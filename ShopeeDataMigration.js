/**
 * ==============================================================================
 * MODULE: ShopeeDataMigration.js
 * MÔ TẢ: Script di trú dữ liệu an toàn (Safe Data Migration) cho đơn hàng
 *        Shopee Global (các thị trường TH, SG, MY, PH, TW, BR...) từ bảng tính cũ
 *        của xưởng sang CSDL độc lập RF_Workspace_Shopee_Global_DB.
 * 
 * NGUYÊN TẮC BẢO MẬT & VẬN HÀNH:
 * 1. Read-Only Tuyệt Đối: Chỉ đọc dữ liệu qua getValues(), KHÔNG sửa/xóa/đè CSDL cũ.
 * 2. Khóa Cờ Kho (Idempotency Lock): Gán inventory_deducted = true trong DB_ORDERS
 *    và item_status = 'DEDUCTED' trong DB_ORDER_ITEMS để ngăn kích hoạt lại trừ kho.
 * 3. Chống Trùng Lặp (Idempotent): Quét Set(order_sn) hiện có để bỏ qua đơn đã nạp.
 * 4. Ghi Audit Log toàn diện vào DB_AGENT_AUDIT_LOGS sau khi hoàn tất.
 * 
 * DOANH NGHIỆP: Rich Fish Aquarium
 * TƯƠNG THÍCH: Google Apps Script V8 Engine
 * ==============================================================================
 */

