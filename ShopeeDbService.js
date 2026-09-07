/**
 * ==============================================================================
 * MODULE: ShopeeDbService.js
 * MÔ TẢ: Data Access Object (DAO) tầng truy xuất và thao tác CSDL Shopee Global
 *        độc lập (Data Isolation) cho RF Workspace Pro.
 * DOANH NGHIỆP: Rich Fish Aquarium
 * ==============================================================================
 */

const ShopeeDbService = {
  /**
   * Danh mục Schema 5 bảng CSDL Shopee Global chuẩn hóa
   */
  SCHEMAS: {
    DB_ORDERS: [
      'order_sn', 'market_code', 'order_status', 'order_created_time',
      'ready_to_ship_time', 'currency_origin', 'total_amount_origin',
      'exchange_rate', 'total_amount_vnd', 'buyer_username',
      'inventory_deducted', 'updated_at'
    ],
    DB_ORDER_ITEMS: [
      'item_row_id', 'order_sn', 'sku', 'product_name',
      'quantity', 'unit_price_origin', 'item_status', 'inventory_note'
    ],
    DB_ESCROW_RECON: [
      'recon_id', 'order_sn', 'payout_date', 'currency_origin',
      'buyer_total_paid', 'fee_commission', 'fee_service', 'fee_transaction',
      'fee_seller_voucher', 'fee_shipping_cross', 'actual_payout_origin',
      'applied_rate', 'actual_payout_vnd', 'recon_status'
    ],
    DB_RETURNS_DISPUTES: [
      'dispute_id', 'order_sn', 'sku', 'return_reason',
      'handling_decision', 'loss_amount_vnd', 'shopee_claim_status', 'compensation_vnd'
    ],
    DB_AGENT_AUDIT_LOGS: [
      'log_id', 'timestamp', 'agent_name', 'trigger_event',
      'target_ref', 'action_summary', 'status', 'raw_payload'
    ]
  },

  /**
   * Lấy ID Spreadsheet từ Script Properties (Mặc định kết nối RF_Workspace_Shopee_Global_DB)
   * @returns {string}
   */
  getSpreadsheetId: function() {
    let dbId = PropertiesService.getScriptProperties().getProperty('SHOPEE_DB_SPREADSHEET_ID');
    if (!dbId || dbId.trim() === '') {
      dbId = '1b26SUcjRaGYt0_pzRyvxk6MFX4Kxx9t1O3DchmOwTUg';
      try {
        PropertiesService.getScriptProperties().setProperty('SHOPEE_DB_SPREADSHEET_ID', dbId);
      } catch (e) {}
    }
    return dbId;
  },

  /**
   * Mở đối tượng Google Spreadsheet độc lập của Shopee
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
   */
  getSpreadsheet: function() {
    let dbId = this.getSpreadsheetId();
    const fallbackId = '1b26SUcjRaGYt0_pzRyvxk6MFX4Kxx9t1O3DchmOwTUg';
    try {
      return SpreadsheetApp.openById(dbId);
    } catch (err) {
      if (dbId !== fallbackId) {
        try {
          const ss = SpreadsheetApp.openById(fallbackId);
          PropertiesService.getScriptProperties().setProperty('SHOPEE_DB_SPREADSHEET_ID', fallbackId);
          return ss;
        } catch (e2) {}
      }
      const activeSs = SpreadsheetApp.getActiveSpreadsheet();
      if (activeSs) return activeSs;
      throw new Error(`[ShopeeDbService] Không thể mở Shopee Spreadsheet ID [${dbId}]: ${err.message}`);
    }
  },

  /**
   * Lấy đối tượng Sheet theo tên (Tự động khởi tạo và gắn Header chuẩn nếu chưa tồn tại)
   * @param {string} sheetName 
   * @returns {GoogleAppsScript.Spreadsheet.Sheet}
   */
  getSheet: function(sheetName) {
    if (!sheetName) throw new Error('[ShopeeDbService] Tên Sheet không được để trống.');
    const ss = this.getSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      const schema = this.SCHEMAS[sheetName] || [];
      sheet = ss.insertSheet(sheetName);
      if (schema.length > 0) {
        sheet.getRange(1, 1, 1, schema.length).setValues([schema])
          .setFontWeight('bold').setBackground('#1e293b').setFontColor('#f8fafc');
        sheet.setFrozenRows(1);
      }
    }
    return sheet;
  },

  /**
   * Lấy danh sách tên cột (headers) của một Sheet
   * @param {string} sheetName 
   * @returns {string[]}
   */
  getHeaders: function(sheetName) {
    const sheet = this.getSheet(sheetName);
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) return [];
    return sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h).trim());
  },

  /**
   * Đọc toàn bộ dữ liệu từ Sheet dưới dạng mảng các Object (key là header)
   * @param {string} sheetName 
   * @returns {Array<Object>}
   */
  getAll: function(sheetName) {
    let sheet;
    try {
      sheet = this.getSheet(sheetName);
    } catch (e) {
      Logger.log(`[ShopeeDbService.getAll] Warning: ${e.message}`);
      return [];
    }
    if (!sheet) return [];

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    if (lastRow <= 1 || lastCol === 0) {
      return [];
    }

    const data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = data[0].map(h => String(h).trim());
    const rows = data.slice(1);

    const tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';

    return rows.map((row, idx) => {
      const obj = { _rowIndex: idx + 2 };
      headers.forEach((header, colIdx) => {
        if (header) {
          let val = row[colIdx];
          if (val instanceof Date) {
            val = Utilities.formatDate(val, tz, 'yyyy-MM-dd HH:mm:ss');
          }
          obj[header] = (val !== undefined && val !== null) ? val : '';
        }
      });
      return obj;
    });
  },

  /**
   * Tìm kiếm các bản ghi thỏa mãn điều kiện predicate
   * @param {string} sheetName 
   * @param {Function} predicateFn Hàm lọc (record, index) => boolean
   * @returns {Array<Object>}
   */
  find: function(sheetName, predicateFn) {
    const records = this.getAll(sheetName);
    if (typeof predicateFn !== 'function') return records;
    return records.filter(predicateFn);
  },

  /**
   * Tìm một bản ghi theo khóa chính hoặc cột định danh
   * @param {string} sheetName 
   * @param {string} keyColumn Tên cột
   * @param {any} keyValue Giá trị cần tìm
   * @returns {Object|null}
   */
  findOne: function(sheetName, keyColumn, keyValue) {
    const records = this.getAll(sheetName);
    const targetStr = String(keyValue).trim().toLowerCase();
    const found = records.find(r => String(r[keyColumn] || '').trim().toLowerCase() === targetStr);
    return found || null;
  },

  findWhere: function(sheetName, keyColumn, keyValue) {
    return this.findOne(sheetName, keyColumn, keyValue);
  },

  /**
   * Ghi thêm một dòng dữ liệu dạng mảng thô (Có LockService an toàn)
   * @param {string} sheetName 
   * @param {Array} rowDataArray 
   * @returns {boolean}
   */
  appendRow: function(sheetName, rowDataArray) {
    if (!Array.isArray(rowDataArray)) {
      throw new Error('[ShopeeDbService.appendRow] rowDataArray phải là một mảng.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);

    try {
      const sheet = this.getSheet(sheetName);
      sheet.appendRow(rowDataArray);
      return true;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Thêm một Object bản ghi vào Sheet (tự động mapping theo thứ tự Header, có LockService)
   * @param {string} sheetName 
   * @param {Object} recordObject 
   * @returns {Object} Bản ghi đã lưu kèm timestamp
   */
  insert: function(sheetName, recordObject) {
    if (!recordObject || typeof recordObject !== 'object') {
      throw new Error('[ShopeeDbService.insert] recordObject không hợp lệ.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);

    try {
      const sheet = this.getSheet(sheetName);
      const headers = this.getHeaders(sheetName);

      if (headers.length === 0) {
        throw new Error(`[ShopeeDbService.insert] Sheet "${sheetName}" chưa có header.`);
      }

      const rowValues = headers.map(header => {
        const val = recordObject[header];
        return val !== undefined && val !== null ? val : '';
      });

      sheet.appendRow(rowValues);
      return { success: true, record: recordObject };
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Thêm hàng loạt bản ghi dạng Object vào Sheet (Batch Insert tối ưu tốc độ & LockService)
   * @param {string} sheetName 
   * @param {Array<Object>} recordObjects 
   * @returns {number} Số lượng bản ghi đã thêm
   */
  insertBatch: function(sheetName, recordObjects) {
    if (!Array.isArray(recordObjects) || recordObjects.length === 0) {
      return 0;
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);

    try {
      const sheet = this.getSheet(sheetName);
      const headers = this.getHeaders(sheetName);

      if (headers.length === 0) {
        throw new Error(`[ShopeeDbService.insertBatch] Sheet "${sheetName}" chưa có header.`);
      }

      const matrix = recordObjects.map(obj => {
        return headers.map(header => {
          const val = obj[header];
          return val !== undefined && val !== null ? val : '';
        });
      });

      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, matrix.length, headers.length).setValues(matrix);

      return matrix.length;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Cập nhật bản ghi thỏa điều kiện cột khóa (Update Where có LockService)
   * @param {string} sheetName 
   * @param {string} keyColumn Tên cột định danh (vd: 'order_sn', 'recon_id')
   * @param {any} keyValue Giá trị của cột định danh
   * @param {Object} updateObject Các trường cần cập nhật
   * @returns {number} Số dòng được cập nhật
   */
  updateWhere: function(sheetName, keyColumn, keyValue, updateObject) {
    if (!keyColumn || keyValue === undefined || !updateObject) {
      throw new Error('[ShopeeDbService.updateWhere] Tham số không hợp lệ.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);

    try {
      const sheet = this.getSheet(sheetName);
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();

      if (lastRow <= 1 || lastCol === 0) return 0;

      const fullData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = fullData[0].map(h => String(h).trim());
      const keyColIndex = headers.indexOf(keyColumn);

      if (keyColIndex === -1) {
        throw new Error(`[ShopeeDbService.updateWhere] Cột "${keyColumn}" không tồn tại trong sheet "${sheetName}".`);
      }

      const targetStr = String(keyValue).trim().toLowerCase();
      let updatedCount = 0;

      for (let r = 1; r < fullData.length; r++) {
        const cellVal = String(fullData[r][keyColIndex] || '').trim().toLowerCase();
        if (cellVal === targetStr) {
          // Cập nhật các trường
          Object.keys(updateObject).forEach(updateKey => {
            const colIdx = headers.indexOf(updateKey);
            if (colIdx !== -1) {
              fullData[r][colIdx] = updateObject[updateKey];
            }
          });
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        sheet.getRange(1, 1, lastRow, lastCol).setValues(fullData);
      }

      return updatedCount;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Xóa các dòng thỏa điều kiện cột khóa (Delete Where có LockService)
   * @param {string} sheetName 
   * @param {string} keyColumn 
   * @param {any} keyValue 
   * @returns {number} Số dòng bị xóa
   */
  deleteWhere: function(sheetName, keyColumn, keyValue) {
    if (!keyColumn || keyValue === undefined) {
      throw new Error('[ShopeeDbService.deleteWhere] Tham số không hợp lệ.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);

    try {
      const sheet = this.getSheet(sheetName);
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();

      if (lastRow <= 1 || lastCol === 0) return 0;

      const fullData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
      const headers = fullData[0].map(h => String(h).trim());
      const keyColIndex = headers.indexOf(keyColumn);

      if (keyColIndex === -1) {
        throw new Error(`[ShopeeDbService.deleteWhere] Cột "${keyColumn}" không tồn tại.`);
      }

      const targetStr = String(keyValue).trim().toLowerCase();
      let deletedCount = 0;

      // Xóa từ dưới lên trên để không làm lệch chỉ mục dòng
      for (let r = fullData.length - 1; r >= 1; r--) {
        const cellVal = String(fullData[r][keyColIndex] || '').trim().toLowerCase();
        if (cellVal === targetStr) {
          sheet.deleteRow(r + 1);
          deletedCount++;
        }
      }

      return deletedCount;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Ghi Audit Log vào bảng DB_AGENT_AUDIT_LOGS
   * @param {string} agentName Tên agent hoặc người dùng
   * @param {string} triggerEvent Sự kiện kích hoạt (vd: 'SYNC_ORDERS', 'RECONCILE_ESCROW')
   * @param {string} targetRef Mã đơn hàng / mã đối soát liên quan
   * @param {string} actionSummary Tóm tắt hành động
   * @param {string} status Trạng thái ('SUCCESS', 'FAILED', 'WARNING', 'PENDING')
   * @param {any} rawPayload Dữ liệu chi tiết dạng object hoặc string
   */
  logAudit: function(agentName, triggerEvent, targetRef, actionSummary, status, rawPayload) {
    try {
      const logEntry = {
        log_id: 'LOG_' + Utilities.getUuid().substring(0, 8).toUpperCase(),
        timestamp: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss'),
        agent_name: agentName || 'Shopee_Agent',
        trigger_event: triggerEvent || 'GENERAL',
        target_ref: targetRef || '',
        action_summary: actionSummary || '',
        status: status || 'SUCCESS',
        raw_payload: typeof rawPayload === 'object' ? JSON.stringify(rawPayload) : String(rawPayload || '')
      };

      this.insert('DB_AGENT_AUDIT_LOGS', logEntry);
    } catch (err) {
      Logger.log(`[ShopeeDbService.logAudit] Lỗi ghi audit log: ${err.message}`);
    }
  }
};
