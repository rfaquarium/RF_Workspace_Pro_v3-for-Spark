/**
 * ==============================================================================
 * MODULE: SetupShopeeDB.js
 * MÔ TẢ: Khởi tạo tự động cấu trúc cơ sở dữ liệu Shopee Global (Data Isolation)
 *        trên một Google Spreadsheet riêng biệt cho RF Workspace Pro.
 * DOANH NGHIỆP: Rich Fish Aquarium
 * ==============================================================================
 */

/**
 * Định nghĩa cấu hình Schema cho 5 bảng dữ liệu Shopee Global độc lập
 */
const SHOPEE_DB_SCHEMAS = {
  'DB_ORDERS': [
    'order_sn',
    'market_code',
    'order_status',
    'order_created_time',
    'ready_to_ship_time',
    'currency_origin',
    'total_amount_origin',
    'exchange_rate',
    'total_amount_vnd',
    'buyer_username',
    'inventory_deducted',
    'updated_at'
  ],
  'DB_ORDER_ITEMS': [
    'item_row_id',
    'order_sn',
    'sku',
    'product_name',
    'quantity',
    'unit_price_origin',
    'item_status',
    'inventory_note'
  ],
  'DB_ESCROW_RECON': [
    'recon_id',
    'order_sn',
    'payout_date',
    'currency_origin',
    'buyer_total_paid',
    'fee_commission',
    'fee_service',
    'fee_transaction',
    'fee_seller_voucher',
    'fee_shipping_cross',
    'actual_payout_origin',
    'applied_rate',
    'actual_payout_vnd',
    'recon_status'
  ],
  'DB_RETURNS_DISPUTES': [
    'dispute_id',
    'order_sn',
    'sku',
    'return_reason',
    'handling_decision',
    'loss_amount_vnd',
    'shopee_claim_status',
    'compensation_vnd'
  ],
  'DB_AGENT_AUDIT_LOGS': [
    'log_id',
    'timestamp',
    'agent_name',
    'trigger_event',
    'target_ref',
    'action_summary',
    'status',
    'raw_payload'
  ]
};

/**
 * Chạy hàm này 1 lần duy nhất để tự động tạo cấu trúc dữ liệu Shopee Global
 * trên một Google Spreadsheet mới, gắn header chuẩn hóa, bôi màu và đóng băng dòng tiêu đề.
 * Tự động lưu ID bảng tính vào Script Properties với key SHOPEE_DB_SPREADSHEET_ID.
 * 
 * @returns {Object} Thông tin cấu hình cơ sở dữ liệu vừa tạo
 */
function initShopeeDatabase() {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    Logger.log('🚀 [ShopeeDB Setup] Bắt đầu khởi tạo Google Spreadsheet Shopee Global riêng biệt...');

    // 1. Tạo Google Spreadsheet mới
    const spreadsheetName = 'RF_Workspace_Shopee_Global_DB';
    const newSpreadsheet = SpreadsheetApp.create(spreadsheetName);
    const ssId = newSpreadsheet.getId();
    const ssUrl = newSpreadsheet.getUrl();

    // 2. Lưu ID bảng tính mới vào Script Properties để toàn hệ thống dùng chung
    PropertiesService.getScriptProperties().setProperty('SHOPEE_DB_SPREADSHEET_ID', ssId);
    Logger.log(`✅ Đã tạo bảng tính thành công!\n- Tên: ${spreadsheetName}\n- ID: ${ssId}\n- URL: ${ssUrl}`);

    // 3. Khởi tạo từng Sheet và định dạng Header theo Schema chuẩn hóa
    const sheetNames = Object.keys(SHOPEE_DB_SCHEMAS);

    sheetNames.forEach((sheetName, index) => {
      let sheet;
      if (index === 0) {
        sheet = newSpreadsheet.getSheets()[0];
        sheet.setName(sheetName);
      } else {
        sheet = newSpreadsheet.insertSheet(sheetName);
      }

      const headers = SHOPEE_DB_SCHEMAS[sheetName];
      
      // Ghi Header vào dòng 1
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

      // Định dạng Header: Chữ đậm, nền slate tối (#1e293b), chữ trắng, căn giữa, đóng băng hàng 1
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#1e293b');
      headerRange.setFontColor('#ffffff');
      headerRange.setHorizontalAlignment('center');
      headerRange.setVerticalAlignment('middle');
      
      sheet.setFrozenRows(1);
      
      // Auto-resize cột và chỉnh độ cao hàng tiêu đề
      sheet.setRowHeight(1, 36);
      for (let col = 1; col <= headers.length; col++) {
        sheet.autoResizeColumn(col);
      }

      Logger.log(` ✔️ Sheet [${sheetName}] đã khởi tạo với ${headers.length} cột.`);
    });

    Logger.log('🎉 Hoàn tất khởi tạo toàn bộ 5 bảng dữ liệu Shopee Global!');

    return {
      success: true,
      spreadsheetId: ssId,
      spreadsheetUrl: ssUrl,
      sheets: sheetNames
    };
  } catch (error) {
    Logger.log(`❌ Lỗi khi khởi tạo Shopee Database: ${error.message}`);
    throw error;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Hàm hỗ trợ lấy thông tin cấu hình Shopee Database hiện tại
 */
function getShopeeDatabaseInfo() {
  const dbId = PropertiesService.getScriptProperties().getProperty('SHOPEE_DB_SPREADSHEET_ID');
  if (!dbId) {
    return {
      configured: false,
      message: 'Chưa cấu hình SHOPEE_DB_SPREADSHEET_ID trong Script Properties. Hãy chạy initShopeeDatabase().'
    };
  }

  try {
    const ss = SpreadsheetApp.openById(dbId);
    return {
      configured: true,
      spreadsheetId: dbId,
      spreadsheetName: ss.getName(),
      spreadsheetUrl: ss.getUrl(),
      sheets: ss.getSheets().map(s => s.getName())
    };
  } catch (err) {
    return {
      configured: false,
      spreadsheetId: dbId,
      error: `Không thể mở bảng tính với ID [${dbId}]: ${err.message}`
    };
  }
}

/**
 * Hàm gán thủ công ID Spreadsheet có sẵn nếu người dùng đã tạo trước
 * @param {string} customSpreadsheetId 
 */
function setShopeeDatabaseId(customSpreadsheetId) {
  if (!customSpreadsheetId || typeof customSpreadsheetId !== 'string') {
    throw new Error('ID bảng tính không hợp lệ.');
  }
  const cleanId = customSpreadsheetId.trim();
  PropertiesService.getScriptProperties().setProperty('SHOPEE_DB_SPREADSHEET_ID', cleanId);
  Logger.log(`Đã cập nhật SHOPEE_DB_SPREADSHEET_ID = ${cleanId}`);
  return { success: true, spreadsheetId: cleanId };
}
