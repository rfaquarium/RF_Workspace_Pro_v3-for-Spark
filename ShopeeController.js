/**
 * ==============================================================================
 * MODULE: ShopeeController.js
 * MÔ TẢ: Controller xử lý dữ liệu Shopee Global cho giao diện RF Workspace Pro.
 *        - Chuẩn hóa triệt để kiểu dữ liệu số học parseSafeNumber, triệt tiêu lỗi nối chuỗi.
 *        - Chuẩn hóa mã quốc gia (THB->TH, MYR->MY, PHP->PH, SGD->SG, TWD->TW).
 *        - Map an toàn items và escrow, phòng chống 100% lỗi runtime crash.
 * DOANH NGHIỆP: Rich Fish Aquarium
 * TƯƠNG THÍCH: Google Apps Script V8 Engine
 * ==============================================================================
 */

/**
 * Lấy toàn bộ dữ liệu thống kê KPI và danh sách đơn hàng cho Tab Shopee Global
 * @param {string} [marketFilter=''] - Mã quốc gia lọc (tùy chọn)
 * @returns {Object} JSON payload chuẩn hóa
 */
/**
 * Lấy toàn bộ dữ liệu thống kê KPI, đơn hàng, tiến độ xưởng và đối soát cho Tab Shopee Global
 * @param {string|Object} [filterOptions=''] - Mã quốc gia lọc hoặc Object { market, timeRange, pin }
 * @param {string} [pin=''] - Mã PIN xác thực
 * @returns {Object} JSON payload chuẩn hóa
 */