const ShopeeDataMigration = {
  /**
   * Bảng quy đổi tiền tệ mặc định cho các thị trường (đồng bộ nguồn SHOPEE_CANONICAL_EXCHANGE_RATES)
   */
  EXCHANGE_RATES: (typeof SHOPEE_CANONICAL_EXCHANGE_RATES !== 'undefined') ? SHOPEE_CANONICAL_EXCHANGE_RATES : {
    'TH': 710,    // Thái Lan (THB)
    'THB': 710,
    'SG': 18800,  // Singapore (SGD)
    'SGD': 18800,
    'MY': 5600,   // Malaysia (MYR)
    'MYR': 5600,
    'PH': 440,    // Philippines (PHP)
    'PHP': 440,
    'TW': 800,    // Đài Loan (TWD)
    'TWD': 800,
    'BR': 4500,   // Brazil (BRL)
    'BRL': 4500,
    'USD': 25400,
    'VND': 1
  },

  /**
   * Kiểm tra một dòng đơn hàng có phải đơn Shopee Global hay không
   * @param {Object} orderRow - Object chứa các trường của đơn hàng cũ
   * @returns {{ isGlobal: boolean, market: string }}
   */
  detectShopeeGlobal: function(orderRow) {
    const channel = String(orderRow.channel || '').toUpperCase().trim();
    const orderCode = String(orderRow.orderCode || orderRow.id || '').toUpperCase().trim();
    const note = String(orderRow.note || '').toUpperCase().trim();
    const customer = String(orderRow.customer || '').toUpperCase().trim();
    const shippingMethod = String(orderRow.shippingMethod || '').toUpperCase().trim();

    const fullText = `${channel} ${orderCode} ${note} ${customer} ${shippingMethod}`;

    // Kiểm tra kênh Shopee
    const isShopee = channel.includes('SHOPEE') || fullText.includes('SHOPEE');
    if (!isShopee) {
      return { isGlobal: false, market: '' };
    }

    // Danh sách từ khóa nhận diện thị trường quốc tế
    const markets = [
      { code: 'TH', keywords: ['THÁI', 'THAI', 'THB', 'SHOPEE TH', 'SHOPEE_TH', 'TH-'] },
      { code: 'SG', keywords: ['SING', 'SGD', 'SHOPEE SG', 'SHOPEE_SG', 'SG-'] },
      { code: 'MY', keywords: ['MALAY', 'MYR', 'SHOPEE MY', 'SHOPEE_MY', 'MY-'] },
      { code: 'PH', keywords: ['PHILIP', 'PHP', 'SHOPEE PH', 'SHOPEE_PH', 'PH-'] },
      { code: 'TW', keywords: ['ĐÀI LOAN', 'DAI LOAN', 'TAIWAN', 'TWD', 'SHOPEE TW', 'TW-'] },
      { code: 'BR', keywords: ['BRAZIL', 'BRL', 'SHOPEE BR', 'SHOPEE_BR', 'BR-'] }
    ];

    for (let i = 0; i < markets.length; i++) {
      const m = markets[i];
      for (let k = 0; k < m.keywords.length; k++) {
        if (fullText.includes(m.keywords[k])) {
          return { isGlobal: true, market: m.code };
        }
      }
    }

    // Kiểm tra các tag chung như GLOBAL, QUỐC TẾ, CROSSBORDER
    if (fullText.includes('GLOBAL') || fullText.includes('QUỐC TẾ') || fullText.includes('QUOC TE') || fullText.includes('CROSSBORDER')) {
      return { isGlobal: true, market: 'GLOBAL' };
    }

    return { isGlobal: false, market: '' };
  },

  /**
   * Parse chuỗi phụ kiện / sản phẩm cũ thành danh sách các SKU
   * @param {string|Array} accData
   * @returns {Array<{ sku: string, name: string, quantity: number, price: number }>}
   */
  parseAccessories: function(accData) {
    if (!accData) return [];
    if (Array.isArray(accData)) {
      return accData.map(item => ({
        sku: String(item.sku || item.code || item.name || 'SKU_UNKNOWN').trim(),
        name: String(item.name || item.sku || 'Sản phẩm Shopee').trim(),
        quantity: Number(item.quantity || item.qty || 1),
        price: Number(item.price || item.cost || 0)
      }));
    }

    if (typeof accData === 'string') {
      const trimmed = accData.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return this.parseAccessories(parsed);
          if (typeof parsed === 'object' && parsed !== null) return this.parseAccessories([parsed]);
        } catch (e) {
          // Fallback text parser
        }
      }

      // Phân tách dấu phẩy hoặc dòng
      const parts = trimmed.split(/[\n,;]+/);
      return parts.map(part => {
        const clean = part.trim();
        if (!clean) return null;
        // Bắt mẫu "Tên (x2)" hoặc "SKU x 2"
        const match = clean.match(/^(.*?)(?:[xX*]\s*(\d+)|\((\d+)\))?$/);
        const name = match && match[1] ? match[1].trim() : clean;
        const qty = match && (match[2] || match[3]) ? Number(match[2] || match[3]) : 1;
        return {
          sku: name,
          name: name,
          quantity: qty,
          price: 0
        };
      }).filter(Boolean);
    }

    return [];
  },

  /**
   * Thực hiện di trú dữ liệu đơn Shopee Global từ bảng tính cũ sang CSDL độc lập
   * @param {string} [oldSheetName='Orders'] - Tên Sheet cần quét trên bảng tính cũ ('Orders' hoặc 'Orders_Archive')
   * @returns {Object} Báo cáo thống kê kết quả di trú
   */
  runMigration: function(oldSheetName = 'Orders') {
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);

    try {
      Logger.log(`🚀 [ShopeeDataMigration] Bắt đầu quét dữ liệu từ Sheet [${oldSheetName}] của xưởng...`);

      // 1. Đọc bảng tính cũ ở chế độ READ-ONLY tuyệt đối
      const mainSs = SpreadsheetApp.getActiveSpreadsheet();
      const oldSheet = mainSs.getSheetByName(oldSheetName);

      if (!oldSheet) {
        throw new Error(`Sheet [${oldSheetName}] không tồn tại trên bảng tính xưởng.`);
      }

      const lastRow = oldSheet.getLastRow();
      const lastCol = oldSheet.getLastColumn();

      if (lastRow <= 1 || lastCol === 0) {
        return {
          success: true,
          message: `Sheet [${oldSheetName}] không có dữ liệu để di trú.`,
          totalScanned: 0,
          migratedCount: 0
        };
      }

      const oldData = oldSheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = oldData[0].map(h => String(h).trim());
      const rows = oldData.slice(1);

      Logger.log(`📊 [ShopeeDataMigration] Đã tải ${rows.length} dòng dữ liệu từ Sheet [${oldSheetName}].`);

      // 2. Tải toàn bộ order_sn đã có ở CSDL Shopee mới để đảm bảo Idempotent (chống trùng lặp)
      const existingOrders = ShopeeDbService.getAll('DB_ORDERS');
      const existingOrderSnSet = new Set(
        existingOrders.map(o => String(o.order_sn || '').trim().toLowerCase()).filter(Boolean)
      );

      Logger.log(`🔒 [ShopeeDataMigration] CSDL Shopee hiện đã có ${existingOrderSnSet.size} mã đơn. Sẽ tự động bỏ qua nếu trùng.`);

      // 3. Quét, lọc và chuyển đổi dữ liệu
      const ordersToInsert = [];
      const itemsToInsert = [];
      let totalShopeeFound = 0;
      let totalSkippedDuplicate = 0;

      rows.forEach((row, rowIndex) => {
        const rowObj = {};
        headers.forEach((h, colIdx) => {
          if (h) rowObj[h] = row[colIdx];
        });

        const detection = this.detectShopeeGlobal(rowObj);
        if (!detection.isGlobal) {
          return; // Bỏ qua đơn nội địa / không phải Shopee Global
        }

        totalShopeeFound++;

        const rawOrderSn = String(rowObj.orderCode || rowObj.id || `MIG_${rowIndex + 1}`).trim();
        const orderSnNormalized = rawOrderSn.toLowerCase();

        // Kiểm tra Idempotent chống trùng
        if (existingOrderSnSet.has(orderSnNormalized)) {
          totalSkippedDuplicate++;
          return;
        }

        // Đánh dấu đã quét để tránh trùng ngay trong cùng batch cũ
        existingOrderSnSet.add(orderSnNormalized);

        const marketCode = detection.market;
        const exchangeRate = (typeof getShopeeExchangeRate === 'function') ? getShopeeExchangeRate(marketCode) : (this.EXCHANGE_RATES[marketCode] || 1);
        const rawRevenue = Number(rowObj.revenue || rowObj.totalAmount || 0);
        const revenueVnd = rawRevenue; // Do đơn cũ thường đã ghi doanh thu theo VNĐ
        const rawStatus = String(rowObj.status || 'Hoàn thành').trim().toUpperCase();

        const createdDate = rowObj.createdAt || rowObj.date || new Date();
        const createdDateStr = Utilities.formatDate(new Date(createdDate), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');
        const nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');

        // A. Cấu trúc bản ghi DB_ORDERS (Khóa cờ inventory_deducted = true)
        const orderRecord = {
          order_sn: rawOrderSn,
          market_code: marketCode,
          order_status: rawStatus,
          order_created_time: createdDateStr,
          ready_to_ship_time: createdDateStr,
          currency_origin: marketCode,
          total_amount_origin: exchangeRate > 1 ? Math.round(revenueVnd / exchangeRate) : revenueVnd,
          exchange_rate: exchangeRate,
          total_amount_vnd: revenueVnd,
          buyer_username: String(rowObj.customer || rowObj.phone || 'Khách Quốc Tế').trim(),
          inventory_deducted: true, // KHÓA CỜ KHO: Ngăn trừ kho lại
          updated_at: nowStr
        };

        ordersToInsert.push(orderRecord);

        // B. Bóc tách SKU vào DB_ORDER_ITEMS (Gán item_status = 'DEDUCTED')
        const items = this.parseAccessories(rowObj.accessories);
        if (items.length > 0) {
          items.forEach((item, itemIdx) => {
            itemsToInsert.push({
              item_row_id: `${rawOrderSn}_${item.sku}_${itemIdx + 1}`,
              order_sn: rawOrderSn,
              sku: item.sku,
              product_name: item.name,
              quantity: item.quantity,
              unit_price_origin: item.price || 0,
              item_status: 'DEDUCTED', // ĐÃ TRỪ KHO TỪ TRƯỚC
              inventory_note: `Di trú an toàn từ [${oldSheetName}] ngày ${nowStr}`
            });
          });
        } else {
          // Nếu không có accessories chi tiết, tạo 1 dòng sản phẩm đại diện
          itemsToInsert.push({
            item_row_id: `${rawOrderSn}_SKU_1`,
            order_sn: rawOrderSn,
            sku: 'SKU_LEGACY_MIGRATED',
            product_name: `Đơn hàng Shopee Global (${marketCode})`,
            quantity: 1,
            unit_price_origin: 0,
            item_status: 'DEDUCTED',
            inventory_note: `Di trú an toàn từ [${oldSheetName}] ngày ${nowStr}`
          });
        }
      });

      Logger.log(`✨ [ShopeeDataMigration] Tìm thấy ${totalShopeeFound} đơn Shopee Global. Cần nạp mới: ${ordersToInsert.length}, Trùng lặp bỏ qua: ${totalSkippedDuplicate}.`);

      // 4. Ghi dữ liệu vào CSDL độc lập mới theo lô an toàn
      if (ordersToInsert.length > 0) {
        ShopeeDbService.insertBatch('DB_ORDERS', ordersToInsert);
        Logger.log(`✅ Đã nạp thành công ${ordersToInsert.length} đơn vào DB_ORDERS.`);
      }

      if (itemsToInsert.length > 0) {
        ShopeeDbService.insertBatch('DB_ORDER_ITEMS', itemsToInsert);
        Logger.log(`✅ Đã nạp thành công ${itemsToInsert.length} chi tiết SKU vào DB_ORDER_ITEMS.`);
      }

      const migrationReport = {
        success: true,
        sourceSheet: oldSheetName,
        totalScannedRows: rows.length,
        totalShopeeFound: totalShopeeFound,
        migratedOrdersCount: ordersToInsert.length,
        migratedItemsCount: itemsToInsert.length,
        skippedDuplicatesCount: totalSkippedDuplicate,
        timestamp: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss')
      };

      // 5. Ghi Audit Log vào CSDL Shopee
      ShopeeDbService.logAudit(
        'Shopee_Data_Migration_Tool',
        'LEGACY_DATA_MIGRATION',
        `SHEET_${oldSheetName}`,
        `Di trú an toàn ${ordersToInsert.length} đơn Shopee Global từ [${oldSheetName}]`,
        'SUCCESS',
        migrationReport
      );

      Logger.log('🎉 [ShopeeDataMigration] Quá trình di trú hoàn tất 100%!');
      return migrationReport;

    } catch (err) {
      Logger.log(`❌ [ShopeeDataMigration] Lỗi di trú dữ liệu: ${err.stack || err.message}`);
      try {
        ShopeeDbService.logAudit(
          'Shopee_Data_Migration_Tool',
          'LEGACY_DATA_MIGRATION_FAILED',
          `SHEET_${oldSheetName}`,
          err.message,
          'FAILED',
          { error: err.message, stack: err.stack }
        );
      } catch (logErr) { }
      throw err;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Chạy di trú toàn bộ từ cả 2 bảng Orders và Orders_Archive
   * @returns {Object} Tổng kết di trú toàn diện
   */
  runFullMigration: function() {
    Logger.log('🚀 [ShopeeDataMigration] Bắt đầu di trú toàn diện (Orders + Orders_Archive)...');
    const resultOrders = this.runMigration('Orders');
    
    let resultArchive = { migratedOrdersCount: 0, migratedItemsCount: 0, skippedDuplicatesCount: 0 };
    try {
      resultArchive = this.runMigration('Orders_Archive');
    } catch (e) {
      Logger.log(`⚠️ Bỏ qua Orders_Archive: ${e.message}`);
    }

    return {
      success: true,
      ordersSheet: resultOrders,
      archiveSheet: resultArchive,
      totalMigrated: (resultOrders.migratedOrdersCount || 0) + (resultArchive.migratedOrdersCount || 0)
    };
  }
};

/**
 * Hàm Entrypoint gọi nhanh từ Apps Script Editor để di trú bảng Orders
 */
function runShopeeMigration() {
  return ShopeeDataMigration.runFullMigration();
}
