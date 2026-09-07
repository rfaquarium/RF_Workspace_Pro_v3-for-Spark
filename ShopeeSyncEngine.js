/**
 * ==============================================================================
 * MODULE: ShopeeSyncEngine.js
 * MÔ TẢ: Engine đồng bộ tự động dữ liệu từ Shopee Open Platform API v2 vào CSDL độc lập:
 *        1. Quét & nạp đơn hàng mới qua /api/v2/order/get_order_list & get_order_detail.
 *        2. Lưu trữ phân tách vào DB_ORDERS & DB_ORDER_ITEMS qua ShopeeDbService.
 *        3. State Machine & Auto Stock Deduction: Khi đơn READY_TO_SHIP, tự động trừ
 *           tồn kho vật lý bảng Products xưởng và đánh dấu inventory_deducted = true.
 *        4. Auto Escrow Reconciliation: Khi đơn COMPLETED, tự động gọi get_escrow_detail,
 *           bóc tách 5 loại phí sàn (TK 641, 521, 112) lưu vào DB_ESCROW_RECON.
 *        5. Time-driven Trigger ngầm 10 phút/lần không cần can thiệp thủ công.
 * DOANH NGHIỆP: Rich Fish Aquarium
 * TƯƠNG THÍCH: Google Apps Script V8 Engine
 * ==============================================================================
 */

const SHOPEE_CANONICAL_EXCHANGE_RATES = {
  'PHP': 440,    // Philippines Peso
  'PH': 440,
  'MYR': 5600,   // Malaysia Ringgit (chuẩn hóa thống nhất 5600)
  'MY': 5600,
  'THB': 710,    // Thai Baht (chuẩn hóa thống nhất 710)
  'TH': 710,
  'SGD': 18800,  // Singapore Dollar (chuẩn hóa thống nhất 18800)
  'SG': 18800,
  'IDR': 1.6,    // Indonesian Rupiah
  'BRL': 4500,   // Brazilian Real
  'BR': 4500,
  'TWD': 800,    // New Taiwan Dollar
  'TW': 800,
  'USD': 25400,  // US Dollar (chuẩn hóa thống nhất 25400)
  'VND': 1
};

function getShopeeExchangeRate(currency) {
  if (!currency) return 1;
  const key = String(currency).trim().toUpperCase();
  try {
    const props = (typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties) ? PropertiesService.getScriptProperties() : null;
    if (props) {
      const dynamicConfig = props.getProperty('SHOPEE_EXCHANGE_RATES');
      if (dynamicConfig) {
        const parsed = JSON.parse(dynamicConfig);
        if (parsed && parsed[key]) return Number(parsed[key]);
      }
    }
  } catch (e) {
    // fallback
  }
  return SHOPEE_CANONICAL_EXCHANGE_RATES[key] || 1;
}