function getShopeeGlobalDashboardData(filterOptions, pin) {
  try {
    let marketFilter = '';
    let pinVal = pin || '';
    if (typeof filterOptions === 'object' && filterOptions !== null) {
      marketFilter = filterOptions.market || filterOptions.marketFilter || '';
      pinVal = filterOptions.pin || pinVal;
    } else if (typeof filterOptions === 'string') {
      marketFilter = filterOptions;
    }

    const rawFilter = (marketFilter || '').toString().trim().toUpperCase();

    // 1. Đọc dữ liệu từ 5 bảng cốt lõi của Shopee DB
    const orders = ShopeeDbService.getAll('DB_ORDERS') || [];
    const items = ShopeeDbService.getAll('DB_ORDER_ITEMS') || [];
    const escrowRecords = ShopeeDbService.getAll('DB_ESCROW_RECON') || [];
    const disputes = ShopeeDbService.getAll('DB_RETURNS_DISPUTES') || [];
    const auditLogs = ShopeeDbService.getAll('DB_AGENT_AUDIT_LOGS') || [];

    // 2. Đọc trạng thái sản xuất từ bảng Production của Xưởng Rich Fish
    const mainSs = SpreadsheetApp.getActiveSpreadsheet();
    let prodMap = new Map();
    let prodSheet = mainSs ? mainSs.getSheetByName('Production') : null;
    if (prodSheet && prodSheet.getLastRow() > 1) {
      const prodData = prodSheet.getDataRange().getValues();
      const pHeaders = prodData[0];
      const pIdCol = pHeaders.indexOf('orderId');
      const pNameCol = pHeaders.indexOf('name');
      const pStatusCol = pHeaders.indexOf('status');
      const p1StatusCol = pHeaders.indexOf('p1_status');
      const p2StatusCol = pHeaders.indexOf('p2_status');
      const p1UserCol = pHeaders.indexOf('p1_user');
      const p2UserCol = pHeaders.indexOf('p2_user');
      const pQcCol = pHeaders.indexOf('qc_status');

      for (let p = 1; p < prodData.length; p++) {
        const oId = String(prodData[p][pIdCol] || '').trim();
        if (oId) {
          if (!prodMap.has(oId)) prodMap.set(oId, []);
          prodMap.get(oId).push({
            id: prodData[p][pHeaders.indexOf('id')] || '',
            name: prodData[p][pNameCol] || '',
            status: prodData[p][pStatusCol] || 'Pending',
            p1_status: prodData[p][p1StatusCol] || '',
            p2_status: prodData[p][p2StatusCol] || '',
            p1_user: prodData[p][p1UserCol] || '',
            p2_user: prodData[p][p2UserCol] || '',
            qc_status: prodData[p][pQcCol] || ''
          });
        }
      }
    }

    // 3. Đọc tồn kho thực tế từ bảng Products xưởng
    let stockMap = new Map();
    let productSheet = mainSs ? mainSs.getSheetByName('Products') : null;
    if (productSheet && productSheet.getLastRow() > 1) {
      const pData = productSheet.getDataRange().getValues();
      const pHeaders = pData[0];
      const pSkuCol = pHeaders.indexOf('sku');
      const pQtyCol = pHeaders.indexOf('quantity');
      const pCostCol = pHeaders.indexOf('costPrice');
      const pPriceCol = pHeaders.indexOf('price');
      for (let pr = 1; pr < pData.length; pr++) {
        const sku = String(pData[pr][pSkuCol] || '').trim();
        if (sku) {
          stockMap.set(sku, {
            quantity: Number(pData[pr][pQtyCol]) || 0,
            costPrice: Number(pData[pr][pCostCol]) || 0,
            price: Number(pData[pr][pPriceCol]) || 0
          });
        }
      }
    }

    // Hàm làm sạch và chuyển đổi số an toàn tuyệt đối
    const parseSafeNumber = (val) => {
      if (typeof val === 'number') return isNaN(val) ? 0 : val;
      if (!val) return 0;
      const cleanStr = String(val).replace(/[^0-9.-]+/g, '');
      const num = parseFloat(cleanStr);
      return isNaN(num) ? 0 : num;
    };

    // Hàm lấy giá trị an toàn từ Object hỗ trợ nhiều biến thể tên cột (Fuzzy Header Matching)
    const getFieldSafe = (obj, ...possibleKeys) => {
      if (!obj || typeof obj !== 'object') return '';
      for (let k of possibleKeys) {
        if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') {
          return obj[k];
        }
      }
      const objKeys = Object.keys(obj);
      for (let k of possibleKeys) {
        const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (let ok of objKeys) {
          const okClean = ok.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (okClean === kClean || (okClean.length >= 3 && (okClean.includes(kClean) || kClean.includes(okClean)))) {
            if (obj[ok] !== undefined && obj[ok] !== null && String(obj[ok]).trim() !== '') {
              return obj[ok];
            }
          }
        }
      }
      return '';
    };

    let totalRevenueVnd = 0;
    let readyToShipCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let returnedDisputedCount = disputes.length;
    let totalLossDisputeVnd = 0;
    let reconciledPayoutVnd = 0;
    let totalPlatformFeeVnd = 0;
    let pendingDeductionCount = 0;

    // 4. Map danh sách Items theo order_sn kèm tồn kho & tiến độ xưởng
    const itemsMap = new Map();
    items.forEach(item => {
      const sn = String(getFieldSafe(item, 'order_sn', 'ordersn', 'id') || '').trim();
      if (!itemsMap.has(sn)) {
        itemsMap.set(sn, []);
      }
      const itemSku = String(getFieldSafe(item, 'sku', 'item_sku', 'product_sku') || 'SKU_UNKNOWN').trim();
      const stockInfo = stockMap.get(itemSku) || { quantity: 0, costPrice: 0 };
      const itemQty = parseSafeNumber(getFieldSafe(item, 'quantity', 'qty')) || 1;

      itemsMap.get(sn).push({
        sku: itemSku,
        product_name: String(getFieldSafe(item, 'product_name', 'name', 'item_name') || 'Sản phẩm Shopee').trim(),
        quantity: itemQty,
        unit_price_origin: parseSafeNumber(getFieldSafe(item, 'unit_price_origin', 'unit_price', 'price')),
        current_warehouse_stock: stockInfo.quantity,
        cost_price: stockInfo.costPrice,
        is_in_stock: stockInfo.quantity >= itemQty
      });
    });

    // 5. Map danh sách Escrow theo order_sn
    const escrowMap = new Map();
    escrowRecords.forEach(rec => {
      const sn = String(getFieldSafe(rec, 'order_sn', 'ordersn', 'id') || '').trim();
      const payout = parseSafeNumber(getFieldSafe(rec, 'actual_payout_vnd', 'payout_vnd'));
      const commission = parseSafeNumber(getFieldSafe(rec, 'fee_commission', 'commission'));
      const serviceFee = parseSafeNumber(getFieldSafe(rec, 'fee_service', 'service_fee'));
      const txFee = parseSafeNumber(getFieldSafe(rec, 'fee_transaction', 'transaction_fee'));
      const voucherFee = parseSafeNumber(getFieldSafe(rec, 'fee_seller_voucher', 'voucher_fee'));
      const crossShipping = parseSafeNumber(getFieldSafe(rec, 'fee_shipping_cross', 'shipping_fee'));

      const totalFee = commission + serviceFee + txFee + voucherFee + crossShipping;
      totalPlatformFeeVnd += totalFee;
      reconciledPayoutVnd += payout;

      escrowMap.set(sn, {
        ...rec,
        actual_payout_vnd: payout,
        buyer_total_paid: parseSafeNumber(getFieldSafe(rec, 'buyer_total_paid')),
        fee_commission: commission,
        fee_service: serviceFee,
        fee_transaction: txFee,
        fee_seller_voucher: voucherFee,
        fee_shipping_cross: crossShipping,
        total_fees_origin: totalFee
      });
    });

    // 6. Map danh sách Khiếu Nại / Hàng Hoàn
    const disputesMap = new Map();
    disputes.forEach(disp => {
      const sn = String(getFieldSafe(disp, 'order_sn', 'ordersn', 'id') || '').trim();
      const loss = parseSafeNumber(getFieldSafe(disp, 'loss_amount_vnd', 'loss_amount'));
      totalLossDisputeVnd += loss;
      disputesMap.set(sn, {
        ...disp,
        loss_amount_vnd: loss,
        compensation_vnd: parseSafeNumber(getFieldSafe(disp, 'compensation_vnd'))
      });
    });

    // 7. Xử lý và chuẩn hóa danh sách đơn hàng
    const enrichedOrders = orders.map(order => {
      const orderSn = String(getFieldSafe(order, 'order_sn', 'id', 'ordersn') || '').trim();
      const rawStatusStr = String(getFieldSafe(order, 'order_status', 'status', 'trang_thai') || 'READY_TO_SHIP').trim();
      const status = rawStatusStr.toUpperCase();

      const originAmount = parseSafeNumber(getFieldSafe(order, 'total_amount_origin', 'total_amount_orig', 'otal_amount_orig', 'amount'));
      const rate = parseSafeNumber(getFieldSafe(order, 'exchange_rate', 'xchange_rate', 'rate')) || 1;
      
      let vndAmount = parseSafeNumber(getFieldSafe(order, 'total_amount_vnd', 'total_amount_v', 'tal_amount_v', 'revenue', 'vnd'));
      if (vndAmount <= 0 && originAmount > 0) {
        vndAmount = Math.round(originAmount * rate);
      }

      // Chuẩn hóa mã thị trường
      let rawMarket = String(getFieldSafe(order, 'market_code', 'market_cc', 'rket_cc', 'currency_origin', 'ncy_origin', 'market') || 'GLOBAL').toUpperCase().trim();
      if (rawMarket.includes('TH')) rawMarket = 'TH';
      else if (rawMarket.includes('MY') || rawMarket.includes('MA')) rawMarket = 'MY';
      else if (rawMarket.includes('PH')) rawMarket = 'PH';
      else if (rawMarket.includes('SG')) rawMarket = 'SG';
      else if (rawMarket.includes('TW')) rawMarket = 'TW';
      else if (rawMarket.includes('BR')) rawMarket = 'BR';
      else if (rawMarket.includes('ID')) rawMarket = 'ID';
      else if (rawMarket.includes('VN')) rawMarket = 'VN';

      const invDeductVal = getFieldSafe(order, 'inventory_deducted', 'entory_deduc', 'deducted');
      const isDeducted = invDeductVal === true || String(invDeductVal).toLowerCase() === 'true';
      
      const isCancelled = status === 'CANCELLED' || status.includes('HUỶ') || status.includes('HỦY');
      const isReturn = status === 'RETURNED' || status.includes('HOÀN');
      const isDelivered = status === 'COMPLETED' || status === 'HOÀN THÀNH' || status === 'ĐỐI SOÁT THÀNH CÔNG' || status === 'ĐÃ BÀN GIAO' || status === 'SHIPPED' || status === 'DELIVERED';
      const isRTS = status === 'READY_TO_SHIP' || status === 'CHỜ GIAO' || status === 'CHỜ SẢN XUẤT' || status === 'PROCESSED' || status === 'SẴN SÀNG ĐÓNG GÓI';

      if (!isCancelled && !isReturn) {
        totalRevenueVnd += vndAmount;
      } else if (isCancelled) {
        cancelledCount++;
      }

      if (isRTS) {
        readyToShipCount++;
        if (!isDeducted) pendingDeductionCount++;
      } else if (isDelivered) {
        completedCount++;
      }

      const orderProdTickets = prodMap.get(orderSn) || [];
      const orderItems = itemsMap.get(orderSn) || [];

      // Đánh giá trạng thái sản xuất tổng thể của đơn
      let productionStatus = 'Chưa Có Lệnh';
      if (orderProdTickets.length > 0) {
        const allDone = orderProdTickets.every(t => t.status === 'Done' || t.qc_status === 'Đạt' || t.p2_status === 'Done');
        const inProgress = orderProdTickets.some(t => t.status === 'In Progress' || t.p1_status === 'Done');
        productionStatus = allDone ? 'Xưởng Đã Xong' : (inProgress ? 'Đang Sản Xuất' : 'Chờ Sản Xuất');
      }

      const createdTime = getFieldSafe(order, 'order_created_time', 'create_time', 'createdAt', 'created_at') || getFieldSafe(order, 'updated_at', 'updatedAt') || '';
      const rtsTime = getFieldSafe(order, 'ready_to_ship_time', 'rts_time') || '';
      const updatedAt = getFieldSafe(order, 'updated_at', 'updatedAt') || '';

      return {
        order_sn: orderSn,
        market_code: rawMarket,
        order_status: rawStatusStr || 'READY_TO_SHIP',
        order_created_time: createdTime,
        ready_to_ship_time: rtsTime,
        currency_origin: getFieldSafe(order, 'currency_origin', 'ncy_origin') || rawMarket,
        total_amount_origin: originAmount,
        exchange_rate: rate,
        total_amount_vnd: vndAmount,
        buyer_username: String(getFieldSafe(order, 'buyer_username', 'buyer', 'username') || 'Khách Quốc Tế'),
        inventory_deducted: isDeducted,
        updated_at: updatedAt,
        items: orderItems,
        escrow: escrowMap.get(orderSn) || null,
        dispute: disputesMap.get(orderSn) || null,
        productionTickets: orderProdTickets,
        productionStatus: productionStatus
      };
    });

    // Lọc theo market nếu có
    const filteredOrders = rawFilter && rawFilter !== 'ALL'
      ? enrichedOrders.filter(o => o.market_code === rawFilter)
      : enrichedOrders;

    // Sắp xếp đơn mới nhất lên đầu
    filteredOrders.sort((a, b) => new Date(b.order_created_time || 0) - new Date(a.order_created_time || 0));

    // Thống kê theo từng Market
    const marketBreakdown = {};
    const ALL_MARKET_CODES = ['MY', 'PH', 'TH', 'SG', 'TW', 'BR', 'ID'];
    ALL_MARKET_CODES.forEach(code => {
      marketBreakdown[code] = { count: 0, revenueVnd: 0, rts: 0, comp: 0 };
    });

    enrichedOrders.forEach(o => {
      const m = o.market_code;
      if (marketBreakdown[m]) {
        marketBreakdown[m].count++;
        marketBreakdown[m].revenueVnd += o.total_amount_vnd;
        const stUpper = String(o.order_status).toUpperCase();
        if (stUpper === 'READY_TO_SHIP' || stUpper === 'CHỜ GIAO' || stUpper === 'CHỜ SẢN XUẤT') marketBreakdown[m].rts++;
        if (stUpper === 'COMPLETED' || stUpper === 'HOÀN THÀNH' || stUpper === 'ĐỐI SOÁT THÀNH CÔNG' || stUpper === 'ĐÃ BÀN GIAO') marketBreakdown[m].comp++;
      }
    });

    const summaryData = {
      totalOrders: enrichedOrders.length,
      totalOrdersCount: enrichedOrders.length,
      readyToShip: readyToShipCount,
      readyToShipCount: readyToShipCount,
      completed: completedCount,
      completedCount: completedCount,
      cancelledCount: cancelledCount,
      disputesCount: returnedDisputedCount,
      totalLossDisputeVnd: totalLossDisputeVnd,
      totalRevenueVnd: totalRevenueVnd,
      totalPlatformFeeVnd: totalPlatformFeeVnd,
      reconciledPayoutVnd: reconciledPayoutVnd,
      totalEscrowPayoutVnd: reconciledPayoutVnd,
      pendingDeductionCount: pendingDeductionCount,
      marketBreakdown: marketBreakdown
    };

    const ssId = ShopeeDbService.getSpreadsheetId();

    return {
      success: true,
      timestamp: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss'),
      spreadsheetId: ssId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${ssId}/edit`,
      summary: summaryData,
      kpi: summaryData,
      markets: ALL_MARKET_CODES,
      orders: filteredOrders,
      escrowList: escrowRecords,
      disputesList: disputes,
      auditLogs: auditLogs.slice(-50).reverse()
    };

  } catch (error) {
    Logger.log(`❌ [ShopeeController.getShopeeGlobalDashboardData] Error: ${error.stack || error.message}`);
    return {
      success: false,
      message: error.toString(),
      summary: { totalOrders: 0, readyToShip: 0, completed: 0, totalRevenueVnd: 0, reconciledPayoutVnd: 0 },
      kpi: { totalOrdersCount: 0, readyToShipCount: 0, completedCount: 0, totalRevenueVnd: 0, totalEscrowPayoutVnd: 0, pendingDeductionCount: 0 },
      orders: [],
      escrowList: [],
      disputesList: [],
      auditLogs: []
    };
  }
}

/**
 * Khấu trừ tồn kho xưởng Rich Fish cho một đơn hàng Shopee Global
 * @param {string} orderSn - Mã đơn hàng Shopee
 * @param {string} [pin=''] - Mã PIN xác thực
 * @returns {Object}
 */
function api_deductShopeeOrderStock(orderSn, pin) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const sn = String(orderSn || '').trim();
    if (!sn) return { success: false, message: 'Mã đơn hàng không được để trống' };

    // 1. Kiểm tra đơn hàng trong DB_ORDERS
    const order = ShopeeDbService.findOne('DB_ORDERS', 'order_sn', sn);
    if (!order) return { success: false, message: 'Không tìm thấy đơn hàng Shopee: ' + sn };

    if (order.inventory_deducted === true || String(order.inventory_deducted).toLowerCase() === 'true') {
      return { success: false, message: 'Đơn hàng này đã được trừ kho trước đó!' };
    }

    // 2. Lấy danh sách items từ DB_ORDER_ITEMS
    const items = ShopeeDbService.find('DB_ORDER_ITEMS', item => String(item.order_sn).trim() === sn);
    if (!items || items.length === 0) {
      return { success: false, message: 'Đơn hàng chưa có dữ liệu sản phẩm (DB_ORDER_ITEMS rỗng)' };
    }

    // 3. Trừ tồn kho trong bảng Products của Xưởng Rich Fish
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const prodSheet = ss.getSheetByName('Products');
    const ieSheet = ss.getSheetByName('ImportExport');
    if (!prodSheet) return { success: false, message: 'Không tìm thấy bảng Products xưởng' };

    const pData = prodSheet.getDataRange().getValues();
    const pHeaders = pData[0];
    const skuCol = pHeaders.indexOf('sku');
    const qtyCol = pHeaders.indexOf('quantity');
    const nameCol = pHeaders.indexOf('name');
    const costCol = pHeaders.indexOf('costPrice');

    let deductedItems = [];
    let totalDeductedVal = 0;

    items.forEach(item => {
      const itemSku = String(item.sku || '').trim();
      const itemQty = Number(item.quantity) || 1;

      for (let r = 1; r < pData.length; r++) {
        if (String(pData[r][skuCol] || '').trim() === itemSku) {
          const currentQty = Number(pData[r][qtyCol]) || 0;
          const cost = Number(pData[r][costCol]) || 0;
          pData[r][qtyCol] = Math.max(0, currentQty - itemQty);
          totalDeductedVal += (cost * itemQty);
          deductedItems.push({
            sku: itemSku,
            name: pData[r][nameCol] || item.product_name,
            qty: itemQty,
            costPrice: cost
          });
          break;
        }
      }
    });

    // Ghi đè lại bảng Products
    prodSheet.getRange(1, 1, pData.length, pHeaders.length).setValues(pData);

    // 4. Ghi log xuất kho vào bảng ImportExport của xưởng
    if (ieSheet && deductedItems.length > 0) {
      const nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
      const ieRow = [
        'IE_GLOBAL_' + Date.now(),
        'Xuất',
        'Shopee Global (' + (order.market_code || 'Quốc Tế') + ')',
        totalDeductedVal,
        nowStr,
        'Xuất kho đơn hàng quốc tế: ' + sn + ' | Người mua: ' + (order.buyer_username || 'Khách Shopee'),
        JSON.stringify(deductedItems)
      ];
      ieSheet.appendRow(ieRow);
    }

    // 5. Cập nhật trạng thái inventory_deducted trong DB_ORDERS
    ShopeeDbService.updateWhere('DB_ORDERS', 'order_sn', sn, {
      inventory_deducted: true,
      updated_at: Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss")
    });

    // 6. Ghi log kiểm toán
    ShopeeDbService.insert('DB_AGENT_AUDIT_LOGS', {
      log_id: 'LOG_' + Date.now(),
      timestamp: new Date().toISOString(),
      agent_name: 'ShopeeStockEngine',
      trigger_event: 'MANUAL_STOCK_DEDUCT',
      target_ref: sn,
      action_summary: 'Khấu trừ ' + deductedItems.length + ' SKU xưởng cho đơn ' + sn,
      status: 'SUCCESS',
      raw_payload: JSON.stringify(deductedItems)
    });

    return {
      success: true,
      message: 'Đã trừ tồn kho xưởng thành công cho đơn: ' + sn + ' (' + deductedItems.length + ' sản phẩm)!',
      data: deductedItems
    };

  } catch (e) {
    return { success: false, message: 'Lỗi trừ kho đơn Shopee: ' + e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Tạo lệnh sản xuất trực tiếp trên bảng Production của xưởng Rich Fish cho đơn Shopee Global
 * @param {string} orderSn 
 * @param {string} [pin='']
 * @returns {Object}
 */
function api_createShopeeProductionTickets(orderSn, pin) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const sn = String(orderSn || '').trim();
    if (!sn) return { success: false, message: 'Mã đơn hàng không được để trống' };

    const order = ShopeeDbService.findOne('DB_ORDERS', 'order_sn', sn);
    if (!order) return { success: false, message: 'Không tìm thấy đơn hàng: ' + sn };

    const items = ShopeeDbService.find('DB_ORDER_ITEMS', item => String(item.order_sn).trim() === sn);
    if (!items || items.length === 0) return { success: false, message: 'Đơn không có chi tiết sản phẩm' };

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const prodSheet = ss.getSheetByName('Production');
    if (!prodSheet) return { success: false, message: 'Không tìm thấy bảng Production xưởng' };

    const nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
    const newProdRows = [];

    items.forEach((item, idx) => {
      const qty = Number(item.quantity) || 1;
      for (let q = 1; q <= qty; q++) {
        const prodId = 'PROD_GLOBAL_' + Date.now() + '_' + idx + '_' + q;
        const prodName = (item.product_name || item.sku) + ' [Shopee ' + (order.market_code || 'Global') + ']';
        // Schema Production: id, orderId, type, name, note, status, deadline, ...
        newProdRows.push([
          prodId,
          sn,
          'Khung',
          prodName,
          'Đơn Shopee Global xuất ' + (order.market_code || 'Global') + ' | Khách: ' + (order.buyer_username || 'Quốc tế'),
          'Pending',
          order.ready_to_ship_time || nowStr,
          false,
          '', 'Pending', '', '', '', '', 0,
          '', 'Pending', '', '', '', '', 0,
          '', '', 'Pending', ''
        ]);
      }
    });

    if (newProdRows.length > 0) {
      prodSheet.getRange(prodSheet.getLastRow() + 1, 1, newProdRows.length, newProdRows[0].length).setValues(newProdRows);
    }

    ShopeeDbService.insert('DB_AGENT_AUDIT_LOGS', {
      log_id: 'LOG_' + Date.now(),
      timestamp: new Date().toISOString(),
      agent_name: 'ShopeeProductionBridge',
      trigger_event: 'CREATE_FACTORY_TICKETS',
      target_ref: sn,
      action_summary: 'Sinh ' + newProdRows.length + ' lệnh sản xuất xưởng cho đơn ' + sn,
      status: 'SUCCESS',
      raw_payload: JSON.stringify({ count: newProdRows.length })
    });

    return {
      success: true,
      message: 'Đã sinh ' + newProdRows.length + ' lệnh sản xuất thành công trên bảng điều phối xưởng!',
      ticketsCount: newProdRows.length
    };

  } catch (err) {
    return { success: false, message: 'Lỗi tạo lệnh sản xuất: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Kích hoạt đồng bộ API Shopee thủ công từ giao diện Web App
 */
function api_triggerShopeeSyncNow() {
  try {
    if (typeof ShopeeSyncEngine === 'undefined') {
      return { success: false, message: 'ShopeeSyncEngine chưa được cài đặt.' };
    }
    const result = ShopeeSyncEngine.syncOrdersFromApi(15);
    return {
      success: true,
      message: `Đã đồng bộ thành công! Mới: ${result.newOrders || 0}, Cập nhật: ${result.updatedOrders || 0}, Trừ kho: ${result.stockDeductedOrders || 0}`,
      data: result
    };
  } catch (err) {
    return { success: false, message: 'Lỗi đồng bộ Shopee API: ' + err.message };
  }
}
