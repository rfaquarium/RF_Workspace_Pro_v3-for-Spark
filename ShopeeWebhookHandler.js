/**
 * ==============================================================================
 * MODULE: ShopeeWebhookHandler.js
 * MÔ TẢ: Tiếp nhận & xử lý sự kiện Webhook từ Shopee Open Platform cho RF Workspace Pro.
 *        - Bọc LockService chống nghẽn ghi đồng thời (Concurrency Control).
 *        - Ghi nhật ký Audit Log thô vào DB_AGENT_AUDIT_LOGS (Shopee DB).
 *        - Tự động ghi nhận/cập nhật đơn vào DB_ORDERS & DB_ORDER_ITEMS.
 *        - Khi đơn READY_TO_SHIP: Tự động quét SKU, trừ tồn kho vật lý bảng Products,
 *          ghi log xuất kho ImportExport và đánh dấu inventory_deducted = true.
 *        - Trả về Response JSON hợp lệ theo chuẩn Shopee Webhook Specification.
 * DOANH NGHIỆP: Rich Fish Aquarium
 * TƯƠNG THÍCH: Google Apps Script V8 Engine
 * ==============================================================================
 */

const ShopeeWebhookHandler = {
  /**
   * Tỷ giá mặc định quy đổi ngoại tệ sàn Shopee Global sang VND (đồng bộ nguồn SHOPEE_CANONICAL_EXCHANGE_RATES)
   */
  DEFAULT_EXCHANGE_RATES: (typeof SHOPEE_CANONICAL_EXCHANGE_RATES !== 'undefined') ? SHOPEE_CANONICAL_EXCHANGE_RATES : {
    'MYR': 5600,  // Malaysia Ringgit
    'PHP': 440,   // Philippines Peso
    'SGD': 18800, // Singapore Dollar
    'THB': 710,   // Thai Baht
    'VND': 1,
    'USD': 25400
  },

  /**
   * Xử lý request Webhook từ Shopee Open Platform
   * @param {Object} e - Sự kiện HTTP POST nhận được từ Apps Script doPost(e)
   * @returns {GoogleAppsScript.Content.TextOutput} JSON Response chuẩn Shopee
   */
  handleWebhook: function(e) {
    const lock = LockService.getScriptLock();
    const isLockAcquired = lock.tryLock(15000);

    if (!isLockAcquired) {
      Logger.log('[ShopeeWebhook] Không thể lấy ScriptLock sau 15s. Hệ thống đang bận.');
      return this._buildJsonResponse({
        status: 'error',
        message: 'Server busy, ScriptLock timeout',
        code: 503
      });
    }

    try {
      if (!e || !e.postData || !e.postData.contents) {
        Logger.log('[ShopeeWebhook] Request rỗng hoặc thiếu postData.contents.');
        return this._buildJsonResponse({
          status: 'error',
          message: 'Invalid payload: missing postData contents',
          code: 400
        });
      }

      const rawContent = e.postData.contents;

      // KIỂM TRA NGUỒN VÀ CẤU HÌNH XÁC MINH WEBHOOK
      const props = PropertiesService.getScriptProperties();
      const webhookSecret = props.getProperty('SHOPEE_WEBHOOK_SECRET') || props.getProperty('SHOPEE_PARTNER_KEY');
      if (!webhookSecret) {
        const missingMsg = 'Thiếu cấu hình xác thực webhook: Cần bổ sung SHOPEE_WEBHOOK_SECRET hoặc SHOPEE_PARTNER_KEY trong Script Properties trước khi xử lý dữ liệu!';
        Logger.log('[ShopeeWebhook] ' + missingMsg);
        try {
          ShopeeDbService.logAudit(
            'Shopee_Webhook_Engine',
            'WEBHOOK_AUTH_CONFIG_MISSING',
            'SYSTEM',
            missingMsg,
            'BLOCKED',
            {}
          );
        } catch (audErr) { }
        return this._buildJsonResponse({
          status: 'error',
          message: missingMsg,
          code: 401
        });
      }

      // Kiểm tra chữ ký webhook nếu được gửi trong request
      const incomingSign = (e.parameter && (e.parameter.sign || e.parameter.signature)) ||
                           (e.headers && (e.headers['authorization'] || e.headers['Authorization'] || e.headers['x-shopee-signature']));
      if (incomingSign) {
        try {
          const computedBytes = Utilities.computeHmacSha256Signature(rawContent, webhookSecret);
          const computedSign = computedBytes.map(function (b) { return ('0' + (b & 0xFF).toString(16)).slice(-2); }).join('');
          if (incomingSign.toLowerCase() !== computedSign.toLowerCase() && incomingSign !== webhookSecret) {
            const sigErrMsg = 'Xác thực chữ ký webhook thất bại: Nguồn gửi không hợp lệ!';
            Logger.log('[ShopeeWebhook] ' + sigErrMsg);
            return this._buildJsonResponse({
              status: 'error',
              message: sigErrMsg,
              code: 401
            });
          }
        } catch (hmacErr) {
          Logger.log('[ShopeeWebhook] Lỗi xác thực chữ ký: ' + hmacErr.message);
        }
      }

      let payload;
      try {
        payload = JSON.parse(rawContent);
      } catch (parseErr) {
        Logger.log(`[ShopeeWebhook] Lỗi parse JSON payload: ${parseErr.message}`);
        ShopeeDbService.logAudit(
          'Shopee_Webhook_Engine',
          'PAYLOAD_PARSE_ERROR',
          'UNKNOWN',
          'Không thể parse JSON từ Shopee Webhook',
          'FAILED',
          rawContent
        );
        return this._buildJsonResponse({
          status: 'error',
          message: 'Malformed JSON payload',
          code: 400
        });
      }

      // Xử lý logic nghiệp vụ webhook
      const processResult = this.processPayload(payload);

      return this._buildJsonResponse({
        status: 'success',
        message: 'Webhook processed successfully',
        data: processResult
      });

    } catch (globalErr) {
      Logger.log(`[ShopeeWebhook] Lỗi nghiêm trọng khi xử lý webhook: ${globalErr.stack || globalErr.message}`);
      try {
        ShopeeDbService.logAudit(
          'Shopee_Webhook_Engine',
          'WEBHOOK_FATAL_ERROR',
          'SYSTEM',
          globalErr.message,
          'FAILED',
          { error: globalErr.message, stack: globalErr.stack }
        );
      } catch (logErr) {
        // Fallback im lặng nếu DB lỗi
      }

      return this._buildJsonResponse({
        status: 'error',
        message: 'Internal server error: ' + globalErr.message,
        code: 500
      });
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Phân tích và xử lý chi tiết payload sự kiện từ Shopee
   * @param {Object} payload - Object dữ liệu từ Shopee
   * @returns {Object} Kết quả xử lý
   */
  processPayload: function(payload) {
    // 1. Ghi log thô vào DB_AGENT_AUDIT_LOGS
    const eventCode = payload.code !== undefined ? String(payload.code) : 'GENERAL_EVENT';
    const shopId = payload.shop_id || payload.shopId || 'UNKNOWN_SHOP';
    const dataSection = payload.data || payload;
    const orderSn = dataSection.ordersn || dataSection.order_sn || dataSection.orderSn || payload.ordersn || 'N/A';

    ShopeeDbService.logAudit(
      'Shopee_Webhook_Engine',
      `SHOPEE_EVENT_${eventCode}`,
      orderSn,
      `Nhận sự kiện Webhook từ Shop ID: ${shopId}, Đơn: ${orderSn}`,
      'SUCCESS',
      payload
    );

    if (orderSn === 'N/A') {
      Logger.log(`[ShopeeWebhook] Sự kiện không chứa mã đơn order_sn (Event code: ${eventCode}). Đã ghi log.`);
      return { action: 'LOGGED_ONLY', orderSn: 'N/A' };
    }

    // 2. Chuẩn hóa trạng thái đơn hàng
    const rawStatus = (dataSection.status || dataSection.order_status || payload.order_status || 'UNPAID').toString().trim().toUpperCase();
    const currency = (dataSection.currency || payload.currency || 'MYR').toUpperCase();
    const totalAmountOrigin = Number(dataSection.total_amount || dataSection.total_amount_origin || payload.total_amount || 0);
    const exchangeRate = (typeof getShopeeExchangeRate === 'function') ? getShopeeExchangeRate(currency) : (this.DEFAULT_EXCHANGE_RATES[currency] || 1);
    const totalAmountVnd = Math.round(totalAmountOrigin * exchangeRate);
    const marketCode = dataSection.market_code || payload.market_code || currency.substring(0, 2);
    const buyerUsername = dataSection.buyer_username || dataSection.buyer_user || payload.buyer_username || '';
    const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');

    // 3. Kiểm tra xem đơn hàng đã tồn tại trong DB_ORDERS chưa
    const existingOrder = ShopeeDbService.findOne('DB_ORDERS', 'order_sn', orderSn);

    let isInventoryDeducted = false;

    if (!existingOrder) {
      // Đơn hàng mới -> Insert vào DB_ORDERS
      const newOrderRecord = {
        order_sn: orderSn,
        market_code: marketCode,
        order_status: rawStatus,
        order_created_time: dataSection.create_time ? this._formatTimestamp(dataSection.create_time) : nowStr,
        ready_to_ship_time: rawStatus === 'READY_TO_SHIP' ? nowStr : '',
        currency_origin: currency,
        total_amount_origin: totalAmountOrigin,
        exchange_rate: exchangeRate,
        total_amount_vnd: totalAmountVnd,
        buyer_username: buyerUsername,
        inventory_deducted: false,
        updated_at: nowStr
      };

      ShopeeDbService.insert('DB_ORDERS', newOrderRecord);
      Logger.log(`[ShopeeWebhook] Đã thêm đơn mới: ${orderSn} [${rawStatus}]`);

      // Ghi nhận items vào DB_ORDER_ITEMS nếu có danh sách item trong payload
      const itemsList = dataSection.item_list || dataSection.items || payload.items || [];
      if (Array.isArray(itemsList) && itemsList.length > 0) {
        this._insertOrderItems(orderSn, itemsList, exchangeRate);
      }
    } else {
      // Đơn đã tồn tại -> Cập nhật trạng thái
      isInventoryDeducted = existingOrder.inventory_deducted === true || String(existingOrder.inventory_deducted).toUpperCase() === 'TRUE';
      
      const updateData = {
        order_status: rawStatus,
        updated_at: nowStr
      };

      if (rawStatus === 'READY_TO_SHIP' && !existingOrder.ready_to_ship_time) {
        updateData.ready_to_ship_time = nowStr;
      }

      ShopeeDbService.updateWhere('DB_ORDERS', 'order_sn', orderSn, updateData);
      Logger.log(`[ShopeeWebhook] Đã cập nhật đơn: ${orderSn} -> ${rawStatus}`);
    }

    // 4. KHI ĐƠN CHUYỂN SANG READY_TO_SHIP: Tự động trừ tồn kho vật lý (nếu chưa trừ)
    if (rawStatus === 'READY_TO_SHIP' && !isInventoryDeducted) {
      Logger.log(`[ShopeeWebhook] Đơn ${orderSn} đạt trạng thái READY_TO_SHIP. Bắt đầu khấu trừ tồn kho vật lý xưởng...`);
      const deductionResult = this.deductPhysicalInventory(orderSn, dataSection);

      if (deductionResult.success) {
        // Đánh dấu inventory_deducted = true trong DB_ORDERS
        ShopeeDbService.updateWhere('DB_ORDERS', 'order_sn', orderSn, {
          inventory_deducted: true,
          updated_at: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss')
        });

        ShopeeDbService.logAudit(
          'Shopee_Inventory_Engine',
          'INVENTORY_DEDUCTION_SUCCESS',
          orderSn,
          `Đã trừ tồn kho thành công cho ${deductionResult.deductedCount} SKU của đơn ${orderSn}`,
          'SUCCESS',
          deductionResult
        );
      } else {
        ShopeeDbService.logAudit(
          'Shopee_Inventory_Engine',
          'INVENTORY_DEDUCTION_WARNING',
          orderSn,
          `Khấu trừ kho có cảnh báo: ${deductionResult.message}`,
          'WARNING',
          deductionResult
        );
      }
    }

    return {
      action: existingOrder ? 'ORDER_UPDATED' : 'ORDER_CREATED',
      orderSn: orderSn,
      orderStatus: rawStatus,
      inventoryDeducted: rawStatus === 'READY_TO_SHIP'
    };
  },

  /**
   * Lưu danh sách sản phẩm SKU của đơn hàng vào DB_ORDER_ITEMS
   * @param {string} orderSn - Mã đơn hàng
   * @param {Array} itemsList - Danh sách items từ Shopee
   * @param {number} [exchangeRate=1] - Tỷ giá quy đổi ngoại tệ sang VNĐ áp dụng
   */
  _insertOrderItems: function(orderSn, itemsList, exchangeRate = 1) {
    try {
      const itemsToInsert = itemsList.map((item, idx) => {
        const sku = (item.item_sku || item.model_sku || item.sku || 'SKU_UNKNOWN').toString().trim();
        const productName = (item.item_name || item.model_name || item.product_name || 'Sản phẩm Shopee').toString().trim();
        const quantity = Number(item.model_quantity_purchased || item.quantity || item.qty || 1);
        const unitPrice = Number(item.model_discounted_price || item.unit_price || item.price || 0);

        return {
          item_row_id: `${orderSn}_${sku}_${idx + 1}`,
          order_sn: orderSn,
          sku: sku,
          product_name: productName,
          quantity: quantity,
          unit_price_origin: unitPrice,
          exchange_rate: exchangeRate,
          unit_price_vnd: Math.round(unitPrice * exchangeRate),
          item_status: 'READY',
          inventory_note: ''
        };
      });

      ShopeeDbService.insertBatch('DB_ORDER_ITEMS', itemsToInsert);
      Logger.log(`[ShopeeWebhook] Đã lưu ${itemsToInsert.length} SKU vào DB_ORDER_ITEMS cho đơn ${orderSn}`);
    } catch (err) {
      Logger.log(`[ShopeeWebhook] Lỗi lưu DB_ORDER_ITEMS: ${err.message}`);
    }
  },

  /**
   * Quét SKU và trừ tồn kho vật lý trong bảng Products của xưởng chính
   * @param {string} orderSn - Mã đơn Shopee
   * @param {Object} dataSection - Dữ liệu đơn từ payload
   * @returns {Object} Kết quả trừ kho
   */
  deductPhysicalInventory: function(orderSn, dataSection) {
    try {
      // 1. Lấy danh sách sản phẩm cần trừ: Ưu tiên từ DB_ORDER_ITEMS, nếu chưa có thì lấy từ payload
      let items = ShopeeDbService.find('DB_ORDER_ITEMS', item => String(item.order_sn).trim() === String(orderSn).trim());

      if (!items || items.length === 0) {
        const rawItems = dataSection.item_list || dataSection.items || [];
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          items = rawItems.map(item => ({
            sku: (item.item_sku || item.model_sku || item.sku || '').toString().trim(),
            product_name: item.item_name || item.product_name || '',
            quantity: Number(item.model_quantity_purchased || item.quantity || 1)
          }));
        }
      }

      if (!items || items.length === 0) {
        return {
          success: false,
          deductedCount: 0,
          message: `Không tìm thấy chi tiết SKU của đơn ${orderSn} để trừ kho.`
        };
      }

      // 2. Mở Spreadsheet chính của xưởng
      const mainSs = SpreadsheetApp.getActiveSpreadsheet();
      if (!mainSs) {
        return { success: false, deductedCount: 0, message: 'Không thể mở Spreadsheet xưởng chính.' };
      }

      const prodSheet = mainSs.getSheetByName('Products');
      if (!prodSheet) {
        return { success: false, deductedCount: 0, message: 'Bảng Products không tồn tại trong CSDL xưởng.' };
      }

      const prodLastRow = prodSheet.getLastRow();
      const prodLastCol = prodSheet.getLastColumn();
      if (prodLastRow <= 1 || prodLastCol === 0) {
        return { success: false, deductedCount: 0, message: 'Bảng Products rỗng.' };
      }

      const prodData = prodSheet.getRange(1, 1, prodLastRow, prodLastCol).getValues();
      const pHeaders = prodData[0].map(h => String(h).trim());
      const skuColIdx = pHeaders.indexOf('sku');
      const qtyColIdx = pHeaders.indexOf('quantity');
      const nameColIdx = pHeaders.indexOf('name');

      if (skuColIdx === -1 || qtyColIdx === -1) {
        return { success: false, deductedCount: 0, message: 'Không tìm thấy cột sku hoặc quantity trong bảng Products.' };
      }

      let deductedCount = 0;
      const deductedDetails = [];

      items.forEach(item => {
        const itemSku = String(item.sku || '').trim();
        const itemName = String(item.product_name || item.name || '').trim();
        const deductQty = Number(item.quantity) || 1;

        if (!itemSku && !itemName) return;

        const cleanSku = itemSku.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let matchedRowIdx = -1;

        // 1. Khớp chính xác SKU
        for (let r = 1; r < prodData.length; r++) {
          const currentSku = String(prodData[r][skuColIdx] || '').trim();
          if (currentSku && currentSku.toUpperCase() === itemSku.toUpperCase()) {
            matchedRowIdx = r;
            break;
          }
        }

        // 2. Khớp chuỗi rút gọn Clean SKU (VD: XBL500 -> PK-LOC-XBL500, RUN020402325 -> LAY-RUN020-402325)
        if (matchedRowIdx === -1 && cleanSku.length >= 3) {
          for (let r = 1; r < prodData.length; r++) {
            const currentSkuClean = String(prodData[r][skuColIdx] || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (currentSkuClean && (currentSkuClean === cleanSku || currentSkuClean.includes(cleanSku) || cleanSku.includes(currentSkuClean))) {
              matchedRowIdx = r;
              break;
            }
          }
        }

        // 3. Khớp theo Tên sản phẩm
        if (matchedRowIdx === -1 && itemName && nameColIdx !== -1) {
          const cleanItemName = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (let r = 1; r < prodData.length; r++) {
            const currentNameClean = String(prodData[r][nameColIdx] || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            if (currentNameClean && (currentNameClean === cleanItemName || currentNameClean.includes(cleanItemName) || cleanItemName.includes(currentNameClean))) {
              matchedRowIdx = r;
              break;
            }
          }
        }

        if (matchedRowIdx !== -1) {
          const currentQty = Number(prodData[matchedRowIdx][qtyColIdx]) || 0;
          const newQty = Math.max(0, currentQty - deductQty);
          prodData[matchedRowIdx][qtyColIdx] = newQty;

          deductedCount++;
          deductedDetails.push({
            sku: prodData[matchedRowIdx][skuColIdx],
            name: nameColIdx !== -1 ? prodData[matchedRowIdx][nameColIdx] : '',
            deductedQty: deductQty,
            remainingQty: newQty
          });
        }
      });

      // Ghi ngược lại bảng Products
      if (deductedCount > 0) {
        prodSheet.getRange(1, 1, prodLastRow, prodLastCol).setValues(prodData);
        Logger.log(`[ShopeeWebhook] Đã cập nhật trừ tồn kho thành công cho ${deductedCount} SKU.`);

        // 3. Ghi log phiếu xuất kho vào bảng ImportExport của xưởng (nếu có)
        this._recordImportExportLog(mainSs, orderSn, deductedDetails);
      }

      return {
        success: true,
        deductedCount: deductedCount,
        details: deductedDetails,
        message: `Đã trừ tồn kho thành công cho ${deductedCount} SKU.`
      };

    } catch (err) {
      Logger.log(`[ShopeeWebhook] Lỗi khi trừ tồn kho vật lý: ${err.message}`);
      return {
        success: false,
        deductedCount: 0,
        message: err.message
      };
    }
  },

  /**
   * Ghi log xuất kho vào bảng ImportExport của xưởng
   * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
   * @param {string} orderSn
   * @param {Array} deductedDetails
   */
  _recordImportExportLog: function(ss, orderSn, deductedDetails) {
    try {
      const ieSheet = ss.getSheetByName('ImportExport');
      if (!ieSheet) return;

      const headers = ieSheet.getRange(1, 1, 1, ieSheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
      const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
      const logId = 'XUAT_SHOPEE_' + Utilities.getUuid().substring(0, 8).toUpperCase();

      const logRecord = {
        id: logId,
        type: 'XUẤT TỰ ĐỘNG',
        target: `Shopee Global (${orderSn})`,
        totalAmount: 0,
        date: nowStr,
        note: `Tự động xuất kho theo Webhook Shopee Global đơn ${orderSn}`,
        itemsData: JSON.stringify(deductedDetails)
      };

      const rowValues = headers.map(h => (logRecord[h] !== undefined ? logRecord[h] : ''));
      ieSheet.appendRow(rowValues);
    } catch (err) {
      Logger.log(`[ShopeeWebhook] Lỗi ghi ImportExport: ${err.message}`);
    }
  },

  /**
   * Format Unix timestamp sang chuỗi ngày giờ
   * @param {number|string} ts 
   * @returns {string}
   */
  _formatTimestamp: function(ts) {
    try {
      const num = Number(ts);
      const date = num > 9999999999 ? new Date(num) : new Date(num * 1000);
      return Utilities.formatDate(date, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
    } catch (e) {
      return Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
    }
  },

  /**
   * Tạo Response TextOutput dạng JSON chuẩn
   * @param {Object} obj
   * @returns {GoogleAppsScript.Content.TextOutput}
   */
  _buildJsonResponse: function(obj) {
    return ContentService.createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
  }
};

/**
 * Hàm toàn cục tiếp nhận webhook Shopee (có thể gọi trực tiếp hoặc từ router doPost)
 * @param {Object} e - HTTP POST event
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function handleShopeeWebhook(e) {
  return ShopeeWebhookHandler.handleWebhook(e);
}