const ShopeeSyncEngine = {
  /**
   * Bảng tỷ giá chuẩn quy đổi ngoại tệ sàn TMĐT sang VNĐ (nguồn chuẩn hóa duy nhất)
   */
  EXCHANGE_RATES: SHOPEE_CANONICAL_EXCHANGE_RATES,
  getExchangeRate: getShopeeExchangeRate,

  /**
   * Quét và nạp toàn bộ đơn hàng mới từ Shopee Open Platform qua API v2
   * @param {number} [daysBack=15] - Số ngày quét ngược về quá khứ
   * @returns {Object} Thống kê số lượng đơn đã đồng bộ
   */
  syncOrdersFromApi: function(daysBack = 15) {
    const lock = LockService.getScriptLock();
    const isLockAcquired = lock.tryLock(30000);

    if (!isLockAcquired) {
      Logger.log('[ShopeeSyncEngine] ScriptLock bận, hoãn lượt đồng bộ này.');
      return { success: false, message: 'ScriptLock is busy' };
    }

    try {
      Logger.log(`🔄 [ShopeeSyncEngine] Bắt đầu quét đơn hàng Shopee API (${daysBack} ngày gần nhất)...`);

      const timeTo = Math.floor(Date.now() / 1000);
      const timeFrom = timeTo - (daysBack * 24 * 3600);

      // 1. Lấy danh sách mã đơn hàng (Pagination support)
      let allOrderList = [];
      let cursor = '';
      let hasMore = true;
      let pageCount = 0;

      while (hasMore && pageCount < 10) { // Giới hạn tối đa 10 trang = 500 đơn/lượt quét
        pageCount++;
        const queryParams = {
          time_range_field: 'create_time',
          time_from: timeFrom,
          time_to: timeTo,
          page_size: 50
        };
        if (cursor) queryParams.cursor = cursor;

        const listRes = ShopeeApiService.request('/api/v2/order/get_order_list', queryParams);
        const ordersBatch = listRes.order_list || [];

        if (ordersBatch.length > 0) {
          allOrderList = allOrderList.concat(ordersBatch);
        }

        hasMore = listRes.more === true || listRes.more === 'true';
        cursor = listRes.next_cursor || '';
      }

      if (allOrderList.length === 0) {
        Logger.log('[ShopeeSyncEngine] Không có đơn hàng nào trong khoảng thời gian quét.');
        return { success: true, syncedOrders: 0, updatedOrders: 0 };
      }

      Logger.log(`📦 [ShopeeSyncEngine] Tìm thấy ${allOrderList.length} mã đơn hàng. Đang lấy chi tiết...`);

      // 2. Lấy chi tiết đơn hàng theo lô 50 đơn/request
      let newOrdersCount = 0;
      let updatedOrdersCount = 0;
      let stockDeductedCount = 0;
      let escrowReconCount = 0;

      const chunkSize = 50;
      for (let i = 0; i < allOrderList.length; i += chunkSize) {
        const chunk = allOrderList.slice(i, i + chunkSize);
        const orderSnListStr = chunk.map(o => o.order_sn).join(',');

        const detailRes = ShopeeApiService.request('/api/v2/order/get_order_detail', {
          order_sn_list: orderSnListStr,
          response_optional_fields: 'item_list,buyer_user,recipient_address,total_amount,currency,order_status,create_time'
        });

        const orders = detailRes.order_list || [];

        orders.forEach(rawOrder => {
          const orderSn = rawOrder.order_sn;
          const currency = (rawOrder.currency || 'VND').toUpperCase();
          const rate = getShopeeExchangeRate(currency);
          const totalRaw = Number(rawOrder.total_amount) || 0;
          const status = (rawOrder.order_status || '').toString().trim().toUpperCase();
          const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
          const createdTimeStr = rawOrder.create_time ? this._formatTimestamp(rawOrder.create_time) : nowStr;

          const existingOrder = ShopeeDbService.findWhere('DB_ORDERS', 'order_sn', orderSn);

          // A. Lưu mới hoặc Cập nhật vào DB_ORDERS
          if (!existingOrder) {
            ShopeeDbService.insert('DB_ORDERS', {
              order_sn: orderSn,
              market_code: currency,
              order_status: status,
              order_created_time: createdTimeStr,
              ready_to_ship_time: status === 'READY_TO_SHIP' ? nowStr : '',
              currency_origin: currency,
              total_amount_origin: totalRaw,
              exchange_rate: rate,
              total_amount_vnd: Math.round(totalRaw * rate),
              buyer_username: (rawOrder.buyer_user && rawOrder.buyer_user.user_name) || '',
              inventory_deducted: false,
              updated_at: nowStr
            });
            newOrdersCount++;
          } else {
            const isAlreadyDeducted = existingOrder.inventory_deducted === true || String(existingOrder.inventory_deducted).toUpperCase() === 'TRUE';
            const updatePayload = {
              order_status: status,
              exchange_rate: rate,
              total_amount_vnd: Math.round(totalRaw * rate),
              updated_at: nowStr
            };
            if (status === 'READY_TO_SHIP' && !existingOrder.ready_to_ship_time) {
              updatePayload.ready_to_ship_time = nowStr;
            }

            ShopeeDbService.updateWhere('DB_ORDERS', 'order_sn', orderSn, updatePayload);
            updatedOrdersCount++;
          }

          // B. Lưu chi tiết từng SKU vào DB_ORDER_ITEMS (Tự động chuẩn hoá sang SKU chuẩn của xưởng)
          if (rawOrder.item_list && Array.isArray(rawOrder.item_list) && rawOrder.item_list.length > 0) {
            rawOrder.item_list.forEach((item, idx) => {
              const rawSku = (item.item_sku || item.model_sku || item.item_id || 'SKU_UNKNOWN').toString().trim();
              const pName = item.item_name || item.model_name || 'Sản phẩm Shopee';
              const sku = this.normalizeShopeeSku(rawSku, pName);
              const rowId = `${orderSn}_${sku}_${idx + 1}`;
              const existingItem = ShopeeDbService.findWhere('DB_ORDER_ITEMS', 'item_row_id', rowId);

              if (!existingItem) {
                const itemUnitPrice = Number(item.model_discounted_price || item.unit_price || 0);
                ShopeeDbService.insert('DB_ORDER_ITEMS', {
                  item_row_id: rowId,
                  order_sn: orderSn,
                  sku: sku,
                  product_name: pName,
                  quantity: Number(item.model_quantity_purchased || item.quantity || 1),
                  unit_price_origin: itemUnitPrice,
                  exchange_rate: rate,
                  unit_price_vnd: Math.round(itemUnitPrice * rate),
                  item_status: status === 'READY_TO_SHIP' ? 'DEDUCTED' : 'PENDING',
                  inventory_note: 'Đồng bộ tự động qua Shopee API v2'
                });
              }
            });
          }

          // C. Tự động kích hoạt trừ kho vật lý nếu đơn chuyển sang READY_TO_SHIP và chưa trừ
          const currentOrder = ShopeeDbService.findWhere('DB_ORDERS', 'order_sn', orderSn);
          const isDeducted = currentOrder && (currentOrder.inventory_deducted === true || String(currentOrder.inventory_deducted).toUpperCase() === 'TRUE');

          if (status === 'READY_TO_SHIP' && !isDeducted) {
            this.executeStockDeduction(orderSn, rawOrder.item_list);
            stockDeductedCount++;
          }

          // D. Tự động kéo đối soát tài chính Escrow nếu đơn COMPLETED
          if (status === 'COMPLETED') {
            const isReconDone = this.syncSingleEscrow(orderSn, currency, rate);
            if (isReconDone) escrowReconCount++;
          }
        });
      }

      const syncSummary = {
        success: true,
        totalFetched: allOrderList.length,
        newOrders: newOrdersCount,
        updatedOrders: updatedOrdersCount,
        stockDeductedOrders: stockDeductedCount,
        escrowReconciledOrders: escrowReconCount
      };

      Logger.log(`🎉 [ShopeeSyncEngine] Hoàn tất đồng bộ: Mới=${newOrdersCount}, Cập nhật=${updatedOrdersCount}, Trừ kho=${stockDeductedCount}, Đối soát=${escrowReconCount}`);

      ShopeeDbService.logAudit(
        'Shopee_Sync_Engine',
        'SYNC_ORDERS_CRON_COMPLETED',
        'BATCH_API',
        `Hoàn tất đồng bộ ${allOrderList.length} đơn hàng từ Shopee API`,
        'SUCCESS',
        syncSummary
      );

      return syncSummary;

    } catch (e) {
      Logger.log(`❌ [ShopeeSyncEngine] Lỗi đồng bộ Shopee API: ${e.stack || e.message}`);
      ShopeeDbService.logAudit(
        'Shopee_Sync_Engine',
        'SYNC_ORDERS_CRON_FAILED',
        'SYSTEM',
        e.message,
        'FAILED',
        { error: e.message, stack: e.stack }
      );
      throw e;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Trừ tồn kho vật lý bảng Products trong CSDL xưởng chính và khóa cờ Idempotency
   * @param {string} orderSn - Mã đơn Shopee
   * @param {Array} itemList - Danh sách SKU
   */
  executeStockDeduction: function(orderSn, itemList) {
    try {
      Logger.log(`📉 [ShopeeSyncEngine] Đang thực hiện trừ kho cho đơn ${orderSn}...`);

      // 1. Khấu trừ trực tiếp trên bảng Products của Spreadsheet xưởng chính
      if (typeof ShopeeWebhookHandler !== 'undefined' && typeof ShopeeWebhookHandler.deductPhysicalInventory === 'function') {
        ShopeeWebhookHandler.deductPhysicalInventory(orderSn, { items: itemList });
      }

      // 2. Cập nhật trạng thái item trong DB_ORDER_ITEMS
      if (itemList && Array.isArray(itemList) && itemList.length > 0) {
        itemList.forEach((item, idx) => {
          const sku = (item.item_sku || item.model_sku || item.item_id || '').toString().trim();
          const rowId = `${orderSn}_${sku}_${idx + 1}`;
          ShopeeDbService.updateWhere('DB_ORDER_ITEMS', 'item_row_id', rowId, {
            item_status: 'DEDUCTED',
            inventory_note: `Đã trừ kho tự động lúc ${Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss')}`
          });
        });
      }

      // 3. Khóa cờ inventory_deducted = true trong DB_ORDERS
      ShopeeDbService.updateWhere('DB_ORDERS', 'order_sn', orderSn, {
        inventory_deducted: true,
        ready_to_ship_time: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss'),
        updated_at: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss')
      });

      Logger.log(`✅ [ShopeeSyncEngine] Đã trừ kho và bật cờ inventory_deducted cho đơn ${orderSn}`);
    } catch (err) {
      Logger.log(`❌ [ShopeeSyncEngine] Lỗi executeStockDeduction đơn ${orderSn}: ${err.message}`);
    }
  },

  /**
   * Đối soát tài chính Escrow tự động cho đơn hoàn tất (COMPLETED)
   * Phân bổ 5 loại phí sàn kế toán:
   * - Phí hoa hồng sàn (TK 641)
   * - Phí dịch vụ (TK 641)
   * - Phí thanh toán (TK 641)
   * - Voucher người bán (TK 521)
   * - Thuế / Phí vận chuyển xuyên biên giới
   * - Số tiền thực nhận về ví Shopee (TK 112)
   * 
   * @param {string} orderSn - Mã đơn hàng
   * @param {string} currency - Ngoại tệ gốc
   * @param {number} rate - Tỷ giá quy đổi sang VNĐ
   * @returns {boolean} true nếu vừa ghi nhận đối soát mới
   */
  syncSingleEscrow: function(orderSn, currency, rate) {
    const existingRecon = ShopeeDbService.findWhere('DB_ESCROW_RECON', 'order_sn', orderSn);
    if (existingRecon) return false; // Đã đối soát trước đó, bỏ qua

    try {
      Logger.log(`💰 [ShopeeSyncEngine] Đang kéo báo cáo Escrow cho đơn ${orderSn}...`);

      const escrowRes = ShopeeApiService.request('/api/v2/payment/get_escrow_detail', {
        order_sn: orderSn
      });

      const income = escrowRes.order_income || escrowRes || {};
      const actualPayoutOrigin = Number(income.escrow_amount || income.buyer_total_amount || 0);
      const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
      const payoutDateStr = income.payout_time ? this._formatTimestamp(income.payout_time) : nowStr;

      const reconRecord = {
        recon_id: `REC_${orderSn}`,
        order_sn: orderSn,
        payout_date: payoutDateStr,
        currency_origin: currency,
        buyer_total_paid: Number(income.buyer_total_amount || 0),
        fee_commission: Number(income.commission_fee || 0),             // Phí hoa hồng sàn (TK 641)
        fee_service: Number(income.service_fee || 0),                   // Phí dịch vụ (TK 641)
        fee_transaction: Number(income.transaction_fee || 0),           // Phí giao dịch (TK 641)
        fee_seller_voucher: Number(income.voucher_from_seller || 0),    // Voucher người bán (TK 521)
        fee_shipping_cross: Number(income.cross_border_tax || income.seller_shipping_discount_subsidized_by_shopee || 0),
        actual_payout_origin: actualPayoutOrigin,
        applied_rate: rate,
        actual_payout_vnd: Math.round(actualPayoutOrigin * rate),       // Tiền thực nhận về ví (TK 112)
        recon_status: 'MATCHED'
      };

      ShopeeDbService.insert('DB_ESCROW_RECON', reconRecord);
      Logger.log(`✅ [ShopeeSyncEngine] Đã đối soát Escrow thành công cho đơn ${orderSn}`);
      return true;

    } catch (err) {
      Logger.log(`⚠️ [ShopeeSyncEngine] Chưa thể đối soát đơn ${orderSn}: ${err.message}`);
      return false;
    }
  },

  /**
   * Tự động chuẩn hóa mã SKU từ sàn Shopee sang mã chuẩn xưởng
   * @param {string} rawSku
   * @param {string} [name]
   * @returns {string}
   */
  normalizeShopeeSku: function(rawSku, name) {
    if (!rawSku) return 'SKU_UNKNOWN';
    const s = String(rawSku).trim().toUpperCase();
    const clean = s.replace(/\s+/g, '');

    // Nhóm Layout: RUN-020-402325, BON01...
    const layMatch = clean.match(/^(?:LAY[-_]?)?(BON|RUN|CAU|HAN|VAC|DAO|NAT|TRU|HEM|VOM|CV)[-_]?0*(\d{1,3})?[-_]?(\d{6})?$/i);
    if (layMatch) {
      const code = layMatch[1];
      const ver = layMatch[2] ? ('000' + parseInt(layMatch[2], 10)).slice(-3) : '001';
      const size = layMatch[3] || 'STD';
      if (code === 'CV') return `LAY-CV-${size}`;
      return `LAY-${code}${ver}-${size}`;
    }

    // Nhóm Bể kính: BE302020, BEND15, BETTA201012, TERA121221, BC301422
    const beMatch = clean.match(/^(?:BE[-_]?)?(ND|BETTA|TERA|BC|MINI|STD|DUC)?[-_]?(\d{6})$/i);
    if (beMatch) {
      const sub = beMatch[1] || 'STD';
      const size = beMatch[2];
      return `BE-${sub}-${size}`;
    }

    return s;
  },

  /**
   * Chuyển đổi Unix timestamp sang chuỗi ngày giờ VN
   */
  _formatTimestamp: function(ts) {
    try {
      const num = Number(ts);
      const date = num > 9999999999 ? new Date(num) : new Date(num * 1000);
      return Utilities.formatDate(date, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
    } catch (e) {
      return Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
    }
  }
};

/**
 * Hàm thiết lập Trigger chạy ngầm tự động mỗi 10 phút (Không cần con người can thiệp)
 */
function setupAutoSyncCron() {
  // Xóa trigger cũ cùng tên nếu đã tồn tại để tránh tạo trùng lặp
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'triggerShopeeBackgroundSync') {
      ScriptApp.deleteTrigger(t);
    }
  });

  // Tạo trigger mới chạy mỗi 10 phút
  ScriptApp.newTrigger('triggerShopeeBackgroundSync')
    .timeBased()
    .everyMinutes(10)
    .create();

  Logger.log('🚀 Đã kích hoạt Time-driven Trigger đồng bộ Shopee API tự động mỗi 10 phút.');
  return { success: true, message: 'Đã kích hoạt tự động đồng bộ API Shopee ngầm mỗi 10 phút.' };
}

/**
 * Hàm Entrypoint được Trigger gọi định kỳ
 */
function triggerShopeeBackgroundSync() {
  ShopeeSyncEngine.syncOrdersFromApi(15);
}
