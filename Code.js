/**
 * ⚡ RUNNER CHẠY NHANH: ĐỒNG BỘ CHÍNH XÁC 100% SKU NGUYÊN LIỆU (PRODUCTS ➡️ BOM_CONFIG)
 */
function AAA_SYNC_BOM_MATERIAL_SKUS() {
  return syncBomMaterialSkusWithProducts();
}

/**
 * ⚡ RUNNER CHẠY NHANH: XÓA SẠCH MỌI KHOẢN PHẠT & CẢNH BÁO SLA ĐÓNG GÓI
 */
function AAA_CLEANUP_PACKING_SLA_PENALTIES() {
  return api_cleanupAllPackingSlaPenalties();
}

/**
 * ⚡ RUNNER CHẠY NHANH: CHUẨN HÓA MÃ SKU & ĐỒNG BỘ CSDL
 */
function AAA_RUN_STANDARDIZE_SKU() {
  return standardizeWarehouseSKU();
}

/**
 * ⚡ RUNNER CHẠY NHANH: SỬA ĐỊNH MỨC & GIÁ KEO 502 (1 CHAI 162G - VỎ 62G = 100G KEO, GIÁ 22.000Đ/100G)
 */
function AAA_REPAIR_KEO502_PRICE_AND_BOM() {
  return repairKeo502PriceAndBom();
}

var SCHEMA = {
  Orders: ['id', 'orderCode', 'channel', 'customer', 'createdAt', 'deadline', 'date', 'status', 'accessories', 'hasProduction', 'isCarriedToWH', 'updatedBy', 'revenue', 'phone', 'address', 'note', 'prePaid', 'cod', 'costTotal', 'responsibleUser', 'discount', 'shippingMethod', 'sizeCoefficient', 'cogs', 'feeFixed', 'feeService', 'feePayment', 'feeAffiliate', 'shopVoucher', 'tax', 'reconciledAt', 'isReconciled', 'isUrgent', 'urgentAt'],
  Orders_Archive: ['id', 'orderCode', 'channel', 'customer', 'createdAt', 'deadline', 'date', 'status', 'accessories', 'hasProduction', 'isCarriedToWH', 'updatedBy', 'revenue', 'phone', 'address', 'note', 'prePaid', 'cod', 'costTotal', 'responsibleUser', 'discount', 'shippingMethod', 'sizeCoefficient', 'cogs', 'feeFixed', 'feeService', 'feePayment', 'feeAffiliate', 'shopVoucher', 'tax', 'reconciledAt', 'isReconciled', 'isUrgent', 'urgentAt'],
  Production: ['id', 'orderId', 'type', 'name', 'note', 'status', 'deadline', 'fulfilledFromStock', 'p1_name', 'p1_status', 'p1_user', 'p1_start', 'p1_endTime', 'p1_photo', 'p1_reward_vnd', 'p2_name', 'p2_status', 'p2_user', 'p2_start', 'p2_endTime', 'p2_photo', 'p2_reward_vnd', 'qc_front_photo', 'qc_side_photo', 'qc_status', 'qc_note', 'serialCode', 'usedByOrderCode', 'usedAt', 'isUrgent', 'urgentAt'],
  Packings: ['id', 'orderId', 'user', 'start', 'end', 'endTime', 'status', 'photo', 'reward_vnd', 'photoBefore'],
  Attendance: ['id', 'user', 'date', 'morningIn', 'morningOut', 'afternoonIn', 'afternoonOut', 'leaveType', 'leaveReportAt', 'shift', 'timeIn', 'timeOut', 'totalHours', 'status', 'penalty', 'isEdited', 'leaveStart', 'leaveEnd', 'note'],
  Documents: ['id', 'category', 'title', 'description', 'link', 'createdAt', 'createdBy', 'attachments', 'testLink', 'readBy'],
  Trainings: ['id', 'title', 'content', 'targetRole', 'createdAt', 'createdBy', 'readUsers'],
  Models3D: ['id', 'name', 'url', 'createdAt', 'createdBy', 'productId', 'materials'],
  Reimbursements: ['id', 'staffName', 'reason', 'amount', 'qrCodeUrl', 'status', 'createdAt'],
  // Monthly_Snapshots đã chuyển sang SCHEMA_ERP (xóa duplicate - v2.11 Audit Fix)
  Config_NhanSu: ['Tên Nhân Sự', 'ID Ảnh', 'Chức Danh', 'Chức Danh Phụ', 'Phân Quyền', 'Mã PIN', 'Lương Cơ Bản', 'Lương Chức Vụ', 'Phụ Cấp Xăng Xe', 'Khoản Trừ Vi Phạm', 'id'],
  Tracking_Log: ['Thời gian', 'Tên nhân sự', 'Hoàn thành', 'Hỏi AI', 'Ghi chú thêm']
};

var SCHEMA_ERP = {
  Products: ['id', 'sku', 'name', 'unit', 'image', 'category', 'sub_category', 'costPrice', 'price', 'quantity', 'minStock', 'maxStock', 'realImage', 'importUnit', 'conversionRate', 'model3D'],
  Accounts: ['id', 'accountName', 'balance', 'type', 'accountNumber', 'accountOwner'],
  Suppliers: ['id', 'name', 'phone', 'totalDebt', 'category', 'note'],
  Transactions: ['id', 'type', 'category', 'amount', 'fromAccount', 'toAccount', 'title', 'date', 'note', 'isAuto'],
  ImportExport: ['id', 'type', 'target', 'totalAmount', 'date', 'note', 'itemsData'],
  ProfitReports: ['id', 'period', 'channel', 'revenue', 'orderCount', 'platformFee', 'returns', 'discount', 'ads', 'cogs', 'salary', 'operation'],
  BonusPenalty: ['id', 'user', 'amount', 'type', 'note', 'date', 'orderCode'],
  KPI_Progress: ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty', 'guide'],
  PurchasedServices: ['id', 'invoiceCode', 'supplier', 'taxCode', 'category', 'date', 'amount', 'payer', 'paymentMethod', 'note', 'expiryDate', 'createdAt', 'createdBy'],
  BOM_Config: ['id', 'layoutCode', 'materialSku', 'defaultQty', 'unit'],
  Monthly_Snapshots: ['id', 'month', 'user', 'totalSalary', 'totalHours', 'totalAdvance', 'totalDebt', 'createdAt', 'snapshotData'],
  Config_KPI: ['id', 'Nhóm Hàng', 'Từ Khoá', 'Tên Hàng', 'Thời gian Khâu 1', 'Tiền Khâu 1', 'Thời gian Khâu 2', 'Tiền Khâu 2', 'Thời gian Đóng Gói', 'Thưởng Đóng Gói', 'Thưởng Chở Kho'],
  CTV_Finance: ['id', 'date', 'type', 'amount', 'note', 'user', 'status'],
  Config_GiaLayout: ['Size_Max', 'Do_Chi_Tiet', 'He_So_Gia', 'Phi_Gui_Xuong', 'Phi_Gan_Reu'],
  ThongKe_TichLuyXu: ['id', 'user', 'type', 'amount_xu', 'date', 'orderCode', 'note', 'timestamp'],
  Workspaces: ['id', 'name', 'user', 'tools', 'status', 'handoverDate', 'photo', 'note']
};

// =========================================================================
// HÀM CHUẨN HÓA TRẠNG THÁI ĐƠN HÀNG — SINGLE SOURCE OF TRUTH (v2.11 Audit Fix)
// Giải quyết R3: Unicode inconsistency (HỦY vs HUỶ, 6+ biến thể)
// =========================================================================
/**
 * Chuẩn hóa trạng thái đơn hàng/sản xuất về dạng canonical.
 * Xử lý Unicode NFC normalization, trim, uppercase rồi map về giá trị chuẩn.
 * @param {string} rawStatus - Trạng thái thô từ sàn TMĐT hoặc nhập tay
 * @returns {string} Trạng thái đã chuẩn hóa
 */
function normalizeStatus(rawStatus) {
  if (!rawStatus) return '';
  var s = String(rawStatus).trim();
  // Bước 1: Chuẩn hóa Unicode NFC (ủ → ủ, ỷ → ỷ) và uppercase
  try { s = s.normalize('NFC'); } catch (e) { /* fallback cho môi trường không hỗ trợ NFC */ }
  var upper = s.toUpperCase().replace(/\s+/g, ' ');
  
  // Bước 2: Exact Match mapping từ sàn TMĐT → hệ thống nội bộ
  var STATUS_MAP = {
    // === ĐƠN HOÀN THÀNH / ĐỐI SOÁT ===
    'HOÀN THÀNH': 'Đối Soát Thành Công',
    'COMPLETED': 'Đối Soát Thành Công',
    'ĐỐI SOÁT THÀNH CÔNG': 'Đối Soát Thành Công',
    // === ĐÃ GIAO / ĐÃ BÀN GIAO ===
    'ĐÃ GIAO': 'Đã Bàn Giao',
    'DELIVERED': 'Đã Bàn Giao',
    'ĐÃ BÀN GIAO': 'Đã Bàn Giao',
    // === HÀNG HOÀN ===
    'TRẢ HÀNG/HOÀN TIỀN': 'Hàng Hoàn',
    'RETURNED': 'Hàng Hoàn',
    'HÀNG HOÀN': 'Hàng Hoàn',
    // === ĐƠN HUỶ (tất cả biến thể Unicode) ===
    'ĐÃ HỦY': 'Đơn Huỷ', 'ĐÃ HUỶ': 'Đơn Huỷ',
    'CANCELLED': 'Đơn Huỷ', 'ĐƠN HUỶ': 'Đơn Huỷ', 'ĐƠN HỦY': 'Đơn Huỷ',
    'HỦY': 'Đơn Huỷ', 'HUỶ': 'Đơn Huỷ',
    'HỦY/VỠ': 'Đơn Huỷ', 'HUỶ/VỠ': 'Đơn Huỷ',
    'HỦY / VỠ': 'Đơn Huỷ', 'HUỶ / VỠ': 'Đơn Huỷ',
    // === SẢN XUẤT DONE ===
    'DONE': 'Done', 'ĐÃ XONG': 'Done', 'HOÀN KHO ĐẠT': 'Done'
  };
  
  // Bước 3: Nếu không match exact, thử tìm keyword "HỦY"/"HUỶ" trong chuỗi
  if (STATUS_MAP[upper]) return STATUS_MAP[upper];
  if (upper.indexOf('HỦY') > -1 || upper.indexOf('HUỶ') > -1) return 'Đơn Huỷ';
  
  // Bước 4: Trả về nguyên gốc (trim) nếu không cần normalize
  return s;
}

/**
 * Kiểm tra trạng thái đơn hàng có phải Terminal (đã kết thúc) hay không.
 * Dùng normalizeStatus() bên trong để đảm bảo consistency.
 * @param {string} rawStatus - Trạng thái thô
 * @returns {boolean}
 */
function isTerminalStatus(rawStatus) {
  var normalized = normalizeStatus(rawStatus);
  var TERMINAL_STATUSES = ['Đối Soát Thành Công', 'Đã Bàn Giao', 'Hàng Hoàn', 'Đơn Huỷ'];
  return TERMINAL_STATUSES.indexOf(normalized) > -1;
}

/**
 * Kiểm tra trạng thái sản xuất có phải Done (hoàn thành) hay không.
 * @param {string} rawStatus - Trạng thái thô
 * @returns {boolean}
 */
function isProductionDone(rawStatus) {
  var normalized = normalizeStatus(rawStatus);
  return normalized === 'Done';
}

function doGet(e) {
  // Hỗ trợ API cho Expo App qua phương thức GET để tránh lỗi CORS trên Web Browser
  if (e && e.parameter && e.parameter.action) {
    return handleApiRequest(e.parameter);
  }



  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('RF Workspace Pro')
    .setFaviconUrl('https://i.postimg.cc/TYD5NncZ/icon.png')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// =========================================================================
// HỆ THỐNG API CHO ỨNG DỤNG EXPO (REACT NATIVE)
// =========================================================================
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No post data' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);

    // Định tuyến Webhook Shopee Open Platform tự động
    if (payload.shop_id || payload.code !== undefined || (payload.data && (payload.data.ordersn || payload.data.order_sn)) || (e.parameter && e.parameter.source === 'shopee') || payload.action === 'shopeeWebhook') {
      if (typeof ShopeeWebhookHandler !== 'undefined') {
        return ShopeeWebhookHandler.handleWebhook(e);
      }
    }

    return handleApiRequest(payload);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Lỗi Server: ' + error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleApiRequest(payload) {
  try {
    var action = payload.action;
    var response = { success: false, data: null, message: '' };

    if (action === 'validatePin') {
      var pin = payload.pin;
      var result = validatePin(pin);
      if (result && result.valid) {
        response.success = true;
        response.data = result;
      } else {
        response.message = 'Mã PIN không hợp lệ!';
      }
    }
    else if (action === 'getAppData') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response.success = true;
        response.data = getAppData(pin);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getArchivedData') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response.success = true;
        response.data = getArchivedData(pin);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getArchivedOrders') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'ORDER_ARCHIVE_VIEW')) {
          response.message = 'Từ chối quyền: Bạn không có quyền xem đơn lưu trữ!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = getArchivedOrders(payload.options || {}, pin);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'archiveReconciledOrders' || action === 'runAutoArchiveEngine') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'ORDER_ARCHIVE_ACTION')) {
          response.message = 'Từ chối quyền: Chỉ Quản Lý Bán Hàng, Kế Toán hoặc Tối Cao mới được lưu trữ đơn!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = archiveReconciledOrders(payload.cutoffDays || 60, pin);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getArchiveStats') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_getArchiveStats(pin);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'setupAutoArchiveTrigger') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = setupAutoArchiveTrigger(pin);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'sendUrgentOrderPush') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_sendUrgentOrderPush(payload.orderCode, payload.message, pin);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'toggleOrderUrgent') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_toggleOrderUrgent(payload.orderId, payload.isUrgent, pin);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'sendFactorySOSPush') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_sendFactorySOSPush(payload.sosType, payload.note, pin);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'syncDeltas') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        var lock = LockService.getScriptLock();
        try {
          lock.waitLock(15000); // Đợi 15s để lấy quyền truy cập độc quyền
          var deltaPayload = typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data;
          var resData = syncDeltas(deltaPayload, pin);
          if (!resData || resData.success === false || resData.error) {
            response.success = false;
            response.error = (resData && resData.error) || 'SYNC_FAILED';
            response.message = (resData && resData.message) || 'Lỗi đồng bộ dữ liệu!';
            response.data = resData;
          } else {
            response.success = true;
            response.data = resData;
          }
        } catch (e) {
          response.success = false;
          response.error = 'LOCK_TIMEOUT';
          response.message = 'Hệ thống đang quá tải, vui lòng thử lại sau vài giây! Lỗi: ' + e.message;
        } finally {
          lock.releaseLock();
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'syncBank') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'FIN_VIEW_ACCOUNTS')) {
          response.message = 'Từ chối quyền: Bạn không có quyền truy cập dữ liệu ngân hàng!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = syncBIDVEmails();
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'deductInventoryBOM') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = processMaterialDeduction(payload.prodId, payload.materialUsageData);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'syncBomMaterialSkus') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = syncBomMaterialSkusWithProducts(payload);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'repairKeo502PriceAndBom') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = repairKeo502PriceAndBom();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'processCascadeCancelOrder') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'ORDER_CANCEL')) {
          response.message = 'Từ chối quyền: Bạn không có quyền hủy đơn hàng này!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = processCascadeCancelOrder(payload.orderId, payload.isHandedOver || payload.isReturned);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'checkAndAutoForwardOrder') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = checkAndAutoForwardOrder(payload.orderId);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'processAutoAllocation' || action === 'autoAllocateOrders') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = processAutoAllocation(payload.orderId);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getAvailableStockItems') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_getAvailableStockItems(payload.sku, payload.type);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'assignStockItemToOrder') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_assignStockItemToOrder(payload.prodId, payload.orderCode, payload.serialCode);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'repairAllBomTickets') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'INV_BOM_CONFIG')) {
          response.message = 'Từ chối quyền: Chỉ Quản Lý Kho hoặc Kế Toán mới có quyền sửa đổi BOM!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = repairAllBomTickets();
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'processRcaResolver') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'PROD_QC_APPROVE')) {
          response.message = 'Từ chối quyền: Bạn không có quyền can thiệp RCA sản xuất!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = processRcaResolver(payload);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'saveUserPushSubscription') {
      var pushData = typeof payload.data === 'string' ? JSON.parse(payload.data) : (payload.data || payload);
      response = saveUserPushSubscription(pushData);
    }
    else if (action === 'invalidateUserConfig' || action === 'invalidateUserConfigCache') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (auth.isBoss || auth.role === 'TỐI CAO' || auth.role === 'ADMIN') {
          var invRes = invalidateUserConfigCache();
          response.success = true;
          response.data = invRes;
          response.message = 'Đã làm mới cache cấu hình nhân sự thành công!';
        } else {
          response.message = 'Từ chối quyền: Chỉ Tối Cao hoặc Admin mới có quyền làm mới cache nhân sự!';
          response.error = 'PERMISSION_DENIED';
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'api_insertManualKPI' || action === 'insertManualKPI') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'HR_EDIT_KPI_TARGET')) {
          response.message = 'Từ chối quyền: Chỉ Boss Tối Cao mới có quyền nhập chỉ số KPI thủ công!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = api_insertManualKPI(payload.data || payload);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'api_syncMasterPayroll' || action === 'syncMasterPayroll') {
      var pin = payload.pin || (payload.data && payload.data.pin);
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'HR_PAY_SALARY_ADVANCE')) {
          response.message = 'Từ chối quyền: Chỉ Kế Toán hoặc Tối Cao mới có quyền đồng bộ bảng lương!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = api_syncMasterPayroll(payload.data || payload);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'generateMonthlySnapshot') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'HR_PAY_SALARY_ADVANCE')) {
          response.message = 'Từ chối quyền: Chỉ Kế Toán hoặc Tối Cao mới có quyền khóa sổ lương tháng!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = generateMonthlySnapshot(payload.monthStr);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'approveQC') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'PROD_QC_APPROVE')) {
          response.message = 'Từ chối quyền: Chỉ Quản Lý Kho Vận hoặc Tối Cao mới có quyền duyệt QC!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = processQCApproval(payload.prodId, auth.user);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'generateMonthlyKPI_All') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'HR_EDIT_KPI_TARGET')) {
          response.message = 'Từ chối quyền: Chỉ Tối Cao mới có quyền sinh mục tiêu KPI tự động!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = api_generateMonthlyKPI_All(payload.allStatsMap);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getOperationsHealth') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_getOperationsHealth();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'createCustomKPI') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'HR_EDIT_KPI_TARGET')) {
          response.message = 'Từ chối quyền: Chỉ Boss Tối Cao mới có quyền tạo chỉ tiêu KPI tùy chỉnh!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = api_createCustomKPI(payload);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'submitKpiSelfAssessment') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_submitKpiSelfAssessment(payload.kpiId, payload.actualValue, payload.note, payload.proofUrl);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'auditOverdueReturnOrdersSLA') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_auditOverdueReturnOrdersSLA();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'saveZaloWebhookConfig') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'SYSTEM_CONFIG')) {
          response.message = 'Từ chối quyền: Chỉ Boss Tối Cao mới được sửa cấu hình Zalo Bot!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = api_saveZaloWebhookConfig(payload.config);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getZaloWebhookConfig') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_getZaloWebhookConfig();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'testZaloNotification') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_testZaloNotification();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'saveTelegramConfig') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'SYSTEM_CONFIG')) {
          response.message = 'Từ chối quyền: Chỉ Boss Tối Cao mới được sửa cấu hình Telegram Bot!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = api_saveTelegramConfig(payload.config);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getTelegramConfig') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_getTelegramConfig();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'testTelegramNotification') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_testTelegramNotification();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'saveGoogleChatConfig') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'SYSTEM_CONFIG')) {
          response.message = 'Từ chối quyền: Chỉ Boss Tối Cao mới được sửa cấu hình Google Chat!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = api_saveGoogleChatConfig(payload.config);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getGoogleChatConfig') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_getGoogleChatConfig();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'testGoogleChatNotification') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_testGoogleChatNotification();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'saveNtfyConfig') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'SYSTEM_CONFIG')) {
          response.message = 'Từ chối quyền: Chỉ Boss Tối Cao mới được sửa cấu hình ntfy.sh!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = api_saveNtfyConfig(payload.config);
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getNtfyConfig') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_getNtfyConfig();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'testNtfyNotification' || action === 'sendNtfy') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        var topic = payload.topic || '';
        var title = payload.title || 'TEST THÔNG BÁO RF WORKSPACE';
        var message = payload.message || '✅ Kết nối thành công! Thiết bị của bạn đã sẵn sàng nhận thông báo đơn hàng và sản xuất tức thì.';
        response = sendNtfyNotification(title, message, topic);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'uploadImage' || action === 'uploadQCImage') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response.success = true;
        response.data = uploadImage(payload.base64Data || payload.data || payload.b64, payload.fileName);
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'getDashboardErrors') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_getDashboardErrors();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'autoCalculateGlassTankBOM' || action === 'autoCalculateGlassTankBOM_Dual') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        if (!checkServerPermission(auth, 'CALC_TANK')) {
          response.message = 'Từ chối quyền: Bạn không có quyền chạy tính toán định mức BOM Bể Kính!';
          response.error = 'PERMISSION_DENIED';
        } else {
          response = autoCalculateGlassTankBOM_Dual();
        }
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'runDataIntegrityCheck') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_runDataIntegrityCheck();
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else if (action === 'applyAiQcResult') {
      var pin = payload.pin;
      var auth = validatePin(pin);
      if (auth && auth.valid) {
        response = api_applyAiQcResult(payload.productionId, payload.updatePayload || {});
      } else {
        response.message = 'Xác thực thất bại!';
      }
    }
    else {
      response.message = 'Action không hợp lệ: ' + (action || 'null');
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Lỗi API: ' + error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function include(filename) {
  var content = HtmlService.createTemplateFromFile(filename).getRawContent();
  if (!content) return '';
  content = content.replace(/\0/g, '')
    .replace(/[\uFEFF\uFFFE]/g, '')
    .replace(/<script[^>]*>/gi, '')
    .replace(/<\/script>/gi, '');
  return content;
}

// =========================================================================
// NEW ARCHITECTURE LOGIC: BOM, SLA, LEDGER, QC
// =========================================================================



function checkAndAutoForwardOrder(orderId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var orderSheet = ss.getSheetByName('Orders');
    var prodSheet = ss.getSheetByName('Production');
    if (!orderSheet || !prodSheet) return { success: false, message: 'Bảng dữ liệu không tồn tại!' };

    var prodData = prodSheet.getDataRange().getValues();
    var pHeaders = prodData[0];
    var pOrderIdCol = pHeaders.indexOf('orderId');
    var pStatusCol = pHeaders.indexOf('status');
    var pStockCol = pHeaders.indexOf('fulfilledFromStock');

    var childProds = [];
    for (var i = 1; i < prodData.length; i++) {
      if (String(prodData[i][pOrderIdCol]).trim() === String(orderId).trim()) {
        var rawStatus = String(prodData[i][pStatusCol] || '').trim();
        var statusUpper = rawStatus.toUpperCase();
        if (normalizeStatus(statusUpper) === 'Đơn Huỷ') {
          continue;
        }
        var isStock = prodData[i][pStockCol] === true || String(prodData[i][pStockCol]).toUpperCase() === 'TRUE';
        childProds.push({
          status: statusUpper,
          fulfilledFromStock: isStock
        });
      }
    }

    if (childProds.length === 0) return { success: false, message: 'Đơn hàng không chứa lệnh sản xuất nào hợp lệ.' };

    var isAllCompleted = childProds.every(function (p) {
      return p.status === 'DONE' || p.status === 'ĐÃ XONG' || p.status === 'HOÀN KHO ĐẠT' || p.fulfilledFromStock === true;
    });

    if (isAllCompleted) {
      var orderData = orderSheet.getDataRange().getValues();
      var oHeaders = orderData[0];
      var oIdCol = oHeaders.indexOf('id');
      var oStatusCol = oHeaders.indexOf('status');

      for (var o = 1; o < orderData.length; o++) {
        if (String(orderData[o][oIdCol]).trim() === String(orderId).trim()) {
          var currentStatus = String(orderData[o][oStatusCol] || '').trim();
          if (['Chờ Sản Xuất', 'Đang Sản Xuất', 'Quét Tự Động'].indexOf(currentStatus) > -1) {
            orderSheet.getRange(o + 1, oStatusCol + 1).setValue('Sẵn sàng đóng gói');
            return { success: true, message: 'Đã tự động chuyển đơn ' + orderId + ' ➔ Sẵn sàng đóng gói' };
          }
          break;
        }
      }
    }

    return { success: true, message: 'Đơn hàng chưa đủ điều kiện chuyển trạng thái.' };

  } catch (err) {
    return { success: false, message: 'Lỗi Auto-Forward SLA: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function processQCApproval(prodId, approverName) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Production');
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idCol = headers.indexOf('id');
    var statusCol = headers.indexOf('qc_status');
    var noteCol = headers.indexOf('qc_note');
    if (idCol === -1 || statusCol === -1) return { success: false, message: 'Thiếu cột schema' };
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(prodId)) {
        sheet.getRange(i + 1, statusCol + 1).setValue('Passed');
        if (noteCol !== -1) {
          var oldNote = String(data[i][noteCol] || '');
          var newNote = oldNote ? (oldNote + '\n[Duyệt bởi: ' + approverName + ']') : ('[Duyệt bởi: ' + approverName + ']');
          sheet.getRange(i + 1, noteCol + 1).setValue(newNote);
        }
        return { success: true, message: 'Đã duyệt QC' };
      }
    }
    return { success: false, message: 'Không tìm thấy ID sản xuất' };
  } catch (err) {
    return { success: false, message: 'Lỗi duyệt QC: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Quét bảng KPI_Progress, tính tổng tiền giải ngân cho quỹ [PHAT_TRIEN]
 * @param {string} monthStr - Chuỗi tháng định dạng 'YYYY-MM' (VD: '2026-08')
 * @param {string} userName - Tên nhân sự (tùy chọn, để trống sẽ tính cho toàn cty)
 * @returns {number|object} Tổng tiền, hoặc Object map theo user.
 */
function calculateDynamicPositionSalary(monthStr, userName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('KPI_Progress');
  if (!sheet) return 0;

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return 0;

  const h = data[0];
  const userCol = h.indexOf('user');
  const kpiNameCol = h.indexOf('kpiName');
  const rewardCol = h.indexOf('reward');
  const isClaimedCol = h.indexOf('isClaimed');
  const endTimeCol = h.indexOf('endTime');

  let userTotals = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (userName && row[userCol] !== userName) continue;
    if (String(row[kpiNameCol] || '').indexOf('[PHAT_TRIEN]') !== 0) continue;

    // Điều kiện: Đã hoàn thành/Nhận
    const claimed = row[isClaimedCol];
    if (claimed !== true && String(claimed).toLowerCase() !== 'true') continue;

    // Điều kiện: Thuộc tháng chốt lương (dựa vào endTime)
    const endTime = new Date(row[endTimeCol]);
    if (isNaN(endTime.getTime())) continue;

    const rowMonthStr = endTime.getFullYear() + '-' + String(endTime.getMonth() + 1).padStart(2, '0');
    if (rowMonthStr === monthStr) {
      const u = row[userCol];
      userTotals[u] = (userTotals[u] || 0) + (Number(row[rewardCol]) || 0);
    }
  }

  return userName ? (userTotals[userName] || 0) : userTotals;
}

/**
 * KIỂM TRA NGÀY NGHỈ XƯỞNG & NGÀY NGHỈ LỄ QUỐC GIA (HOLIDAY CALENDAR ENGINE)
 * Tránh phạt oan SLA sau 21:00 hoặc 19:30 và không tính SLA vào ngày nghỉ
 * 1. Chủ Nhật hàng tuần (getDay() === 0)
 * 2. Ngày lễ cố định Việt Nam (Tết Dương Lịch 01/01, 30/04, 01/05, Quốc Khánh 02/09, 03/09)
 * 3. Ngày nghỉ xưởng khai báo động trong ScriptProperties ('WORKSHOP_OFF_DATES')
 * @param {Date|string} dateObj
 * @returns {boolean}
 */
function isWorkshopOffDay(dateObj) {
  if (!dateObj) return false;
  var d = new Date(dateObj);
  if (isNaN(d.getTime())) return false;
  
  // 1. Chủ nhật
  if (d.getDay() === 0) return true;

  // 2. Ngày lễ cố định Việt Nam (MM-DD)
  var month = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  var md = month + '-' + day;
  var FIXED_HOLIDAYS = [
    '01-01', // Tết Dương Lịch
    '04-30', // Giải phóng Miền Nam
    '05-01', // Quốc tế Lao Động
    '09-02', // Quốc Khánh 2/9
    '09-03'  // Nghỉ Lễ Quốc Khánh
  ];
  if (FIXED_HOLIDAYS.indexOf(md) !== -1) return true;

  // 3. Ngày nghỉ xưởng khai báo đặc biệt ('YYYY-MM-DD,YYYY-MM-DD')
  try {
    var customOffDays = PropertiesService.getScriptProperties().getProperty('WORKSHOP_OFF_DATES');
    if (customOffDays) {
      var ymd = d.getFullYear() + '-' + month + '-' + day;
      var offList = customOffDays.split(',').map(function (s) { return s.trim(); });
      if (offList.indexOf(ymd) !== -1) return true;
    }
  } catch (e) {}

  return false;
}

function calculateBusinessHoursSLA(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  var start = new Date(startStr);
  var end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) return 0;

  var totalMin = 0;
  var cur = new Date(start.getTime());

  while (cur < end) {
    var h = cur.getHours();

    if (isWorkshopOffDay(cur)) { // Chủ nhật hoặc Ngày nghỉ lễ / Ngày nghỉ xưởng
      cur.setHours(24, 0, 0, 0);
      continue;
    }
    if (h < 8) {
      cur.setHours(8, 0, 0, 0);
      continue;
    }
    if (h >= 12 && h < 13) { // Nghỉ trưa
      cur.setHours(13, 0, 0, 0);
      continue;
    }
    if (h >= 17) {
      cur.setHours(24, 0, 0, 0);
      continue;
    }

    var nextBreak = new Date(cur.getTime());
    if (h < 12) {
      nextBreak.setHours(12, 0, 0, 0);
    } else {
      nextBreak.setHours(17, 0, 0, 0);
    }

    var endOfPeriod = (end < nextBreak) ? end : nextBreak;
    var diffMin = Math.floor((endOfPeriod.getTime() - cur.getTime()) / 60000);
    totalMin += diffMin;

    cur = new Date(endOfPeriod.getTime());
  }
  return totalMin;
}

/**
 * Core Payroll Calculator — single source of truth
 * Dùng chung cho cả api_syncMasterPayroll và generateMonthlySnapshot
 */
function calculatePayrollForUser(u, monthStr, options) {
  var salConfig = options.salConfig || {};
  var userAtts = options.userAtts || [];
  var userBPs = options.userBPs || [];
  var prodData = options.prodData || [];
  var packData = options.packData || [];
  var kpiProgressData = options.kpiProgressData || [];
  var prevDebt = options.prevDebt || 0;

  var totalGateHours = userAtts.reduce(function (sum, a) {
    var h = Number(a.totalHours) || 0;
    if (h === 0 && a.timeIn && a.timeOut) {
      try {
        var tIn = String(a.timeIn).trim();
        var tOut = String(a.timeOut).trim();
        var tInFmt = tIn.length === 5 ? tIn + ':00' : tIn;
        var tOutFmt = tOut.length === 5 ? tOut + ':00' : tOut;
        var diffMs = new Date('1970-01-01T' + tOutFmt).getTime() - new Date('1970-01-01T' + tInFmt).getTime();
        var diffHours = diffMs / 3600000;
        if (diffHours < 0) diffHours += 24;
        h = Math.max(0, diffHours);
      } catch (e) {}
    }
    return sum + h;
  }, 0);
  var hoursWorked = totalGateHours;
  var daysWorked = userAtts.filter(function (a) {
    var h = Number(a.totalHours) || 0;
    if (h === 0 && a.timeIn && a.timeOut) {
      try {
        var tIn = String(a.timeIn).trim();
        var tOut = String(a.timeOut).trim();
        var tInFmt = tIn.length === 5 ? tIn + ':00' : tIn;
        var tOutFmt = tOut.length === 5 ? tOut + ':00' : tOut;
        var diffMs = new Date('1970-01-01T' + tOutFmt).getTime() - new Date('1970-01-01T' + tInFmt).getTime();
        var diffHours = diffMs / 3600000;
        if (diffHours < 0) diffHours += 24;
        h = Math.max(0, diffHours);
      } catch (e) {}
    }
    return h > 0 || (a.morningIn && a.morningOut);
  }).length;

  var baseSalaryConfig = Number(salConfig.baseSalary) || Number(salConfig['Lương Cơ Bản']) || 0;
  var luongChinh = baseSalaryConfig > 0 ? Math.round((baseSalaryConfig / 208) * hoursWorked) : hoursWorked * 20000;
  var luongLamThemGio = userBPs.filter(function (b) { return b.type === 'Lương Làm Thêm Giờ'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);

  var prodSalary = 0;
  prodData.forEach(function (pItem) {
    var itemDone = pItem.status === 'Done' || String(pItem.status).toUpperCase() === 'ĐÃ XONG' || String(pItem.status).toUpperCase() === 'HOÀN KHO ĐẠT';
    if (pItem.p1_user === u && pItem.p1_endTime && pItem.p1_endTime.indexOf(monthStr) === 0 && (pItem.p1_status === 'Done' || itemDone)) {
      prodSalary += Number(pItem.p1_reward_vnd) || 0;
    }
    if (pItem.p2_user === u && pItem.p2_endTime && pItem.p2_endTime.indexOf(monthStr) === 0 && (pItem.p2_status === 'Done' || itemDone)) {
      prodSalary += Number(pItem.p2_reward_vnd) || 0;
    }
  });

  var packSalary = 0;
  packData.forEach(function (pk) {
    if (pk.user === u && (pk.status === 'Done' || String(pk.status).toUpperCase() === 'ĐÃ XONG')) {
      packSalary += Number(pk.reward_vnd) || 0;
    }
  });

  var hoaHongSanXuat = prodSalary + packSalary;
  var hoTroSanLuong = userBPs.filter(function (b) { return b.type === 'Hỗ Trợ Sản Lượng'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);

  var userDevKpis = kpiProgressData.filter(function (k) {
    return k.user === u && String(k.unit).toLowerCase() !== 'xu' &&
      (k.isClaimed === true || String(k.isClaimed).toLowerCase() === 'true');
  });
  var dynamicFuncSalary = userDevKpis.reduce(function (sum, k) { return sum + (Number(k.reward) || 0); }, 0);
  var ceilingFuncSalary = Number(salConfig.funcSalary) || Number(salConfig['Lương Chức Vụ']) || 0;
  var funcSalary = ceilingFuncSalary > 0 ? Math.min(dynamicFuncSalary, ceilingFuncSalary) : dynamicFuncSalary;

  var allowanceConfig = Number(salConfig.allowance) || Number(salConfig['Phụ Cấp Xăng Xe']) || 0;
  var phuCapKhac = userBPs.filter(function (b) { return b.type === 'Phụ Cấp Khác'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);
  var tongPhuCap = funcSalary + allowanceConfig + phuCapKhac;

  var thuongNong = userBPs.filter(function (b) { return b.type === 'Thưởng Nóng' || b.type === 'Thưởng'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);
  var manualChuyenCanRec = userBPs.find(function (b) { return b.type === 'Thưởng Chuyên Cần'; });
  var chuyenCan = manualChuyenCanRec ? Number(manualChuyenCanRec.amount) : ((daysWorked >= 28 || totalGateHours >= 216) ? 500000 : 0);
  var tongThuong = thuongNong + chuyenCan;

  var hoaHongBanHang = userBPs.filter(function (b) { return b.type === 'Hoa Hồng Bán Hàng' || b.type === 'Thưởng Bán Hàng'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);
  var cacKhoanThuKhac = userBPs.filter(function (b) { return b.type === 'Thu Nhập Khác' || b.type === 'Các Khoản Thu Khác'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0);

  var tongThuNhap = luongChinh + luongLamThemGio + hoaHongSanXuat + hoTroSanLuong + tongPhuCap + tongThuong + hoaHongBanHang + cacKhoanThuKhac;

  var soNgayNghi = userAtts.filter(function (a) { return String(a.status || '').indexOf('Nghỉ') > -1 || String(a.shift || '').indexOf('Nghỉ') > -1; }).length;
  var phatVuotNgayNghi = soNgayNghi > 2 ? (soNgayNghi - 2) * 200000 : 0;
  var attPenalty = userAtts.reduce(function (sum, a) { return sum + (Number(a.penalty) || 0); }, 0);
  var phatQuyDinhBP = Math.abs(userBPs.filter(function (b) { return b.type === 'Phạt Quy Định' || b.type === 'Phạt'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
  var phatQuyDinh = phatQuyDinhBP + attPenalty + phatVuotNgayNghi;

  var phiCongDoan = 100000;
  var chiPhiBaoHanh = Math.abs(userBPs.filter(function (b) { return b.type === 'Chi Phí Bảo Hành'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
  var tamUng = Math.abs(userBPs.filter(function (b) { return b.type === 'Tạm Ứng'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
  var excludeGiamTru = ['Phạt Quy Định', 'Phạt', 'Chi Phí Bảo Hành', 'Tạm Ứng', 'Thanh Toán Lương', 'Đã Trả'];
  var giamTruKhac = Math.abs(userBPs.filter(function (b) { return excludeGiamTru.indexOf(b.type) === -1 && Number(b.amount) < 0; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
  
  var tongGiamTru = phatQuyDinh + phiCongDoan + chiPhiBaoHanh + tamUng + giamTruKhac + prevDebt;
  
  var netCalculated = tongThuNhap - tongGiamTru;
  var daTraNhanVien = Math.abs(userBPs.filter(function (b) { return b.type === 'Đã Trả' || b.type === 'Thanh Toán Lương'; }).reduce(function (sum, b) { return sum + Number(b.amount || 0); }, 0));
  var conCanTra = netCalculated - daTraNhanVien;

  var totalDebt = netCalculated < 0 ? Math.abs(netCalculated) : 0;

  return {
    hoursWorked: hoursWorked,
    totalGateHours: totalGateHours,
    daysWorked: daysWorked,
    luongChinh: luongChinh,
    luongLamThemGio: luongLamThemGio,
    hoaHongSanXuat: hoaHongSanXuat,
    tongPhuCap: tongPhuCap,
    tongThuong: tongThuong,
    hoaHongBanHang: hoaHongBanHang,
    cacKhoanThuKhac: cacKhoanThuKhac,
    tongThuNhap: tongThuNhap,
    phatQuyDinh: phatQuyDinh,
    phiCongDoan: phiCongDoan,
    chiPhiBaoHanh: chiPhiBaoHanh,
    tamUng: tamUng,
    giamTruKhac: giamTruKhac,
    noThangTruoc: prevDebt,
    tongGiamTru: tongGiamTru,
    totalSalary: netCalculated,
    daTraNhanVien: daTraNhanVien,
    conCanTra: conCanTra,
    totalDebt: totalDebt
  };
}

// =========================================================================
// API ĐỒNG BỘ LƯƠNG TẬP TRUNG (CLIENT-SERVER PAYROLL SYNC)
// =========================================================================
function api_syncMasterPayroll(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận đồng bộ dữ liệu lương, vui lòng thử lại sau.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var p = payload || {};
    if (payload && payload.data) p = payload.data;

    var pinToAuth = (p && p.pin) || (payload && payload.pin);
    if (!pinToAuth) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để đồng bộ bảng lương!' };
    var auth = validatePin(pinToAuth);
    if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ hoặc hết hạn!' };
    if (!checkServerPermission(auth, 'HR_PAY_SALARY_ADVANCE')) {
      return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Kế Toán hoặc Tối Cao mới có quyền đồng bộ bảng lương!' };
    }

    var monthStr = p.monthStr || p.filterMonth || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM");

    // 1. KÍCH HOẠT TỰ ĐỘNG KHÓA SỔ LƯƠNG (FREEZE PAYROLL) KHI ĐÃ TRẢ / ĐÃ CHỐT
    var snapSheet = ss.getSheetByName('Monthly_Snapshots');
    if (snapSheet) {
      var existingSnaps = readSheet('Monthly_Snapshots', function (s) { return s.month === monthStr; }, ss);
      if (existingSnaps.length > 0) {
        var targetUsers = [];
        if (p.BonusPenalty_Updates) p.BonusPenalty_Updates.forEach(function (b) { if (b.user && targetUsers.indexOf(b.user) === -1) targetUsers.push(b.user); });
        if (p.Attendance_Updates) p.Attendance_Updates.forEach(function (a) { if (a.user && targetUsers.indexOf(a.user) === -1) targetUsers.push(a.user); });

        var isLocked = existingSnaps.some(function (s) {
          return targetUsers.length === 0 || targetUsers.indexOf(s.user) !== -1;
        });
        if (isLocked) {
          return { success: false, message: '🔒 Dữ liệu lương tháng ' + monthStr + ' đã Khóa Sổ / Đã Trả. Hệ thống tự động chặn mọi quyền chỉnh sửa!' };
        }
      }
    }

    // 2. GHI NHẬN THAY ĐỔI DỮ LIỆU
    if (p.BonusPenalty_Updates && p.BonusPenalty_Updates.length > 0) {
      updateDeltas('BonusPenalty', p.BonusPenalty_Updates, formatBonusPenalty, ss);
    }
    if (p.Attendance_Updates && p.Attendance_Updates.length > 0) {
      p.Attendance_Updates.forEach(function (a) {
        var tIn = a.timeIn ? String(a.timeIn).trim() : '';
        var tOut = a.timeOut ? String(a.timeOut).trim() : '';
        if ((a.totalHours === undefined || a.totalHours === null || a.totalHours === '' || Number(a.totalHours) === 0) && tIn && tOut) {
          try {
            var tInFmt = tIn.length === 5 ? tIn + ':00' : tIn;
            var tOutFmt = tOut.length === 5 ? tOut + ':00' : tOut;
            var diffMs = new Date('1970-01-01T' + tOutFmt).getTime() - new Date('1970-01-01T' + tInFmt).getTime();
            var diffHours = diffMs / 3600000;
            if (diffHours < 0) diffHours += 24;
            a.totalHours = Math.max(0, diffHours);
          } catch (e) {}
        }
      });
      updateDeltas('Attendance', p.Attendance_Updates, formatAtt, ss);
    }
    if (p.deletes || p.Deletes) {
      var del = p.deletes || p.Deletes;
      if (del.BonusPenalty && del.BonusPenalty.length > 0) {
        deleteDeltas('BonusPenalty', del.BonusPenalty, ss);
      }
      if (del.Attendance && del.Attendance.length > 0) {
        deleteDeltas('Attendance', del.Attendance, ss);
      }
    }

    // 2. TÍNH TOÁN TẬP TRUNG (SERVER-SIDE PAYROLL AGGREGATION)
    var userConfig = getUserConfig();
    var allUsers = userConfig.users || [];
    if (allUsers.length === 0) {
      allUsers = ['Đỗ Minh Ân', 'Trần Hữu Tâm', 'Nguyễn Hoàng Dương', 'Nguyễn Thị Diệu Hương'];
    }

    var prodData = readSheet('Production', function (item) {
      return (item.p1_endTime && item.p1_endTime.indexOf(monthStr) === 0) || (item.p2_endTime && item.p2_endTime.indexOf(monthStr) === 0);
    }, ss);
    var packData = readSheet('Packings', function (item) {
      return item.endTime && item.endTime.indexOf(monthStr) === 0;
    }, ss);
    var attData = readSheet('Attendance', function (item) {
      return item.date && item.date.indexOf(monthStr) === 0;
    }, ss);
    var bpData = readSheet('BonusPenalty', function (item) {
      return item.date && item.date.indexOf(monthStr) === 0;
    }, ss);
    var kpiProgressData = readSheet('KPI_Progress', function (item) {
      return item.endTime && item.endTime.indexOf(monthStr) === 0;
    }, ss);

    // Dư nợ tháng trước
    var prevMonth = new Date(monthStr + '-01');
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    var prevMonthStr = prevMonth.getFullYear() + '-' + ('0' + (prevMonth.getMonth() + 1)).slice(-2);
    var prevSnaps = readSheet('Monthly_Snapshots', function (s) { return s.month === prevMonthStr; }, ss);
    var prevDebtMap = {};
    prevSnaps.forEach(function (s) { prevDebtMap[s.user] = Number(s.totalDebt) || 0; });

    var payrollData = {};

    allUsers.forEach(function (u) {
      var salConfig = userConfig.salaries ? (userConfig.salaries[u] || {}) : {};
      var userAtts = attData.filter(function (a) { return String(a.user).trim() === String(u).trim(); });
      var userBPs = bpData.filter(function (b) { return String(b.user).trim() === String(u).trim(); });

      var result = calculatePayrollForUser(u, monthStr, {
        salConfig: salConfig,
        userAtts: userAtts,
        userBPs: userBPs,
        prodData: prodData,
        packData: packData,
        kpiProgressData: kpiProgressData,
        prevDebt: prevDebtMap[u] || 0
      });

      payrollData[u] = Object.assign({
        user: u,
        month: monthStr
      }, result);
    });

    return {
      success: true,
      message: 'Đồng bộ dữ liệu lương tập trung thành công!',
      payrollData: payrollData
    };
  } catch (err) {
    return { success: false, message: 'Lỗi đồng bộ lương: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function api_generateMonthlySnapshot(payload) {
  try {
    var auth = validatePin(payload.pin);
    if (auth && auth.valid && auth.role === 'TỐI CAO') {
      return generateMonthlySnapshot(payload.monthStr);
    } else {
      return { success: false, message: 'Chỉ Boss (TỐI CAO) mới được chốt sổ!' };
    }
  } catch (err) {
    return { success: false, message: err.toString() };
  }
}

function generateMonthlySnapshot(monthStr) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận khóa sổ, vui lòng thử lại sau giây lát.' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var snapSheet = ss.getSheetByName('Monthly_Snapshots');
    if (!snapSheet) {
      snapSheet = ss.insertSheet('Monthly_Snapshots');
      snapSheet.appendRow(SCHEMA_ERP.Monthly_Snapshots);
      snapSheet.setFrozenRows(1);
    }

    var snaps = readSheet('Monthly_Snapshots', function (s) { return s.month === monthStr; }, ss);
    if (snaps.length > 0) return { success: false, message: 'Tháng ' + monthStr + ' đã được khóa sổ.' };

    var userConfig = getUserConfig();
    var allUsers = userConfig.users || [];
    if (allUsers.length === 0) {
      allUsers = ['Đỗ Minh Ân', 'Trần Hữu Tâm', 'Nguyễn Hoàng Dương', 'Nguyễn Thị Diệu Hương'];
    }

    var prodData = readSheet('Production', function (p) { return (p.p1_endTime && p.p1_endTime.indexOf(monthStr) === 0) || (p.p2_endTime && p.p2_endTime.indexOf(monthStr) === 0); }, ss);
    var packData = readSheet('Packings', function (p) { return p.endTime && p.endTime.indexOf(monthStr) === 0; }, ss);
    var attData = readSheet('Attendance', function (a) { return a.date && a.date.indexOf(monthStr) === 0; }, ss);
    var bpData = readSheet('BonusPenalty', function (b) { return b.date && b.date.indexOf(monthStr) === 0; }, ss);
    var kpiProgressData = readSheet('KPI_Progress', function (k) { return k.endTime && k.endTime.indexOf(monthStr) === 0; }, ss);

    // Lấy nợ từ tháng trước
    var prevMonth = new Date(monthStr + '-01');
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    var prevMonthStr = prevMonth.getFullYear() + '-' + ('0' + (prevMonth.getMonth() + 1)).slice(-2);
    var prevSnaps = readSheet('Monthly_Snapshots', function (s) { return s.month === prevMonthStr; }, ss);
    var prevDebtMap = {};
    prevSnaps.forEach(function (s) {
      prevDebtMap[s.user] = Number(s.totalDebt) || 0;
    });

    var newRows = [];
    var createdAt = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

    allUsers.forEach(function (u) {
      var salConfig = userConfig.salaries ? (userConfig.salaries[u] || {}) : {};
      var userAtts = attData.filter(function (a) { return a.user === u; });
      var userBPs = bpData.filter(function (b) { return b.user === u; });

      var result = calculatePayrollForUser(u, monthStr, {
        salConfig: salConfig,
        userAtts: userAtts,
        userBPs: userBPs,
        prodData: prodData,
        packData: packData,
        kpiProgressData: kpiProgressData,
        prevDebt: prevDebtMap[u] || 0
      });

      var detailedSnapshot = Object.assign({
        user: u,
        month: monthStr
      }, result);
      
      var tamUng = result.tamUng;
      var debt = result.totalDebt;
      var netCalculated = result.totalSalary;
      var totalGateHours = result.totalGateHours;

      var row = SCHEMA_ERP.Monthly_Snapshots.map(function (h) {
        if (h === 'id') return 'SNAP_' + monthStr + '_' + u.replace(/\s+/g, '') + '_' + Date.now();
        if (h === 'month') return monthStr;
        if (h === 'user') return u;
        if (h === 'totalSalary') return netCalculated;
        if (h === 'totalHours') return totalGateHours;
        if (h === 'totalAdvance') return tamUng;
        if (h === 'totalDebt') return debt;
        if (h === 'createdAt') return createdAt;
        if (h === 'snapshotData') return JSON.stringify(detailedSnapshot);
        return '';
      });
      newRows.push(row);
    });

    if (newRows.length > 0) {
      var range = snapSheet.getRange(snapSheet.getLastRow() + 1, 1, newRows.length, SCHEMA_ERP.Monthly_Snapshots.length);
      range.setValues(newRows);
    }

    return { success: true, message: 'Đã khóa sổ tháng ' + monthStr + ' thành công cho ' + newRows.length + ' nhân sự!' };
  } catch (err) {
    Logger.log('Lỗi generateMonthlySnapshot: ' + err.toString());
    return { success: false, message: 'Lỗi khóa sổ tháng: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}



function initDB() { var ss = SpreadsheetApp.getActiveSpreadsheet(); Object.keys(SCHEMA).forEach(function (s) { if (!ss.getSheetByName(s)) { var sheet = ss.insertSheet(s); sheet.appendRow(SCHEMA[s]); sheet.setFrozenRows(1); } }); }
function initDbERP() { var ss = SpreadsheetApp.getActiveSpreadsheet(); Object.keys(SCHEMA_ERP).forEach(function (s) { if (!ss.getSheetByName(s)) { var sheet = ss.insertSheet(s); sheet.appendRow(SCHEMA_ERP[s]); sheet.setFrozenRows(1); sheet.getRange(1, 1, 1, SCHEMA_ERP[s].length).setFontWeight("bold").setBackground("#e6f5f5"); } }); }

// =========================================================================
// HÀM ĐỌC GOOGLE SHEETS (v2.11 Audit Fix: Xóa hard-cap 4000 dòng)
// UPGRADE: Đọc toàn bộ dữ liệu, dùng filterFn để lọc tại application layer
// Nếu bảng >8000 dòng sẽ log cảnh báo để nhắc Archive
// =========================================================================
function readSheet(name, filterFn, ss) {
  try {
    var activeSs = ss || SpreadsheetApp.getActiveSpreadsheet();
    var sheet = activeSs.getSheetByName(name); if (!sheet) return [];
    var lastRow = sheet.getLastRow(); if (lastRow <= 1) return [];

    // v2.11 Audit Fix R1: Xóa hard-cap 4000 dòng — đọc toàn bộ sheet
    // Giới hạn an toàn 10000 dòng để tránh timeout 30s của Apps Script
    // Nếu vượt 10000, đọc 10000 dòng mới nhất + log cảnh báo cần Archive
    var MAX_SAFE_ROWS = 10000;
    var data;
    var headers;
    if (lastRow <= MAX_SAFE_ROWS) {
      data = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
      headers = data[0];
    } else {
      // CẢNH BÁO: Bảng quá lớn — cần chạy Archive để giảm tải
      console.warn('⚠️ readSheet: Bảng "' + name + '" có ' + lastRow + ' dòng (vượt ngưỡng ' + MAX_SAFE_ROWS + '). Cần chạy Archive để tối ưu hiệu năng!');
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var startRow = lastRow - MAX_SAFE_ROWS + 2;
      var numRows = lastRow - startRow + 1;
      var values = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).getValues();
      data = [headers].concat(values);
    }
    var result = [];

    for (var i = 1; i < data.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        var val = data[i][j]; var header = headers[j];
        if (val instanceof Date) {
          var hours = val.getHours();
          var minutes = val.getMinutes();
          var seconds = val.getSeconds();
          var pad = function (n) { return n < 10 ? '0' + n : n; };
          if (val.getFullYear() === 1899) {
            if (hours === 0 && minutes === 0 && seconds === 0) {
              obj[header] = "00:00:00";
            } else {
              obj[header] = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
            }
          } else if (hours === 0 && minutes === 0 && seconds === 0) {
            obj[header] = val.getFullYear() + "-" + pad(val.getMonth() + 1) + "-" + pad(val.getDate());
          } else {
            obj[header] = val.getFullYear() + "-" + pad(val.getMonth() + 1) + "-" + pad(val.getDate()) + " " + pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
          }
        } else if (header === 'date' && val) {
          var str = String(val).trim(); if (str.includes('T')) str = str.split('T')[0];
          if (str.includes('/')) { var parts = str.split('/'); if (parts.length === 3) str = parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0'); }
          obj[header] = str;
        } else { obj[header] = String(val !== null && val !== undefined ? val : '').trim(); }
      }

      if (obj.id || name === 'Config_KPI' || name === 'Config_GiaLayout') {
        // ÁP DỤNG MÀNG LỌC DỮ LIỆU ĐỂ GIẢM TẢI BỘ NHỚ CHO TRÌNH DUYỆT
        if (!filterFn || filterFn(obj)) {
          result.push(obj);
        }
      }
    }
    return result;
  } catch (e) {
    console.error("Lỗi readSheet bảng " + name + ": ", e);
    return [];
  }
}

// =========================================================================
// HÀM GÓI DỮ LIỆU GỬI VỀ APP (LỌC BỎ RÁC VÀ DỮ LIỆU CŨ QUÁ 45 NGÀY)
// =========================================================================
function getAppData(pin) {
  var auth = validatePin(pin);
  if (!auth || !auth.valid || auth._debugMsg) { return { isAuthFailed: true, error: "AUTH_FAILED" }; }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // TỐI ƯU HIỆU NĂNG: Chỉ chạy khởi tạo Sheet & Migration duy nhất 1 lần thay vì chạy đè Lock mỗi request
    var scriptProps = PropertiesService.getScriptProperties();
    var lastMigration = scriptProps.getProperty('LAST_MIGRATION_VERSION');
    if (lastMigration !== 'v2.14.2') {
      try {
        if (!ss.getSheetByName('Trainings')) {
          var trainingsSheet = ss.insertSheet('Trainings');
          trainingsSheet.appendRow(SCHEMA.Trainings);
          trainingsSheet.setFrozenRows(1);
        }
        if (!ss.getSheetByName('Models3D')) {
          var models3DSheet = ss.insertSheet('Models3D');
          models3DSheet.appendRow(SCHEMA.Models3D);
          models3DSheet.setFrozenRows(1);
        }
        if (!ss.getSheetByName('CTV_Finance')) {
          var ctvSheet = ss.insertSheet('CTV_Finance');
          ctvSheet.appendRow(['id', 'date', 'type', 'amount', 'note', 'user', 'status']);
          ctvSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#d4af37");
          ctvSheet.setFrozenRows(1);
        }
        if (!ss.getSheetByName('Config_GiaLayout')) {
          var configLayoutSheet = ss.insertSheet('Config_GiaLayout');
          configLayoutSheet.appendRow(['Size_Max', 'Do_Chi_Tiet', 'He_So_Gia', 'Phi_Gui_Xuong', 'Phi_Gan_Reu']);
          configLayoutSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#d4af37");
          configLayoutSheet.setFrozenRows(1);
          const defaultLayoutData = [
            [30, 'Đơn giản', 740000, 10000, 10000],
            [30, 'Chi tiết cao', 860000, 10000, 10000],
            [50, 'Đơn giản', 540000, 15000, 20000],
            [50, 'Chi tiết cao', 660000, 15000, 20000],
            [70, 'Đơn giản', 560000, 30000, 25000],
            [70, 'Chi tiết cao', 680000, 30000, 30000],
            [90, 'Đơn giản', 490000, 40000, 45000],
            [90, 'Chi tiết cao', 630000, 45000, 50000],
            [120, 'Đơn giản', 490000, 45000, 65000],
            [120, 'Chi tiết cao', 660000, 50000, 65000]
          ];
          defaultLayoutData.forEach(function (row) { configLayoutSheet.appendRow(row); });
        }
        if (!ss.getSheetByName('Reimbursements')) {
          var reimbSheet = ss.insertSheet('Reimbursements');
          reimbSheet.appendRow(SCHEMA.Reimbursements);
          reimbSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#d4af37");
          reimbSheet.setFrozenRows(1);
        }
        if (!ss.getSheetByName('Workspaces')) {
          var wsSheet = ss.insertSheet('Workspaces');
          wsSheet.appendRow(SCHEMA_ERP.Workspaces);
          wsSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#d4af37");
          wsSheet.setFrozenRows(1);
        }
        if (!ss.getSheetByName('BOM_Config')) {
          var bomSheet = ss.insertSheet('BOM_Config');
          bomSheet.appendRow(SCHEMA_ERP.BOM_Config);
          bomSheet.getRange("A1:E1").setFontWeight("bold").setBackground("#d4af37");
        }
        repairKPIProgressSheetHeaders();
        api_migrateXuFromBonusPenaltyToThongKeTichLuyXu();
        api_repairAndRestoreTasksFromXuSheet();
        api_repairSupplierNegativeDebts();
        api_repairAdjustmentTransactions();
        scriptProps.setProperty('LAST_MIGRATION_VERSION', 'v2.14.2');
      } catch (mErr) {
        console.error('Lỗi khi chạy migration ngầm một lần:', mErr);
      }
    }

    // 1. TẠO MỐC THỜI GIAN CẮT DỮ LIỆU (MẶC ĐỊNH LÀ NGÀY 1 THÁNG TRƯỚC) CHO HR & ERP
    var today = new Date();
    var cutoffDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    var cutoffStr = Utilities.formatDate(cutoffDate, Session.getScriptTimeZone(), "yyyy-MM-dd");

    // 2. LỌC ĐƠN HÀNG: NẠP TOÀN BỘ ĐƠN ĐANG VẬN HÀNH VÀ CÁC ĐƠN ĐÃ ĐÓNG
    var orderIds = {};
    var orders = readSheet('Orders', function (o) {
      if (!o.id || String(o.id).trim() === '0' || String(o.id).trim() === '') return false;

      // BỘ LỌC CHỐNG GHOST ORDERS:
      // Chỉ loại bỏ các dòng rác hoàn toàn không có thông tin (customer="0" hoặc rỗng kèm orderCode="0" hoặc rỗng)
      if ((String(o.customer || '').trim() === '0' || !o.customer) && (String(o.orderCode || '').trim() === '0' || !o.orderCode) && !o.revenue && !o.createdAt) {
        return false;
      }
      if (!o.orderCode || String(o.orderCode).trim() === '0' || String(o.orderCode).trim() === '') {
        o.orderCode = String(o.id);
      }

      var s = String(o.status || '').trim();
      if (s === '0' || s === '') return true;
      var isTerminal = isTerminalStatus(s);
      if (!isTerminal) return true; // Đang vận hành thì luôn lấy 100%

      // Với các đơn đã đóng (Terminal/Reconciled), chỉ nạp các đơn trong phạm vi 60 ngày gần nhất (từ ngày 1 tháng trước) theo ngày đặt hàng
      var dStr = o.date || o.createdAt;
      if (dStr) {
        var oDateStr = String(dStr).substring(0, 10);
        if (oDateStr >= cutoffStr) return true;
        if (oDateStr.indexOf('/') > -1) {
          var parts = oDateStr.split('/');
          if (parts.length >= 3) {
            var reformatDate = parts[2] + '-' + parts[1].padStart(2, '0') + '-' + parts[0].padStart(2, '0');
            if (reformatDate >= cutoffStr) return true;
          }
        }
        var d = new Date(dStr);
        if (!isNaN(d.getTime()) && d >= cutoffDate) return true;
      }
      return false; // Đơn cũ hơn sẽ được Lazy-load qua getArchivedOrders khi user cần
    }, ss).map(function (o) {
      var acc = o.accessories;
      if (acc && typeof acc === 'string') {
        try {
          var parsed = JSON.parse(acc);
          while (typeof parsed === 'string') { parsed = JSON.parse(parsed); }
          o.accessories = Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          // Nếu không phải JSON hợp lệ, giữ nguyên chuỗi hoặc phân tách bằng dấu phẩy
          o.accessories = acc.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
        }
      } else if (!Array.isArray(acc)) {
        o.accessories = [];
      }
      o.hasProduction = (String(o.hasProduction).toUpperCase() === 'TRUE');
      o.shippingMethod = o.shippingMethod || '';
      if (o.id) {
        orderIds[String(o.id).trim()] = true;
      }
      return o;
    });

    // 3. LỌC LỆNH SẢN XUẤT: GIỮ LẠI LỆNH CỦA ĐƠN ĐANG VẬN HÀNH VÀ LỆNH HOÀN THÀNH TRONG 45 NGÀY (CHO KPI)
    var prodItems = readSheet('Production', function (p) {
      if (p.orderId) {
        var pRaw = String(p.orderId).trim();
        var matched = false;
        var multipleOrders = pRaw.split('|').map(function (s) { return s.trim(); });
        for (var mo = 0; mo < multipleOrders.length; mo++) {
          var singleOrderId = multipleOrders[mo];
          if (orderIds[singleOrderId] === true) {
            matched = true; break;
          } else {
            var parts = singleOrderId.split('_');
            while (parts.length > 1) {
              parts.pop();
              if (orderIds[parts.join('_')] === true) {
                matched = true; break;
              }
            }
            if (matched) break;
          }
        }
        if (matched) return true;
      }
      var s = String(p.status).toUpperCase().trim();
      var isTerminal = (normalizeStatus(s) === 'Done' || normalizeStatus(s) === 'Đơn Huỷ' || p.fulfilledFromStock);
      if (!isTerminal) return false; // Lệnh mồ côi (đơn đã xoá hoặc quá cũ) thì loại bỏ

      // Giữ lại 45 ngày để tính lương/KPI
      var dStr = p.p2_endTime || p.p1_endTime || p.deadline;
      if (dStr) {
        var d = new Date(dStr);
        // Nếu parse lỗi (VD định dạng dd/mm/yyyy), ta thử split '/'
        if (isNaN(d.getTime()) && typeof dStr === 'string' && dStr.includes('/')) {
          var parts = dStr.split(' ')[0].split('/');
          if (parts.length >= 3) d = new Date(parts[2], parts[1] - 1, parts[0]);
        }
        if (!isNaN(d.getTime()) && d >= cutoffDate) return true;
        // Fallback string compare if Date parsing fails entirely but it's yyyy-mm-dd
        if (String(dStr) >= cutoffStr) return true;
      }
      return false;
    }, ss).map(function (p) { return { id: p.id, orderId: p.orderId, type: p.type, name: p.name, note: p.note, status: p.status, deadline: p.deadline, fulfilledFromStock: (String(p.fulfilledFromStock).toUpperCase() === 'TRUE'), qc_front_photo: p.qc_front_photo || '', qc_side_photo: p.qc_side_photo || '', qc_status: p.qc_status || '', qc_note: p.qc_note || '', serialCode: p.serialCode || '', usedByOrderCode: p.usedByOrderCode || '', usedAt: p.usedAt || '', phases: { phase1: { name: p.p1_name || '', status: p.p1_status || '', user: p.p1_user || '', start: p.p1_start || '', endTime: p.p1_endTime || '', photo: p.p1_photo || '', reward_vnd: p.p1_reward_vnd || 0 }, phase2: { name: p.p2_name || '', status: p.p2_status || '', user: p.p2_user || '', start: p.p2_start || '', endTime: p.p2_endTime || '', photo: p.p2_photo || '', reward_vnd: p.p2_reward_vnd || 0 } } }; });

    // 4. LỌC ĐÓNG GÓI: GIỮ LẠI ĐÓNG GÓI CỦA ĐƠN ĐANG VẬN HÀNH VÀ HOÀN THÀNH TRONG 45 NGÀY
    var packings = readSheet('Packings', function (p) {
      if (p.orderId) {
        var pRaw = String(p.orderId).trim();
        var matched = false;
        var multipleOrders = pRaw.split('|').map(function (s) { return s.trim(); });
        for (var mo = 0; mo < multipleOrders.length; mo++) {
          var singleOrderId = multipleOrders[mo];
          if (orderIds[singleOrderId] === true) {
            matched = true; break;
          } else {
            var parts = singleOrderId.split('_');
            while (parts.length > 1) {
              parts.pop();
              if (orderIds[parts.join('_')] === true) {
                matched = true; break;
              }
            }
            if (matched) break;
          }
        }
        if (matched) return true;
      }
      var s = String(p.status).toUpperCase().trim();
      var isTerminal = (s === 'DONE' || s === 'ĐÃ XONG');
      if (!isTerminal) return false;

      // Giữ lại 45 ngày để tính lương/KPI
      var dStr = p.endTime || p.end;
      if (dStr) {
        var d = new Date(dStr);
        if (isNaN(d.getTime()) && typeof dStr === 'string' && dStr.includes('/')) {
          var parts = dStr.split(' ')[0].split('/');
          if (parts.length >= 3) d = new Date(parts[2], parts[1] - 1, parts[0]);
        }
        if (!isNaN(d.getTime()) && d >= cutoffDate) return true;
        if (String(dStr) >= cutoffStr) return true;
      }
      return false;
    }, ss).map(function (p) { return { id: p.id, orderId: p.orderId, user: p.user || '', start: p.start || '', end: p.end || '', endTime: p.endTime || '', status: p.status || '', photo: p.photo || '', photoBefore: p.photoBefore || '', reward_vnd: Number(p.reward_vnd || 0) }; });


    // 5. LỌC CHẤM CÔNG (HR): Chỉ lấy đúng 45 ngày gần nhất để tính lương
    var attendance = readSheet('Attendance', function (a) {
      return (a.date >= cutoffStr);
    }, ss);

    var documentsRaw = readSheet('Documents', null, ss) || [];
    var parsedDocuments = documentsRaw.map(function (doc) {
      if (doc.attachments && typeof doc.attachments === 'string') { try { doc.attachments = JSON.parse(doc.attachments); } catch (e) { doc.attachments = []; } }
      if (doc.readBy && typeof doc.readBy === 'string') { try { doc.readBy = JSON.parse(doc.readBy); } catch (e) { doc.readBy = []; } }
      return doc;
    });

    var d = { orders: orders || [], prodItems: prodItems || [], packings: packings || [], attendance: attendance || [], kpiConfig: readSheet('Config_KPI', null, ss) || [], documents: parsedDocuments, trainings: readSheet('Trainings', null, ss) || [], models3D: readSheet('Models3D', null, ss) || [], ctvFinance: readSheet('CTV_Finance', null, ss) || [], configGiaLayout: readSheet('Config_GiaLayout', null, ss) || [], reimbursements: readSheet('Reimbursements', null, ss) || [], monthlySnapshots: readSheet('Monthly_Snapshots', null, ss) || [] };

    // 6. LỌC CÁC BẢNG ERP (Lịch sử giao dịch, Thu chi, Thưởng phạt)
    Object.keys(SCHEMA_ERP).forEach(function (n) {
      if (n === 'Transactions' || n === 'ImportExport' || n === 'BonusPenalty') {
        d[n] = readSheet(n, function (item) {
          // Chỉ kéo về app các giao dịch tài chính & kho vận trong 45 ngày qua
          return (item.date && String(item.date).substring(0, 10) >= cutoffStr);
        }, ss) || [];
      } else {
        // Hàng hoá (Products), Quỹ (Accounts), Nhà Cung Cấp (Suppliers) là dữ liệu Master nên giữ toàn bộ từ Sheet gốc
        d[n] = readSheet(n, null, ss) || [];
      }
    });

    // === PHÂN QUYỀN TRUY CẬP ĐỌC DỮ LIỆU (READ RBAC FILTERING) ===
    var userRole = String(auth.role || '').toUpperCase();
    var isBoss = auth.isBoss || userRole === 'TỐI CAO';
    var isAccounting = isBoss || userRole === 'KẾ TOÁN' || userRole === 'QUẢN LÝ KIỂM TOÁN' || userRole === 'KIỂM TOÁN';
    var isHR = isBoss || isAccounting || userRole === 'QUẢN LÝ NHÂN SỰ' || userRole === 'NHÂN SỰ';
    var isWarehouse = isBoss || isAccounting || userRole === 'QUẢN LÝ KHO VẬN' || userRole === 'KHO VẬN';
    var isSales = isBoss || isAccounting || userRole === 'QUẢN LÝ BÁN HÀNG' || userRole === 'BÁN HÀNG' || userRole === 'CỘNG TÁC VIÊN' || userRole === 'CTV';
    var isProduction = isBoss || isAccounting || userRole === 'QUẢN LÝ SẢN XUẤT' || userRole === 'SẢN XUẤT';

    // 1. Sổ quỹ ngân hàng và báo cáo tài chính nội bộ: Chỉ Kế toán và Tối cao
    if (!isAccounting) {
      d.Accounts = [];
      d.Transactions = [];
      d.ProfitReports = [];
      if (!isSales) {
        d.CTV_Finance = [];
        d.ctvFinance = [];
      }
    }

    // 2. Bảng lương chi tiết và thưởng phạt: Nhân sự thông thường chỉ xem được của chính mình
    if (!isBoss && !isAccounting && !isHR) {
      d.monthlySnapshots = (d.monthlySnapshots || []).filter(function(s) {
        return s.user === auth.user;
      });
      d.BonusPenalty = (d.BonusPenalty || []).filter(function(bp) {
        return bp.user === auth.user;
      });
    }

    // 3. Chấm công: Thợ / Nhân viên thông thường chỉ xem lịch sử chấm công của chính mình
    if (!isBoss && !isHR && !isProduction && !isWarehouse && !isAccounting) {
      d.attendance = (d.attendance || []).filter(function(a) {
        return a.user === auth.user;
      });
    }

    var props = PropertiesService.getScriptProperties();
    d.announcement = props.getProperty('RF_ANNOUNCEMENT') || "Tối nay 20:00 ngày 15/06/2026.\nĐào tạo nâng cao kỹ năng quản lý. Có mặt đúng giờ!";
    d.archiveStats = {
      lastArchivedAt: props.getProperty('LAST_ARCHIVE_RUN') || '',
      lastArchivedCount: Number(props.getProperty('LAST_ARCHIVE_COUNT') || 0),
      lastCutoff: props.getProperty('LAST_ARCHIVE_CUTOFF') || ''
    };

    d.serverTime = new Date().getTime(); return d;
  } catch (e) { return { error: e.toString() }; }
}

// =========================================================================
// HÀM TẢI LỊCH SỬ KHI USER CÓ YÊU CẦU (ARCHIVE LOADER)
// =========================================================================
function getArchivedData(pin) {
  var auth = validatePin(pin);
  if (!auth || !auth.valid) { return { isAuthFailed: true, error: "AUTH_FAILED" }; }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. TẢI CÁC ĐƠN HÀNG ĐÃ ĐÓNG (ARCHIVED)
    var archivedOrders = readSheet('Orders', function (o) {
      if (!o.status) return false;
      return isTerminalStatus(o.status);
    }, ss).map(function (o) {
      try { var acc = o.accessories; while (typeof acc === 'string') { acc = JSON.parse(acc); } o.accessories = Array.isArray(acc) ? acc : []; } catch (e) { o.accessories = []; }
      o.hasProduction = (String(o.hasProduction).toUpperCase() === 'TRUE');
      o.shippingMethod = o.shippingMethod || '';
      return o;
    });

    // 2. TẢI CÁC LỆNH SẢN XUẤT ĐÃ ĐÓNG (ARCHIVED)
    var archivedProdItems = readSheet('Production', function (p) {
      var s = String(p.status).toUpperCase().trim();
      var isTerminal = (normalizeStatus(s) === 'Done' || normalizeStatus(s) === 'Đơn Huỷ' || p.fulfilledFromStock);
      return isTerminal;
    }, ss).map(function (p) { return { id: p.id, orderId: p.orderId, type: p.type, name: p.name, note: p.note, status: p.status, deadline: p.deadline, fulfilledFromStock: (String(p.fulfilledFromStock).toUpperCase() === 'TRUE'), qc_front_photo: p.qc_front_photo || '', qc_side_photo: p.qc_side_photo || '', qc_status: p.qc_status || '', qc_note: p.qc_note || '', serialCode: p.serialCode || '', usedByOrderCode: p.usedByOrderCode || '', usedAt: p.usedAt || '', phases: { phase1: { name: p.p1_name || '', status: p.p1_status || '', user: p.p1_user || '', start: p.p1_start || '', endTime: p.p1_endTime || '', photo: p.p1_photo || '', reward_vnd: p.p1_reward_vnd || 0 }, phase2: { name: p.p2_name || '', status: p.p2_status || '', user: p.p2_user || '', start: p.p2_start || '', endTime: p.p2_endTime || '', photo: p.p2_photo || '', reward_vnd: p.p2_reward_vnd || 0 } } }; });

    // 3. TẢI CÁC LỆNH ĐÓNG GÓI ĐÃ ĐÓNG (ARCHIVED)
    var archivedPackings = readSheet('Packings', function (p) {
      var s = String(p.status).toUpperCase().trim();
      return (s === 'DONE' || s === 'ĐÃ XONG');
    }, ss).map(function (p) { return { id: p.id, orderId: p.orderId, user: p.user || '', start: p.start || '', end: p.end || '', endTime: p.endTime || '', status: p.status || '', photo: p.photo || '', photoBefore: p.photoBefore || '', reward_vnd: Number(p.reward_vnd || 0) }; });

    return {
      orders: archivedOrders,
      prodItems: archivedProdItems,
      packings: archivedPackings
    };
  } catch (e) { return { error: e.toString() }; }
}

// =========================================================================
// HÀM LAZY-LOAD ĐƠN HÀNG LƯU TRỮ THEO QUÝ / THÁNG / MÃ ĐƠN (ON-DEMAND)
// =========================================================================
function getArchivedOrders(options, pin) {
  if (typeof options === 'string' && !pin) { pin = options; options = {}; }
  if (options && typeof options === 'object' && options.pin && !pin) { pin = options.pin; }
  var auth = validatePin(pin);
  if (!auth || !auth.valid) { return { isAuthFailed: true, error: "AUTH_FAILED" }; }
  try {
    options = options || {};
    var month = options.month; // e.g. "2026-03"
    var quarter = options.quarter; // e.g. "Q1-2026", "2026-Q1"
    var searchCode = options.searchCode ? String(options.searchCode).trim().toUpperCase() : '';
    var page = parseInt(options.page, 10) || 1;
    // BẮT BUỘC: Khi người dùng chọn Tháng, tải 100% toàn bộ đơn của tháng đó (không cắt cụt phân trang dở dang)
    var pageSize = parseInt(options.pageSize, 10) || (month || quarter ? 5000 : 500);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var allArchived = [];

    // Helper filter function
    var matchesFilter = function(o) {
      if (!o.id || String(o.id).trim() === '0' || String(o.id).trim() === '') return false;
      if (!o.orderCode || String(o.orderCode).trim() === '0') return false;
      if (String(o.customer).trim() === '0') return false;

      var oCode = String(o.orderCode || '').toUpperCase();
      var oPhone = String(o.phone || '').toUpperCase();
      var oCust = String(o.customer || '').toUpperCase();
      var oId = String(o.id || '').toUpperCase();
      // BẮT BUỘC: Lọc theo ngày đặt hàng thực tế (order.date hoặc order.createdAt)
      var oDate = String(o.date || o.createdAt || '').substring(0, 10);

      // Filter by Search Code if provided
      if (searchCode) {
        var isSearchMatch = oCode.indexOf(searchCode) !== -1 || oPhone.indexOf(searchCode) !== -1 || oCust.indexOf(searchCode) !== -1 || oId.indexOf(searchCode) !== -1;
        if (!isSearchMatch) return false;
      }

      // Filter by Month if provided (e.g. "2026-03")
      if (month && !searchCode) {
        if (oDate.indexOf(month) !== 0) return false;
      }

      // Filter by Quarter if provided (e.g. "Q1-2026")
      if (quarter && !searchCode && !month) {
        var qParts = quarter.toUpperCase().split(/[-_]/);
        var qNum = 0; var qYear = '';
        qParts.forEach(function(p) {
          if (p.indexOf('Q') === 0) qNum = parseInt(p.replace('Q', ''), 10);
          else if (p.length === 4) qYear = p;
        });
        if (qNum && qYear && oDate.length >= 7) {
          var oYear = oDate.substring(0, 4);
          var oMonthNum = parseInt(oDate.substring(5, 7), 10);
          var orderQ = Math.ceil(oMonthNum / 3);
          if (oYear !== qYear || orderQ !== qNum) return false;
        }
      }

      return true;
    };

    var formatOrder = function(o) {
      try {
        var acc = o.accessories;
        while (typeof acc === 'string') { acc = JSON.parse(acc); }
        o.accessories = Array.isArray(acc) ? acc : [];
      } catch (e) {
        o.accessories = [];
      }
      o.hasProduction = (String(o.hasProduction).toUpperCase() === 'TRUE');
      o.shippingMethod = o.shippingMethod || '';
      return o;
    };

    // 1. Đọc từ sheet Orders_Archive (nếu có)
    if (ss.getSheetByName('Orders_Archive')) {
      var archiveList = readSheet('Orders_Archive', matchesFilter, ss).map(formatOrder);
      allArchived = allArchived.concat(archiveList);
    }

    // 2. Đọc thêm từ Orders (các đơn terminal cũ chưa archive nếu có lọc theo month/search)
    var ordersList = readSheet('Orders', function(o) {
      if (!isTerminalStatus(o.status)) return false;
      return matchesFilter(o);
    }, ss).map(formatOrder);

    // Merge chống trùng lặp theo ID
    var existingIds = {};
    allArchived.forEach(function(o) { existingIds[o.id] = true; });
    ordersList.forEach(function(o) {
      if (!existingIds[o.id]) {
        allArchived.push(o);
        existingIds[o.id] = true;
      }
    });

    // Sắp xếp theo ngày đặt hàng giảm dần
    allArchived.sort(function(a, b) {
      var dateA = String(a.date || a.createdAt || '');
      var dateB = String(b.date || b.createdAt || '');
      return dateB.localeCompare(dateA);
    });

    var totalCount = allArchived.length;
    var totalPages = Math.ceil(totalCount / pageSize) || 1;
    var startIdx = (page - 1) * pageSize;
    var paginatedOrders = allArchived.slice(startIdx, startIdx + pageSize);

    return {
      success: true,
      orders: paginatedOrders,
      totalCount: totalCount,
      page: page,
      pageSize: pageSize,
      totalPages: totalPages
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

// =========================================================================
// HÀM LƯU TRỮ HÀNG LOẠT ĐƠN ĐỐI SOÁT THÀNH CÔNG SANG ORDERS_ARCHIVE (CHỐNG NGHẼN APP)
// =========================================================================
function archiveReconciledOrders(cutoffDays, pin) {
  var days = 60;
  var effectivePin = pin;
  if (typeof cutoffDays === 'object' && cutoffDays !== null) {
    if (cutoffDays.cutoffDays !== undefined) days = parseInt(cutoffDays.cutoffDays, 10) || 60;
    if (cutoffDays.pin && !effectivePin) effectivePin = cutoffDays.pin;
  } else if (typeof cutoffDays === 'number' || typeof cutoffDays === 'string') {
    days = parseInt(cutoffDays, 10) || 60;
  }

  if (!effectivePin) {
    return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để thực hiện lưu trữ đơn!' };
  }
  var auth = validatePin(effectivePin);
  if (!auth || !auth.valid) { return { isAuthFailed: true, error: "AUTH_FAILED" }; }
  if (!checkServerPermission(auth, 'ORDER_ARCHIVE_ACTION')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Bạn không có quyền thực hiện lưu trữ đơn hàng!' };
  }

  return archiveReconciledOrdersInternal_(days, auth.user);
}

function archiveReconciledOrdersInternal_(cutoffDays, operator) {
  var days = (typeof cutoffDays === 'number' || typeof cutoffDays === 'string') ? (parseInt(cutoffDays, 10) || 60) : 60;
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var orderSheet = ss.getSheetByName('Orders');
    if (!orderSheet) return { success: false, message: 'Không tìm thấy bảng Orders!' };

    // Đảm bảo bảng Orders_Archive tồn tại với đầy đủ Schema
    var archiveSheet = ss.getSheetByName('Orders_Archive');
    var expectedCols = SCHEMA.Orders;
    if (!archiveSheet) {
      archiveSheet = ss.insertSheet('Orders_Archive');
      archiveSheet.getRange(1, 1, 1, expectedCols.length).setValues([expectedCols])
        .setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
      archiveSheet.setFrozenRows(1);
    } else {
      var archHeaders = archiveSheet.getRange(1, 1, 1, Math.max(archiveSheet.getLastColumn(), 1)).getValues()[0];
      if (archHeaders.length === 0 || !archHeaders[0]) {
        archiveSheet.getRange(1, 1, 1, expectedCols.length).setValues([expectedCols])
          .setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
        archiveSheet.setFrozenRows(1);
      }
    }

    var cutoffMs = Date.now() - (days * 24 * 60 * 60 * 1000);
    var cutoffDate = new Date(cutoffMs);
    var cutoffStr = Utilities.formatDate(cutoffDate, Session.getScriptTimeZone(), "yyyy-MM-dd");

    var data = orderSheet.getDataRange().getValues();
    if (data.length <= 1) {
      return { success: true, message: 'Bảng Orders chưa có dữ liệu để lưu trữ.', movedCount: 0, totalOrders: 0 };
    }

    var headers = data[0];
    var statusCol = headers.indexOf('status');
    var reconCol = headers.indexOf('isReconciled');
    var reconAtCol = headers.indexOf('reconciledAt');
    var dateCol = headers.indexOf('date');
    var createdCol = headers.indexOf('createdAt');
    var idCol = headers.indexOf('id');

    var rowsToMove = [];
    var rowIndicesToDelete = []; // 1-based row numbers from bottom up

    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      var oId = String(row[idCol] || '').trim();
      if (!oId || oId === '0') continue;

      var status = String(row[statusCol] || '').trim();
      var isRecon = (reconCol !== -1 && (String(row[reconCol]).toUpperCase() === 'TRUE' || row[reconCol] === true));
      var isTerminal = isTerminalStatus(status) || isRecon;

      if (!isTerminal) continue;

      var dateVal = (reconAtCol !== -1 ? row[reconAtCol] : '') || (createdCol !== -1 ? row[createdCol] : '') || (dateCol !== -1 ? row[dateCol] : '');
      var oDateStr = '';
      if (dateVal instanceof Date) {
        oDateStr = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "yyyy-MM-dd");
      } else {
        oDateStr = String(dateVal || '').substring(0, 10);
      }

      // Nếu đơn terminal có ngày cũ hơn mốc cutoff
      if (oDateStr && oDateStr < cutoffStr) {
        // Chuẩn hóa hàng dữ liệu theo đúng thứ tự SCHEMA.Orders
        var normalizedRow = expectedCols.map(function(colName) {
          var cIdx = headers.indexOf(colName);
          return cIdx !== -1 ? row[cIdx] : '';
        });
        rowsToMove.push(normalizedRow);
        rowIndicesToDelete.push(i + 1); // 1-indexed row in sheet
      }
    }

    var remainingOrders = data.length - 1 - rowsToMove.length;
    var nowIso = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    var props = PropertiesService.getScriptProperties();

    if (rowsToMove.length === 0) {
      props.setProperty('LAST_ARCHIVE_RUN', nowIso);
      return {
        success: true,
        message: 'Không có đơn hàng nào cũ hơn ' + days + ' ngày cần lưu trữ.',
        movedCount: 0,
        cutoffDate: cutoffStr,
        totalOrders: data.length - 1,
        lastArchivedAt: nowIso
      };
    }

    // 1. Ghi hàng loạt vào Orders_Archive
    var archiveLastRow = archiveSheet.getLastRow();
    archiveSheet.getRange(archiveLastRow + 1, 1, rowsToMove.length, expectedCols.length).setValues(rowsToMove);

    // 2. Xóa các dòng đã chuyển khỏi sheet Orders (xóa từ dưới lên để không lệch chỉ số)
    var deleteRanges = [];
    var currentRange = null;

    rowIndicesToDelete.forEach(function(rowIdx) {
      if (!currentRange) {
        currentRange = { start: rowIdx, count: 1 };
      } else if (currentRange.start - currentRange.count === rowIdx) {
        currentRange.count++;
      } else {
        deleteRanges.push(currentRange);
        currentRange = { start: rowIdx, count: 1 };
      }
    });
    if (currentRange) deleteRanges.push(currentRange);

    deleteRanges.forEach(function(rg) {
      var actualStart = rg.start - rg.count + 1;
      orderSheet.deleteRows(actualStart, rg.count);
    });

    // 3. Cập nhật thống kê vào ScriptProperties
    props.setProperty('LAST_ARCHIVE_RUN', nowIso);
    props.setProperty('LAST_ARCHIVE_COUNT', String(rowsToMove.length));
    props.setProperty('LAST_ARCHIVE_CUTOFF', cutoffStr);

    return {
      success: true,
      message: 'Lưu trữ thành công ' + rowsToMove.length + ' đơn hàng sang Orders_Archive! Orders chính còn ' + remainingOrders + ' đơn.',
      movedCount: rowsToMove.length,
      cutoffDate: cutoffStr,
      remainingOrders: remainingOrders,
      lastArchivedAt: nowIso
    };
  } catch (e) {
    return { success: false, message: 'Lỗi lưu trữ đơn: ' + e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * API Lấy Thống Kê Sức Khỏe & Tình Trạng Lưu Trữ
 */
function api_getArchiveStats(pin) {
  var effectivePin = (typeof pin === 'object' && pin !== null) ? (pin.pin || pin.passcode || '') : pin;
  var auth = validatePin(effectivePin);
  if (!auth || !auth.valid) { return { isAuthFailed: true, error: "AUTH_FAILED" }; }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var orderSheet = ss.getSheetByName('Orders');
    var archiveSheet = ss.getSheetByName('Orders_Archive');
    
    var ordersCount = orderSheet ? Math.max(0, orderSheet.getLastRow() - 1) : 0;
    var archiveCount = archiveSheet ? Math.max(0, archiveSheet.getLastRow() - 1) : 0;
    
    var props = PropertiesService.getScriptProperties();
    var lastRun = props.getProperty('LAST_ARCHIVE_RUN') || 'Chưa chạy';
    var lastCount = Number(props.getProperty('LAST_ARCHIVE_COUNT') || 0);
    var lastCutoff = props.getProperty('LAST_ARCHIVE_CUTOFF') || '';

    // Kiểm tra trigger tự động
    var hasNightlyTrigger = false;
    try {
      var triggers = ScriptApp.getProjectTriggers();
      triggers.forEach(function(t) {
        if (t.getHandlerFunction() === 'nightlyAutoArchive' || t.getHandlerFunction() === 'api_runAutoArchiveEngine') {
          hasNightlyTrigger = true;
        }
      });
    } catch (trigErr) { }

    return {
      success: true,
      ordersCount: ordersCount,
      archiveCount: archiveCount,
      lastArchivedAt: lastRun,
      lastArchivedCount: lastCount,
      lastCutoff: lastCutoff,
      hasNightlyTrigger: hasNightlyTrigger,
      recommendedArchive: ordersCount > 2000,
      targetAppLoadTime: ordersCount <= 1500 ? '< 1.2s' : '< 1.8s'
    };
  } catch (e) {
    return { success: false, error: e.toString() };
  }
}

/**
 * Chạy Auto-Archive tự động định kỳ (hoặc qua Trigger Cron)
 */
function api_runAutoArchiveEngine(cutoffDays, pin) {
  var effectivePin = (typeof pin === 'object' && pin !== null) ? (pin.pin || pin.passcode || '') : pin;
  if (!effectivePin) {
    return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để chạy engine lưu trữ!' };
  }
  var days = cutoffDays || 60;
  return archiveReconciledOrders(days, effectivePin);
}

/**
 * Thiết lập Trigger tự động chạy hàng đêm lúc 2:00 AM
 */
function setupAutoArchiveTrigger(pin) {
  var effectivePin = (typeof pin === 'object' && pin !== null) ? (pin.pin || pin.passcode || '') : pin;
  if (!effectivePin) {
    return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để cài đặt Trigger!' };
  }
  var auth = validatePin(effectivePin);
  if (!auth || !auth.valid || (!auth.isAdmin && !auth.isBoss)) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Chỉ Quản Trị Viên mới được cài đặt Trigger!' };
  }
  try {
    var triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(function(t) {
      var fn = t.getHandlerFunction();
      if (fn === 'nightlyAutoArchive' || fn === 'api_runAutoArchiveEngine') {
        ScriptApp.deleteTrigger(t);
      }
    });

    ScriptApp.newTrigger('nightlyAutoArchive')
      .timeBased()
      .atHour(2)
      .everyDays(1)
      .inTimezone('Asia/Ho_Chi_Minh')
      .create();

    return { success: true, message: 'Đã kích hoạt tự động Auto-Archive mỗi ngày lúc 02:00 AM (GMT+7)!' };
  } catch (e) {
    return { success: false, message: 'Lỗi tạo trigger: ' + e.toString() };
  }
}


function applyDeltasToSheet(sheetName, items, formatter, ss) {
  if (!items || !items.length) return;
  var activeSs = ss || SpreadsheetApp.getActiveSpreadsheet();
  var sheet = activeSs.getSheetByName(sheetName); if (!sheet) return;

  // 1. Đọc đồng thời dữ liệu giá trị và dữ liệu công thức để bảo tồn công thức trên toàn bảng
  var dataRange = sheet.getDataRange();
  var data = dataRange.getValues();
  var formulas = dataRange.getFormulas();
  var headers = data[0] || SCHEMA[sheetName] || SCHEMA_ERP[sheetName] || [];

  // Mở rộng cột nếu thiếu cột theo schema quy định
  var expectedSchema = SCHEMA[sheetName] || SCHEMA_ERP[sheetName] || [];
  if (expectedSchema.length > 0 && data.length > 0) {
    var missing = [];
    expectedSchema.forEach(function (col) {
      if (headers.indexOf(col) === -1) {
        missing.push(col);
      }
    });
    if (missing.length > 0) {
      var lastCol = sheet.getLastColumn();
      sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing])
        .setFontWeight("bold").setBackground("#e6f5f5");
      dataRange = sheet.getDataRange();
      data = dataRange.getValues();
      formulas = dataRange.getFormulas();
      headers = data[0];
    }
  }

  var idColIdx = headers.indexOf('id');
  if (idColIdx === -1) idColIdx = 0;
  var codeColIdx = headers.indexOf('orderCode');
  var userCol = headers.indexOf('user');
  var dateCol = headers.indexOf('date');
  var shiftCol = headers.indexOf('shift');
  var statusCol = headers.indexOf('status');
  var catColIdx = headers.indexOf('category');

  // 2. Xây dựng chỉ mục tra cứu in-memory O(1)
  var idMap = new Map();
  var codeMap = new Map();
  var attLeaveMap = new Map();

  for (var r = 1; r < data.length; r++) {
    var rId = String(data[r][idColIdx] || '').trim();
    if (rId !== '' && !idMap.has(rId)) {
      idMap.set(rId, r);
    }
    if (sheetName === 'Orders' && codeColIdx !== -1) {
      var rCode = String(data[r][codeColIdx] || '').split(' | ')[0].split('|')[0].trim().toUpperCase();
      if (rCode && !codeMap.has(rCode)) {
        codeMap.set(rCode, r);
      }
    }
    if (sheetName === 'Attendance' && userCol !== -1 && dateCol !== -1) {
      var rUser = String(data[r][userCol]).trim();
      var rDate = String(data[r][dateCol]).trim().substring(0, 10);
      var rRowId = String(data[r][0]).trim();
      var rShift = shiftCol !== -1 ? String(data[r][shiftCol]) : '';
      var rStatus = statusCol !== -1 ? String(data[r][statusCol]) : '';
      if (rUser && rDate && (rRowId.indexOf('ATT_LEAVE_') === 0 || rShift.indexOf('Nghỉ') !== -1 || rStatus.indexOf('Nghỉ') !== -1)) {
        var leaveKey = rUser + '|' + rDate;
        if (!attLeaveMap.has(leaveKey)) {
          attLeaveMap.set(leaveKey, r);
        }
      }
    }
  }

  // Quản lý các dòng sửa và dòng thêm mới
  var updatedRows = new Map();
  var newRows = [];

  items.forEach(function (item) {
    var rowObject = formatter(item);
    var itemIdStr = String(item.id || '').trim();
    var matchedRowIdx = -1;

    // Bước 1: Tra cứu theo id
    if (itemIdStr !== '' && idMap.has(itemIdStr)) {
      matchedRowIdx = idMap.get(itemIdStr);
    }

    // Bước 2: Fallback tra cứu theo orderCode nếu là Orders (Exact Match)
    if (matchedRowIdx === -1 && sheetName === 'Orders' && codeColIdx !== -1) {
      var itemCode = String(item.orderCode || item.id || '').split(' | ')[0].split('|')[0].trim().toUpperCase();
      if (itemCode && codeMap.has(itemCode)) {
        matchedRowIdx = codeMap.get(itemCode);
      }
    }

    // Bước 3: Chống x2 phiếu nghỉ trùng lặp trên Attendance
    if (matchedRowIdx === -1 && sheetName === 'Attendance' && item.id && (String(item.id).indexOf('ATT_LEAVE_') === 0 || String(item.leaveType || '').indexOf('Nghỉ') === 0)) {
      if (userCol !== -1 && dateCol !== -1) {
        var leaveKey = String(item.user).trim() + '|' + String(item.date).trim().substring(0, 10);
        if (attLeaveMap.has(leaveKey)) {
          matchedRowIdx = attLeaveMap.get(leaveKey);
        }
      }
    }

    if (matchedRowIdx !== -1) {
      // Đang cập nhật một dòng: có thể là dòng trong data gốc HOẶC dòng mới được thêm trước đó trong cùng lô
      var isVirtualNewRow = (matchedRowIdx >= data.length);
      var currentRowData;
      var currentRowFormulas;

      if (isVirtualNewRow) {
        var virtualIdx = matchedRowIdx - data.length;
        currentRowData = newRows[virtualIdx];
        currentRowFormulas = [];
      } else {
        currentRowData = updatedRows.has(matchedRowIdx) ? updatedRows.get(matchedRowIdx) : data[matchedRowIdx];
        currentRowFormulas = (formulas && formulas[matchedRowIdx]) ? formulas[matchedRowIdx] : [];
      }

      var newRow = headers.map(function (h, colIdx) {
        // Xử lý tồn kho _diff (hỗ trợ cộng dồn nhiều lần)
        if (sheetName === 'Products' && h === 'quantity' && item._diff !== undefined) {
          var currentQtyVal = Number(currentRowData[colIdx]);
          if (isNaN(currentQtyVal)) currentQtyVal = 0;
          var diffVal = Number(item._diff);
          if (isNaN(diffVal)) diffVal = 0;
          var finalQty = currentQtyVal + diffVal;

          var category = catColIdx >= 0 ? String(currentRowData[catColIdx]).trim().toUpperCase() : '';
          if ((category.indexOf('BỂ KÍNH') > -1 || category.indexOf('LAYOUT') > -1) && finalQty < 0) {
            finalQty = 0;
          }
          return finalQty;
        }

        // Bảo vệ số dư tài khoản
        if (sheetName === 'Accounts' && h === 'balance') {
          if (currentRowFormulas[colIdx] && String(currentRowFormulas[colIdx]).indexOf('=') === 0) {
            return currentRowFormulas[colIdx];
          }
          return currentRowData[colIdx];
        }

        var hasField = item.hasOwnProperty(h);
        if (!hasField && sheetName === 'Production' && (h.indexOf('p1_') === 0 || h.indexOf('p2_') === 0)) {
          hasField = item.hasOwnProperty('phases');
        }

        if (hasField) {
          var newVal = rowObject[h];
          if (typeof newVal === 'number' && isNaN(newVal)) return 0;
          if (newVal === 'NaN' || newVal === 'undefined') return '';

          var finalVal = newVal !== undefined ? newVal : '';
          if (sheetName === 'Products' && h === 'quantity') {
            var category2 = catColIdx >= 0 ? String(currentRowData[catColIdx]).trim().toUpperCase() : '';
            if (category2.indexOf('BỂ KÍNH') > -1 || category2.indexOf('LAYOUT') > -1) {
              var qtyNum = Number(finalVal);
              if (qtyNum < 0) finalVal = 0;
            }
          }
          return finalVal;
        }

        // BẢO TOÀN CÔNG THỨC: Nếu client không gửi trường này và ô có công thức gốc, giữ nguyên chuỗi công thức!
        if (currentRowFormulas[colIdx] && String(currentRowFormulas[colIdx]).indexOf('=') === 0) {
          return currentRowFormulas[colIdx];
        }

        return currentRowData[colIdx];
      });

      if (isVirtualNewRow) {
        var virtualIdx2 = matchedRowIdx - data.length;
        newRows[virtualIdx2] = newRow;
      } else {
        updatedRows.set(matchedRowIdx, newRow);
        data[matchedRowIdx] = newRow; // Cập nhật in-memory cho các item sau cùng lô
      }

    } else {
      // Thêm dòng mới
      var newRow = headers.map(function (h) {
        var val = rowObject[h];
        if (typeof val === 'number' && isNaN(val)) return 0;
        return val !== undefined ? val : '';
      });

      var virtualRowIdx = data.length + newRows.length;
      newRows.push(newRow);

      // CẬP NHẬT CHỈ MỤC IN-FLIGHT NGAY TRONG LÔ:
      if (itemIdStr !== '') {
        idMap.set(itemIdStr, virtualRowIdx);
      }
      if (sheetName === 'Orders' && codeColIdx !== -1) {
        var itemCodeNew = String(item.orderCode || item.id || '').split(' | ')[0].split('|')[0].trim().toUpperCase();
        if (itemCodeNew) {
          codeMap.set(itemCodeNew, virtualRowIdx);
        }
      }
      if (sheetName === 'Attendance' && userCol !== -1 && dateCol !== -1) {
        var leaveKeyNew = String(item.user).trim() + '|' + String(item.date).trim().substring(0, 10);
        attLeaveMap.set(leaveKeyNew, virtualRowIdx);
      }
    }
  });

  // 3. TỐI ƯU GHI THEO LÔ (CONTIGUOUS RANGE BATCH WRITE)
  var totalRowsToWrite = updatedRows.size + newRows.length;
  if (totalRowsToWrite === 0) return;

  var currentMaxRows = sheet.getMaxRows();
  var neededRows = data.length + newRows.length;
  if (neededRows > currentMaxRows) {
    sheet.insertRowsAfter(currentMaxRows, neededRows - currentMaxRows);
  }
  var currentMaxCols = sheet.getMaxColumns();
  if (headers.length > currentMaxCols) {
    sheet.insertColumnsAfter(currentMaxCols, headers.length - currentMaxCols);
  }

  // A. Ghi các dòng cập nhật theo các dải liên tiếp (Contiguous Chunks)
  if (updatedRows.size > 0) {
    var sortedIndices = Array.from(updatedRows.keys()).sort(function (a, b) { return a - b; });
    var chunkStart = sortedIndices[0];
    var chunkRows = [updatedRows.get(chunkStart)];

    for (var k = 1; k < sortedIndices.length; k++) {
      var currentIdx = sortedIndices[k];
      var prevIdx = sortedIndices[k - 1];

      if (currentIdx === prevIdx + 1) {
        chunkRows.push(updatedRows.get(currentIdx));
      } else {
        var sheetRow = chunkStart + 1; // 1-based row index trên Sheet
        sheet.getRange(sheetRow, 1, chunkRows.length, headers.length).setValues(chunkRows);
        chunkStart = currentIdx;
        chunkRows = [updatedRows.get(chunkStart)];
      }
    }
    if (chunkRows.length > 0) {
      var sheetRowFinal = chunkStart + 1;
      sheet.getRange(sheetRowFinal, 1, chunkRows.length, headers.length).setValues(chunkRows);
    }
  }

  // B. Thêm toàn bộ dòng mới theo lô duy nhất (Single Batch Append)
  if (newRows.length > 0) {
    var appendStartRow = data.length + 1;
    sheet.getRange(appendStartRow, 1, newRows.length, headers.length).setValues(newRows);
  }
}

function normalizeProdName(s) {
  if (!s) return '';
  return String(s).trim().toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
}

function getProductInfoByName(ss, name) {
  if (!name) return null;
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var prodSheet = ss.getSheetByName('Products');
  if (!prodSheet) return null;
  var pData = prodSheet.getDataRange().getValues();
  if (pData.length <= 1) return null;
  
  var pHeaders = pData[0];
  var nameCol = pHeaders.indexOf('name');
  var skuCol = pHeaders.indexOf('sku');
  var catCol = pHeaders.indexOf('category');
  var subCatCol = pHeaders.indexOf('sub_category');
  var qtyCol = pHeaders.indexOf('quantity');
  var minStockCol = pHeaders.indexOf('minStock');
  var costCol = pHeaders.indexOf('costPrice');
  var idCol = pHeaders.indexOf('id');
  
  var cleanTarget = normalizeProdName(name);
  if (!cleanTarget) return null;

  function buildProdResult(i) {
    var cat = String(pData[i][catCol] || '').toUpperCase();
    var subCat = String(pData[i][subCatCol] || '').toUpperCase();
    var isEligible = cat === 'LAYOUT' || cat === 'BỂ KÍNH' || subCat === 'LAYOUT' || subCat === 'BỂ KÍNH' || cat.includes('SẢN XUẤT');
    return {
      rowIndex: i + 1,
      id: idCol !== -1 ? pData[i][idCol] : '',
      qtyColIndex: qtyCol !== -1 ? qtyCol : 9,
      qty: Number(pData[i][qtyCol]) || 0,
      minStock: Number(pData[i][minStockCol]) || 0,
      costPrice: Number(pData[i][costCol]) || 0,
      category: cat,
      isEligible: isEligible,
      sku: pData[i][skuCol],
      name: pData[i][nameCol]
    };
  }

  // PASS 1: ƯU TIÊN TUYỆT ĐỐI 100% EXACT MATCH (SKU HOẶC TÊN CHUẨN HOÁ)
  for (var i = 1; i < pData.length; i++) {
    var rawRowName = String(pData[i][nameCol] || '');
    var rawRowSku = String(pData[i][skuCol] || '');
    var rowName = normalizeProdName(rawRowName);
    var rowSku = normalizeProdName(rawRowSku);

    if (rowName === cleanTarget || (rowSku && rowSku === cleanTarget)) {
      return buildProdResult(i);
    }
  }

  // PASS 2: FALLBACK THEO KÍCH THƯỚC (CHỈ ÁP DỤNG CHO BỂ KÍNH, CẤM TIỆT ĐỐI VỚI LAYOUT)
  var isTargetGlass = /be|kinh/i.test(cleanTarget);
  if (isTargetGlass) {
    var targetDimMatch = String(name).match(/(\d+)\s*[xX*×_]\s*(\d+)(?:\s*[xX*×_]\s*(\d+))?/);
    var targetDims = targetDimMatch ? (targetDimMatch[1] + 'x' + targetDimMatch[2] + (targetDimMatch[3] ? ('x' + targetDimMatch[3]) : '')) : '';

    if (targetDims) {
      for (var j = 1; j < pData.length; j++) {
        var rawNameJ = String(pData[j][nameCol] || '');
        var rowNameJ = normalizeProdName(rawNameJ);
        var isRowGlass = /be|kinh/i.test(rowNameJ);

        if (isRowGlass) {
          var rowDimMatch = rawNameJ.match(/(\d+)\s*[xX*×_]\s*(\d+)(?:\s*[xX*×_]\s*(\d+))?/);
          var rowDims = rowDimMatch ? (rowDimMatch[1] + 'x' + rowDimMatch[2] + (rowDimMatch[3] ? ('x' + rowDimMatch[3]) : '')) : '';
          if (rowDims && rowDims === targetDims) {
            return buildProdResult(j);
          }
        }
      }
    }
  }

  return null;
}

function deleteDeltas(sheetName, itemIds, ss) {
  if (!itemIds || itemIds.length === 0) return;
  var activeSs = ss || SpreadsheetApp.getActiveSpreadsheet();
  var sheet = activeSs.getSheetByName(sheetName); if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  var headers = data[0];
  var idCol = headers.indexOf('id');
  if (idCol === -1) idCol = 0; // Fallback

  var deleteSet = {};
  itemIds.forEach(function (id) {
    if (id !== undefined && id !== null) {
      deleteSet[String(id).trim()] = true;
    }
  });

  var rowsToKeep = [headers];
  var hasDeleted = false;
  for (var i = 1; i < data.length; i++) {
    var rowId = String(data[i][idCol]).trim();
    if (deleteSet[rowId]) {
      hasDeleted = true;
    } else {
      rowsToKeep.push(data[i]);
    }
  }

  if (hasDeleted) {
    sheet.clearContents();
    sheet.getRange(1, 1, rowsToKeep.length, headers.length).setValues(rowsToKeep);
  }
}

function formatOrder(o) { 
  var nowIso = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  var nowDate = nowIso.split(' ')[0];
  var createdAtVal = o.createdAt ? String(o.createdAt).trim() : nowIso;
  var dateVal = o.date ? String(o.date).trim().substring(0, 10) : (createdAtVal ? createdAtVal.substring(0, 10) : nowDate);
  return { 
    "id": o.id, 
    "orderCode": o.orderCode || o.id || ('ORD_' + Date.now()), 
    "channel": o.channel || '', 
    "customer": o.customer || '', 
    "phone": o.phone || '', 
    "address": o.address || '', 
    "note": o.note || '', 
    "createdAt": createdAtVal, 
    "deadline": o.deadline || '', 
    "date": dateVal, 
    "status": o.status || 'Chờ Sản Xuất', 
    "accessories": typeof o.accessories === 'string' ? o.accessories : JSON.stringify(o.accessories || []), 
    "hasProduction": o.hasProduction || false, 
    "isCarriedToWH": o.isCarriedToWH || '', 
    "updatedBy": o.updatedBy || '', 
    "revenue": Number(o.revenue) || 0, 
    "prePaid": Number(o.prePaid) || 0, 
    "cod": Number(o.cod) || 0, 
    "costTotal": Number(o.costTotal) || 0, 
    "responsibleUser": o.responsibleUser || '', 
    "discount": Number(o.discount) || 0, 
    "shippingMethod": o.shippingMethod || ((String(o.channel).includes('Bán Lẻ') || String(o.channel).includes('Cộng Tác Viên')) ? 'Gửi GHN' : ''), 
    "sizeCoefficient": Number(o.sizeCoefficient !== undefined && o.sizeCoefficient !== null && o.sizeCoefficient !== '' ? o.sizeCoefficient : 1), 
    "cogs": Number(o.cogs || 0), 
    "feeFixed": Number(o.feeFixed || 0), 
    "feeService": Number(o.feeService || 0), 
    "feePayment": Number(o.feePayment || 0), 
    "feeAffiliate": Number(o.feeAffiliate || 0), 
    "shopVoucher": Number(o.shopVoucher || 0), 
    "tax": Number(o.tax || 0), 
    "reconciledAt": o.reconciledAt || '', 
    "isReconciled": o.isReconciled || '',
    "isUrgent": o.isUrgent === true || String(o.isUrgent).toUpperCase() === 'TRUE',
    "urgentAt": o.urgentAt || ''
  }; 
}
function formatProd(p) { 
  var ph1 = (p.phases && p.phases.phase1) ? p.phases.phase1 : {}; 
  var ph2 = (p.phases && p.phases.phase2) ? p.phases.phase2 : {}; 
  var isFulfilledStock = p.fulfilledFromStock === true || String(p.fulfilledFromStock).toUpperCase() === 'TRUE';
  
  var p1St = ph1.status || p.p1_status || (isFulfilledStock ? 'Done' : 'Pending');
  var p2St = ph2.status || p.p2_status || (isFulfilledStock ? 'Done' : 'Pending');
  var p1U = ph1.user || p.p1_user || '';
  if (p1U === 'Kho Hàng' || p1U === 'Hàng') p1U = '';
  var p2U = ph2.user || p.p2_user || '';
  if (p2U === 'Kho Hàng' || p2U === 'Hàng') p2U = '';
  var qcSt = p.qc_status || (isFulfilledStock ? 'Đã Duyệt' : '');

  return { 
    "id": p.id, 
    "orderId": p.orderId, 
    "type": p.type || '', 
    "name": p.name || '', 
    "note": p.note || '', 
    "status": p.status || (isFulfilledStock ? 'Hoàn Kho Đạt' : 'Pending'), 
    "deadline": p.deadline || '', 
    "fulfilledFromStock": isFulfilledStock, 
    "p1_name": ph1.name || p.p1_name || (p.type === 'Layout' ? 'Dựng Khung' : 'Cắt Dán'), 
    "p1_status": p1St, 
    "p1_user": p1U, 
    "p1_start": ph1.start || p.p1_start || '', 
    "p1_endTime": ph1.endTime || p.p1_endTime || '', 
    "p1_photo": ph1.photo || p.p1_photo || '', 
    "p1_reward_vnd": Number(ph1.reward_vnd || p.p1_reward_vnd) || 0, 
    "p2_name": ph2.name || p.p2_name || (p.type === 'Layout' ? 'Gia Cố' : 'Gọt Keo'), 
    "p2_status": p2St, 
    "p2_user": p2U, 
    "p2_start": ph2.start || p.p2_start || '', 
    "p2_endTime": ph2.endTime || p.p2_endTime || '', 
    "p2_photo": ph2.photo || p.p2_photo || '', 
    "p2_reward_vnd": Number(ph2.reward_vnd || p.p2_reward_vnd) || 0, 
    "qc_front_photo": p.qc_front_photo || '', 
    "qc_side_photo": p.qc_side_photo || '', 
    "qc_status": qcSt, 
    "qc_note": p.qc_note || '',
    "serialCode": p.serialCode || '',
    "usedByOrderCode": p.usedByOrderCode || '',
    "usedAt": p.usedAt || '',
    "isUrgent": p.isUrgent === true || String(p.isUrgent).toUpperCase() === 'TRUE',
    "urgentAt": p.urgentAt || ''
  }; 
}
function formatPacking(p) { return { "id": p.id, "orderId": p.orderId, "user": p.user || '', "start": p.start || '', "end": p.end || '', "endTime": p.endTime || '', "status": p.status || '', "photo": p.photo || '', "photoBefore": p.photoBefore || '', "reward_vnd": p.reward_vnd || 0 }; }
function formatAtt(a) {
  var shiftVal = a.shift || '';
  if (shiftVal === 'Nghỉ Phép' && a.leaveShift) {
    shiftVal = a.leaveShift;
  }
  var leaveTypeVal = a.leaveType || (String(a.status || '').includes('Nghỉ') ? 'Nghỉ Phép' : '');

  var tIn = a.timeIn ? String(a.timeIn).trim() : '';
  var tOut = a.timeOut ? String(a.timeOut).trim() : '';
  var totalHoursVal = a.totalHours;

  if ((totalHoursVal === undefined || totalHoursVal === null || totalHoursVal === '' || Number(totalHoursVal) === 0) && tIn && tOut) {
    try {
      var tInFmt = tIn.length === 5 ? tIn + ':00' : tIn;
      var tOutFmt = tOut.length === 5 ? tOut + ':00' : tOut;
      var diffMs = new Date('1970-01-01T' + tOutFmt).getTime() - new Date('1970-01-01T' + tInFmt).getTime();
      var diffHours = diffMs / 3600000;
      if (diffHours < 0) diffHours += 24;
      totalHoursVal = Math.max(0, diffHours);
    } catch (e) {
      totalHoursVal = 0;
    }
  }

  return {
    "id": a.id, "user": a.user || '', "date": a.date || '',
    "morningIn": a.morningIn || '', "morningOut": a.morningOut || '',
    "afternoonIn": a.afternoonIn || '', "afternoonOut": a.afternoonOut || '',
    "leaveType": leaveTypeVal, "leaveReportAt": a.leaveReportAt || '',
    "shift": shiftVal, "timeIn": tIn, "timeOut": tOut,
    "totalHours": Number(totalHoursVal) || 0, "status": a.status || '', "penalty": Number(a.penalty) || 0,
    "isEdited": a.isEdited || false, "leaveStart": a.leaveStart || '', "leaveEnd": a.leaveEnd || '', "note": a.note || ''
  };
}

function formatProduct(p) {
  var cleanNum = function(val, fallback) {
    if (val === undefined || val === null || val === '') return fallback;
    var n = Number(val);
    return isNaN(n) ? fallback : n;
  };
  return {
    "id": p.id, "sku": p.sku || '', "name": p.name || '', "unit": p.unit || '', "image": p.image || '',
    "category": p.category || '', "sub_category": p.sub_category || '',
    "costPrice": cleanNum(p.costPrice, 0), "price": cleanNum(p.price, 0), "quantity": cleanNum(p.quantity, 0),
    "minStock": cleanNum(p.minStock, 0), "maxStock": cleanNum(p.maxStock, 0), "realImage": p.realImage || '',
    "importUnit": p.importUnit || '', "conversionRate": cleanNum(p.conversionRate, 1), "model3D": p.model3D || ''
  };
}

function formatAccount(a) { return { "id": a.id, "accountName": a.accountName || '', "balance": a.balance || 0, "type": a.type || '', "accountNumber": a.accountNumber || '', "accountOwner": a.accountOwner || '' }; }
function formatSupplier(s) { return { "id": s.id, "name": s.name || '', "phone": s.phone || '', "totalDebt": s.totalDebt || 0, "category": s.category || '', "note": s.note || '' }; }
function formatTransaction(t) { return { "id": t.id, "type": t.type || '', "category": t.category || '', "amount": t.amount || 0, "fromAccount": t.fromAccount || '', "toAccount": t.toAccount || '', "title": t.title || '', "date": t.date || '', "note": t.note || '', "isAuto": t.isAuto || '' }; }
function formatImportExport(i) { return { "id": i.id, "type": i.type || '', "target": i.target || '', "totalAmount": i.totalAmount || 0, "date": i.date || '', "note": i.note || '', "itemsData": i.itemsData || '' }; }
function formatDocument(d) { return { "id": d.id, "category": d.category || 'Khác', "title": d.title || '', "description": d.description || '', "link": d.link || '', "createdAt": d.createdAt || new Date().toISOString(), "createdBy": d.createdBy || '', "attachments": typeof d.attachments === 'string' ? d.attachments : JSON.stringify(d.attachments || []), "testLink": d.testLink || '', "readBy": typeof d.readBy === 'string' ? d.readBy : JSON.stringify(d.readBy || []) }; }
function formatTraining(t) { return { "id": t.id, "title": t.title || '', "content": t.content || '', "targetRole": t.targetRole || 'ALL', "createdAt": t.createdAt || new Date().toISOString(), "createdBy": t.createdBy || '', "readUsers": typeof t.readUsers === 'string' ? t.readUsers : JSON.stringify(t.readUsers || []) }; }
function formatProfitReport(r) { return { "id": r.id, "period": r.period || '', "channel": r.channel || '', "revenue": r.revenue || 0, "orderCount": r.orderCount || 0, "platformFee": r.platformFee || 0, "returns": r.returns || 0, "discount": r.discount || 0, "ads": r.ads || 0, "cogs": r.cogs || 0, "salary": r.salary || 0, "operation": r.operation || 0 }; }
function formatBonusPenalty(b) { return { "id": b.id, "user": b.user || '', "amount": b.amount || 0, "type": b.type || '', "note": b.note || '', "date": b.date || '', "orderCode": b.orderCode || '' }; }
function formatKPIProg(k) { return { "id": k.id, "user": k.user || '', "kpiName": k.kpiName || '', "current": k.current || 0, "target": k.target || 0, "unit": k.unit || '', "lastUpdated": k.lastUpdated || '', "startTime": k.startTime || '', "endTime": k.endTime || '', "reward": k.reward || 0, "isClaimed": k.isClaimed || false, "penalty": k.penalty || 0, "guide": k.guide || k.Guide || k.guideText || k.note || k.desc || '' }; }
function formatReimbursement(r) { return { "id": r.id, "staffName": r.staffName || '', "reason": r.reason || '', "amount": r.amount || 0, "qrCodeUrl": r.qrCodeUrl || '', "status": r.status || '', "createdAt": r.createdAt || new Date().toISOString() }; }
function formatBOMConfig(b) { return { "id": b.id, "layoutCode": b.layoutCode || '', "materialSku": b.materialSku || '', "defaultQty": Number(b.defaultQty) || 0, "unit": b.unit || '' }; }
function formatThongKeTichLuyXu(x) { return { "id": x.id || ('XU_' + Date.now() + '_' + Math.floor(Math.random() * 1000)), "user": x.user || '', "type": x.type || 'XU_REWARD', "amount_xu": Number(x.amount_xu !== undefined ? x.amount_xu : (x.amount || 0)), "date": x.date ? String(x.date).slice(0, 10) : Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd"), "orderCode": x.orderCode || '', "note": x.note || '', "timestamp": x.timestamp || Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss") }; }
function formatWorkspace(w) { return { "id": w.id, "name": w.name || '', "user": w.user || '', "tools": typeof w.tools === 'string' ? w.tools : JSON.stringify(w.tools || []), "status": w.status || 'Tốt', "handoverDate": w.handoverDate || '', "photo": w.photo || '', "note": w.note || '' }; }
function formatCTVFinance(t) { return { "id": t.id || ('CTV_' + Date.now() + '_' + Math.floor(Math.random() * 1000)), "date": t.date ? String(t.date).slice(0, 10) : Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd"), "type": t.type || '', "amount": Number(t.amount) || 0, "note": t.note || '', "user": t.user || '', "status": t.status || 'Chờ Duyệt' }; }

// HÀM LƯU PHÂN QUYỀN VÀ CẤU HÌNH NHÂN SỰ VỀ GOOGLE SHEETS
function updateUserConfigSheet(configPayload) {
  var lock = LockService.getScriptLock();
  var hasLock = false;
  try {
    hasLock = lock.tryLock(15000);
  } catch (e) {
    hasLock = false;
  }
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config_NhanSu');
    if (!sheet) return;
    var data = sheet.getDataRange().getValues();
    var headers = data[0];

    var pinsMap = configPayload.pins || {};
    var nameToPinData = {};
    Object.keys(pinsMap).forEach(function (pin) {
      var pData = pinsMap[pin];
      if (pData && pData.name) {
        nameToPinData[pData.name.trim()] = {
          pin: pin,
          role: pData.role,
          title: pData.title,
          avatar: pData.avatar
        };
      }
    });

    var newRows = [headers];
    var salariesMap = configPayload.salaries || {};
    var processedNames = {};

    for (var i = 1; i < data.length; i++) {
      var name = String(data[i][0] || '').trim();
      if (!name) continue;

      var updatedRow = [...data[i]];

      if (nameToPinData[name]) {
        var update = nameToPinData[name];
        var avatarColIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'id ảnh' });
        var titleColIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'chức danh' });
        var subTitleColIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'trách nhiệm' });
        var roleColIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'phân quyền' });
        var pinColIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'mã pin' });

        if (avatarColIdx !== -1) updatedRow[avatarColIdx] = update.avatar || '';
        else updatedRow[1] = update.avatar || '';

        if (titleColIdx !== -1) updatedRow[titleColIdx] = update.title || '';
        else updatedRow[2] = update.title || '';

        if (subTitleColIdx !== -1 && update.subTitle !== undefined) updatedRow[subTitleColIdx] = update.subTitle || '';

        if (roleColIdx !== -1) updatedRow[roleColIdx] = update.role || '';
        else updatedRow[3] = update.role || '';

        if (pinColIdx !== -1) updatedRow[pinColIdx] = update.pin || '';
        else updatedRow[4] = update.pin || '';

        processedNames[name] = true;
      }

      if (salariesMap[name]) {
        var salUpdate = salariesMap[name];
        var baseSalIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'lương cơ bản'; });
        var funcSalIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'lương chức vụ'; });
        var allowanceIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'phụ cấp xăng xe'; });
        var penaltyIdx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === 'khoản trừ vi phạm'; });

        if (baseSalIdx !== -1 && salUpdate.baseSalary !== undefined) updatedRow[baseSalIdx] = salUpdate.baseSalary;
        if (funcSalIdx !== -1 && salUpdate.funcSalary !== undefined) updatedRow[funcSalIdx] = salUpdate.funcSalary;
        if (allowanceIdx !== -1 && salUpdate.allowance !== undefined) updatedRow[allowanceIdx] = salUpdate.allowance;
        if (penaltyIdx !== -1 && salUpdate.penalty !== undefined) updatedRow[penaltyIdx] = salUpdate.penalty;
      }

      newRows.push(updatedRow);
    }

    Object.keys(nameToPinData).forEach(function (name) {
      if (!processedNames[name]) {
        var update = nameToPinData[name];
        var newRow = [name, update.avatar || '', update.title || '', update.role || '', update.pin || '', 0, 0, 0, 0];
        newRows.push(newRow);
      }
    });

    sheet.clearContents();
    sheet.getRange(1, 1, newRows.length, headers.length).setValues(newRows);
    invalidateUserConfigCache();
  } finally {
    if (hasLock) {
      try { lock.releaseLock(); } catch(e) {}
    }
  }
}

function adjustAccountBalanceServer(ss, accountId, change) {
  if (!accountId || change === 0) return;
  var batch = {};
  batch[String(accountId).trim()] = Number(change) || 0;
  applyBatchAccountBalanceChanges(ss, batch);
}

function applyBatchAccountBalanceChanges(ss, balanceChanges) {
  if (!balanceChanges || typeof balanceChanges !== 'object') return;
  var keys = Object.keys(balanceChanges);
  if (keys.length === 0) return;
  var activeSs = ss || SpreadsheetApp.getActiveSpreadsheet();
  var sheet = activeSs.getSheetByName('Accounts');
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;
  var headers = data[0];
  var idCol = headers.indexOf('id');
  var balCol = headers.indexOf('balance');
  if (idCol === -1) idCol = 0;
  if (balCol === -1) balCol = 2;

  var modified = false;
  for (var i = 1; i < data.length; i++) {
    var accId = String(data[i][idCol]).trim();
    if (balanceChanges.hasOwnProperty(accId)) {
      var delta = Number(balanceChanges[accId]) || 0;
      if (delta !== 0) {
        var curBal = Number(data[i][balCol]) || 0;
        data[i][balCol] = curBal + delta;
        modified = true;
      }
    }
  }
  if (modified) {
    sheet.getRange(1, 1, data.length, headers.length).setValues(data);
  }
}

function syncDeltas(payload, pin) {
  var pinToAuth = pin || (payload && payload.pin);
  var auth = validatePin(pinToAuth);
  if (!auth || !auth.valid) { return { isAuthFailed: true, error: "AUTH_FAILED", message: "Mã PIN không hợp lệ hoặc phiên làm việc đã hết hạn!" }; }
  if (!payload) return getAppData(pinToAuth);

  // === KIỂM TRA PHÂN QUYỀN BACKEND RBAC TRƯỚC KHI THỰC HIỆN BẤT KỲ THAO TÁC GHI / XÓA NÀO ===
  if (!auth.isBoss && auth.role !== 'TỐI CAO') {
    // 1. Kiểm tra các bảng được thêm/sửa trong payload
    var payloadWriteTables = [
      'Orders', 'orders', 'Production', 'prodItems', 'Packings', 'packings',
      'Attendance', 'attendance', 'Products', 'products', 'ImportExport', 'importExport',
      'Transactions', 'transactions', 'Accounts', 'accounts', 'Suppliers', 'suppliers',
      'BOM_Config', 'bomConfig', 'BonusPenalty', 'bonusPenalty', 'KPI_Progress',
      'UserConfigs', 'Config_NhanSu', 'Workspaces', 'workspaces', 'CTV_Finance', 'ctvTransactions',
      'Config_GiaLayout', 'Documents', 'documents', 'Trainings', 'trainings', 'Models3D', 'models3D'
    ];

    for (var tw = 0; tw < payloadWriteTables.length; tw++) {
      var tKey = payloadWriteTables[tw];
      if (payload[tKey] && payload[tKey].length > 0) {
        var permCheck = validateTableWritePermission(auth, tKey, false, payload[tKey]);
        if (!permCheck.allowed) {
          logBehavior('CẢNH BÁO RBAC TỪ CHỐI GHI', 'Nhân sự: ' + auth.user + ' (' + auth.role + ') | Cố gắng ghi vào bảng: ' + tKey + ' | Lý do: ' + permCheck.reason);
          return {
            success: false,
            error: 'PERMISSION_DENIED',
            message: 'Từ chối quyền: ' + permCheck.reason
          };
        }
      }
    }

    // 2. Kiểm tra các bảng bị xóa trong payload.deletes
    if (payload.deletes && typeof payload.deletes === 'object') {
      var delKeys = Object.keys(payload.deletes);
      for (var dk = 0; dk < delKeys.length; dk++) {
        var dTable = delKeys[dk];
        if (payload.deletes[dTable] && payload.deletes[dTable].length > 0) {
          var delPermCheck = validateTableWritePermission(auth, dTable, true, payload.deletes[dTable]);
          if (!delPermCheck.allowed) {
            logBehavior('CẢNH BÁO RBAC TỪ CHỐI XÓA', 'Nhân sự: ' + auth.user + ' (' + auth.role + ') | Cố gắng xóa từ bảng: ' + dTable + ' | Lý do: ' + delPermCheck.reason);
            return {
              success: false,
              error: 'PERMISSION_DENIED',
              message: 'Từ chối quyền: ' + delPermCheck.reason
            };
          }
        }
      }
    }
  }

  var lock = LockService.getScriptLock();
  var acquiredLock = false;
  try {
    if (!lock.hasLock()) {
      var lockOk = lock.tryLock(30000);
      if (!lockOk) {
        return {
          success: false,
          error: 'LOCK_TIMEOUT',
          message: 'Hệ thống đang bận ghi dữ liệu, vui lòng thử lại sau vài giây!',
          serverTime: new Date().getTime()
        };
      }
      acquiredLock = true;
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Hoàn trả số dư khi XOÁ giao dịch (Batch Account Balance Optimization)
    var balanceDeltaMap = {};
    function queueBalanceDelta(accId, amt) {
      if (!accId || !amt) return;
      var key = String(accId).trim();
      balanceDeltaMap[key] = (balanceDeltaMap[key] || 0) + Number(amt);
    }

    if (payload.deletes && payload.deletes.Transactions && payload.deletes.Transactions.length > 0) {
      var txSheet = ss.getSheetByName('Transactions');
      if (txSheet) {
        var txData = txSheet.getDataRange().getValues();
        var txHeaders = SCHEMA_ERP.Transactions;
        var idCol = txHeaders.indexOf('id');
        var amtCol = txHeaders.indexOf('amount');
        var fromCol = txHeaders.indexOf('fromAccount');
        var toCol = txHeaders.indexOf('toAccount');

        if (idCol !== -1 && amtCol !== -1 && fromCol !== -1 && toCol !== -1) {
          payload.deletes.Transactions.forEach(function (txId) {
            for (var i = 1; i < txData.length; i++) {
              if (String(txData[i][idCol]) === String(txId)) {
                var amt = Number(txData[i][amtCol]) || 0;
                var fromAcc = String(txData[i][fromCol]).trim();
                var toAcc = String(txData[i][toCol]).trim();

                if (fromAcc) queueBalanceDelta(fromAcc, amt);
                if (toAcc) queueBalanceDelta(toAcc, -amt);
                break;
              }
            }
          });
        }
      }
    }

    // 1b. XOÁ chấm công
    if (payload.deletes && payload.deletes.Attendance && payload.deletes.Attendance.length > 0) {
      deleteDeltas('Attendance', payload.deletes.Attendance, ss);
    }

    // 2. Cập nhật số dư khi THÊM/SỬA giao dịch
    if (payload.Transactions && payload.Transactions.length > 0) {
      var txSheet = ss.getSheetByName('Transactions');
      if (txSheet) {
        var txData = txSheet.getDataRange().getValues();
        var txHeaders = SCHEMA_ERP.Transactions;
        var idCol = txHeaders.indexOf('id');
        var amtCol = txHeaders.indexOf('amount');
        var fromCol = txHeaders.indexOf('fromAccount');
        var toCol = txHeaders.indexOf('toAccount');

        payload.Transactions.forEach(function (newTx) {
          var txId = newTx.id;
          var foundOld = false;

          if (idCol !== -1 && amtCol !== -1 && fromCol !== -1 && toCol !== -1) {
            for (var i = 1; i < txData.length; i++) {
              if (String(txData[i][idCol]) === String(txId)) {
                var oldAmt = Number(txData[i][amtCol]) || 0;
                var oldFrom = String(txData[i][fromCol]).trim();
                var oldTo = String(txData[i][toCol]).trim();

                if (oldFrom) queueBalanceDelta(oldFrom, oldAmt);
                if (oldTo) queueBalanceDelta(oldTo, -oldAmt);
                foundOld = true;
                break;
              }
            }
          }

          var newAmt = Number(newTx.amount) || 0;
          var newFrom = String(newTx.fromAccount || '').trim();
          var newTo = String(newTx.toAccount || '').trim();

          if (newFrom) queueBalanceDelta(newFrom, -newAmt);
          if (newTo) queueBalanceDelta(newTo, newAmt);
        });
      }
    }

    // Ghi nhận biến động số dư theo lô an toàn
    applyBatchAccountBalanceChanges(ss, balanceDeltaMap);

    // =========================================================================
    // HỆ THỐNG TỰ ĐỘNG HÓA KHO & SẢN XUẤT CHO SẢN PHẨM LAYOUT & BỂ KÍNH
    // =========================================================================
    if (payload.prodItems && payload.prodItems.length > 0) {
      // 1. Tải danh sách ID lệnh sản xuất hiện tại để nhận dạng lệnh mới được thêm
      var prodSheet = ss.getSheetByName('Production');
      var existingPIds = {};
      if (prodSheet) {
        var pValues = prodSheet.getDataRange().getValues();
        for (var pi = 1; pi < pValues.length; pi++) {
          existingPIds[String(pValues[pi][0])] = true;
        }
      }
      var stockUpdates = {}; // { rowIndex: { qty: newQty, col: qtyColIndex + 1 } }

      // A. XỬ LÝ KHI BƠM ĐƠN / THÊM ĐƠN HÀNG MỚI
      // Xây dựng map Lệnh Sản Xuất và Đơn Hàng hiện tại để phục vụ Cướp Lệnh (Auto-link) và Quét Tồn Kho
      var existingOrderMap = {};
      var activeOrders = {};
      var oSheetToRead = ss.getSheetByName('Orders');
      if (oSheetToRead) {
        var oVals = oSheetToRead.getDataRange().getValues();
        var oHead = oVals[0];
        var oIdCol = oHead.indexOf('id');
        var oChanCol = oHead.indexOf('channel');
        var oStatusCol = oHead.indexOf('status');
        for (var oi = 1; oi < oVals.length; oi++) {
          var oId = String(oVals[oi][oIdCol]);
          existingOrderMap[oId] = { id: oId, channel: oVals[oi][oChanCol] };

          var isTerminal = isTerminalStatus(oVals[oi][oStatusCol]);
          if (!isTerminal) {
            activeOrders[oId] = true;
          }
        }
      }

      var existingProdMap = {};
      var pendingAllocations = {};
      if (prodSheet) {
        var pVals = prodSheet.getDataRange().getValues();
        var pHead = pVals[0];
        var pIdCol = pHead.indexOf('id');
        var pOrderIdCol = pHead.indexOf('orderId');
        var pNameCol = pHead.indexOf('name');
        var pStatusCol = pHead.indexOf('status');
        var pFulCol = pHead.indexOf('fulfilledFromStock');
        var pQcCol = pHead.indexOf('qc_status');

        for (var pi = 1; pi < pVals.length; pi++) {
          var pId = String(pVals[pi][pIdCol]);
          var oId = String(pVals[pi][pOrderIdCol]);
          var pName = String(pVals[pi][pNameCol]);
          existingProdMap[pId] = {
            id: pId,
            orderId: oId,
            name: pName,
            status: pVals[pi][pStatusCol]
          };

          if (activeOrders[oId]) {
            var fStock = String(pVals[pi][pFulCol]).toUpperCase() === 'TRUE';
            var pStat = String(pVals[pi][pStatusCol]).toUpperCase();
            var qc = String(pVals[pi][pQcCol]).toUpperCase();
            var isKcsPassed = qc.indexOf('ĐÃ DUYỆT') > -1 || qc === 'ĐẠT';
            var isDone = pStat === 'DONE' || pStat === 'ĐÃ XONG' || pStat === 'HOÀN KHO ĐẠT';
            var isReady = isDone && isKcsPassed;

            if (fStock || isReady) {
              var nName = normalizeProdName(pName);
              if (!pendingAllocations[nName]) pendingAllocations[nName] = 0;
              pendingAllocations[nName]++;
            }
          }
        }
      }

      payload.prodItems.forEach(function (pItem) {
        var isNewProdItem = !existingPIds[pItem.id];
        if (isNewProdItem) {
          var pInfo = getProductInfoByName(ss, pItem.name);
          if (pInfo && pInfo.isEligible) {
            var orderObj = null;
            var isRepOrder = false;
            if (payload.orders) {
              for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                  orderObj = payload.orders[oIdx];
                  isRepOrder = (orderObj.channel === 'Sản Xuất Tồn' || orderObj.channel === 'Sản Xuất Bù Kho');
                  break;
                }
              }
            }
            if (!orderObj) {
              if (existingOrderMap[pItem.orderId]) {
                orderObj = existingOrderMap[pItem.orderId];
                isRepOrder = (orderObj.channel === 'Sản Xuất Tồn' || orderObj.channel === 'Sản Xuất Bù Kho');
              }
            }

            if (orderObj && !isRepOrder) {
              var isLayoutItem = String(pItem.type || '').toUpperCase() === 'LAYOUT' || /rừng|layout|đảo|bonsai|trang|nature|suối|vách|hẻm|núi|cầu|thác|hang|tiểu cảnh/i.test(pItem.name);
              var isCover = /cover/i.test(pItem.name);
              var isTargetItem = (String(pItem.type || '').toUpperCase() === 'BỂ KÍNH' || (isLayoutItem && !isCover));

              if (isTargetItem) {
                // Tồn kho hiện tại (đã trừ đi lượng hàng đang bị giam bởi các đơn chưa bàn giao)
                var lockedQty = pendingAllocations[normalizeProdName(pItem.name)] || 0;
                var realQty = pInfo.qty - lockedQty;
                if (realQty < 0) realQty = 0;
                var currentQty = stockUpdates[pInfo.rowIndex] !== undefined ? stockUpdates[pInfo.rowIndex].qty : realQty;
                var minStock = Number(pInfo.minStock) || 0;

                // 1. CƯỚP LỆNH TỒN (Chỉ dành cho Layout)
                var hijackedProdId = null;
                if (isLayoutItem && !isCover) {
                  for (var eId in existingProdMap) {
                    var ep = existingProdMap[eId];
                    var epO = existingOrderMap[ep.orderId];
                    if (ep.name === pItem.name && epO && (epO.channel === 'Sản Xuất Tồn' || epO.channel === 'Sản Xuất Bù Kho')) {
                      var epStatus = String(ep.status).toUpperCase();
                      if (epStatus !== 'DONE' && epStatus !== 'ĐÃ XONG' && epStatus !== 'HỦY/VỠ' && epStatus !== 'HOÀN KHO ĐẠT' && epStatus !== 'HỦY') {
                        if (!ep._isHijacked) {
                          hijackedProdId = ep.id;
                          ep._isHijacked = true; // Đánh dấu đã cướp
                          break;
                        }
                      }
                    }
                  }
                }

                if (hijackedProdId) {
                  // Cướp thành công, cập nhật lệnh tồn thành lệnh khách
                  payload.prodItems = payload.prodItems || [];
                  payload.prodItems.push({
                    id: hijackedProdId,
                    orderId: orderObj.id, // Gắn sang đơn mới
                    note: 'Được chuyển từ lệnh Tồn kho sang đơn khách'
                  });

                  // Đơn khách chờ sản xuất
                  if (payload.orders) {
                    for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                      if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                        var isTerm = isTerminalStatus(payload.orders[oIdx].status);
                        if (!isTerm) payload.orders[oIdx].status = 'Chờ Sản Xuất';
                        break;
                      }
                    }
                  } else {
                    var oSheetToUpdate = ss.getSheetByName('Orders');
                    if (oSheetToUpdate) {
                      var ovv = oSheetToUpdate.getDataRange().getValues();
                      var stCol = ovv[0].indexOf('status');
                      for (var k = 1; k < ovv.length; k++) {
                        if (String(ovv[k][0]) === String(pItem.orderId)) {
                          var isTerm = isTerminalStatus(ovv[k][stCol]);
                          if (!isTerm) oSheetToUpdate.getRange(k + 1, stCol + 1).setValue('Chờ Sản Xuất');
                          break;
                        }
                      }
                    }
                  }

                  // Hủy pItem mới (không tạo thêm lệnh mới)
                  pItem._skipInsert = true;

                } else {
                  // 2. KHÔNG CƯỚP ĐƯỢC -> XỬ LÝ THEO TỒN KHO HOẶC ĐƠN XUẤT KHẨU
                  var pItemChannel = '';
                  if (payload.orders) {
                    for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                      if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                        pItemChannel = String(payload.orders[oIdx].channel || '').toUpperCase();
                        break;
                      }
                    }
                  }
                  var isExportOrder = pItemChannel.indexOf('SHOPEE SG') !== -1 || pItemChannel.indexOf('SHOPEE MA') !== -1 ||
                    pItemChannel.indexOf('SHOPEE MY') !== -1 || pItemChannel.indexOf('SHOPEE TH') !== -1 ||
                    pItemChannel.indexOf('SHOPEE PH') !== -1 || pItemChannel.indexOf('SHOPEE TW') !== -1 ||
                    pItemChannel.indexOf('XUẤT KHẨU') !== -1 || pItemChannel.indexOf('EXPORT') !== -1 ||
                    pItemChannel.indexOf('QUỐC TẾ') !== -1;

                  if (currentQty <= 0 || isExportOrder) {
                    // KHO = 0 HOẶC LÀ ĐƠN XUẤT KHẨU: Bắt buộc tạo lệnh sản xuất mới
                    pItem.fulfilledFromStock = false;
                    pItem.status = 'Pending';
                    pItem.qc_status = 'Pending';
                    if (pItem.phases) {
                      for (var phKey in pItem.phases) {
                        if (pItem.phases[phKey]) pItem.phases[phKey].status = 'Pending';
                      }
                    }
                    // Dọn sạch nhãn tồn kho cũ để tránh mâu thuẫn hiển thị
                    if (pItem.note) {
                      pItem.note = String(pItem.note)
                        .replace(/\|\s*Lấy từ tồn kho có sẵn/gi, '')
                        .replace(/Lấy từ tồn kho có sẵn\s*\|?/gi, '')
                        .replace(/\|\s*Có sẵn ở kho[^|]*/gi, '')
                        .replace(/Có sẵn ở kho[^|]*\|?/gi, '')
                        .trim();
                    }
                    if (isExportOrder) pItem.note = (pItem.note ? (pItem.note + ' | ') : '') + '(Đơn Xuất Khẩu - Ép buộc tạo lệnh SX mới)';
                    if (payload.orders) {
                      for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                        if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                          var isTerm = isTerminalStatus(payload.orders[oIdx].status);
                          if (!isTerm) payload.orders[oIdx].status = 'Chờ Sản Xuất';
                          break;
                        }
                      }
                    } else {
                      var oSheetToUpdate2 = ss.getSheetByName('Orders');
                      if (oSheetToUpdate2) {
                        var ovv2 = oSheetToUpdate2.getDataRange().getValues();
                        var stCol2 = ovv2[0].indexOf('status');
                        for (var k2 = 1; k2 < ovv2.length; k2++) {
                          if (String(ovv2[k2][0]) === String(pItem.orderId)) {
                            var isTerm = isTerminalStatus(ovv2[k2][stCol2]);
                            if (!isTerm) oSheetToUpdate2.getRange(k2 + 1, stCol2 + 1).setValue('Chờ Sản Xuất');
                            break;
                          }
                        }
                      }
                    }
                  } else {
                    // KHO > 0 & KHÔNG PHẢI ĐƠN XUẤT KHẨU: Lấy từ tồn kho
                    pItem.fulfilledFromStock = true;
                    pItem.status = 'Hoàn Kho Đạt';
                    pItem.qc_status = 'Đã Duyệt';
                    pItem.note = 'Lấy từ tồn kho có sẵn';
                    pItem.phases = {
                      phase1: { name: (pItem.type === 'Layout' ? 'Dựng Khung' : 'Cắt Dán'), status: 'Done', user: '' },
                      phase2: { name: (pItem.type === 'Layout' ? 'Gia Cố' : 'Gọt Keo'), status: 'Done', user: '' }
                    };

                    if (payload.orders) {
                      for (var oIdx = 0; oIdx < payload.orders.length; oIdx++) {
                        if (String(payload.orders[oIdx].id) === String(pItem.orderId)) {
                          var isTerm = isTerminalStatus(payload.orders[oIdx].status);
                          if (!isTerm) payload.orders[oIdx].status = 'Sẵn sàng đóng gói';
                          break;
                        }
                      }
                    } else {
                      var oSheetToUpdate3 = ss.getSheetByName('Orders');
                      if (oSheetToUpdate3) {
                        var ovv3 = oSheetToUpdate3.getDataRange().getValues();
                        var stCol3 = ovv3[0].indexOf('status');
                        for (var k3 = 1; k3 < ovv3.length; k3++) {
                          if (String(ovv3[k3][0]) === String(pItem.orderId)) {
                            var isTerm = isTerminalStatus(ovv3[k3][stCol3]);
                            if (!isTerm) oSheetToUpdate3.getRange(k3 + 1, stCol3 + 1).setValue('Sẵn sàng đóng gói');
                            break;
                          }
                        }
                      }
                    }

                    // Giảm biến ảo để tính cho đơn tiếp theo trong cùng payload
                    currentQty--;
                    stockUpdates[pInfo.rowIndex] = { qty: currentQty, col: pInfo.qtyColIndex + 1 };
                  }
                }
              }
            }
          }
        }
      });

      // Lọc bỏ những pItem bị skip (do cướp lệnh hoặc lấy từ kho)
      payload.prodItems = payload.prodItems.filter(function (p) { return !p._skipInsert; });

      // KHÔNG CẬP NHẬT KHO TRỰC TIẾP Ở ĐÂY NỮA (Chỉ trừ kho khi Đã Bàn Giao)

      // B. XỬ LÝ KHI LỆNH SẢN XUẤT HOÀN THÀNH (STATUS -> DONE)
      if (prodSheet) {
        var pData = prodSheet.getDataRange().getValues();
        var pHeaders = pData[0];
        var pIdCol = pHeaders.indexOf('id');
        var pStatusCol = pHeaders.indexOf('status');
        var pNameCol = pHeaders.indexOf('name');
        var pOrderIdCol = pHeaders.indexOf('orderId');
        var pFulfilledCol = pHeaders.indexOf('fulfilledFromStock');

        payload.prodItems.forEach(function (newP) {
          var pInfo = getProductInfoByName(ss, newP.name);
          if (pInfo && pInfo.isEligible) {
            var isNewDone = String(newP.status || '').toUpperCase() === 'DONE' || String(newP.status || '').toUpperCase() === 'ĐÃ XONG';
            var qcStr = String(newP.qc_status || '').toUpperCase();
            var isNewQC = qcStr.indexOf('ĐÃ DUYỆT') > -1 || qcStr === 'ĐẠT';

            var isReady = isNewDone && isNewQC;

            if (isReady) {
              // Tìm trạng thái cũ từ sheet để chỉ xử lý khi trạng thái chuyển từ Chưa Ready sang Ready
              var oldP = null;
              for (var rIdx = 1; rIdx < pData.length; rIdx++) {
                if (String(pData[rIdx][pIdCol]) === String(newP.id)) {
                  oldP = {
                    status: String(pData[rIdx][pStatusCol] || ''),
                    qc_status: String(pData[rIdx][pHeaders.indexOf('qc_status')] || ''),
                    orderId: String(pData[rIdx][pOrderIdCol] || ''),
                    fulfilledFromStock: String(pData[rIdx][pFulfilledCol]).toUpperCase() === 'TRUE'
                  };
                  break;
                }
              }

              var oldIsDone = oldP && (oldP.status.toUpperCase() === 'DONE' || oldP.status.toUpperCase() === 'ĐÃ XONG');
              var oldQcStr = oldP ? oldP.qc_status.toUpperCase() : '';
              var oldIsQC = oldQcStr.indexOf('ĐÃ DUYỆT') > -1 || oldQcStr === 'ĐẠT';
              var wasAlreadyReady = oldIsDone && oldIsQC;

              var isFulfilledFromStock = (newP.fulfilledFromStock === true || String(newP.fulfilledFromStock).toUpperCase() === 'TRUE') || (oldP && oldP.fulfilledFromStock);
              if (!wasAlreadyReady && !isFulfilledFromStock) {
                // Nhập kho thành phẩm và trừ BOM được quản lý đồng bộ, duy nhất bởi processMaterialDeduction bên dưới
                // 2. Chuyển trạng thái đơn sang Sẵn sàng đóng gói
                var orderId = newP.orderId || (oldP ? oldP.orderId : '');
                if (orderId) {
                  var ordersSheet = ss.getSheetByName('Orders');
                  var oData = ordersSheet.getDataRange().getValues();
                  var oHeaders = oData[0];
                  var oIdCol = oHeaders.indexOf('id');
                  var oChannelCol = oHeaders.indexOf('channel');
                  var oStatusCol = oHeaders.indexOf('status');

                  var orderRowIndex = -1;
                  var orderChannel = '';
                  for (var oR = 1; oR < oData.length; oR++) {
                    if (String(oData[oR][oIdCol]) === String(orderId)) {
                      orderRowIndex = oR + 1;
                      orderChannel = String(oData[oR][oChannelCol]);
                      break;
                    }
                  }

                  if (orderChannel === 'Sản Xuất Tồn' || orderChannel === 'Sản Xuất Bù Kho') {
                    // Nếu lệnh sản xuất bù tồn kho xong trước -> đổi lệnh sản xuất của đơn chờ sang sản xuất tồn
                    var targetProdRowIndex = -1;
                    var targetOrderId = '';
                    for (var pr = 1; pr < pData.length; pr++) {
                      var nameMatch = normalizeProdName(pData[pr][pNameCol]) === normalizeProdName(newP.name);
                      var isPending = String(pData[pr][pStatusCol]).toUpperCase() !== 'DONE';
                      var pOrdId = String(pData[pr][pOrderIdCol]);
                      var isFulfillStock = String(pData[pr][pFulfilledCol]).toUpperCase() === 'TRUE';

                      if (nameMatch && isPending && !isFulfillStock) {
                        for (var oR = 1; oR < oData.length; oR++) {
                          if (String(oData[oR][oIdCol]) === pOrdId) {
                            var ch = String(oData[oR][oChannelCol]);
                            if (ch !== 'Sản Xuất Tồn' && ch !== 'Sản Xuất Bù Kho') {
                              targetProdRowIndex = pr + 1;
                              targetOrderId = pOrdId;
                              break;
                            }
                          }
                        }
                        if (targetProdRowIndex !== -1) break;
                      }
                    }

                    if (targetProdRowIndex !== -1) {
                      // Đổi lệnh sản xuất đơn hàng thường thành bốc tồn kho
                      prodSheet.getRange(targetProdRowIndex, pFulfilledCol + 1).setValue(true);
                      prodSheet.getRange(targetProdRowIndex, pStatusCol + 1).setValue('Done');

                      // Cập nhật đơn hàng bán lẻ liên kết sang Sẵn sàng đóng gói
                      for (var oR = 1; oR < oData.length; oR++) {
                        if (String(oData[oR][oIdCol]) === String(targetOrderId)) {
                          var isTerm = isTerminalStatus(oData[oR][oStatusCol]);
                          if (!isTerm) {
                            oData[oR][oStatusCol] = 'Sẵn sàng đóng gói';
                            ordersSheet.getRange(oR + 1, oStatusCol + 1).setValue('Sẵn sàng đóng gói');
                          }
                          break;
                        }
                      }
                    }
                  } else {
                    // Lệnh sản xuất trực tiếp của đơn xong -> chuyển trạng thái đơn hàng
                    if (orderRowIndex !== -1) {
                      var isTerm = isTerminalStatus(oData[orderRowIndex - 1][oStatusCol]);
                      if (!isTerm) {
                        ordersSheet.getRange(orderRowIndex, oStatusCol + 1).setValue('Sẵn sàng đóng gói');
                      }
                    }
                  }
                }
              }
            }
          }
        });
      }
    }

    // === CHỐNG TRỪ KÉP KHO HÀNG (SAFE HANDOVER) ===
    if (payload.orders && payload.orders.length > 0) {
      var ordersSheetObj = ss.getSheetByName('Orders');
      var oldOrdersData = ordersSheetObj ? ordersSheetObj.getDataRange().getValues() : [];
      var oIdColIdx = oldOrdersData.length > 0 ? oldOrdersData[0].indexOf('id') : -1;
      var oStatusColIdx = oldOrdersData.length > 0 ? oldOrdersData[0].indexOf('status') : -1;
      var oCodeColIdx = oldOrdersData.length > 0 ? oldOrdersData[0].indexOf('orderCode') : -1;
      var oAccColIdx = oldOrdersData.length > 0 ? oldOrdersData[0].indexOf('accessories') : -1;
      var oChanColIdx = oldOrdersData.length > 0 ? oldOrdersData[0].indexOf('channel') : -1;

      var ordersToHandover = [];
      payload.orders.forEach(function (incomingOrder) {
        var isTargetHandover = String(incomingOrder.status || '').toUpperCase().trim() === 'ĐÃ BÀN GIAO';
        if (isTargetHandover && oIdColIdx !== -1 && oStatusColIdx !== -1) {
          var oldStatus = '';
          for (var r = 1; r < oldOrdersData.length; r++) {
            var rowId = String(oldOrdersData[r][oIdColIdx] || '').trim();
            var incId = String(incomingOrder.id || '').trim();
            var rowCode = oCodeColIdx !== -1 ? String(oldOrdersData[r][oCodeColIdx] || '').split(' | ')[0].split('|')[0].trim().toUpperCase() : '';
            var incCode = String(incomingOrder.orderCode || incomingOrder.id || '').split(' | ')[0].split('|')[0].trim().toUpperCase();

            var isRowMatch = (incId !== '' && rowId === incId) || (rowCode !== '' && incCode !== '' && rowCode === incCode);
            if (isRowMatch) {
              oldStatus = String(oldOrdersData[r][oStatusColIdx]).toUpperCase().trim();
              if (!incomingOrder.orderCode && oCodeColIdx !== -1) incomingOrder.orderCode = oldOrdersData[r][oCodeColIdx];
              if (!incomingOrder.accessories && oAccColIdx !== -1) incomingOrder.accessories = oldOrdersData[r][oAccColIdx];
              if (!incomingOrder.channel && oChanColIdx !== -1) incomingOrder.channel = oldOrdersData[r][oChanColIdx];
              break;
            }
          }
          if (oldStatus !== 'ĐÃ BÀN GIAO' && oldStatus !== 'HÀNG HOÀN' && normalizeStatus(oldStatus) !== 'Đơn Huỷ') {
            ordersToHandover.push(incomingOrder);
          }
        }
      });

      if (ordersToHandover.length > 0) {
        try {
          safeDeductInventoryOnHandover(ordersToHandover, ss);
        } catch (e) {
          Logger.log('Lỗi safeDeductInventoryOnHandover: ' + e.toString());
        }

        // Loại bỏ payload.Products và payload.ImportExport rác từ Frontend để tránh trừ kép
        if (payload.ImportExport) {
          payload.ImportExport = payload.ImportExport.filter(function (ie) {
            return !(ie.target === 'Bàn Giao Khách Hàng' && String(ie.id).includes('IE_OUT_BULK_'));
          });
        }
        if (payload.Products) {
          payload.Products = payload.Products.filter(function (p) {
            return p._diff === undefined;
          });
        }
      }

      // 1. Áp dụng lưu dữ liệu đơn hàng xuống Google Sheets NGAY LẬP TỨC
      applyDeltasToSheet('Orders', payload.orders, formatOrder, ss);

      // 2. Bắn thông báo Đơn Hàng Mới qua ntfy.sh (an toàn tuyệt đối, bọc try-catch không bao giờ làm gián đoạn lưu đơn)
      try {
        var newOrdersCount = 0;
        var firstNewOrder = null;
        payload.orders.forEach(function (incomingOrder) {
          var isNew = true;
          for (var r = 1; r < oldOrdersData.length; r++) {
            if (String(oldOrdersData[r][oIdColIdx]) === String(incomingOrder.id)) {
              isNew = false;
              break;
            }
          }
          if (isNew) {
            newOrdersCount++;
            if (!firstNewOrder) firstNewOrder = incomingOrder;
          }
        });
        if (newOrdersCount > 0 && typeof sendNtfyNotification === 'function') {
          var summaryMsg = newOrdersCount === 1 
            ? ('Khách: ' + firstNewOrder.customer + '\nSP: ' + (firstNewOrder.accessories || firstNewOrder.name || 'N/A') + '\nKênh: ' + (firstNewOrder.channel || 'N/A'))
            : ('Đã bơm thành công ' + newOrdersCount + ' đơn mới vào hệ thống.');
          sendNtfyNotification(
            '🛒 ' + (newOrdersCount === 1 ? ('ĐƠN MỚI: ' + (firstNewOrder.orderCode || 'Không mã')) : (newOrdersCount + ' ĐƠN HÀNG MỚI')),
            summaryMsg,
            null
          );
        }
      } catch (ntfyErr) {
        Logger.log('Lỗi thông báo ntfy đơn mới: ' + ntfyErr.toString());
      }
    }
    if (payload.prodItems && payload.prodItems.length > 0) {
      applyDeltasToSheet('Production', payload.prodItems, formatProd, ss);
      // Tự động kiểm tra và cấn trừ nguyên liệu BOM cho các lệnh sản xuất hoàn thành
      var processedBomIds = {};
      payload.prodItems.forEach(function (p) {
        if (!p || !p.id) return;
        var pIdKey = String(p.id).trim();
        if (processedBomIds[pIdKey]) return;

        var isFromStock = p.fulfilledFromStock === true || 
                          String(p.fulfilledFromStock).toUpperCase() === 'TRUE' ||
                          String(p.status).trim() === 'Hoàn Kho Đạt' ||
                          String(p.note || '').indexOf('Lấy từ tồn kho') !== -1;
        if (isFromStock) return; // Hàng lấy từ kho có sẵn -> Tuyệt đối không trừ BOM!

        var pStatus = String(p.status || '').toUpperCase().trim();
        var p1Status = String(p.p1_status || (p.phases && p.phases.phase1 && p.phases.phase1.status) || '').toUpperCase().trim();
        var p2Status = String(p.p2_status || (p.phases && p.phases.phase2 && p.phases.phase2.status) || '').toUpperCase().trim();
        var qcStatus = String(p.qc_status || '').toUpperCase().trim();
        // CHỐT CHẶN: Sản phẩm 2 khâu BẮT BUỘC cả 2 khâu Done mới được nhập kho & trừ BOM
        var hasTwoPhases = !!(p.p2_name || p.p2_status || (p.phases && p.phases.phase2 && p.phases.phase2.name));
        var isBothPhasesDone = p1Status === 'DONE' && p2Status === 'DONE';
        var isDone = pStatus === 'DONE' || pStatus === 'ĐÃ XONG' || pStatus === 'HOÀN THÀNH' ||
                     (hasTwoPhases ? isBothPhasesDone : p1Status === 'DONE') ||
                     qcStatus.indexOf('DUYỆT') !== -1 || qcStatus.indexOf('PASS') !== -1;
        if (isDone) {
          processedBomIds[pIdKey] = true;
          try {
            _processMaterialDeduction_Core(p.id, null, ss);
          } catch (e) {
            Logger.log('Lỗi auto BOM trong syncDeltas: ' + e.toString());
          }
          try {
            if (typeof sendNtfyNotification === 'function') {
              sendNtfyNotification(
                '✅ KHÂU HOÀN THÀNH: ' + (p.name || 'Không tên'), 
                'Mã lệnh: ' + p.id + (p.orderId ? '\nThuộc đơn: ' + p.orderId : ''), 
                null
              );
            }
          } catch (e) {}
        }
      });
    }
    if (payload.packings && payload.packings.length > 0) applyDeltasToSheet('Packings', payload.packings, formatPacking, ss);
    var attDeltas = payload.attendance || payload.Attendance;
    if (attDeltas && attDeltas.length > 0) applyDeltasToSheet('Attendance', attDeltas, formatAtt, ss);
    // === ĐỒNG BỘ TÊN HÀNG HÓA KHI ĐỔI TÊN/SKU TRONG KHO ===
    if (payload.Products && payload.Products.length > 0) {
      var prodSheet = ss.getSheetByName('Products');
      var orderSheetObj = ss.getSheetByName('Orders');
      var productionSheetObj = ss.getSheetByName('Production');

      if (prodSheet && orderSheetObj && productionSheetObj) {
        var pData = prodSheet.getDataRange().getValues();
        var pHeaders = pData[0];
        var idIdx = pHeaders.indexOf('id');
        var nameIdx = pHeaders.indexOf('name');

        var oData = orderSheetObj.getDataRange().getValues();
        var oHeaders = oData[0];
        var oAccIdx = oHeaders.indexOf('accessories');

        var prodData = productionSheetObj.getDataRange().getValues();
        var prodHeaders = prodData[0];
        var prodNameIdx = prodHeaders.indexOf('name');

        var ordersModified = false;
        var productionModified = false;

        payload.Products.forEach(function (newProd) {
          if (!newProd.id || !newProd.name) return;

          for (var i = 1; i < pData.length; i++) {
            if (String(pData[i][idIdx]) === String(newProd.id)) {
              var oldName = String(pData[i][nameIdx] || '').trim();
              var newName = String(newProd.name || '').trim();

              if (oldName && oldName !== newName) {
                // Đổi tên trong lệnh sản xuất
                for (var pr = 1; pr < prodData.length; pr++) {
                  if (String(prodData[pr][prodNameIdx] || '').trim() === oldName) {
                    prodData[pr][prodNameIdx] = newName;
                    productionModified = true;
                  }
                }

                // Đổi tên trong phụ kiện đơn hàng
                for (var or = 1; or < oData.length; or++) {
                  var accStr = String(oData[or][oAccIdx] || '');
                  if (accStr && accStr.indexOf(oldName) !== -1) {
                    try {
                      var accArr = JSON.parse(accStr);
                      var accChanged = false;
                      for (var a = 0; a < accArr.length; a++) {
                        if (String(accArr[a].name).trim() === oldName) {
                          accArr[a].name = newName;
                          accChanged = true;
                        }
                      }
                      if (accChanged) {
                        oData[or][oAccIdx] = JSON.stringify(accArr);
                        ordersModified = true;
                      }
                    } catch (e) { }
                  }
                }
              }
              break;
            }
          }
        });

        if (productionModified) productionSheetObj.getRange(1, 1, prodData.length, prodHeaders.length).setValues(prodData);
        if (ordersModified) orderSheetObj.getRange(1, 1, oData.length, oHeaders.length).setValues(oData);
      }
    }

    if (payload.Products && payload.Products.length > 0) applyDeltasToSheet('Products', payload.Products, formatProduct, ss);
    if (payload.Accounts && payload.Accounts.length > 0) applyDeltasToSheet('Accounts', payload.Accounts, formatAccount, ss);
    if (payload.Suppliers && payload.Suppliers.length > 0) applyDeltasToSheet('Suppliers', payload.Suppliers, formatSupplier, ss);
    if (payload.Transactions && payload.Transactions.length > 0) applyDeltasToSheet('Transactions', payload.Transactions, formatTransaction, ss);
    if (payload.ImportExport && payload.ImportExport.length > 0) applyDeltasToSheet('ImportExport', payload.ImportExport, formatImportExport, ss);
    if ((payload.documents && payload.documents.length > 0) || (payload.Documents && payload.Documents.length > 0)) applyDeltasToSheet('Documents', payload.documents || payload.Documents, formatDocument, ss);
    if ((payload.trainings && payload.trainings.length > 0) || (payload.Trainings && payload.Trainings.length > 0)) applyDeltasToSheet('Trainings', payload.trainings || payload.Trainings, formatTraining, ss);
    if ((payload.Reimbursements && payload.Reimbursements.length > 0) || (payload.reimbursements && payload.reimbursements.length > 0)) applyDeltasToSheet('Reimbursements', payload.Reimbursements || payload.reimbursements, formatReimbursement, ss);
    if ((payload.Models3D && payload.Models3D.length > 0) || (payload.models3D && payload.models3D.length > 0)) applyDeltasToSheet('Models3D', payload.Models3D || payload.models3D, function (x) { return x; }, ss);
    if (payload.ProfitReports && payload.ProfitReports.length > 0) applyDeltasToSheet('ProfitReports', payload.ProfitReports, formatProfitReport, ss);
    if (payload.BonusPenalty && payload.BonusPenalty.length > 0) {
      // 🔔 Bắn thông báo Ghi Nhận Phạt qua ntfy.sh
      payload.BonusPenalty.forEach(function(bp) {
        if (Number(bp.amount) < 0 || String(bp.type).toUpperCase().indexOf('PHẠT') !== -1) {
          sendNtfyNotification(
            '⚠️ GHI NHẬN PHẠT: ' + (bp.user || 'N/A'), 
            'Lý do: ' + (bp.note || 'N/A') + '\nSố tiền: ' + bp.amount + 'đ', 
            null
          );
        }
      });
      applyDeltasToSheet('BonusPenalty', payload.BonusPenalty, formatBonusPenalty, ss);
      logBehavior('Cập nhật BonusPenalty', 'Nhân sự thực hiện: ' + (auth ? auth.user : 'Unknown') + ' | Cập nhật ' + payload.BonusPenalty.length + ' bản ghi.');
    }
    if (payload.KPI_Progress && payload.KPI_Progress.length > 0) applyDeltasToSheet('KPI_Progress', payload.KPI_Progress, formatKPIProg, ss);
    if (payload.BOM_Config && payload.BOM_Config.length > 0) applyDeltasToSheet('BOM_Config', payload.BOM_Config, formatBOMConfig, ss);
    if (payload.ThongKe_TichLuyXu && payload.ThongKe_TichLuyXu.length > 0) applyDeltasToSheet('ThongKe_TichLuyXu', payload.ThongKe_TichLuyXu, formatThongKeTichLuyXu, ss);
    if (payload.xuTransactions && payload.xuTransactions.length > 0) applyDeltasToSheet('ThongKe_TichLuyXu', payload.xuTransactions, formatThongKeTichLuyXu, ss);
    if (payload.Workspaces && payload.Workspaces.length > 0) {
      if (!ss.getSheetByName('Workspaces')) {
        var wsSheet = ss.insertSheet('Workspaces');
        wsSheet.appendRow(SCHEMA_ERP.Workspaces);
        wsSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#d4af37");
        wsSheet.setFrozenRows(1);
      }
      applyDeltasToSheet('Workspaces', payload.Workspaces, formatWorkspace, ss);
    }
    
    // GHI NHẬN COMBAT LOG VÀO BẢNG TRACKING_LOG CỦA HỆ THỐNG
    if (payload.Tracking_Log && payload.Tracking_Log.length > 0) {
      var trackSheet = ss.getSheetByName('Tracking_Log');
      if (trackSheet) {
        var trackRows = [];
        payload.Tracking_Log.forEach(function (tl) {
          trackRows.push([
            tl['Thời gian'] || tl.time || new Date(),
            tl['Tên nhân sự'] || tl.user || '',
            tl['Hoàn thành'] || tl.action || '',
            tl['Hỏi AI'] || tl.ai || '',
            tl['Ghi chú thêm'] || tl.note || ''
          ]);
        });
        if (trackRows.length > 0) {
          trackSheet.getRange(trackSheet.getLastRow() + 1, 1, trackRows.length, trackRows[0].length).setValues(trackRows);
        }
      }
    }
    // XỬ LÝ RIÊNG TÀI CHÍNH CỘNG TÁC VIÊN (CÁCH LY VỚI SỔ QUỸ CHÍNH - CHỐNG TRÙNG LẶP ID)
    if (payload.ctvTransactions && payload.ctvTransactions.length > 0) {
      if (!ss.getSheetByName('CTV_Finance')) {
        var financeSheet = ss.insertSheet('CTV_Finance');
        financeSheet.appendRow(SCHEMA_ERP.CTV_Finance || ['id', 'date', 'type', 'amount', 'note', 'user', 'status']);
        financeSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#d4af37");
        financeSheet.setFrozenRows(1);
      }
      applyDeltasToSheet('CTV_Finance', payload.ctvTransactions, formatCTVFinance, ss);
    }
    if (payload.UserConfigs && payload.UserConfigs.length > 0) {
      updateUserConfigSheet(payload.UserConfigs[0]);
      var updatedUser = payload.UserConfigs[0]['Tên Nhân Sự'] || 'N/A';
      logBehavior('Cập nhật Config_NhanSu', 'Nhân sự thực hiện: ' + (auth ? auth.user : 'Unknown') + ' | Sửa cấu hình của: ' + updatedUser);
      invalidateUserConfigCache();
    }
    if (payload.Config_NhanSu && payload.Config_NhanSu.length > 0) {
      invalidateUserConfigCache();
    }

    var props = PropertiesService.getScriptProperties();
    if (payload.announcement !== undefined) {
      props.setProperty('RF_ANNOUNCEMENT', payload.announcement);
    }
    if (payload.deletes) {
      var keyMapping = {
        'orders': 'Orders',
        'Orders': 'Orders',
        'Production': 'Production',
        'prodItems': 'Production',
        'packings': 'Packings',
        'Packings': 'Packings',
        'Products': 'Products',
        'ImportExport': 'ImportExport',
        'Transactions': 'Transactions',
        'Accounts': 'Accounts',
        'Suppliers': 'Suppliers',
        'BonusPenalty': 'BonusPenalty',
        'KPI_Progress': 'KPI_Progress',
        'Attendance': 'Attendance',
        'attendance': 'Attendance',
        'Documents': 'Documents',
        'documents': 'Documents',
        'Trainings': 'Trainings',
        'trainings': 'Trainings',
        'Models3D': 'Models3D',
        'BOM_Config': 'BOM_Config',
        'ThongKe_TichLuyXu': 'ThongKe_TichLuyXu',
        'xuTransactions': 'ThongKe_TichLuyXu',
        'CTV_Finance': 'CTV_Finance',
        'ctvTransactions': 'CTV_Finance',
        'Workspaces': 'Workspaces',
        'workspaces': 'Workspaces'
      };
      Object.keys(payload.deletes).forEach(function (clientKey) {
        var sName = keyMapping[clientKey] || clientKey;
        if (SCHEMA[sName] || SCHEMA_ERP[sName]) {
          deleteDeltas(sName, payload.deletes[clientKey], ss);
        }
      });
    }
    SpreadsheetApp.flush();
    props.setProperty('RF_LAST_UPDATED', new Date().getTime().toString());

  } catch (err) {
    Logger.log('Lỗi syncDeltas: ' + err.toString());
    return {
      success: false,
      error: 'SYNC_ERROR',
      message: 'Lỗi ghi dữ liệu lên hệ thống: ' + (err.message || err.toString()),
      serverTime: new Date().getTime()
    };
  } finally {
    if (acquiredLock) {
      try { lock.releaseLock(); } catch (e) { }
    }
  }

  return {
    success: true,
    serverTime: new Date().getTime()
  };
}

const ADMIN_ROLES = ['TỐI CAO', 'QUẢN LÝ CẤP TRUNG', 'QUẢN LÝ SẢN XUẤT', 'SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'KHO VẬN', 'BÁN HÀNG', 'QUẢN LÝ BÁN HÀNG', 'QUẢN LÝ NHÂN SỰ', 'NHÂN SỰ', 'KẾ TOÁN', 'QUẢN LÝ KIỂM TOÁN', 'KIỂM TOÁN', 'NHÂN VIÊN', 'CỘNG TÁC VIÊN', 'CTV', 'KHÁCH'];
const BOSS_ROLES = ['TỐI CAO'];

// =========================================================================
// HỆ THỐNG QUẢN LÝ CẤU HÌNH & XÁC THỰC AN TOÀN (CACHE INVALIDATION & GENERATION TOKEN)
// =========================================================================

function invalidateUserConfigCache() {
  try {
    var cache = CacheService.getScriptCache();
    if (cache) {
      cache.remove('USER_DISPLAY_CONFIG');
      cache.remove('USER_CONFIG');
    }
    var props = PropertiesService.getScriptProperties();
    var newGen = Date.now().toString();
    if (props) {
      props.setProperty('CONFIG_GENERATION', newGen);
    }
    return { success: true, generation: newGen };
  } catch (e) {
    console.warn('Lỗi invalidateUserConfigCache:', e);
    return { success: false, error: e.toString() };
  }
}

/**
 * Lấy cấu hình hiển thị giao diện (avatars, titles, subTitles, salaries, users).
 * Dữ liệu này an toàn, được cache 120s trong CacheService để tối ưu tốc độ mở app.
 */
function getUserConfig() {
  var cache = CacheService.getScriptCache();
  try {
    var cached = cache.get('USER_DISPLAY_CONFIG');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('Lỗi đọc cache USER_DISPLAY_CONFIG:', e);
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config_NhanSu');
    if (!sheet) { console.error('Sheet Config_NhanSu not found'); return getEmptyConfig("Lỗi: Không tìm thấy sheet Config_NhanSu"); }

    var data = sheet.getDataRange().getValues();
    var config = { avatars: {}, titles: {}, subTitles: {}, salaries: {}, users: [], roles: {}, pins: {} };

    if (data.length === 0) return getEmptyConfig("Lỗi: Sheet Config_NhanSu không có dữ liệu (data.length === 0)");
    var headers = data[0];
    var getCol = function (names, fallback) {
      for (var k = 0; k < names.length; k++) {
        var idx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === names[k].toLowerCase(); });
        if (idx !== -1) return idx;
      }
      return fallback;
    };

    var nameCol = getCol(['Tên Nhân Sự'], 0);
    var avatarCol = getCol(['ID Ảnh'], 1);
    var titleCol = getCol(['Chức Danh'], 2);
    var subTitleCol = getCol(['Chức Danh Phụ'], -1);
    var roleCol = getCol(['Phân Quyền'], 3);
    var pinCol = getCol(['Mã PIN', 'PIN', 'Mã Pin'], 4);
    var baseSalCol = getCol(['Lương Cơ Bản'], -1);
    var funcSalCol = getCol(['Lương Chức Vụ'], -1);
    var allowCol = getCol(['Phụ Cấp Xăng Xe'], -1);
    var deductCol = getCol(['Khoản Trừ Vi Phạm'], -1);

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var name = String(row[nameCol] || '').trim();
      if (!name) continue;

      config.users.push(name);
      var linkOrId = String(row[avatarCol] || '').trim();
      if (linkOrId) {
        var match = linkOrId.match(/[-\w]{25,}/);
        config.avatars[name] = match ? match[0] : linkOrId;
      }

      var title = String(row[titleCol] || '').trim();
      if (title) config.titles[name] = title;

      if (subTitleCol !== -1) {
        var subTitle = String(row[subTitleCol] || '').trim();
        if (subTitle) config.subTitles[name] = subTitle;
      }

      var role = String(row[roleCol] || '').trim().toUpperCase() || 'THỢ';
      config.roles[name] = role;

      config.salaries[name] = {
        baseSalary: parseNumber(row[baseSalCol]),
        funcSalary: parseNumber(row[funcSalCol]),
        allowance: parseNumber(row[allowCol]),
        deduction: parseNumber(row[deductCol])
      };

      var pin = (pinCol !== -1) ? String(row[pinCol] || '').trim() : '';
      if (pin) pin = pin.replace(/\.0+$/, '');
      var pinKey = pin || ('user_' + i);
      var pinObj = {
        name: name,
        role: role,
        title: title,
        subTitle: (subTitleCol !== -1 && row[subTitleCol]) ? String(row[subTitleCol] || '').trim() : '',
        avatar: config.avatars[name] || ''
      };
      config.pins[pinKey] = pinObj;
      if (pin && /^\d+$/.test(pin) && pin.length < 6 && !config.pins[pin.padStart(6, '0')]) {
        config.pins[pin.padStart(6, '0')] = pinObj;
      }
    }

    try {
      cache.put('USER_DISPLAY_CONFIG', JSON.stringify(config), 120);
    } catch (errCache) { }
    return config;

  } catch (e) {
    console.error('Error in getUserConfig:', e);
    return getEmptyConfig(e.toString());
  }
}

/**
 * Nguồn xác thực thẩm quyền cho PIN và Phân Quyền (Authoritative Auth Source).
 * Sử dụng CONFIG_GENERATION token chống race condition đè cache cũ khi có thao tác sửa quyền.
 */
function getAuthoritativeAuthConfig_() {
  var props = PropertiesService.getScriptProperties();
  var generation = props.getProperty('CONFIG_GENERATION') || '1';
  var cacheKey = 'AUTH_CONFIG_' + generation;
  var cache = CacheService.getScriptCache();

  try {
    var cached = cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) { }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config_NhanSu');
    if (!sheet) return { pins: {}, roles: {}, _debugMsg: "Không tìm thấy sheet Config_NhanSu" };

    var data = sheet.getDataRange().getValues();
    if (data.length === 0) return { pins: {}, roles: {}, _debugMsg: "Sheet Config_NhanSu rỗng" };

    var headers = data[0];
    var getCol = function (names, fallback) {
      for (var k = 0; k < names.length; k++) {
        var idx = headers.findIndex(function (h) { return String(h).trim().toLowerCase() === names[k].toLowerCase(); });
        if (idx !== -1) return idx;
      }
      return fallback;
    };

    var nameCol = getCol(['Tên Nhân Sự'], 0);
    var avatarCol = getCol(['ID Ảnh'], 1);
    var titleCol = getCol(['Chức Danh'], 2);
    var subTitleCol = getCol(['Chức Danh Phụ'], -1);
    var roleCol = getCol(['Phân Quyền'], 3);
    var pinCol = getCol(['Mã PIN'], 4);

    var authConfig = { pins: {}, roles: {} };

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var name = String(row[nameCol] || '').trim();
      if (!name) continue;

      var role = String(row[roleCol] || '').trim().toUpperCase() || 'THỢ';
      authConfig.roles[name] = role;

      var pin = String(row[pinCol] || '').trim();
      if (pin) {
        pin = pin.replace(/\.0+$/, '');
        var pinObj = {
          name: name,
          role: role,
          title: String(row[titleCol] || '').trim(),
          subTitle: subTitleCol !== -1 ? String(row[subTitleCol] || '').trim() : '',
          avatar: String(row[avatarCol] || '').trim()
        };

        authConfig.pins[pin] = pinObj;

        if (/^\d+$/.test(pin)) {
          if (pin.length < 6) {
            authConfig.pins[pin.padStart(6, '0')] = pinObj;
          }
          var intVal = parseInt(pin, 10);
          if (!isNaN(intVal)) {
            authConfig.pins[String(intVal)] = pinObj;
          }
        }
      }
    }

    try {
      cache.put(cacheKey, JSON.stringify(authConfig), 30); // TTL ngắn 30s với generation token
    } catch (e) { }

    return authConfig;
  } catch (e) {
    console.error('Lỗi getAuthoritativeAuthConfig_:', e);
    return { pins: {}, roles: {}, _debugMsg: e.toString() };
  }
}

function parseNumber(val) {
  if (!val) return 0;
  const num = Number(String(val).replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? 0 : num;
}

function getEmptyConfig(debugMsg) {
  return { avatars: {}, titles: {}, salaries: {}, pins: {}, users: [], roles: {}, _debugMsg: debugMsg };
}

function createInternalSystemAuth_() {
  return { valid: true, user: 'SYSTEM', role: 'TỐI CAO', title: 'Hệ Thống Tự Động', isAdmin: true, isBoss: true };
}

function validatePin(pin) {
  if (!pin) { return { valid: false, user: null, role: '', isAdmin: false, isBoss: false }; }
  // Chặn tuyệt đối việc client gửi chuỗi giả lập hệ thống để chiếm quyền
  if (pin === 'SYSTEM' || pin === 'AUTO_TRIGGER' || pin === 'INTERNAL_ENGINE') {
    return { valid: false, user: null, role: '', isAdmin: false, isBoss: false, error: 'Mã PIN không hợp lệ' };
  }
  var rawPin = pin;
  if (typeof pin === 'object' && pin !== null) {
    rawPin = pin.pin || pin.passcode || pin.token || '';
  }
  if (!rawPin || rawPin === 'SYSTEM' || rawPin === 'AUTO_TRIGGER' || rawPin === 'INTERNAL_ENGINE') {
    return { valid: false, user: null, role: '', isAdmin: false, isBoss: false, error: 'Mã PIN không hợp lệ' };
  }
  
  // Nguồn xác thực thẩm quyền có generation token bảo vệ chống race condition
  var authConfig;
  if (typeof getAuthoritativeAuthConfig_ === 'function') {
    authConfig = getAuthoritativeAuthConfig_();
  } else if (typeof getUserConfig === 'function') {
    authConfig = getUserConfig();
  } else {
    authConfig = { pins: {}, roles: {} };
  }

  if (authConfig && authConfig._debugMsg) {
    return { valid: false, _debugMsg: "Lỗi nạp cấu hình tài khoản hệ thống" };
  }

  var pinStr = String(rawPin).trim().replace(/\.0+$/, '');
  var userInfo = authConfig.pins[pinStr];

  // Thử tìm theo chuỗi số nguyên (bỏ số 0 đầu)
  if (!userInfo && /^\d+$/.test(pinStr)) {
    var intVal = parseInt(pinStr, 10);
    if (!isNaN(intVal)) {
      userInfo = authConfig.pins[String(intVal)];
    }
  }

  // Thử tìm theo chuỗi đã đệm số 0 đầu cho đủ 6 ký tự
  if (!userInfo && /^\d+$/.test(pinStr) && pinStr.length < 6) {
    var padded = pinStr.padStart(6, '0');
    userInfo = authConfig.pins[padded];
  }

  if (!userInfo) {
    // Tuyệt đối không trả danh sách mã PIN trong thông báo lỗi hoặc log
    return { valid: false, _debugMsg: "Mã PIN không tồn tại hoặc không hợp lệ" };
  }
  const role = userInfo.role || 'THỢ';

  return {
    valid: true,
    user: userInfo.name,
    role: role,
    title: userInfo.title || '',
    isAdmin: ADMIN_ROLES.indexOf(role) > -1,
    isBoss: BOSS_ROLES.indexOf(role) > -1
  };
}

// =========================================================================
// BACKEND RBAC MIDDLEWARE & PERMISSION VALIDATOR
// Single Source of Truth cho toàn bộ xác thực quyền hạn Server-side
// =========================================================================

var SERVER_RBAC_RULES = {
  // 1. Header & Nút Toàn Cục
  BLACKBOX_AUDIT: ['TỐI CAO'],
  RELOAD_DATA: 'ALL',
  LOGIN_LOGOUT: 'ALL',
  CALC_FREIGHT: 'ALL',
  CALC_TANK: 'ALL',
  CALC_LAYOUT: 'ALL',
  VIEW_PRICE_LIST: 'ALL_INTERNAL',
  REIMBURSE_SUBMIT: 'ALL_INTERNAL',
  REIMBURSE_APPROVE: ['TỐI CAO', 'KẾ TOÁN'],
  QUICK_PENALTY: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  QUICK_EXPENSE: ['TỐI CAO', 'KẾ TOÁN'],

  // 2. Tab Đơn Hàng (Orders)
  ORDER_CREATE: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN', 'CỘNG TÁC VIÊN', 'CTV'],
  ORDER_IMPORT: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  ORDER_SCAN_QR: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ BÁN HÀNG'],
  ORDER_EDIT: ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG'],
  ORDER_CANCEL: ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG'],
  ORDER_DELETE: ['TỐI CAO'],
  ORDER_STATUS_PENDING_PROD: ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG'],
  ORDER_STATUS_DELIVERED: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ BÁN HÀNG'],
  ORDER_STATUS_RECONCILED: ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  ORDER_ARCHIVE_VIEW: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  ORDER_ARCHIVE_ACTION: ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  ORDER_PRINT_EXPORT: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],

  // 3. Tab Sản Xuất (Production)
  PROD_PHASE1_TAKE: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ', 'THỢ SẢN XUẤT', 'NHÂN VIÊN', 'SẢN XUẤT'],
  PROD_PHASE1_START: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ', 'THỢ SẢN XUẤT', 'NHÂN VIÊN', 'SẢN XUẤT'],
  PROD_PHASE1_SUBMIT: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ', 'THỢ SẢN XUẤT', 'NHÂN VIÊN', 'SẢN XUẤT'],
  PROD_PHASE2_TAKE: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ', 'THỢ SẢN XUẤT', 'NHÂN VIÊN', 'SẢN XUẤT'],
  PROD_PHASE2_START: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ', 'THỢ SẢN XUẤT', 'NHÂN VIÊN', 'SẢN XUẤT'],
  PROD_PHASE2_SUBMIT: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ', 'THỢ SẢN XUẤT', 'NHÂN VIÊN', 'SẢN XUẤT'],
  PROD_QC_APPROVE: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO'],
  PROD_QC_REJECT: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO'],
  PROD_REASSIGN_WORKER: ['TỐI CAO', 'QUẢN LÝ NHÂN SỰ'],
  PROD_CREATE_STOCK_BATCH: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ'],
  PROD_CANCEL_DEFECT: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO'],
  PROD_MOVE_TO_PACKING: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ BÁN HÀNG'],

  // 4. Khâu Đóng Gói (Packings)
  PACKING_TAKE: 'ALL_INTERNAL',
  PACKING_PREFLIGHT: 'ALL_INTERNAL',
  PACKING_PHOTO: 'ALL_INTERNAL',
  PACKING_COMPLETE: 'ALL_INTERNAL',
  PACKING_CARRIED_WH: 'ALL_INTERNAL',

  // 5. Tab Nhân Sự & Chấm Công (HR)
  HR_ATTENDANCE_SELF: 'ALL_INTERNAL',
  HR_LEAVE_SELF: 'ALL_INTERNAL',
  HR_CLAIM_KPI_REWARD: 'ALL_INTERNAL',
  HR_EDIT_ATTENDANCE: ['TỐI CAO', 'QUẢN LÝ NHÂN SỰ'],
  HR_BONUS_PENALTY: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  HR_EDIT_KPI_TARGET: ['TỐI CAO'],
  HR_VIEW_TOTAL_PAYROLL: 'ALL_INTERNAL',
  HR_PRINT_PAYSLIP: ['TỐI CAO', 'QUẢN LÝ NHÂN SỰ', 'KẾ TOÁN'],
  HR_PAY_SALARY_ADVANCE: ['TỐI CAO', 'KẾ TOÁN'],
  HR_CONFIG_STAFF: ['TỐI CAO'],

  // 6. Tab Kho Hàng & Định Mức BOM (Warehouse)
  INV_VIEW_FINISHED: 'ALL_INTERNAL',
  INV_VIEW_RAW_MATERIALS: 'ALL_INTERNAL',
  INV_ADD_PRODUCT: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'KẾ TOÁN'],
  INV_EDIT_PRODUCT: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'KẾ TOÁN'],
  INV_ADJUST_STOCK: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  INV_DELETE_PRODUCT: ['TỐI CAO'],
  INV_STOCK_HISTORY: ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'QUẢN LÝ NHÂN SỰ', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN', 'THỢ SẢN XUẤT'],
  INV_BOM_CONFIG: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'KẾ TOÁN'],

  // 7. Tab Xuất Nhập Kho (ImportExport)
  IE_CREATE_IMPORT: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'KẾ TOÁN'],
  IE_CREATE_EXPORT: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'KẾ TOÁN'],
  IE_CREATE_PO: 'ALL_INTERNAL',
  IE_APPROVE_PO: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'KẾ TOÁN'],
  IE_EDIT_LOG: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'KẾ TOÁN'],
  IE_DELETE_LOG: ['TỐI CAO'],

  // 8. Tab Tài Chính & Đối Tác (Finance & Suppliers)
  FIN_VIEW_ACCOUNTS: ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  FIN_CREATE_TRANSACTION: ['TỐI CAO', 'KẾ TOÁN'],
  FIN_TRANSFER_MONEY: ['TỐI CAO', 'KẾ TOÁN'],
  FIN_EDIT_DELETE_TRANSACTION: ['TỐI CAO'],
  FIN_INCOME: ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  FIN_EXPENSE: ['TỐI CAO', 'KẾ TOÁN'],
  FIN_TRANSFER: ['TỐI CAO', 'KẾ TOÁN'],
  FIN_EDIT_TRANSACTION: ['TỐI CAO', 'KẾ TOÁN'],
  FIN_DELETE_TRANSACTION: ['TỐI CAO'],
  FIN_CONFIG_ACCOUNTS: ['TỐI CAO'],
  SUPPLIER_MANAGE: ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO', 'KẾ TOÁN'],
  SUPPLIER_PAY_DEBT: ['TỐI CAO', 'KẾ TOÁN'],

  // 9. Báo Cáo P&L, KQKD & Shopee Global
  REPORT_PL_VIEW: ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  REPORT_BUSINESS_VIEW: ['TỐI CAO', 'KẾ TOÁN'],
  SHOPEE_GLOBAL_VIEW: ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  REPORT_EXPORT_EXCEL: ['TỐI CAO', 'KẾ TOÁN'],

  // 10. Cộng Tác Viên & Tiện Ích
  CTV_WALLET_MANAGE: ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'],
  CTV_LAYOUT_PRICE_CONFIG: ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG'],
  VIEWER_3D_VIEW: 'ALL',
  MODELS_3D_UPLOAD: ['TỐI CAO'],
  DOCUMENTS_UPLOAD: ['TỐI CAO'],
  WORKSPACES_ASSIGN: ['TỐI CAO', 'QUẢN LÝ NHÂN SỰ'],

  // Cấu hình thông báo Webhook/System
  SYSTEM_CONFIG: ['TỐI CAO']
};

/**
 * Kiểm tra quyền hạn Server-side dựa trên Auth Object và Action Code
 * @param {Object} auth - Object trả về từ validatePin()
 * @param {string} actionCode - Mã hành động trong SERVER_RBAC_RULES
 * @returns {boolean}
 */
function checkServerPermission(auth, actionCode) {
  if (!auth || !auth.valid) return false;
  
  // Boss Tối Cao luôn có toàn quyền
  if (auth.isBoss || auth.role === 'TỐI CAO') {
    return true;
  }
  
  var role = String(auth.role || '').trim().toUpperCase();
  if (role === 'KHÁCH') return false;
  
  // Chuẩn hóa tên phân quyền
  if (role === 'KETOAN' || role === 'KE TOAN') role = 'KẾ TOÁN';
  if (role === 'BAN HANG' || role === 'BANHANG') role = 'QUẢN LÝ BÁN HÀNG';
  if (role === 'SAN XUAT' || role === 'SANXUAT') role = 'QUẢN LÝ SẢN XUẤT';
  if (role === 'KHO VAN' || role === 'KHOVAN' || role === 'KHO') role = 'QUẢN LÝ KHO VẬN';
  if (role === 'NHAN SU' || role === 'NHANSU') role = 'QUẢN LÝ NHÂN SỰ';
  if (role === 'THO SAN XUAT' || role === 'THOSANXUAT' || role === 'THỢ') role = 'THỢ SẢN XUẤT';
  if (role === 'NHAN VIEN' || role === 'NHANVIEN') role = 'NHÂN VIÊN';
  if (role === 'CONG TAC VIEN' || role === 'CTV') role = 'CỘNG TÁC VIÊN';

  var rule = SERVER_RBAC_RULES[actionCode];
  if (!rule) return false;
  if (rule === 'ALL') return true;

  var INTERNAL_ROLES = [
    'TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ KHO',
    'QUẢN LÝ NHÂN SỰ', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN', 'THỢ SẢN XUẤT', 'NHÂN VIÊN'
  ];

  if (rule === 'ALL_INTERNAL') {
    return INTERNAL_ROLES.indexOf(role) > -1;
  }

  if (Array.isArray(rule)) {
    for (var i = 0; i < rule.length; i++) {
      var r = String(rule[i]).trim().toUpperCase();
      if (r === role) return true;
      if (r === 'CTV' && (role === 'CỘNG TÁC VIÊN' || role === 'CTV')) return true;
    }
  }

  return false;
}

/**
 * Middleware bắt buộc kiểm tra quyền — nếu không hợp lệ sẽ ném Error
 * @param {Object} auth - Object trả về từ validatePin()
 * @param {string} actionCode - Mã hành động trong SERVER_RBAC_RULES
 * @param {string} actionDesc - Mô tả hành động thân thiện với người dùng
 */
function requireServerPermission(auth, actionCode, actionDesc) {
  if (!auth || !auth.valid) {
    throw new Error('AUTH_FAILED: Phiên làm việc chưa xác thực hoặc mã PIN không hợp lệ!');
  }
  if (!checkServerPermission(auth, actionCode)) {
    var desc = actionDesc || actionCode;
    throw new Error('PERMISSION_DENIED: Bạn (' + (auth.user || 'Người dùng') + ' - ' + (auth.role || 'Không rõ') + ') không có quyền thực hiện: ' + desc);
  }
  return true;
}

/**
 * Middleware kiểm tra phân quyền chi tiết cho từng bảng trong syncDeltas
 * @param {Object} auth - Object trả về từ validatePin()
 * @param {string} tableName - Tên bảng CSDL (ví dụ 'Orders', 'Transactions', 'Config_NhanSu')
 * @param {boolean} isDelete - True nếu là thao tác xóa bản ghi
 * @param {Object|Array} deltaItems - Danh sách bản ghi đang được thêm/sửa/xóa
 * @returns {Object} { allowed: boolean, reason?: string }
 */
function validateTableWritePermission(auth, tableName, isDelete, deltaItems) {
  if (!auth || !auth.valid) return { allowed: false, reason: 'Chưa xác thực danh tính (PIN không hợp lệ)' };
  if (auth.isBoss || auth.role === 'TỐI CAO') {
    return { allowed: true };
  }

  var TABLE_ALIASES = {
    'orders': 'Orders',
    'Orders': 'Orders',
    'production': 'Production',
    'Production': 'Production',
    'prodItems': 'Production',
    'packings': 'Packings',
    'Packings': 'Packings',
    'products': 'Products',
    'Products': 'Products',
    'importExport': 'ImportExport',
    'ImportExport': 'ImportExport',
    'transactions': 'Transactions',
    'Transactions': 'Transactions',
    'accounts': 'Accounts',
    'Accounts': 'Accounts',
    'suppliers': 'Suppliers',
    'Suppliers': 'Suppliers',
    'bonusPenalty': 'BonusPenalty',
    'BonusPenalty': 'BonusPenalty',
    'kpiProgress': 'KPI_Progress',
    'KPI_Progress': 'KPI_Progress',
    'attendance': 'Attendance',
    'Attendance': 'Attendance',
    'documents': 'Documents',
    'Documents': 'Documents',
    'trainings': 'Trainings',
    'Trainings': 'Trainings',
    'models3D': 'Models3D',
    'Models3D': 'Models3D',
    'bomConfig': 'BOM_Config',
    'BOM_Config': 'BOM_Config',
    'configKpi': 'Config_KPI',
    'Config_KPI': 'Config_KPI',
    'thongKeTichLuyXu': 'ThongKe_TichLuyXu',
    'ThongKe_TichLuyXu': 'ThongKe_TichLuyXu',
    'xuTransactions': 'ThongKe_TichLuyXu',
    'ctvFinance': 'CTV_Finance',
    'CTV_Finance': 'CTV_Finance',
    'ctvTransactions': 'CTV_Finance',
    'workspaces': 'Workspaces',
    'Workspaces': 'Workspaces',
    'configGiaLayout': 'Config_GiaLayout',
    'Config_GiaLayout': 'Config_GiaLayout',
    'reimbursements': 'Reimbursements',
    'Reimbursements': 'Reimbursements',
    'profitReports': 'ProfitReports',
    'ProfitReports': 'ProfitReports',
    'Config_NhanSu': 'Config_NhanSu',
    'userConfigs': 'Config_NhanSu',
    'UserConfigs': 'Config_NhanSu',
    'Tracking_Log': 'Tracking_Log'
  };

  var targetTable = TABLE_ALIASES[tableName];
  if (!targetTable) {
    return { allowed: false, reason: 'Bảng ' + tableName + ' không hợp lệ hoặc chưa được khai báo quyền truy cập' };
  }

  var rawRole = String(auth.role || '').trim().toUpperCase();
  var role = rawRole;
  if (rawRole.indexOf('TỐI CAO') !== -1 || rawRole.indexOf('TOI CAO') !== -1 || rawRole.indexOf('ADMIN') !== -1 || rawRole.indexOf('BOSS') !== -1) role = 'TỐI CAO';
  else if (rawRole.indexOf('KẾ TOÁN') !== -1 || rawRole.indexOf('KE TOAN') !== -1 || rawRole.indexOf('KETOAN') !== -1) role = 'KẾ TOÁN';
  else if (rawRole.indexOf('BÁN HÀNG') !== -1 || rawRole.indexOf('BAN HANG') !== -1 || rawRole.indexOf('BANHANG') !== -1 || rawRole.indexOf('SALE') !== -1) role = 'QUẢN LÝ BÁN HÀNG';
  else if (rawRole.indexOf('KHO') !== -1) role = 'QUẢN LÝ KHO VẬN';
  else if (rawRole.indexOf('NHÂN SỰ') !== -1 || rawRole.indexOf('NHAN SU') !== -1 || rawRole.indexOf('NHANSU') !== -1 || rawRole.indexOf('HR') !== -1) role = 'QUẢN LÝ NHÂN SỰ';
  else if (rawRole.indexOf('SẢN XUẤT') !== -1 || rawRole.indexOf('SAN XUAT') !== -1 || rawRole.indexOf('SANXUAT') !== -1 || rawRole.indexOf('THỢ') !== -1 || rawRole.indexOf('THO') !== -1) role = 'QUẢN LÝ SẢN XUẤT';
  else if (rawRole.indexOf('CỘNG TÁC VIÊN') !== -1 || rawRole.indexOf('CONG TAC VIEN') !== -1 || rawRole.indexOf('CTV') !== -1) role = 'CỘNG TÁC VIÊN';
  else if (rawRole.indexOf('NHÂN VIÊN') !== -1 || rawRole.indexOf('NHAN VIEN') !== -1 || rawRole.indexOf('NHANVIEN') !== -1) role = 'NHÂN VIÊN';

  // 1. Cấu hình nhân sự, bảng lương & PIN: DUY NHẤT TỐI CAO
  if (targetTable === 'Config_NhanSu') {
    return { allowed: false, reason: 'Chỉ có Boss Tối Cao mới có quyền sửa đổi Cấu hình Nhân sự, Lương và Mã PIN' };
  }

  // 2. Bảng Đơn Hàng (Orders)
  if (targetTable === 'Orders') {
    if (isDelete) {
      return { allowed: false, reason: 'Chỉ có Boss Tối Cao mới có quyền xóa vĩnh viễn đơn hàng' };
    }
    var allowedOrderRoles = ['TỐI CAO', 'QUẢN LÝ BÁN HÀNG', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ NHÂN SỰ', 'KẾ TOÁN', 'CỘNG TÁC VIÊN', 'NHÂN VIÊN', 'THỢ SẢN XUẤT'];
    if (allowedOrderRoles.indexOf(role) === -1) {
      return { allowed: false, reason: 'Vai trò ' + role + ' không có quyền ghi/sửa đơn hàng' };
    }
    return { allowed: true };
  }

  // 3. Bảng Giao Dịch Tài Chính (Transactions)
  if (targetTable === 'Transactions') {
    if (isDelete) {
      return { allowed: false, reason: 'Chỉ có Boss Tối Cao mới có quyền xóa giao dịch tài chính' };
    }
    var allowedTxRoles = ['TỐI CAO', 'KẾ TOÁN', 'QUẢN LÝ BÁN HÀNG', 'QUẢN LÝ KHO VẬN', 'CỘNG TÁC VIÊN'];
    if (allowedTxRoles.indexOf(role) === -1) {
      return { allowed: false, reason: 'Chỉ có Kế Toán / Bán Hàng mới có quyền lập/sửa giao dịch tài chính' };
    }
    return { allowed: true };
  }

  // 4. Bảng Tài Khoản / Sổ Quỹ (Accounts)
  if (targetTable === 'Accounts') {
    if (isDelete) {
      return { allowed: false, reason: 'Chỉ có Boss Tối Cao mới có quyền xóa tài khoản ngân hàng / sổ quỹ' };
    }
    var allowedAccountRoles = ['TỐI CAO', 'KẾ TOÁN', 'QUẢN LÝ BÁN HÀNG', 'QUẢN LÝ KHO VẬN', 'CỘNG TÁC VIÊN'];
    if (allowedAccountRoles.indexOf(role) === -1) {
      return { allowed: false, reason: 'Chỉ có Kế Toán / Tối Cao / Quản Lý mới có quyền điều chỉnh tài khoản quỹ' };
    }
    return { allowed: true };
  }

  // 5. Bảng Kho Hàng & Sản Phẩm (Products)
  if (targetTable === 'Products') {
    if (isDelete) {
      return { allowed: false, reason: 'Chỉ có Boss Tối Cao mới có quyền xóa sản phẩm khỏi kho' };
    }
    var allowedInvRoles = ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'KẾ TOÁN', 'QUẢN LÝ BÁN HÀNG', 'QUẢN LÝ SẢN XUẤT'];
    if (allowedInvRoles.indexOf(role) === -1) {
      return { allowed: false, reason: 'Vai trò ' + role + ' không có quyền sửa đổi sản phẩm kho' };
    }
    return { allowed: true };
  }

  // 6. Bảng Xuất Nhập Kho (ImportExport)
  if (targetTable === 'ImportExport') {
    if (isDelete) {
      return { allowed: false, reason: 'Chỉ có Boss Tối Cao mới có quyền xóa nhật ký xuất nhập kho' };
    }
    if (role !== 'QUẢN LÝ KHO VẬN' && role !== 'KẾ TOÁN' && role !== 'TỐI CAO') {
      return { allowed: false, reason: 'Chỉ Quản Lý Kho Vận hoặc Kế Toán mới có quyền tạo/sửa phiếu xuất nhập kho' };
    }
    return { allowed: true };
  }

  // 7. Bảng Định Mức BOM (BOM_Config)
  if (targetTable === 'BOM_Config') {
    if (isDelete && role !== 'TỐI CAO') {
      return { allowed: false, reason: 'Chỉ có Boss Tối Cao mới có quyền xóa cấu hình định mức BOM' };
    }
    var allowedBOMRoles = ['TỐI CAO', 'QUẢN LÝ KHO VẬN', 'KẾ TOÁN', 'QUẢN LÝ BÁN HÀNG', 'QUẢN LÝ SẢN XUẤT'];
    if (allowedBOMRoles.indexOf(role) === -1) {
      return { allowed: false, reason: 'Chỉ Quản Lý Kho Vận, Sản Xuất hoặc Kế Toán mới có quyền cấu hình định mức BOM' };
    }
    return { allowed: true };
  }

  // 8. Bảng Nhà Cung Cấp (Suppliers)
  if (targetTable === 'Suppliers') {
    if (role !== 'QUẢN LÝ KHO VẬN' && role !== 'KẾ TOÁN' && role !== 'TỐI CAO') {
      return { allowed: false, reason: 'Chỉ Quản Lý Kho Vận hoặc Kế Toán mới có quyền quản lý Nhà Cung Cấp' };
    }
    return { allowed: true };
  }

  // 9. Bảng Chấm Công (Attendance)
  if (targetTable === 'Attendance') {
    if (isDelete && role !== 'QUẢN LÝ NHÂN SỰ' && role !== 'TỐI CAO') {
      return { allowed: false, reason: 'Chỉ Quản Lý Nhân Sự / Tối Cao mới có quyền xóa bản ghi chấm công' };
    }
    // Kiểm tra quyền sở hữu bản ghi: Thợ / nhân sự thông thường chỉ chấm công cho chính mình
    if (role !== 'QUẢN LÝ NHÂN SỰ' && role !== 'TỐI CAO') {
      if (Array.isArray(deltaItems)) {
        var isAllOwn = deltaItems.every(function(att) {
          if (!att) return true;
          return !att.user || String(att.user).trim() === String(auth.user).trim();
        });
        if (!isAllOwn) {
          return { allowed: false, reason: 'Bạn chỉ có quyền sửa đổi bản ghi chấm công của chính mình!' };
        }
      }
    }
    return { allowed: true };
  }

  // 10. Bảng Thưởng / Phạt (BonusPenalty)
  if (targetTable === 'BonusPenalty') {
    if (isDelete) {
      return { allowed: false, reason: 'Chỉ có Boss Tối Cao mới có quyền xóa bản ghi Thưởng/Phạt' };
    }
    var allowedPenaltyRoles = ['TỐI CAO', 'QUẢN LÝ SẢN XUẤT', 'QUẢN LÝ KHO VẬN', 'QUẢN LÝ NHÂN SỰ', 'QUẢN LÝ BÁN HÀNG', 'KẾ TOÁN'];
    if (allowedPenaltyRoles.indexOf(role) === -1) {
      return { allowed: false, reason: 'Vai trò ' + role + ' không có quyền ghi nhận thưởng/phạt' };
    }
    return { allowed: true };
  }

  // 11. Bảng Sản Xuất (Production) & Đóng Gói (Packings)
  if (targetTable === 'Production' || targetTable === 'Packings') {
    return { allowed: true };
  }

  // 12. Bảng Phân Công Trách Nhiệm (Workspaces)
  if (targetTable === 'Workspaces') {
    if (role !== 'QUẢN LÝ NHÂN SỰ' && role !== 'TỐI CAO') {
      return { allowed: false, reason: 'Chỉ Quản Lý Nhân Sự mới có quyền phân công khu vực làm việc' };
    }
    return { allowed: true };
  }

  // 13. Bảng Tài Chính CTV (CTV_Finance) & Bảng Giá Layout (Config_GiaLayout)
  if (targetTable === 'CTV_Finance' || targetTable === 'Config_GiaLayout') {
    if (role !== 'QUẢN LÝ BÁN HÀNG' && role !== 'KẾ TOÁN' && role !== 'TỐI CAO') {
      return { allowed: false, reason: 'Chỉ Quản Lý Bán Hàng hoặc Kế Toán mới có quyền quản lý tài chính CTV' };
    }
    return { allowed: true };
  }

  // 14. Bảng Tài Liệu / Mô Hình 3D / Đào tạo
  if (targetTable === 'Documents' || targetTable === 'Models3D' || targetTable === 'Trainings') {
    if (isDelete) {
      return { allowed: false, reason: 'Chỉ có Boss Tối Cao mới có quyền xóa tài liệu / mô hình 3D / đào tạo' };
    }
    return { allowed: true };
  }

  // 15. Bảng Tiến Độ KPI & Thống Kê Tích Lũy Xu
  if (targetTable === 'KPI_Progress' || targetTable === 'ThongKe_TichLuyXu' || targetTable === 'Config_KPI') {
    var allowedKpiRoles = ['TỐI CAO', 'QUẢN LÝ NHÂN SỰ', 'KẾ TOÁN', 'QUẢN LÝ SẢN XUẤT'];
    if (allowedKpiRoles.indexOf(role) === -1) {
      return { allowed: false, reason: 'Vai trò ' + role + ' không có quyền điều chỉnh cấu hình / chỉ tiêu KPI' };
    }
    return { allowed: true };
  }

  if (targetTable === 'Reimbursements') {
    return { allowed: true };
  }

  if (targetTable === 'Tracking_Log') {
    return { allowed: true };
  }

  // Mặc định từ chối mọi trường hợp chưa được cấp quyền rõ ràng
  return { allowed: false, reason: 'Bảng ' + targetTable + ' chưa được cấp quyền truy cập ghi cho vai trò ' + role };
}

function uploadImage(base64Data, fileName) {
  try {
    var FOLDER_ID = "1zZ3PlDKLBzAgAK6oM-hgosfVF6T1Y3o0";
    var folder;
    try {
      folder = DriveApp.getFolderById(FOLDER_ID);
    } catch (folderErr) {
      // Fallback: Tìm hoặc tạo thư mục "RF_Production_Photos" ở thư mục gốc nếu ID cứng bị lỗi hoặc không có quyền truy cập
      var folderName = "RF_Production_Photos";
      var folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder(folderName);
      }
    }

    var data = base64Data;
    if (base64Data.indexOf(",") > -1) { data = base64Data.split(",")[1]; }
    var blob = Utilities.newBlob(Utilities.base64Decode(data), "image/jpeg", fileName);
    var file = folder.createFile(blob);

    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (sharingErr) {
      console.warn("Không thể thiết lập quyền chia sẻ công khai: " + sharingErr.message);
    }

    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w800";
  } catch (e) {
    console.error("Lỗi trong uploadImage:", e);
    return "";
  }
}

function sendNtfyNotification(title, message, topic) {
  try {
    var props = PropertiesService.getScriptProperties();
    var defaultTopic = props.getProperty('NTFY_TOPIC') || 'rf_workspace_pro_alerts';
    var targetTopic = topic || defaultTopic;
    var url = 'https://ntfy.sh/' + encodeURIComponent(targetTopic);
    
    var headers = {
      'Title': Utilities.base64Encode(Utilities.newBlob(title || 'RF Workspace Pro').getBytes(), Utilities.Charset.UTF_8),
      'Priority': 'default',
      'Tags': 'package,hammer_and_wrench'
    };
    
    UrlFetchApp.fetch(url, {
      method: 'post',
      payload: message || '',
      headers: headers,
      muteHttpExceptions: true
    });
    return { success: true };
  } catch (e) {
    Logger.log('Lỗi sendNtfyNotification: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

function api_saveNtfyConfig(config, pin) {
  var pinToAuth = pin || (config && config.pin);
  if (!pinToAuth) {
    return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để lưu cấu hình ntfy.sh!' };
  }
  var auth = validatePin(pinToAuth);
  if (!auth || !auth.valid) {
    return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  }
  if (!checkServerPermission(auth, 'SYSTEM_CONFIG')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Boss Tối Cao mới được sửa cấu hình ntfy.sh!' };
  }
  try {
    var props = PropertiesService.getScriptProperties();
    if (config && config.topic) {
      props.setProperty('NTFY_TOPIC', config.topic.trim());
    }
    return { success: true, message: 'Đã lưu cấu hình ntfy.sh thành công!' };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function api_getNtfyConfig() {
  try {
    var props = PropertiesService.getScriptProperties();
    var topic = props.getProperty('NTFY_TOPIC') || 'rf_workspace_pro_alerts';
    return { success: true, config: { topic: topic } };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function uploadDocumentToDrive(base64Data, fileName, mimeType) {
  try {
    if (!base64Data) { throw new Error("Dữ liệu file (base64) bị thiếu"); }
    let data = base64Data;
    if (base64Data.indexOf(",") > -1) { data = base64Data.split(",")[1]; }
    if (!data) { throw new Error("Không thể tách dữ liệu base64"); }
    const blob = Utilities.newBlob(Utilities.base64Decode(data), mimeType || "application/octet-stream", fileName);
    const file = DriveApp.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const previewUrl = file.getUrl().replace(/\/view.*$/, '/preview');
    return previewUrl;
  } catch (e) {
    console.error("Lỗi uploadDocumentToDrive:", e);
    throw new Error("Lỗi tải file lên Drive: " + e.message);
  }
}

function api_getActiveEmployees() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Config_NhanSu');
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  const headers = data[0];
  const nameIdx = headers.indexOf('Tên Nhân Sự');
  if (nameIdx === -1) return [];

  let employees = [];
  for (let i = 1; i < data.length; i++) {
    let name = data[i][nameIdx];
    if (name && name.toString().trim() !== "") {
      employees.push(name.toString().trim());
    }
  }
  return employees;
}

function processOCR(base64Data) {
  try {
    var boundary = "xxxxxxxxxx";
    var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), "application/pdf", "temp_ocr.pdf");

    var metadata = {
      title: 'temp_ocr_doc',
      mimeType: 'application/pdf'
    };

    var requestBody = Utilities.newBlob(
      "--" + boundary + "\r\n" +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) + "\r\n" +
      "--" + boundary + "\r\n" +
      "Content-Type: application/pdf\r\n\r\n"
    ).getBytes().concat(blob.getBytes()).concat(Utilities.newBlob("\r\n--" + boundary + "--\r\n").getBytes());

    var url = "https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart&ocr=true&ocrLanguage=vi";
    var options = {
      method: "post",
      contentType: "multipart/related; boundary=" + boundary,
      headers: {
        Authorization: "Bearer " + ScriptApp.getOAuthToken()
      },
      payload: requestBody,
      muteHttpExceptions: true
    };

    var response = UrlFetchApp.fetch(url, options);
    var resText = response.getContentText();
    var resJson = JSON.parse(resText);

    if (resJson.error) {
      throw new Error(resJson.error.message);
    }

    var fileId = resJson.id;
    var doc = DocumentApp.openById(fileId);
    var text = doc.getBody().getText();

    // Delete temporary OCR file
    var deleteUrl = "https://www.googleapis.com/drive/v2/files/" + fileId;
    UrlFetchApp.fetch(deleteUrl, {
      method: "delete",
      headers: {
        Authorization: "Bearer " + ScriptApp.getOAuthToken()
      },
      muteHttpExceptions: true
    });

    return text;
  } catch (e) {
    console.error("Lỗi processOCR: " + e.toString());
    throw new Error("Lỗi phân tích OCR PDF: " + e.message);
  }
}


function isExportChannel(channelStr) {
  if (!channelStr) return false;
  var raw = String(channelStr).trim().toUpperCase();
  if (raw.indexOf('XUẤT KHẨU') !== -1 || raw.indexOf('EXPORT') !== -1 || raw.indexOf('QUỐC TẾ') !== -1 || raw.indexOf('INTERNATIONAL') !== -1 || raw.indexOf('GLOBAL') !== -1 || raw.indexOf('USD') !== -1) return true;
  if (/\b(MALAYSIA|THAILAND|PHILIPPINES|SINGAPORE|TAIWAN|USD)\b/i.test(raw)) return true;
  if (/\bSHOPEE\s*[-_]?\s*(TH|MA|MY|SG|TW|PH)\b/i.test(raw)) return true;
  if (/\b(SHOPEE_TH|SHOPEE_MA|SHOPEE_MY|SHOPEE_SG|SHOPEE_TW|SHOPEE_PH)\b/i.test(raw)) return true;
  if (/\b(MY|TH|PH|SG|TW|MA)\b/i.test(raw) && raw.indexOf('SHOPEE') !== -1) return true;
  return false;
}

function getSopAndRewardBackend(item, phaseName, kpiConfig, channel = '') {
  if (!item?.name || !kpiConfig?.length) { return { time: 30, reward: 0 }; }
  const rawName = String(item.name).toLowerCase().trim();
  const phase = String(phaseName || '').toLowerCase();
  const itemType = String(item.type || '').toUpperCase();
  const isLayoutItem = itemType === 'LAYOUT' || /rừng|layout|đảo|bonsai|trang|cover|nature|suối|vách|hẻm|núi|cầu|thác|hang|tiểu cảnh/i.test(rawName);

  let matchedRow = kpiConfig.find(row => {
    const sku = String(row['Từ Khoá'] || '').toLowerCase().trim();
    const name = String(row['Tên Hàng'] || '').toLowerCase().trim();
    if (sku && rawName.includes(sku)) return true;
    if (name && (rawName === name || rawName.includes(name))) return true;
    return false;
  });

  if (!matchedRow && (rawName.includes('bể') || rawName.includes('terra')) && !isLayoutItem && !rawName.includes('combo') && !rawName.includes('setup')) {
    let reward = 0;
    let time = 30;
    if (phase.includes('phase1') || phase.includes('cắt') || phase.includes('dán') || phase.includes('dựng') || phase.includes('khâu 1') || phase === 'v1') {
      reward = 5000;
    } else if (phase.includes('phase2') || phase.includes('gọt') || phase.includes('keo') || phase.includes('gia cố') || phase.includes('khâu 2') || phase === 'v2') {
      reward = 2000;
    } else if (phase.includes('đóng gói') || phase.includes('pack')) {
      reward = 2000;
    }
    if (isExportChannel(channel)) reward *= 3;
    return { time, reward };
  }

  if (!matchedRow && isLayoutItem) {
    const sizeMatch = rawName.match(/size\s*(\d{2,3})|(\d{2,3})[x×]/);
    const size = sizeMatch ? parseInt(sizeMatch[1] || sizeMatch[2]) : 0;

    if (size > 0) {
      matchedRow = kpiConfig.find(row => {
        const rowGroup = String(row['Nhóm Hàng'] || '').toUpperCase().trim();
        if (rowGroup && !rowGroup.includes('LAYOUT')) return false;

        const rowName = String(row['Tên Hàng'] || '').toLowerCase();
        if (size >= 130) return rowName.includes('130');
        if (size >= 110) return rowName.includes('110') || rowName.includes('120');
        if (size >= 90) return rowName.includes('90') || rowName.includes('100');
        if (size >= 70) return rowName.includes('70') || rowName.includes('80');
        if (size >= 60) return rowName.includes('60');
        if (size >= 50) return rowName.includes('50');
        if (size >= 40) return rowName.includes('40');
        if (size >= 30) return rowName.includes('30');
        if (size > 0) return rowName.includes('20') || rowName.includes('15');
        return false;
      });
    }
  }

  if (!matchedRow) {
    const specialKeywords = ['rồng', 'đại bàng', 'phượng hoàng', 'cá voi', 'khủng long', 'tê giác'];
    if (specialKeywords.some(kw => rawName.includes(kw))) {
      matchedRow = kpiConfig.find(row =>
        String(row['Tên Hàng'] || '').toLowerCase().includes('đặc biệt') || String(row['Tên Hàng'] || '').toLowerCase().includes('special')
      );
    }
  }

  if (!matchedRow) return { time: 30, reward: 0 };

  let reward = 0;
  if (phase.includes('phase1') || phase.includes('cắt') || phase.includes('dán') || phase.includes('dựng') || phase.includes('khâu 1')) {
    reward = Number(matchedRow['Tiền Khâu 1']) || 0;
  }
  else if (phase.includes('phase2') || phase.includes('gọt') || phase.includes('keo') || phase.includes('gia cố') || phase.includes('khâu 2')) {
    reward = Number(matchedRow['Tiền Khâu 2']) || 0;
  }
  else if (phase.includes('đóng gói') || phase.includes('pack')) {
    reward = Number(matchedRow['Thưởng Đóng Gói']) || Number(matchedRow['Tiền Đóng Gói']) || 0;
  }

  if (isExportChannel(channel)) {
    reward *= 3;
  }

  return { time: 30, reward };
}


function getPackingReward(itemInput, kpiConfig, channel) {
  channel = channel || '';
  kpiConfig = kpiConfig || [];
  const mult = /SG|MY|TH|PH|MA|TW|Quốc Tế|Xuất Khẩu/i.test(channel) ? 3 : 1;
  if (!kpiConfig || kpiConfig.length === 0) return 0;

  var namesToScan = [];
  function addNameOrSku(val) {
    if (!val) return;
    if (typeof val === 'string') {
      var trimmed = val.trim();
      if (!trimmed || trimmed === '[object Object]') return;
      if (trimmed.indexOf('[') === 0 || trimmed.indexOf('{') === 0) {
        try {
          var parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            for (var p = 0; p < parsed.length; p++) addNameOrSku(parsed[p]);
          } else if (typeof parsed === 'object') {
            addNameOrSku(parsed.name);
            addNameOrSku(parsed.sku);
          }
          return;
        } catch (e) {}
      }
      var splitNames = trimmed.split(/[\n,;+]/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (splitNames.length > 1) {
        for (var sn = 0; sn < splitNames.length; sn++) {
          if (splitNames[sn] && splitNames[sn] !== '[object Object]') namesToScan.push(splitNames[sn]);
        }
      } else {
        namesToScan.push(trimmed);
      }
    } else if (typeof val === 'object') {
      if (val.name) addNameOrSku(String(val.name));
      if (val.sku) addNameOrSku(String(val.sku));
    }
  }

  if (Array.isArray(itemInput)) {
    for (var ii = 0; ii < itemInput.length; ii++) addNameOrSku(itemInput[ii]);
  } else if (itemInput && typeof itemInput === 'object') {
    if (itemInput.items && Array.isArray(itemInput.items)) {
      for (var it = 0; it < itemInput.items.length; it++) addNameOrSku(itemInput.items[it]);
    }
    if (itemInput.products) addNameOrSku(itemInput.products);
    if (itemInput.accessories) addNameOrSku(itemInput.accessories);
    if (itemInput.name) addNameOrSku(itemInput.name);
    if (itemInput.sku) addNameOrSku(itemInput.sku);
  } else if (typeof itemInput === 'string') {
    addNameOrSku(itemInput);
  }

  if (namesToScan.length === 0) {
    var defaultRow = null;
    for (var d = 0; d < kpiConfig.length; d++) {
      var n = String(kpiConfig[d]['Tên Hàng'] || kpiConfig[d]['Nhóm Hàng'] || kpiConfig[d]['Từ Khoá'] || '').toLowerCase();
      if (n.indexOf('mặc định') > -1 || n.indexOf('đơn thường') > -1 || n.indexOf('khác') > -1 || n.indexOf('phụ kiện') > -1) {
        defaultRow = kpiConfig[d];
        break;
      }
    }
    var defReward = defaultRow ? (Number(defaultRow['Thưởng Đóng Gói']) || Number(defaultRow['Tiền Đóng Gói']) || 0) : 0;
    return defReward * mult;
  }

  var maxReward = 0;

  for (var k = 0; k < namesToScan.length; k++) {
    var lowerName = namesToScan[k].toLowerCase().trim();
    if (!lowerName) continue;

    var matchedRow = null;
    for (var r = 0; r < kpiConfig.length; r++) {
      var row = kpiConfig[r];
      var sku = String(row['Từ Khoá'] || '').toLowerCase().trim();
      var name = String(row['Tên Hàng'] || '').toLowerCase().trim();
      if (sku && (lowerName.indexOf(sku) > -1 || sku === lowerName)) { matchedRow = row; break; }
      if (name && (lowerName.indexOf(name) > -1 || name === lowerName)) { matchedRow = row; break; }
    }

    if (!matchedRow) {
      var sizeMatch = lowerName.match(/size\s*(\d{2,3})|(\d{2,3})\s*(x|×|\*|cm|\s|$)/i);
      var size = sizeMatch ? parseInt(sizeMatch[1] || sizeMatch[2]) : 0;
      if (size > 0) {
        for (var s = 0; s < kpiConfig.length; s++) {
          var rowS = kpiConfig[s];
          var rowName = String(rowS['Tên Hàng'] || rowS['Từ Khoá'] || '').toLowerCase();
          if (size >= 130 && (rowName.indexOf('130') > -1 || rowName.indexOf('140') > -1 || rowName.indexOf('150') > -1)) { matchedRow = rowS; break; }
          if (size >= 110 && (rowName.indexOf('110') > -1 || rowName.indexOf('120') > -1)) { matchedRow = rowS; break; }
          if (size >= 90 && (rowName.indexOf('90') > -1 || rowName.indexOf('100') > -1)) { matchedRow = rowS; break; }
          if (size >= 70 && (rowName.indexOf('70') > -1 || rowName.indexOf('80') > -1)) { matchedRow = rowS; break; }
          if (size >= 60 && rowName.indexOf('60') > -1) { matchedRow = rowS; break; }
          if (size >= 50 && rowName.indexOf('50') > -1) { matchedRow = rowS; break; }
          if (size >= 40 && rowName.indexOf('40') > -1) { matchedRow = rowS; break; }
          if (size >= 30 && rowName.indexOf('30') > -1) { matchedRow = rowS; break; }
          if (size >= 20 && rowName.indexOf('20') > -1) { matchedRow = rowS; break; }
          if (size >= 10 && (rowName.indexOf('10') > -1 || rowName.indexOf('15') > -1)) { matchedRow = rowS; break; }
        }
      }
    }

    if (!matchedRow) {
      if (lowerName.indexOf('bể') > -1 || lowerName.indexOf('hồ') > -1 || lowerName.indexOf('kính') > -1 || lowerName.indexOf('tank') > -1) {
        for (var b = 0; b < kpiConfig.length; b++) {
          var grpB = String(kpiConfig[b]['Nhóm Hàng'] || kpiConfig[b]['Tên Hàng'] || '').toLowerCase();
          if (grpB.indexOf('bể') > -1 || grpB.indexOf('kính') > -1 || grpB.indexOf('tank') > -1) { matchedRow = kpiConfig[b]; break; }
        }
      } else if (lowerName.indexOf('layout') > -1 || lowerName.indexOf('rừng') > -1 || lowerName.indexOf('bonsai') > -1 || lowerName.indexOf('núi') > -1 || lowerName.indexOf('hang') > -1) {
        for (var l = 0; l < kpiConfig.length; l++) {
          var grpL = String(kpiConfig[l]['Nhóm Hàng'] || kpiConfig[l]['Tên Hàng'] || '').toLowerCase();
          if (grpL.indexOf('layout') > -1 || grpL.indexOf('rừng') > -1 || grpL.indexOf('bonsai') > -1) { matchedRow = kpiConfig[l]; break; }
        }
      }
    }

    if (matchedRow) {
      var itemReward = Number(matchedRow['Thưởng Đóng Gói']) || Number(matchedRow['Tiền Đóng Gói']) || 0;
      if (itemReward > maxReward) maxReward = itemReward;
    }
  }

  if (maxReward === 0) {
    for (var f = 0; f < kpiConfig.length; f++) {
      var fbRow = kpiConfig[f];
      var fbRew = Number(fbRow['Thưởng Đóng Gói']) || Number(fbRow['Tiền Đóng Gói']) || 0;
      if (fbRew > 0) { maxReward = fbRew; break; }
    }
  }

  return maxReward * mult;
}




function logBehavior(action, details) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet(); const sheet = ss.getSheetByName("Tracking_Log");
    if (sheet) { sheet.appendRow([new Date(), action, details]); }
  } catch (e) { }
}

/**
 * API Hộp Đen Đối Soát: Lấy toàn bộ nhật ký thao tác thợ từ bảng Tracking_Log trên Server
 * Chỉ dành riêng cho phân quyền Quản lý / Boss Tối Cao
 */
function api_getWorkerAuditLogs(payload) {
  var pin = (payload && payload.pin) || payload;
  var auth = validatePin(pin);
  if (!auth || !auth.valid) return { success: false, message: 'Xác thực mã PIN thất bại!' };

  var role = String(auth.role || '').toUpperCase();
  if (!auth.isBoss && !auth.isAdmin && role !== 'TỐI CAO' && role !== 'ADMIN' && !role.includes('QUẢN LÝ')) {
    return { success: false, message: 'Chỉ Boss Tối Cao và Quản Lý mới có quyền xem Hộp Đen Đối Soát!' };
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, vui lòng thử lại sau!' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Tracking_Log');
    if (!sheet) return { success: true, logs: [] };

    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, logs: [] };

    // Lấy tối đa 500 dòng mới nhất để tránh nghẽn payload
    var startRow = Math.max(2, lastRow - 499);
    var numRows = lastRow - startRow + 1;
    var values = sheet.getRange(startRow, 1, numRows, 5).getValues();

    var sevenDaysCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime();
    var serverLogs = [];
    for (var i = values.length - 1; i >= 0; i--) {
      var row = values[i];
      var timeRaw = row[0];
      var user = row[1];
      var action = row[2];
      var aiCol = row[3];
      var note = row[4];

      if (!user && !action) continue;

      var timeMs = 0;
      var formattedTime = "";
      if (timeRaw instanceof Date) {
        timeMs = timeRaw.getTime();
        formattedTime = Utilities.formatDate(timeRaw, Session.getScriptTimeZone() || "GMT+7", "yyyy-MM-dd HH:mm:ss");
      } else {
        formattedTime = String(timeRaw || "");
        timeMs = new Date(formattedTime.replace(/-/g, '/')).getTime() || 0;
      }

      // Chỉ hiển thị dữ liệu trong 7 ngày gần nhất
      if (timeMs > 0 && timeMs < sevenDaysCutoff) {
        continue;
      }

      var isOnline = !String(aiCol || '').toLowerCase().includes('offline');

      // Phân tích ghi chú và tên hàng từ action / note
      var itemName = '';
      var orderId = '';
      var actionType = String(action || '');

      // Trích xuất đơn hàng nếu có trong action: "Hoàn thành Khâu 1 - Bể Kính (#ORD_123)"
      var orderMatch = actionType.match(/\((#[^)]+)\)/);
      if (orderMatch && orderMatch[1]) {
        orderId = orderMatch[1].replace('#', '');
      }

      // Trích xuất thưởng nếu có
      var rewardMatch = String(note || '').match(/\+([0-9.,]+)đ/);
      var rewardVal = rewardMatch ? Number(rewardMatch[1].replace(/\./g, '').replace(/,/g, '')) : 0;

      // Trích xuất thiết bị
      var devMatch = String(note || '').match(/Thiết bị:\s*([^|]+)/i);
      var device = devMatch ? devMatch[1].trim() : 'Máy tính/ĐT';

      serverLogs.push({
        id: 'SRV_' + startRow + '_' + i + '_' + (timeRaw instanceof Date ? timeRaw.getTime() : i),
        time: formattedTime,
        user: String(user || '').trim(),
        action: actionType,
        phaseName: '',
        itemName: actionType,
        orderId: orderId,
        reward: rewardVal,
        note: String(note || ''),
        isOnline: isOnline,
        device: device,
        source: 'server'
      });
    }

    return {
      success: true,
      logs: serverLogs
    };
  } catch (err) {
    return { success: false, message: 'Lỗi nạp Hộp Đen Server: ' + err.message };
  } finally {
    try { lock.releaseLock(); } catch (e) { }
  }
}

// =========================================================================
// HỆ THỐNG TỰ ĐỘNG QUÉT EMAIL VÀ ĐỐI SOÁT GIAO DỊCH TÀI CHÍNH (CASHFLOW)
// =========================================================================
function scanAutoEmails() {
  var lock = LockService.getScriptLock();
  try {
    // Đảm bảo đồng bộ hóa ghi đè đồng thời trên Google Sheets
    lock.waitLock(30000);

    var queries = [
      'is:unread from:cskh@ghn.vn subject:"thông báo thông tin chuyển tiền"',
      'is:unread from:info@mail.spxexpress.com subject:"biên bản trả hàng"',
      'is:unread subject:"biến động số dư"',
      'is:unread subject:"giao dịch"',
      'is:unread subject:"vietcombank"',
      'is:unread subject:"techcombank"',
      'is:unread subject:"mbbank"',
      'is:unread subject:"tpbank"',
      'is:unread subject:"acb"',
      'is:unread subject:"vpbank"'
    ];

    var threads = [];
    queries.forEach(function (query) {
      var found = GmailApp.search(query, 0, 10);
      threads = threads.concat(found);
    });

    if (threads.length === 0) return;

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Transactions');
    if (!sheet) {
      sheet = ss.insertSheet('Transactions');
      sheet.appendRow(SCHEMA_ERP.Transactions);
      sheet.setFrozenRows(1);
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0] || SCHEMA_ERP.Transactions;

    var txIds = {};
    for (var i = 1; i < data.length; i++) {
      var rowId = String(data[i][0]);
      if (rowId) txIds[rowId] = true;
    }

    var accountsSheet = ss.getSheetByName('Accounts');
    var accounts = accountsSheet ? accountsSheet.getDataRange().getValues() : [];

    threads.forEach(function (thread) {
      var messages = thread.getMessages();
      messages.forEach(function (message) {
        if (!message.isUnread()) return;

        var body = message.getPlainBody();
        var subject = message.getSubject();
        var date = message.getDate();
        var messageId = message.getId();
        var sender = message.getFrom();

        // Chống trùng lặp email đã xử lý
        if (txIds[messageId]) {
          message.markRead();
          return;
        }

        // Xử lý email đối soát từ GHN
        if (sender.toLowerCase().indexOf('cskh@ghn.vn') !== -1 && subject.toLowerCase().indexOf('thông báo thông tin chuyển tiền') !== -1) {
          processGHNEmail(subject, body, date, messageId, ss, sheet, headers, accounts);
          message.markRead();
          return;
        }

        // Xử lý email hoàn hàng từ SPX
        if (sender.toLowerCase().indexOf('spxexpress.com') !== -1 && subject.toLowerCase().indexOf('biên bản trả hàng') !== -1) {
          processSPXReturnEmail(message, ss);
          message.markRead();
          return;
        }

        var parsed = parseTransactionFromEmail(subject, body, date);
        if (parsed && parsed.amount > 0) {
          parsed.id = messageId;
          parsed.isAuto = "TRUE";

          // Tìm ID tài khoản quỹ tương ứng
          var accountName = parsed.accountName;
          var matchedAccountId = "";
          if (accountName && accounts.length > 1) {
            for (var a = 1; a < accounts.length; a++) {
              var accNameInSheet = String(accounts[a][1] || '').trim().toLowerCase();
              if (accNameInSheet.indexOf(accountName.toLowerCase()) !== -1) {
                matchedAccountId = accounts[a][0];
                break;
              }
            }
          }
          if (!matchedAccountId && accounts.length > 1) {
            matchedAccountId = accounts[1][0]; // Fallback tài khoản đầu tiên
          }

          if (parsed.type === "Thu") {
            parsed.toAccount = matchedAccountId;
            parsed.fromAccount = "";
          } else {
            parsed.fromAccount = matchedAccountId;
            parsed.toAccount = "";
          }

          var newRow = headers.map(function (h) {
            var val = parsed[h];
            if (typeof val === 'number' && isNaN(val)) return 0;
            return val !== undefined ? val : '';
          });

          sheet.appendRow(newRow);
          updateAccountBalance(ss, matchedAccountId, parsed.amount, parsed.type);
          txIds[messageId] = true;
        }

        // Đánh dấu đã đọc
        message.markRead();
      });
    });

    var props = PropertiesService.getScriptProperties();
    props.setProperty('RF_LAST_UPDATED', new Date().getTime().toString());
    SpreadsheetApp.flush();
  } catch (e) {
    console.error("Lỗi scanAutoEmails: " + e.toString());
    logBehavior("ERROR_SCAN_EMAILS", e.toString());
  } finally {
    lock.releaseLock();
  }
}

function parseTransactionFromEmail(subject, body, emailDate) {
  var content = body.replace(/\s+/g, ' ');
  var type = "Thu";
  var amount = 0;
  var note = "";
  var accountName = "";

  var text = (subject + " " + content).toLowerCase();

  // Xác định tài khoản
  if (/vietcombank/i.test(subject) || /vcb/i.test(content)) accountName = "Vietcombank";
  else if (/techcombank/i.test(subject) || /tcb/i.test(content)) accountName = "Techcombank";
  else if (/mbbank/i.test(subject) || /mb/i.test(content)) accountName = "MB Bank";
  else if (/tpbank/i.test(subject) || /tpb/i.test(content)) accountName = "TPBank";
  else if (/acb/i.test(subject)) accountName = "ACB";
  else if (/vpbank/i.test(subject)) accountName = "VPBank";
  else accountName = "Quỹ Chính";

  // Xác định dòng tiền Thu hay Chi
  if (text.indexOf('-') !== -1 ||
    /ghi nợ/i.test(text) ||
    /chuyển khoản đi/i.test(text) ||
    /trừ tiền/i.test(text) ||
    /thanh toán/i.test(text) ||
    /debit/i.test(text) ||
    /rút tiền/i.test(text)) {
    type = "Chi";
  }

  if (text.indexOf('+') !== -1 ||
    /ghi có/i.test(text) ||
    /cộng tiền/i.test(text) ||
    /nhận tiền/i.test(text) ||
    /chuyển khoản đến/i.test(text) ||
    /credit/i.test(text)) {
    type = "Thu";
  }

  // Quét tìm số tiền
  var p1 = /([+-])\s*([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,})\s*(?:vnd|đ|d|dong)?/i;
  var m1 = text.match(p1);
  if (m1) {
    if (m1[1] === '-') type = "Chi";
    else if (m1[1] === '+') type = "Thu";
    amount = Number(m1[2].replace(/[.,]/g, ''));
  } else {
    var p2 = /(?:ghi có|ghi no|ghi nợ|ghi co|số tiền|so tien|amount|biến động|bien dong|giao dịch|gd)\s*[:\-]?\s*([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,})/i;
    var m2 = text.match(p2);
    if (m2) {
      amount = Number(m2[1].replace(/[.,]/g, ''));
    } else {
      var p3 = /([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,})\s*(?:vnd|đ|d|dong)/i;
      var m3 = text.match(p3);
      if (m3) {
        amount = Number(m3[1].replace(/[.,]/g, ''));
      }
    }
  }

  // Trích xuất nội dung giao dịch
  var noteRegex = /(?:nội dung|nội dung gd|nội dung giao dịch|nd|nd gd|mô tả|ly do|lý do|nội dung ck|noidung)\s*[:\-]?\s*([^.]+)/i;
  var matchNote = content.match(noteRegex);
  if (matchNote && matchNote[1]) {
    note = matchNote[1].trim();
  } else {
    note = subject;
  }

  if (note.length > 200) note = note.substring(0, 200) + "...";
  var category = classifyCategory(type, note);

  var dateStr = Utilities.formatDate(emailDate || new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  return {
    type: type,
    category: category,
    amount: amount,
    title: note || "Giao dịch tự động",
    date: dateStr,
    note: "Email Auto: " + note,
    accountName: accountName
  };
}

function processGHNEmail(subject, plainBody, emailDate, messageId, ss, txSheet, txHeaders, accounts) {
  try {
    var amountMatch = plainBody.match(/(?:Số tiền thực chuyển|Thực chuyển).*?([0-9]{1,3}(?:[.,][0-9]{3})+)/i);
    var totalAmount = amountMatch ? Number(amountMatch[1].replace(/[.,]/g, '')) : 0;

    var feeMatch = plainBody.match(/(?:Phí chuyển khoản).*?([0-9]{1,3}(?:[.,][0-9]{3})+)/i);
    var feeAmount = feeMatch ? Number(feeMatch[1].replace(/[.,]/g, '')) : 0;

    if (totalAmount <= 0) return;

    var ordersSheet = ss.getSheetByName('Orders');
    if (!ordersSheet) return;

    var ordersData = ordersSheet.getDataRange().getValues();
    var ordersHeaders = ordersData[0];

    var idIndex = ordersHeaders.indexOf('id');
    var codeIndex = ordersHeaders.indexOf('orderCode');
    var statusIndex = ordersHeaders.indexOf('status');

    if (idIndex === -1 || codeIndex === -1 || statusIndex === -1) return;

    var matchedOrders = [];
    var updatedRows = [];

    for (var i = 1; i < ordersData.length; i++) {
      var status = String(ordersData[i][statusIndex] || '');
      if (status !== 'Hoàn Thành' && status !== 'Đã Huỷ') {
        var orderCode = String(ordersData[i][codeIndex] || '');
        var mvdMatch = orderCode.match(/MVĐ:\s*([A-Za-z0-9]+)/i);
        var trackingCode = mvdMatch ? mvdMatch[1] : null;

        if (trackingCode && trackingCode.length >= 5 && plainBody.indexOf(trackingCode) !== -1) {
          matchedOrders.push({ code: trackingCode, fullCode: orderCode });
          updatedRows.push(i + 1);
        }
      }
    }

    if (matchedOrders.length > 0) {
      updatedRows.forEach(function (rowNum) {
        ordersSheet.getRange(rowNum, statusIndex + 1).setValue('Hoàn Thành');
      });

      var matchedAccountId = "";
      if (accounts && accounts.length > 1) {
        for (var a = 1; a < accounts.length; a++) {
          if (String(accounts[a][1] || '').toLowerCase().indexOf('bidv') !== -1) {
            matchedAccountId = accounts[a][0]; break;
          }
        }
        if (!matchedAccountId) matchedAccountId = accounts[1][0];
      }

      var dateStr = Utilities.formatDate(emailDate || new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      var joinedCodes = matchedOrders.map(function (m) { return m.code; }).join(', ');
      if (joinedCodes.length > 200) joinedCodes = joinedCodes.substring(0, 197) + "...";

      var txObj = {
        id: messageId,
        type: "Thu",
        category: "Doanh Thu Bán Hàng",
        amount: totalAmount,
        fromAccount: "",
        toAccount: matchedAccountId,
        title: "Đối soát GHN " + matchedOrders.length + " đơn",
        date: dateStr,
        note: "Các mã vận đơn: " + joinedCodes,
        isAuto: "TRUE"
      };

      var newRow = txHeaders.map(function (h) { return txObj[h] !== undefined ? txObj[h] : ''; });
      txSheet.appendRow(newRow);
      if (typeof updateAccountBalance === 'function') updateAccountBalance(ss, matchedAccountId, totalAmount, "Thu");

      if (feeAmount > 0) {
        var feeObj = {
          id: messageId + "_FEE",
          type: "Chi",
          category: "Phí Vận Hành",
          amount: feeAmount,
          fromAccount: matchedAccountId,
          toAccount: "",
          title: "Phí chuyển khoản GHN",
          date: dateStr,
          note: "Trừ phí đối soát",
          isAuto: "TRUE"
        };
        var feeRow = txHeaders.map(function (h) { return feeObj[h] !== undefined ? feeObj[h] : ''; });
        txSheet.appendRow(feeRow);
        if (typeof updateAccountBalance === 'function') updateAccountBalance(ss, matchedAccountId, feeAmount, "Chi");
      }
    }
  } catch (e) {
    console.error("Lỗi processGHNEmail: " + e.toString());
  }
}

function processSPXReturnEmail(message, ss) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    console.error("Hệ thống đang bận, bỏ qua lượt quét SPX Return Email:", e);
    return;
  }
  try {
    if (typeof Drive === 'undefined' || typeof Drive.Files === 'undefined') {
      console.error("Vui lòng bật Drive API (v2 hoặc v3) trong phần Services của Apps Script để dùng OCR đọc PDF!");
      return;
    }

    var attachments = message.getAttachments();
    var pdfBlob = null;
    for (var i = 0; i < attachments.length; i++) {
      if (attachments[i].getContentType() === 'application/pdf') {
        pdfBlob = attachments[i];
        break;
      }
    }

    if (!pdfBlob) return;

    // Tải lên Drive dạng Google Doc để lấy text (OCR)
    var docFile;
    if (typeof Drive.Files.insert === 'function') {
      var resource = {
        title: pdfBlob.getName(),
        mimeType: pdfBlob.getContentType()
      };
      docFile = Drive.Files.insert(resource, pdfBlob, { ocr: true });
    } else if (typeof Drive.Files.create === 'function') {
      var resource = {
        name: pdfBlob.getName(),
        mimeType: 'application/vnd.google-apps.document'
      };
      docFile = Drive.Files.create(resource, pdfBlob);
    } else {
      console.error("Vui lòng sử dụng Drive API v2");
      return;
    }

    var doc = DocumentApp.openById(docFile.id);
    var fullText = doc.getBody().getText();

    // Xoá file doc tạm trên Drive
    if (typeof Drive.Files.remove === 'function') Drive.Files.remove(docFile.id);
    else if (typeof Drive.Files.trash === 'function') Drive.Files.trash(docFile.id);

    // Trích xuất mã SPXVN
    var spxMatches = fullText.match(/SPXVN[0-9]{10,15}/gi);
    if (!spxMatches || spxMatches.length === 0) return;

    var ordersSheet = ss.getSheetByName('Orders');
    if (!ordersSheet) return;

    var ordersData = ordersSheet.getDataRange().getValues();
    var headers = ordersData[0];

    var codeIndex = headers.indexOf('orderCode');
    var statusIndex = headers.indexOf('status');

    if (codeIndex === -1 || statusIndex === -1) return;

    var idIndex = headers.indexOf('id');
    var isCarriedIndex = headers.indexOf('isCarriedToWH');

    var packingsSheet = ss.getSheetByName('Packings');
    var packingsData = packingsSheet ? packingsSheet.getDataRange().getValues() : [];
    var pHeaders = packingsData.length > 0 ? packingsData[0] : [];
    var pOrderIdIdx = pHeaders.indexOf('orderId');
    var pStatusIdx = pHeaders.indexOf('status');

    var updatedRows = [];
    var matchedCodes = [];

    for (var j = 1; j < ordersData.length; j++) {
      var currentStatus = String(ordersData[j][statusIndex] || '');
      var currentStatusUpper = currentStatus.toUpperCase().trim();

      if (currentStatusUpper !== 'HÀNG HOÀN' && normalizeStatus(currentStatusUpper) !== 'Đơn Huỷ') {
        var orderCode = String(ordersData[j][codeIndex] || '');
        var orderId = idIndex !== -1 ? String(ordersData[j][idIndex] || '') : orderCode;

        for (var k = 0; k < spxMatches.length; k++) {
          var spxCode = spxMatches[k];
          if (orderCode.indexOf(spxCode) !== -1) {
            // Kiểm tra xem đơn đã được đóng gói hoặc giao đi chưa
            var isPacked = false;
            if (pOrderIdIdx !== -1 && packingsData.length > 1) {
              for (var p = 1; p < packingsData.length; p++) {
                if (String(packingsData[p][pOrderIdIdx]).trim() === orderId.trim()) {
                  var pSt = pStatusIdx !== -1 ? String(packingsData[p][pStatusIdx] || '').toUpperCase() : '';
                  if (pSt === 'DONE' || pSt === 'HOÀN THÀNH' || pSt === 'ĐÃ XONG') {
                    isPacked = true;
                    break;
                  }
                }
              }
            }

            var isHandedOver = ['ĐÃ BÀN GIAO', 'CHỜ BÀN GIAO', 'ĐÃ ĐÓNG GÓI'].indexOf(currentStatusUpper) > -1 || (isCarriedIndex !== -1 && (ordersData[j][isCarriedIndex] === true || String(ordersData[j][isCarriedIndex]).toUpperCase() === 'TRUE'));

            var targetStatus = (isPacked || isHandedOver) ? 'Hàng Hoàn' : 'Đơn Huỷ';

            updatedRows.push({ rowNum: j + 1, targetStatus: targetStatus, orderId: orderId });
            matchedCodes.push(spxCode + '➔' + targetStatus);
            break;
          }
        }
      }
    }

    if (updatedRows.length > 0) {
      updatedRows.forEach(function (item) {
        ordersSheet.getRange(item.rowNum, statusIndex + 1).setValue(item.targetStatus);
        processCascadeCancelOrder(item.orderId, item.targetStatus === 'Hàng Hoàn');
      });
      console.log("Đã tự động phân loại " + updatedRows.length + " đơn từ SPX Email: " + matchedCodes.join(', '));
    }

  } catch (e) {
    console.error("Lỗi processSPXReturnEmail: " + e.toString());
  } finally {
    lock.releaseLock();
  }
}

function classifyCategory(type, title) {
  var t = String(title).toLowerCase();
  if (type === "Chi") {
    if (t.indexOf("lương") !== -1 || t.indexOf("luong") !== -1) return "Trả Lương";
    if (t.indexOf("nguyên liệu") !== -1 || t.indexOf("nguyen lieu") !== -1 || t.indexOf("vật liệu") !== -1 || t.indexOf("vat lieu") !== -1) return "Mua Nguyên Liệu";
    if (t.indexOf("vật tư") !== -1 || t.indexOf("vat tu") !== -1) return "Mua Vật Tư";
    if (t.indexOf("điện") !== -1 || t.indexOf("nước") !== -1 || t.indexOf("internet") !== -1 || t.indexOf("wifi") !== -1 || t.indexOf("hoá đơn") !== -1 || t.indexOf("hoa don") !== -1) return "Thanh Toán Hoá Đơn";
    if (t.indexOf("quảng cáo") !== -1 || t.indexOf("quang cao") !== -1 || t.indexOf("ads") !== -1 || t.indexOf("fb") !== -1 || t.indexOf("facebook") !== -1 || t.indexOf("marketing") !== -1) return "Quảng Cáo & Marketing";
    if (t.indexOf("thiết bị") !== -1 || t.indexOf("thiet bi") !== -1) return "Trang Thiết Bị";
    if (t.indexOf("máy móc") !== -1 || t.indexOf("may moc") !== -1 || t.indexOf("công cụ") !== -1 || t.indexOf("cong cu") !== -1) return "Máy Móc & Công Cụ";
    return "Chi Phí Khác";
  } else {
    if (t.indexOf("thu nợ") !== -1 || t.indexOf("thuno") !== -1 || t.indexOf("nợ khách") !== -1 || t.indexOf("no khach") !== -1) return "Thu Nợ Khách";
    if (t.indexOf("phế liệu") !== -1 || t.indexOf("phe lieu") !== -1) return "Bán Phế Liệu";
    if (t.indexOf("đầu tư") !== -1 || t.indexOf("dau tu") !== -1) return "Lợi Nhuận Đầu Tư";
    return "Doanh Thu Bán Hàng";
  }
}

function updateAccountBalance(ss, accountId, amount, type) {
  if (!accountId || !amount) return;
  var change = Number(amount) || 0;
  if (type === "Chi") change = -change;
  adjustAccountBalanceServer(ss, accountId, change);
}

function syncBIDVEmails() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, thử lại sau!' };
  }
  try {
    var query = 'bidvsmartbanking@bidv.com.vn is:unread';
    var threads = GmailApp.search(query, 0, 50);
    if (threads.length === 0) return { success: true, count: 0, message: 'Không có biến động số dư mới' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetTrans = ss.getSheetByName('Transactions');
    if (!sheetTrans) return { success: false, message: 'Chưa có sheet Transactions' };

    var sheetAccounts = ss.getSheetByName('Accounts');
    var accData = [];
    if (sheetAccounts) {
      accData = sheetAccounts.getDataRange().getValues();
    }

    var count = 0;

    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        var msg = messages[j];
        if (msg.isUnread()) {
          var body = msg.getPlainBody();

          var sourceMatch = body.match(/Tài khoản nguồn[^\d]*(\d+)/i) || body.match(/Debit account[^\d]*(\d+)/i);
          var amountMatch = body.match(/Số tiền giao dịch[^\d]*([\d,]+)/i) || body.match(/Transaction amount[^\d]*([\d,]+)/i);
          var benMatch = body.match(/Người thụ hưởng[^\w]*([^\n\r]+)/i) || body.match(/Beneficiary name[^\w]*([^\n\r]+)/i);
          var dateMatch = body.match(/Thời gian giao dịch[^\d]*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/i) || body.match(/Transaction time[^\d]*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/i);

          if (sourceMatch && amountMatch) {
            var debitAcc = sourceMatch[1].trim();
            var amountStr = amountMatch[1].replace(/,/g, '').trim();
            var amount = Number(amountStr);
            var beneficiary = benMatch ? benMatch[1].trim() : 'Không rõ';

            var fromAccountSearch = '';
            if (debitAcc === '8600428268') {
              fromAccountSearch = 'TÀI KHOẢN CÔNG TY';
            } else if (debitAcc === '2686688286') {
              fromAccountSearch = 'TÀI KHOẢN GIÁM ĐỐC';
            } else if (debitAcc === '4550900734') {
              msg.markRead();
              continue;
            } else {
              msg.markRead();
              continue;
            }

            var fromAccountId = '';
            var fromAccountRowIndex = -1;
            if (sheetAccounts && accData.length > 1) {
              for (var row = 1; row < accData.length; row++) {
                var accName = String(accData[row][1] || '').toUpperCase().trim();
                if (accName === fromAccountSearch || accName.includes(fromAccountSearch)) {
                  fromAccountId = accData[row][0]; // ID của tài khoản
                  fromAccountRowIndex = row;
                  break;
                }
              }
            }
            if (!fromAccountId) fromAccountId = fromAccountSearch; // Fallback

            var transId = Utilities.getUuid();
            var tDate = new Date();
            if (dateMatch) {
              var dateStr = dateMatch[1].trim();
              var parts = dateStr.split(' ');
              var dparts = parts[0].split('/');
              var tparts = parts[1].split(':');
              tDate = new Date(dparts[2], dparts[1] - 1, dparts[0], tparts[0], tparts[1], tparts[2]);
            }

            var newRow = [
              transId,
              'Chi',
              'Chuyển tiền',
              amount,
              fromAccountId,
              '',
              'Chuyển tiền: ' + beneficiary,
              tDate.toISOString(),
              'Tự động từ BIDV ' + debitAcc,
              true
            ];

            sheetTrans.appendRow(newRow);

            if (fromAccountRowIndex > 0) {
              var currentBal = Number(accData[fromAccountRowIndex][2]) || 0;
              var newBal = currentBal - amount;
              sheetAccounts.getRange(fromAccountRowIndex + 1, 3).setValue(newBal);
              accData[fromAccountRowIndex][2] = newBal;
            }
            count++;
          }
          msg.markRead();
        }
      }
    }
    return { success: true, count: count, message: 'Đã đồng bộ ' + count + ' giao dịch BIDV.' };
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// HÀM LƯU VÀ LẤY CẤU HÌNH GHN
// =========================================================================
function saveGHNConfig(token, shopId) {
  try {
    PropertiesService.getScriptProperties().setProperties({
      'GHN_API_TOKEN': token,
      'GHN_SHOP_ID': shopId
    });
    return { success: true, message: 'Đã lưu cấu hình GHN thành công!' };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function getGHNConfig() {
  var props = PropertiesService.getScriptProperties().getProperties();
  return {
    token: props['GHN_API_TOKEN'] || '5c588da0-1d0a-11ef-b3d7-824e1db0c320',
    shopId: props['GHN_SHOP_ID'] || '5478054'
  };
}

// =========================================================================
// HÀM ĐỒNG BỘ ĐỐI SOÁT GHN QUA API (PRODUCTION)
// =========================================================================
function syncGHNViaAPI() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    var config = getGHNConfig();
    if (!config.token || !config.shopId) {
      return { success: false, message: 'Bạn chưa cấu hình Token và Shop ID của GHN! Vui lòng vào Cấu Hình GHN để nhập trước.' };
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oSheet = ss.getSheetByName('Orders');
    if (!oSheet) return { success: false, message: 'Không tìm thấy sheet Orders' };

    var oData = oSheet.getDataRange().getValues();
    var headers = oData[0];
    var idCol = headers.indexOf('id');
    var codeCol = headers.indexOf('orderCode');
    var statusCol = headers.indexOf('status');
    var channelCol = headers.indexOf('channel');
    var codCol = headers.indexOf('cod');
    var custCol = headers.indexOf('customer');
    var respCol = headers.indexOf('responsibleUser');
    var updCol = headers.indexOf('updatedBy');
    var accCol = headers.indexOf('accessories');
    var noteCol = headers.indexOf('note');
    var feeServiceCol = headers.indexOf('feeService');
    var revCol = headers.indexOf('revenue');
    var isRecCol = headers.indexOf('isReconciled');
    var recAtCol = headers.indexOf('reconciledAt');
    var shippingCol = headers.indexOf('shippingMethod');

    if (idCol === -1 || codeCol === -1 || statusCol === -1) return { success: false, message: 'Sheet Orders thiếu cột chuẩn' };

    var ordersToSync = [];
    for (var i = 1; i < oData.length; i++) {
      var status = String(oData[i][statusCol] || '').trim();
      var code = String(oData[i][codeCol] || '').trim();
      var channel = String(oData[i][channelCol] || '').trim();
      var shipMethod = shippingCol !== -1 ? String(oData[i][shippingCol] || '').trim() : '';
      var accVal = accCol !== -1 ? String(oData[i][accCol] || '') : '';
      var noteVal = noteCol !== -1 ? String(oData[i][noteCol] || '') : '';
      var isReconciled = isRecCol !== -1 ? (oData[i][isRecCol] === true || String(oData[i][isRecCol] || '').toUpperCase().trim() === 'TRUE') : false;

      // Không quét các đơn đã đối soát thành công hoặc đã huỷ
      if (status === 'Đối Soát Thành Công' || status === 'Đơn Huỷ' || isReconciled) continue;

      // Tìm mã vận đơn trong accessories hoặc note hoặc orderCode (VD: GY8HRVBP, GY84GLCX, L38...)
      var trackingMatch = (accVal + ' ' + noteVal + ' ' + code).match(/(GY[0-9A-Z]{5,12}|GHN[0-9A-Z]{4,12}|L[0-9A-Z]{6,15})/i);
      var trackingCode = '';
      if (code.toUpperCase().startsWith('GHN') || code.toUpperCase().startsWith('GY')) {
        trackingCode = code;
      } else if (trackingMatch) {
        trackingCode = trackingMatch[0];
      }

      var isGHN = Boolean(trackingCode) ||
                  code.toUpperCase().startsWith('ORD_') ||
                  shipMethod.toUpperCase().includes('GHN') ||
                  channel.toUpperCase().includes('GHN') ||
                  channel.toUpperCase().includes('CTV') ||
                  channel.toUpperCase().includes('CỘNG TÁC VIÊN') ||
                  channel.toUpperCase().includes('BÁN LẺ') ||
                  accVal.toUpperCase().includes('GHN') ||
                  accVal.toUpperCase().includes('GY');

      if (isGHN && code.length >= 3) {
        ordersToSync.push({
          rowIndex: i + 1,
          code: code,
          trackingCode: trackingCode,
          id: oData[i][idCol],
          cod: Number(oData[i][codCol]) || 0,
          channel: channel,
          customer: custCol !== -1 ? oData[i][custCol] : '',
          responsibleUser: respCol !== -1 ? oData[i][respCol] : '',
          updatedBy: updCol !== -1 ? oData[i][updCol] : '',
          currentStatus: status
        });
      }
    }

    if (ordersToSync.length === 0) {
      return { success: true, count: 0, message: 'Hiện không có đơn hàng GHN nào đang chờ đồng bộ đối soát.' };
    }

    var countSuccess = 0;
    var deliveredCount = 0;
    var returnedCount = 0;
    var totalCOD = 0;
    var totalRevenue = 0;
    var financeTransactions = [];
    var ctvTransactionsToAppend = [];
    var nowIso = new Date().toISOString();

    var ghnHeaders = {
      'Token': String(config.token).trim(),
      'ShopId': String(config.shopId).trim(),
      'Content-Type': 'application/json'
    };

    for (var j = 0; j < ordersToSync.length; j++) {
      var item = ordersToSync[j];
      var ghnRes = null;

      // 1. Thử gọi API bằng trackingCode (Mã vận đơn) nếu có
      if (item.trackingCode) {
        var cleanTracking = item.trackingCode.replace(/[^a-zA-Z0-9]/g, '');
        try {
          var resp1 = UrlFetchApp.fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail', {
            method: 'post',
            headers: ghnHeaders,
            payload: JSON.stringify({ "order_code": cleanTracking }),
            muteHttpExceptions: true
          });
          if (resp1.getResponseCode() === 200) {
            var data1 = JSON.parse(resp1.getContentText());
            if (data1 && data1.code === 200 && data1.data) ghnRes = data1.data;
          }
        } catch(e1) {}
      }

      // 2. Nếu chưa tìm được, thử gọi bằng client_order_code (Mã đơn shop ORD_...)
      if (!ghnRes && item.code) {
        try {
          var resp2 = UrlFetchApp.fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail-by-client-code', {
            method: 'post',
            headers: ghnHeaders,
            payload: JSON.stringify({ "client_order_code": item.code }),
            muteHttpExceptions: true
          });
          if (resp2.getResponseCode() === 200) {
            var data2 = JSON.parse(resp2.getContentText());
            if (data2 && (data2.code === 200 || data2.code === '200') && data2.data) {
              ghnRes = data2.data;
            }
          }
        } catch(e2) {}
      }

      if (ghnRes) {
        var ghnStatus = String(ghnRes.status || '').toLowerCase().trim();
        var totalFee = Number(ghnRes.logistics_fee || ghnRes.total_fee || 0);
        var codAmount = Number(ghnRes.cod_amount || 0);
        var newStatus = '';
        var isDelivered = false;

        if (ghnStatus === 'delivered') {
          newStatus = 'Đối Soát Thành Công';
          isDelivered = true;
          deliveredCount++;
        } else if (ghnStatus.indexOf('return') !== -1 || ghnStatus === 'damage') {
          newStatus = 'Hàng Hoàn';
          returnedCount++;
        } else if (ghnStatus.indexOf('cancel') !== -1) {
          newStatus = 'Đơn Huỷ';
        } else if (ghnStatus.indexOf('deliver') !== -1 || ghnStatus.indexOf('picked') !== -1 || ghnStatus.indexOf('transport') !== -1) {
          newStatus = 'Đang Giao';
        }

        if (newStatus) {
          // Cập nhật trạng thái
          oSheet.getRange(item.rowIndex, statusCol + 1).setValue(newStatus);

          if (isRecCol !== -1 && (newStatus === 'Đối Soát Thành Công' || newStatus === 'Hàng Hoàn')) {
            oSheet.getRange(item.rowIndex, isRecCol + 1).setValue(true);
          }
          if (recAtCol !== -1 && (newStatus === 'Đối Soát Thành Công' || newStatus === 'Hàng Hoàn')) {
            oSheet.getRange(item.rowIndex, recAtCol + 1).setValue(nowIso);
          }

          if (isDelivered) {
            countSuccess++;
            totalCOD += codAmount;

            if (codCol !== -1 && codAmount > 0) oSheet.getRange(item.rowIndex, codCol + 1).setValue(codAmount);
            if (feeServiceCol !== -1 && totalFee > 0) oSheet.getRange(item.rowIndex, feeServiceCol + 1).setValue(totalFee);

            // BẢO VỆ DOANH THU ĐƠN & CÁCH LY 100% DÒNG TIỀN CTV KHỎI TAB TÀI CHÍNH
            var isCTV = String(item.channel).toUpperCase().includes('CTV') || String(item.channel).toUpperCase().includes('CỘNG TÁC VIÊN');
            if (!isCTV) {
              var netRevenue = Math.max(0, codAmount - totalFee);
              totalRevenue += netRevenue;

              // Chỉ ghi Sổ quỹ công ty cho các đơn bán lẻ/bán sỉ của chính Shop
              financeTransactions.push([
                'TX_GHN_' + Date.now() + '_' + j,
                'Thu',
                'Doanh Thu Bán Hàng',
                netRevenue > 0 ? netRevenue : codAmount,
                'Ví GHN',
                'TÀI KHOẢN CÔNG TY',
                'Thu Tiền Đối Soát GHN: ' + (item.code || item.id),
                nowIso.slice(0, 10),
                'Đơn GHN: ' + (item.trackingCode || item.code) + ' | COD: ' + codAmount + ' | Phí: ' + totalFee,
                true
              ]);
            }
          } else if (newStatus === 'Hàng Hoàn') {
            countSuccess++;
          }

          // Ghi nhận Phí Vận Chuyển / Hoàn Hàng cho CTV nếu áp dụng
          var isCTV = String(item.channel).toUpperCase().includes('CTV') || String(item.channel).toUpperCase().includes('CỘNG TÁC VIÊN');
          var ctvUser = String(item.responsibleUser || item.updatedBy || item.customer || '').trim();
          if (isCTV && ctvUser && totalFee > 0) {
            if (newStatus === 'Đối Soát Thành Công') {
              ctvTransactionsToAppend.push([
                'CTV_TX_' + Date.now() + '_' + j,
                nowIso.slice(0, 10),
                'PHÍ VẬN CHUYỂN',
                totalFee,
                'Phí giao hàng GHN: ' + item.code,
                ctvUser,
                'Hoàn Thành'
              ]);
            } else if (newStatus === 'Hàng Hoàn') {
              ctvTransactionsToAppend.push([
                'CTV_TX_' + Date.now() + '_' + j,
                nowIso.slice(0, 10),
                'PHÍ HOÀN HÀNG',
                totalFee,
                'Phí hoàn/chuyển hoàn GHN: ' + item.code,
                ctvUser,
                'Hoàn Thành'
              ]);
            }
          }
        }
      }
    }

    // Ghi sổ CTV
    if (ctvTransactionsToAppend.length > 0) {
      var ctvSheet = ss.getSheetByName('CTV_Finance');
      if (!ctvSheet) {
        ctvSheet = ss.insertSheet('CTV_Finance');
        ctvSheet.appendRow(['id', 'date', 'type', 'amount', 'note', 'user', 'status']);
        ctvSheet.getRange("A1:G1").setFontWeight("bold").setBackground("#d4af37");
      }
      ctvSheet.getRange(ctvSheet.getLastRow() + 1, 1, ctvTransactionsToAppend.length, ctvTransactionsToAppend[0].length).setValues(ctvTransactionsToAppend);
    }

    // Ghi Sổ Quỹ Transactions & Cập nhật Accounts
    if (financeTransactions.length > 0) {
      var tSheet = ss.getSheetByName('Transactions');
      var accSheet = ss.getSheetByName('Accounts');

      if (tSheet) {
        tSheet.getRange(tSheet.getLastRow() + 1, 1, financeTransactions.length, financeTransactions[0].length).setValues(financeTransactions);

        if (accSheet) {
          var accData = accSheet.getDataRange().getValues();
          var targetRow = -1;
          for (var r = 1; r < accData.length; r++) {
            var accName = String(accData[r][1] || '').toUpperCase();
            if (accName.includes('CÔNG TY') || accName.includes('GHN') || accName.includes('MB')) {
              targetRow = r;
              break;
            }
          }
          if (targetRow !== -1) {
            var oldBal = Number(accData[targetRow][2]) || 0;
            accSheet.getRange(targetRow + 1, 3).setValue(oldBal + totalRevenue);
          }
        }
      }
    }

    return {
      success: true,
      count: countSuccess,
      deliveredCount: deliveredCount,
      returnedCount: returnedCount,
      totalCOD: totalCOD,
      totalRevenue: totalRevenue,
      message: '⚡ Đồng bộ hoàn tất: ' + countSuccess + ' đơn GHN (' + deliveredCount + ' Giao thành công, ' + returnedCount + ' Hàng hoàn)!'
    };
  } catch (e) {
    return { success: false, message: 'Lỗi đồng bộ API GHN: ' + e.toString() };
  } finally {
    try { lock.releaseLock(); } catch(err) {}
  }
}

// =========================================================================
// HÀM ĐỒNG BỘ ĐƠN HUỶ TỪ EMAIL (SHOPEE/TIKTOK...)
// =========================================================================
function scanCancelledOrdersFromEmail() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oSheet = ss.getSheetByName('Orders');
    if (!oSheet) return { success: false, message: 'Không tìm thấy sheet Orders' };

    var oData = oSheet.getDataRange().getValues();
    var pSheet = ss.getSheetByName('Packings');
    var pData = pSheet ? pSheet.getDataRange().getValues() : [];

    var prodSheet = ss.getSheetByName('Production');
    var prodData = prodSheet ? prodSheet.getDataRange().getValues() : [];
    var prodModified = false;

    var labelName = "RF_Processed";
    var label = GmailApp.getUserLabelByName(labelName) || GmailApp.createLabel(labelName);

    // Quét tối đa 25 email mới nhất trong 3 ngày qua chưa gắn nhãn để tối ưu tốc độ (< 2s)
    var threads = GmailApp.search('(newer_than:3d) -label:' + labelName + ' (subject:"hủy đơn hàng" OR subject:"huỷ đơn hàng" OR subject:"rút yêu cầu")', 0, 25);
    if (threads.length === 0) return { success: true, count: 0, message: 'Không có email huỷ đơn mới nào cần xử lý' };

    var count = 0;
    var modified = false;

    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        var msg = messages[j];
        var subject = msg.getSubject();
        var codes = subject.match(/[A-Z0-9]{8,25}/ig);
        if (codes && codes.length > 0) {
          for (var k = 0; k < codes.length; k++) {
            var extractedCode = codes[k].toUpperCase();

            for (var r = 1; r < oData.length; r++) {
              var orderCodeRaw = String(oData[r][1] || '').toUpperCase();
              var cleanOrderCode = orderCodeRaw.replace(/[^A-Z0-9]/g, '');

              if (orderCodeRaw.includes(extractedCode) || cleanOrderCode.includes(extractedCode)) {
                var currentStatus = String(oData[r][7] || '').toUpperCase().trim();
                var subjectLower = subject.toLowerCase();
                var isWithdraw = subjectLower.includes('rút yêu cầu') || subjectLower.includes('rút lại');

                if (isWithdraw) {
                  if (normalizeStatus(currentStatus) === 'Đơn Huỷ' || normalizeStatus(currentStatus) === 'Hàng Hoàn') {
                    oData[r][7] = 'Đã Bàn Giao';
                    modified = true;
                    count++;
                  }
                } else {
                  if (normalizeStatus(currentStatus) !== 'Đơn Huỷ' && normalizeStatus(currentStatus) !== 'Hàng Hoàn') {
                    var orderId = String(oData[r][0]);
                    var hasPacked = false;
                    for (var pr = 1; pr < pData.length; pr++) {
                      if (String(pData[pr][1]) === orderId) {
                        hasPacked = true;
                        break;
                      }
                    }
                    var newStatus = hasPacked ? 'Hàng Hoàn' : 'Đơn Huỷ';
                    oData[r][7] = newStatus;
                    modified = true;
                    count++;

                    // Tự động hủy lệnh sản xuất liên quan nếu chưa hoàn thành
                    if (prodData && prodData.length > 1) {
                      for (var prIdx = 1; prIdx < prodData.length; prIdx++) {
                        var pOrdId = String(prodData[prIdx][1] || '').trim();
                        if (pOrdId && (pOrdId === orderId || pOrdId === orderCodeRaw || pOrdId.includes(extractedCode) || orderCodeRaw.includes(pOrdId))) {
                          var pCurStatus = String(prodData[prIdx][5] || '').toUpperCase().trim();
                          if (pCurStatus !== 'DONE' && pCurStatus !== 'ĐÃ XONG') {
                            prodData[prIdx][5] = 'Đã Huỷ';
                            prodModified = true;
                          }
                        }
                      }
                    }
                  }
                }
                break;
              }
            }
          }
        }
      }
      threads[i].addLabel(label);
      threads[i].markRead();
    }

    if (modified) {
      oSheet.getRange(1, 1, oData.length, oData[0].length).setValues(oData);
    }
    if (prodModified && prodSheet) {
      prodSheet.getRange(1, 1, prodData.length, prodData[0].length).setValues(prodData);
    }

    return { success: true, count: count, message: 'Đã xử lý ' + count + ' đơn huỷ/hoàn từ email & cập nhật lệnh sản xuất.' };
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    try { lock.releaseLock(); } catch(err) {}
  }
}

// =========================================================================
// HÀM ĐỒNG BỘ ĐƠN HOÀN TỪ EMAIL (SHOPEE/TIKTOK... HOẶC FILE PDF CỦA SPX)
// =========================================================================
function scanReturnedOrdersFromEmail() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oSheet = ss.getSheetByName('Orders');
    if (!oSheet) return { success: false, message: 'Không tìm thấy sheet Orders' };

    var oData = oSheet.getDataRange().getValues();
    var pSheet = ss.getSheetByName('Packings');
    var pData = pSheet ? pSheet.getDataRange().getValues() : [];

    var labelName = "RF_Processed";
    var label = GmailApp.getUserLabelByName(labelName) || GmailApp.createLabel(labelName);

    // Quét mail hoàn chưa được xử lý trong 3 ngày
    var threads = GmailApp.search('(newer_than:3d) -label:' + labelName + ' (subject:"trả hàng" OR subject:"hàng hoàn" OR subject:"hoàn trả" OR subject:"chuyển hoàn" OR (has:attachment filename:pdf "SPX"))');
    if (threads.length === 0) return { success: true, count: 0, message: 'Không có email hoàn trả mới' };

    var count = 0;
    var modified = false;

    for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
        var msg = messages[j];

        var subject = msg.getSubject();
        var codes = subject.match(/[A-Z0-9]{8,25}/ig) || [];

        // Trích xuất mã từ tên file đính kèm (PDF) và OCR nội dung PDF
        var attachments = msg.getAttachments();
        for (var a = 0; a < attachments.length; a++) {
          var attName = attachments[a].getName().toLowerCase();
          if (attName.indexOf('.pdf') !== -1) {
            var attCodes = attName.match(/[A-Z0-9]{8,25}/ig);
            if (attCodes) codes = codes.concat(attCodes);

            // Cố gắng dùng Drive API để đọc chữ bên trong PDF
            try {
              var blob = attachments[a].copyBlob();
              var resource = {
                name: attachments[a].getName(),
                mimeType: 'application/vnd.google-apps.document'
              };
              var tempFile = Drive.Files.create(resource, blob);
              var doc = DocumentApp.openById(tempFile.id);
              var text = doc.getBody().getText();

              var ocrCodes = text.match(/[A-Z0-9]{8,25}/ig);
              if (ocrCodes) codes = codes.concat(ocrCodes);

              Drive.Files.remove(tempFile.id);
            } catch (e) {
              // Bỏ qua nếu có lỗi OCR (Ví dụ: file quá lớn hoặc lỗi hạn mức)
            }
          }
        }

        if (codes && codes.length > 0) {
          var uniqueCodes = [];
          for (var c = 0; c < codes.length; c++) {
            if (uniqueCodes.indexOf(codes[c].toUpperCase()) === -1) uniqueCodes.push(codes[c].toUpperCase());
          }

          for (var k = 0; k < uniqueCodes.length; k++) {
            var extractedCode = uniqueCodes[k];
            for (var r = 1; r < oData.length; r++) {
              var orderCodeRaw = String(oData[r][1] || '').toUpperCase();
              var cleanOrderCode = orderCodeRaw.replace(/[^A-Z0-9]/g, '');

              if (orderCodeRaw.includes(extractedCode) || cleanOrderCode.includes(extractedCode)) {
                var currentStatus = String(oData[r][7] || '').toUpperCase().trim();
                if (normalizeStatus(currentStatus) !== 'Đơn Huỷ' && normalizeStatus(currentStatus) !== 'Hàng Hoàn') {
                  var orderId = String(oData[r][0]);
                  var hasPacked = false;
                  for (var pr = 1; pr < pData.length; pr++) {
                    if (String(pData[pr][1]) === orderId) {
                      hasPacked = true;
                      break;
                    }
                  }
                  var newStatus = hasPacked ? 'Hàng Hoàn' : 'Đơn Huỷ';
                  oData[r][7] = newStatus;
                  modified = true;
                  count++;
                }
                break;
              }
            }
          }
        }
        // msg.markRead();
      }
      threads[i].addLabel(label);
      threads[i].markRead();
    }

    if (modified) {
      oSheet.getRange(1, 1, oData.length, oData[0].length).setValues(oData);
    }

    return { success: true, count: count, message: 'Đã xử lý tự động ' + count + ' đơn hoàn trả từ email.' };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

// =========================================================================
// HÀM KHỞI TẠO TRIGGER TỰ ĐỘNG CHẠY HÀM QUÉT EMAIL MỖI 30 PHÚT
// =========================================================================
function setupEmailScannerTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'scanCancelledOrdersFromEmail') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger('scanCancelledOrdersFromEmail')
    .timeBased()
    .everyMinutes(30)
    .create();
}


// =========================================================================
// HÀM TỰ ĐỘNG PHẠT NHÂN SỰ ĐÓNG GÓI CHẬM
// =========================================================================
function dailyCheckPackingsAndPenalize() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Đối tượng bị phạt (Lấy từ Config_NhanSu có Trách nhiệm là Nhân Viên Đóng Gói)
    var packingStaffs = [];
    var hrSheet = ss.getSheetByName('Config_NhanSu');
    if (hrSheet) {
      var hrData = hrSheet.getDataRange().getValues();
      var hrHeaders = hrData[0] || [];
      var roleColIdx = hrHeaders.findIndex(function (h) { return String(h).trim().toLowerCase() === 'trách nhiệm'; });
      var nameColIdx = 0; // Cột đầu tiên là Tên nhân sự
      if (roleColIdx !== -1) {
        for (var i = 1; i < hrData.length; i++) {
          if (String(hrData[i][roleColIdx]).trim().toLowerCase() === 'nhân viên đóng gói') {
            var staffName = String(hrData[i][nameColIdx]).trim();
            if (staffName) packingStaffs.push(staffName);
          }
        }
      }
    }

    Logger.log("Số nhân viên bị phạt: " + packingStaffs.length + " - " + packingStaffs.join(", "));

    // 2. Lấy danh sách đơn hàng
    var ordersSheet = ss.getSheetByName('Orders');
    if (!ordersSheet) {
      Logger.log("Không tìm thấy sheet Orders");
      return;
    }
    var ordersData = ordersSheet.getDataRange().getValues();
    var orderHeaders = ordersData[0];
    var statusColIdx = orderHeaders.indexOf('status');
    var channelColIdx = orderHeaders.indexOf('channel');
    var orderCodeColIdx = orderHeaders.indexOf('orderCode');
    var idColIdx = orderHeaders.indexOf('id');

    Logger.log("Chỉ số cột: status=" + statusColIdx + ", channel=" + channelColIdx + ", orderCode=" + orderCodeColIdx);

    var packingsSheet = ss.getSheetByName('Packings');
    var penaltySheet = ss.getSheetByName('BonusPenalty');
    if (!packingsSheet || !penaltySheet) return;

    var packingsData = packingsSheet.getDataRange().getValues();
    var packingHeaders = packingsData[0];
    var pOrderIdCol = packingHeaders.indexOf('orderId');
    var pPhotoCol = packingHeaders.indexOf('photo');
    var pPhotoBeforeCol = packingHeaders.indexOf('photoBefore');
    var pIdCol = packingHeaders.indexOf('id');

    var WARNING_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Warning_icon.svg/512px-Warning_icon.svg.png'; // Ảnh cảnh báo mặc định
    var PENALTY_AMOUNT = -50000;
    var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    var ordersModified = false;
    var countMatchedOrders = 0;

    for (var i = 1; i < ordersData.length; i++) {
      var statusUpper = String(ordersData[i][statusColIdx]).trim().toUpperCase();
      var channelUpper = String(ordersData[i][channelColIdx]).trim().toUpperCase();

      if (statusUpper === 'SẴN SÀNG ĐÓNG GÓI') {
        Logger.log("Tìm thấy đơn SẴN SÀNG ĐÓNG GÓI: " + ordersData[i][orderCodeColIdx] + " | Kênh: " + channelUpper);
      }

      // BẢO VỆ LUỒNG ĐÓNG GÓI: Không tự động chuyển đơn sang 'Chờ Bàn Giao' khi chưa có ảnh đóng gói thực tế.
      // Đơn hàng bắt buộc phải giữ ở 'Sẵn Sàng Đóng Gói' để nhân sự đóng gói chụp ảnh và bấm đóng đơn.
      /* 
      if (statusUpper === 'SẴN SÀNG ĐÓNG GÓI' && channelUpper === 'SHOPEE VN') {
        // Tự động chuyển đơn & phạt đã bị vô hiệu hóa để tránh đứt gãy luồng đóng gói
      }
      */
    }

    Logger.log("Tổng số đơn đã phạt và cập nhật: " + countMatchedOrders);

    if (ordersModified) {
      ordersSheet.getRange(1, 1, ordersData.length, orderHeaders.length).setValues(ordersData);
      Logger.log("Đã lưu ordersData xuống Sheet");
    }

  } catch (e) {
    Logger.log("Lỗi dailyCheckPackingsAndPenalize: " + e.toString());
  } finally {
    // Luôn lên lịch tiếp cho ngày hôm sau hoặc đúng 19:30 tiếp theo
    scheduleNextPenaltyCheck();
    lock.releaseLock();
  }
}

function scheduleNextPenaltyCheck() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'dailyCheckPackingsAndPenalize') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  var now = new Date();
  var nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 31, 0, 0); // Đặt 19:31 để đảm bảo đã qua 19:30

  // Nếu bây giờ đã qua 19:31, thì hẹn vào ngày mai
  if (now.getTime() > nextRun.getTime()) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  ScriptApp.newTrigger('dailyCheckPackingsAndPenalize')
    .timeBased()
    .at(nextRun)
    .create();
}



// =========================================================================
// CRON: 23:30 DAILY PENALTY FOR INCOMPLETE TASKS (PRODUCTION)
// =========================================================================
function cronCheckIncompleteTasks() {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    Logger.log("Không thể lock cronCheckIncompleteTasks");
    return;
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var prodItems = readSheet('Production', null, ss);
    if (!prodItems || prodItems.length === 0) return;

    var penaltyMap = {};
    var now = new Date();
    var todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    var existingBPs = readSheet('BonusPenalty', function (b) {
      return b.date === todayStr && b.type === 'Phạt Vi Phạm' && String(b.note || '').indexOf('Lỗi không hoàn thành') !== -1;
    }, ss);

    if (existingBPs && existingBPs.length > 0) {
      existingBPs.forEach(function (bp) {
        penaltyMap[bp.user] = true;
      });
    }

    var newPenalties = [];

    for (var i = 0; i < prodItems.length; i++) {
      var item = prodItems[i];
      if (!item.phases) continue;

      ['phase1', 'phase2'].forEach(function (phaseKey) {
        var phase = item.phases[phaseKey];
        if (phase && phase.status === 'In Progress' && phase.user && String(phase.user).trim() !== '') {
          var user = String(phase.user).trim();
          if (!penaltyMap[user]) {
            penaltyMap[user] = true;
            newPenalties.push({
              id: 'BP_INCOMPLETE_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
              user: user,
              amount: -100000,
              type: 'Phạt Vi Phạm',
              note: 'Lỗi không hoàn thành khâu trong ngày (Đơn ' + (item.orderId || '') + ')',
              date: todayStr,
              orderCode: item.orderId || ''
            });
          }
        }
      });
    }

    if (newPenalties.length > 0) {
      // 🔔 Bắn thông báo Phạt Tự Động
      newPenalties.forEach(function(bp) {
        sendNtfyNotification(
          '⚠️ GHI NHẬN PHẠT TỰ ĐỘNG: ' + (bp.user || 'N/A'), 
          'Lý do: ' + (bp.note || 'N/A') + '\nSố tiền: ' + bp.amount + 'đ', 
          null
        );
      });
      applyDeltasToSheet('BonusPenalty', newPenalties, formatBonusPenalty, ss);
      Logger.log("Đã phạt " + newPenalties.length + " nhân viên quên hoàn thành khâu.");
    }

  } catch (e) {
    Logger.log("Lỗi cronCheckIncompleteTasks: " + e.toString());
  } finally {
    scheduleNextIncompletePenaltyCheck();
    lock.releaseLock();
  }
}

function scheduleNextIncompletePenaltyCheck() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'cronCheckIncompleteTasks') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  var now = new Date();
  var nextRun = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 30, 0, 0);

  if (now.getTime() > nextRun.getTime()) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  ScriptApp.newTrigger('cronCheckIncompleteTasks')
    .timeBased()
    .at(nextRun)
    .create();
}

// =========================================================================
// HÀM UPLOAD ẢNH QC (DUYỆT KHUNG) TÁCH BIỆT THƯ MỤC
// =========================================================================
function uploadQCImage(base64Data, fileName) {
  try {
    var folderName = "RF_QC_Photos";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder;
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }

    var data = base64Data;
    if (base64Data.indexOf(",") > -1) { data = base64Data.split(",")[1]; }
    var blob = Utilities.newBlob(Utilities.base64Decode(data), "image/jpeg", fileName);
    var file = folder.createFile(blob);

    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (sharingErr) {
      console.warn("Không thể thiết lập quyền chia sẻ công khai: " + sharingErr.message);
    }

    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w800";
  } catch (e) {
    console.error("Lỗi trong uploadQCImage:", e);
    return "";
  }
}



// =========================================================================
// CHỐT SỔ CUỐI THÁNG & LƯU TRỮ DỮ LIỆU LẠNH
// =========================================================================
function closeMonthAndArchive(pin, monthString, snapshotData) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, thử lại sau!' };
  }

  try {
    var auth = validatePin(pin);
    if (!auth || !auth.valid) return { success: false, message: 'Sai mã PIN!' };
    if (auth.role !== 'BOSS') return { success: false, message: 'Chỉ Boss mới có quyền chốt sổ!' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Lưu Snapshot
    var snapSheet = ss.getSheetByName('Monthly_Snapshots');
    if (!snapSheet) {
      snapSheet = ss.insertSheet('Monthly_Snapshots');
      snapSheet.appendRow(SCHEMA_ERP.Monthly_Snapshots);
      snapSheet.setFrozenRows(1);
    }

    var nowStr = new Date().toISOString();

    // Check if already closed
    var snapData = snapSheet.getDataRange().getValues();
    for (var i = 1; i < snapData.length; i++) {
      if (snapData[i][1] === monthString) {
        return { success: false, message: 'Tháng ' + monthString + ' đã được chốt sổ trước đó!' };
      }
    }

    // 2. Chuyển số dư & Ghi Snapshot
    var bpSheet = ss.getSheetByName('BonusPenalty');
    var bpHeaders = bpSheet.getRange(1, 1, 1, bpSheet.getLastColumn()).getValues()[0];
    var parts = monthString.split('-');
    var nextMonthObj = new Date(parseInt(parts[0]), parseInt(parts[1]), 1); // 1st day of next month
    var nextMonthStr = Utilities.formatDate(nextMonthObj, Session.getScriptTimeZone(), "yyyy-MM-dd");

    snapshotData.forEach(function (userSnap) {
      snapSheet.appendRow([
        Utilities.getUuid(),
        monthString,
        userSnap.user,
        userSnap.totalSalary || 0,
        userSnap.totalHours || 0,
        userSnap.totalAdvance || 0,
        userSnap.totalDebt || 0,
        nowStr,
        JSON.stringify(userSnap)
      ]);

      // Nợ luỹ kế
      if (userSnap.netSalary < 0) {
        var rowData = [];
        for (var j = 0; j < bpHeaders.length; j++) {
          if (bpHeaders[j] === 'id') rowData.push(Utilities.getUuid());
          else if (bpHeaders[j] === 'user') rowData.push(userSnap.user);
          else if (bpHeaders[j] === 'amount') rowData.push(Math.abs(userSnap.netSalary));
          else if (bpHeaders[j] === 'type') rowData.push('Tạm ứng');
          else if (bpHeaders[j] === 'note') rowData.push('Nợ luỹ kế chuyển từ ' + monthString);
          else if (bpHeaders[j] === 'date') rowData.push(nextMonthStr);
          else rowData.push('');
        }
        bpSheet.appendRow(rowData);
      }
    });

    // 3. Tạo Archive File
    var archiveName = "RF_Archive_Thang_" + monthString.replace('-', '_');
    var archiveSs = SpreadsheetApp.create(archiveName);

    // 4. Move rows from working sheets
    var sheetsToArchive = ['Attendance', 'KPI_Progress', 'BonusPenalty', 'Reimbursements'];

    sheetsToArchive.forEach(function (sheetName) {
      var sourceSheet = ss.getSheetByName(sheetName);
      if (!sourceSheet) return;

      var data = sourceSheet.getDataRange().getValues();
      if (data.length <= 1) return;

      var headers = data[0];
      var destSheet = archiveSs.getSheetByName(sheetName);
      if (!destSheet) {
        destSheet = archiveSs.insertSheet(sheetName);
        destSheet.appendRow(headers);
      }

      var rowsToKeep = [headers];
      var rowsToArchive = [];
      var dateColIdx = headers.indexOf('date');
      if (dateColIdx === -1) dateColIdx = headers.indexOf('startTime');
      if (dateColIdx === -1) dateColIdx = headers.indexOf('createdAt');

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var rowDate = "";
        var dateVal = row[dateColIdx];

        if (dateVal instanceof Date) {
          rowDate = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "yyyy-MM-dd");
        } else {
          rowDate = String(dateVal || '');
        }

        if (rowDate.indexOf(monthString) !== -1) {
          rowsToArchive.push(row);
        } else {
          rowsToKeep.push(row);
        }
      }

      if (rowsToArchive.length > 0) {
        destSheet.getRange(destSheet.getLastRow() + 1, 1, rowsToArchive.length, headers.length).setValues(rowsToArchive);
        sourceSheet.clearContents();
        sourceSheet.getRange(1, 1, rowsToKeep.length, headers.length).setValues(rowsToKeep);
      }
    });

    var sheet1 = archiveSs.getSheetByName('Sheet1');
    if (sheet1 && archiveSs.getSheets().length > 1) {
      archiveSs.deleteSheet(sheet1);
    }

    return { success: true, message: 'Đã chốt sổ thành công! Dữ liệu đã lưu sang file: ' + archiveName };
  } catch (err) {
    console.error("Lỗi closeMonthAndArchive:", err);
    return { success: false, message: 'Lỗi chốt sổ: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// HÀM ĐỐI SOÁT HÀNG LOẠT (BATCH RECONCILIATION)
// =========================================================================
function processReconciliationBatch(matchedOrders, targetAccountId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    if (!matchedOrders || matchedOrders.length === 0) return { success: true, count: 0, message: 'Không có dữ liệu đối soát.' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oSheet = ss.getSheetByName('Orders');
    if (!oSheet) return { success: false, message: 'Không tìm thấy sheet Orders' };

    var oData = oSheet.getDataRange().getValues();
    var headers = oData[0];
    var codeCol = headers.indexOf('orderCode');
    var statusCol = headers.indexOf('status');
    var idCol = headers.indexOf('id');
    var recAtCol = headers.indexOf('reconciledAt');
    var isRecCol = headers.indexOf('isReconciled');
    var revCol = headers.indexOf('revenue');
    var chanCol = headers.indexOf('channel');

    var feeFixedCol = headers.indexOf('feeFixed');
    var feeServiceCol = headers.indexOf('feeService');
    var feePaymentCol = headers.indexOf('feePayment');
    var feeAffiliateCol = headers.indexOf('feeAffiliate');
    var shopVoucherCol = headers.indexOf('shopVoucher');
    var taxCol = headers.indexOf('tax');

    if (codeCol === -1 || statusCol === -1 || idCol === -1) {
      return { success: false, message: 'Thiếu cột chuẩn trong bảng Orders' };
    }

    var hasRecCols = (recAtCol !== -1 && isRecCol !== -1);
    var countSuccess = 0;
    var notFoundCount = 0;
    var modifiedOrders = false;
    var financeTransactions = [];
    var dStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    for (var k = 0; k < matchedOrders.length; k++) {
      var item = matchedOrders[k];
      var searchCode = String(item.code || '').trim().toUpperCase();
      if (!searchCode) continue;

      var foundRowIndex = -1;
      for (var r = 1; r < oData.length; r++) {
        var rowCode = String(oData[r][codeCol] || '').toUpperCase();
        var cleanRowCode = rowCode.replace(/[^A-Z0-9]/g, '');
        var cleanSearchCode = searchCode.replace(/[^A-Z0-9]/g, '');

        if (rowCode.includes(searchCode) || (cleanSearchCode.length >= 8 && cleanRowCode.includes(cleanSearchCode))) {
          foundRowIndex = r;
          break;
        }
      }

      if (foundRowIndex !== -1) {
        var currentStatus = String(oData[foundRowIndex][statusCol] || '').trim();
        if (currentStatus !== 'Đối Soát Thành Công' && currentStatus !== 'Hàng Hoàn' && currentStatus !== 'Đơn Huỷ') {
          oData[foundRowIndex][statusCol] = 'Đối Soát Thành Công';
          modifiedOrders = true;
        }

        if (hasRecCols) {
          if (!oData[foundRowIndex][isRecCol]) {
            oData[foundRowIndex][isRecCol] = true;
            oData[foundRowIndex][recAtCol] = dStr;
            modifiedOrders = true;
          }
        }

        if (feeFixedCol !== -1 && item.feeFixed) oData[foundRowIndex][feeFixedCol] = Math.abs(item.feeFixed);
        if (feeServiceCol !== -1 && item.feeService) oData[foundRowIndex][feeServiceCol] = Math.abs(item.feeService);
        if (feePaymentCol !== -1 && item.feePayment) oData[foundRowIndex][feePaymentCol] = Math.abs(item.feePayment);
        if (feeAffiliateCol !== -1 && item.feeAffiliate) oData[foundRowIndex][feeAffiliateCol] = Math.abs(item.feeAffiliate);
        if (shopVoucherCol !== -1 && item.shopVoucher) oData[foundRowIndex][shopVoucherCol] = Math.abs(item.shopVoucher);
        if (taxCol !== -1 && item.tax) oData[foundRowIndex][taxCol] = Math.abs(item.tax);

        var amt = Number(item.amount) || 0;
        if (amt > 0 && targetAccountId) {
          var dateColIdx = headers.indexOf('createdAt') !== -1 ? headers.indexOf('createdAt') : headers.indexOf('date');
          var orderTxDate = (dateColIdx !== -1 && oData[foundRowIndex][dateColIdx]) ? String(oData[foundRowIndex][dateColIdx]) : new Date().toISOString();
          financeTransactions.push([
            Utilities.getUuid(),
            'Thu',
            'Sàn TMĐT',
            amt,
            '',
            targetAccountId,
            'Đối soát: ' + searchCode,
            orderTxDate,
            'Đối soát tự động (Batch)',
            true
          ]);
        }
        countSuccess++;
      } else {
        notFoundCount++;
      }
    }

    if (modifiedOrders) {
      oSheet.getRange(1, 1, oData.length, headers.length).setValues(oData);
    }

    if (financeTransactions.length > 0) {
      var tSheet = ss.getSheetByName('Transactions');
      if (tSheet) {
        tSheet.getRange(tSheet.getLastRow() + 1, 1, financeTransactions.length, financeTransactions[0].length).setValues(financeTransactions);
      }
    }

    return { success: true, updatedCount: countSuccess, notFoundCount: notFoundCount, message: 'Đã đối soát ' + countSuccess + ' đơn hàng.' };
  } catch (e) {
    return { success: false, message: 'Lỗi processReconciliationBatch: ' + e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// HÀM DỌN DẸP GIAO DỊCH RÁC CŨ (ĐỐI SOÁT TỰ ĐỘNG BATCH HOẶC LỖI TẠO TAY)
// =========================================================================
function cleanUpOldReconciliationJunk() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, thử lại sau!' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Transactions');
    if (!sheet) return { success: false, message: 'Không tìm thấy Sổ Quỹ (Transactions)' };

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, count: 0, message: 'Không có dữ liệu để dọn dẹp' };

    var headers = data[0];
    var noteCol = headers.indexOf('note');
    var categoryCol = headers.indexOf('category');
    var idCol = headers.indexOf('id');

    var rowsToKeep = [headers];
    var deletedCount = 0;

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var note = noteCol >= 0 ? String(row[noteCol]) : '';
      var cat = categoryCol >= 0 ? String(row[categoryCol]) : '';
      var id = idCol >= 0 ? String(row[idCol]) : '';

      var isJunk = false;
      // Xoá rác đối soát cũ và phiếu tự động trùng lặp (chỉ xoá phiếu rác test rõ ràng, bảo vệ doanh thu thật)
      if (note.indexOf('Đối soát tự động (Batch) - RÁC') > -1) isJunk = true;
      if (note.indexOf('Nhóm') > -1 && note.indexOf('=> THỰC NHẬN') > -1 && id.indexOf('TX_TEST') > -1) isJunk = true;
      if (id.indexOf('TX_JUNK_') > -1) isJunk = true;
      if (note.indexOf('Order.all.test') > -1) isJunk = true;

      if (!isJunk) {
        rowsToKeep.push(row);
      } else {
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      sheet.clearContents();
      sheet.getRange(1, 1, rowsToKeep.length, headers.length).setValues(rowsToKeep);
    }

    return { success: true, count: deletedCount, message: 'Đã dọn dẹp sạch sẽ ' + deletedCount + ' giao dịch rác thành công!' };
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// HÀM CHUẨN HOÁ DỮ LIỆU ĐƠN HÀNG (Dọn dẹp rác, fix JSON, tên khách...)
// =========================================================================
function autoCleanOrdersData() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, thử lại sau!' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Orders');
    if (!sheet) return { success: false, message: 'Không tìm thấy sheet Orders' };

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, message: 'Không có dữ liệu để chuẩn hóa' };

    var headers = data[0];
    var customerCol = headers.indexOf('customer');
    var accCol = headers.indexOf('accessories');
    var prodCol = headers.indexOf('products');
    var codeCol = headers.indexOf('orderCode');
    var totalCol = headers.indexOf('totalAmount');
    var statusCol = headers.indexOf('status');

    var rowsToKeep = [headers];
    var deletedCount = 0;
    var modifiedCount = 0;

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var isModified = false;

      var cust = customerCol >= 0 ? String(row[customerCol] || '').trim() : '';
      var prods = prodCol >= 0 ? String(row[prodCol] || '').trim() : '';
      var accs = accCol >= 0 ? String(row[accCol] || '').trim() : '';
      var total = totalCol >= 0 ? (Number(row[totalCol]) || 0) : 0;
      var status = statusCol >= 0 ? String(row[statusCol] || '').trim() : '';

      // 0. Xóa các đơn rác (không có khách hàng, không có sản phẩm, không có tiền)
      if (!cust && (prods === '' || prods === '[]') && (accs === '' || accs === '[]') && total === 0) {
        deletedCount++;
        continue;
      }

      // 1. Lọc ghi chú khỏi cột khách hàng (độ dài > 30)
      if (cust.length > 30) {
        row[customerCol] = 'Khách';
        isModified = true;
      }

      // 2. Sửa lỗi định dạng JSON phụ kiện ("price":"25000" -> "price":25000)
      if (accCol >= 0) {
        var accStr = String(row[accCol] || '');
        if (accStr.indexOf('"price":"') > -1) {
          var fixedAcc = accStr.replace(/"price":"(\d+)"/g, '"price":$1');
          row[accCol] = fixedAcc;
          isModified = true;
        }
      }

      // 3. (Đã bỏ) Không tách Mã Vận Đơn nữa vì hệ thống lưu mã vận đơn chung với orderCode.

      if (isModified) {
        modifiedCount++;
      }
      rowsToKeep.push(row);
    }

    if (deletedCount > 0 || modifiedCount > 0) {
      sheet.clearContents();
      sheet.getRange(1, 1, rowsToKeep.length, headers.length).setValues(rowsToKeep);
    }

    return { success: true, message: 'Đã chuẩn hóa ' + modifiedCount + ' đơn, xoá ' + deletedCount + ' đơn rác!' };
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * BLOCK CODE AN TOÀN: TRUY XUẤT HỒ SƠ KHIẾU NẠI SHOPEE
 * @param {string} shopeeOrderCode - Mã đơn hàng trên Shopee
 */
function getAppealEvidence(shopeeOrderCode) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Tìm Order ID gốc
    const ordersSheet = ss.getSheetByName("Orders");
    const orderData = ordersSheet.getDataRange().getValues();
    const orderHeaders = orderData[0];

    const idIdx = orderHeaders.indexOf("id");
    const codeIdx = orderHeaders.indexOf("orderCode");

    let targetOrderId = null;
    for (let i = 1; i < orderData.length; i++) {
      if (orderData[i][codeIdx] && String(orderData[i][codeIdx]).includes(shopeeOrderCode)) {
        targetOrderId = orderData[i][idIdx];
        break;
      }
    }

    if (!targetOrderId) throw new Error("Không tìm thấy mã đơn hàng Shopee này trên hệ thống.");

    // 2. Lấy bằng chứng Đóng Gói (Packings)
    const packData = ss.getSheetByName("Packings").getDataRange().getValues();
    let packEvidence = { photoBefore: "", photoPacked: "" };
    for (let i = 1; i < packData.length; i++) {
      if (packData[i][1] === targetOrderId) { // Cột B là orderId
        packEvidence.photoPacked = packData[i][7]; // Cột photo
        packEvidence.photoBefore = packData[i][9]; // Cột photoBefore
        break;
      }
    }

    // 3. Lấy bằng chứng Sản Xuất (Production - QC)
    const prodData = ss.getSheetByName("Production").getDataRange().getValues();
    let prodEvidence = { qcFront: "", qcSide: "" };
    for (let i = 1; i < prodData.length; i++) {
      if (prodData[i][1] === targetOrderId) {
        prodEvidence.qcFront = prodData[i][22]; // qc_front_photo
        prodEvidence.qcSide = prodData[i][23];  // qc_side_photo
        break;
      }
    }

    return {
      status: "success",
      data: {
        orderCode: shopeeOrderCode,
        productionQC: prodEvidence,
        packingEvidence: packEvidence
      }
    };

  } catch (error) {
    return { status: "error", message: error.message };
  }
}

/**
 * BLOCK CODE AN TOÀN: CẬP NHẬT TRẠNG THÁI VÀ LƯU LINK VIDEO
 */
function updateAppealStatus(orderId, newStatus, videoLink) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, thử lại sau!' };
  }

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orders");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const idIdx = headers.indexOf("id");
    const statusIdx = headers.indexOf("status");
    const noteIdx = headers.indexOf("note");

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] === orderId) {
        // Ghi nối link video vào cột note hiện tại
        let currentNote = data[i][noteIdx] || "";
        let newNote = videoLink ? `[Video Hoàn]: ${videoLink} \n${currentNote}` : currentNote;

        // Cập nhật Database
        sheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
        sheet.getRange(i + 1, noteIdx + 1).setValue(newNote);

        return { success: true, message: "Đã lưu hồ sơ khiếu nại thành công!" };
      }
    }
    throw new Error("Không tìm thấy ID đơn hàng để cập nhật.");
  } catch (error) {
    return { success: false, message: error.message };
  } finally {
    lock.releaseLock();
  }
}

/**
 * BLOCK CODE AN TOÀN: XÓA CỨNG ĐƠN HÀNG VÀ DỮ LIỆU LIÊN QUAN (CASCADING DELETE)
 * Yêu cầu: Chỉ thực thi với quyền Founder.
 * @param {string} orderId - ID của đơn hàng cần xóa
 */
function hardDeleteOrderAndRelatedData(orderId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { status: "error", message: 'Hệ thống đang bận, thử lại sau!' };
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Quét và xóa Lệnh Sản Xuất (Production)
    deleteRowsByMatch(ss, "Production", "orderId", orderId);

    // 2. Quét và xóa Lệnh Đóng Gói (Packings)
    deleteRowsByMatch(ss, "Packings", "orderId", orderId);

    // 3. Quét và xóa Phiếu Thu/Chi liên quan (Transactions)
    deleteTransactionsByOrderId(ss, orderId);

    // 4. Xóa Đơn Hàng gốc (Orders)
    deleteRowsByMatch(ss, "Orders", "id", orderId);

    return {
      status: "success",
      message: "Đã tiêu hủy toàn bộ dữ liệu (Sản xuất, Đóng gói, Sổ quỹ) của đơn hàng: " + orderId
    };
  } catch (error) {
    return { status: "error", message: error.message };
  } finally {
    lock.releaseLock();
  }
}

/**
 * HÀM HỖ TRỢ: Xóa dòng an toàn (Quét từ dưới lên để bảo toàn Index)
 */
function deleteRowsByMatch(ss, sheetName, colName, matchValue) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return;

  const header = data[0];
  const colIdx = header.indexOf(colName);
  if (colIdx === -1) return;

  // Vòng lặp Bottom-Up
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][colIdx] === matchValue) {
      sheet.deleteRow(i + 1);
    }
  }
}

/**
 * HÀM HỖ TRỢ: Tìm và xóa dòng trong Sổ quỹ (Transactions)
 */
function deleteTransactionsByOrderId(ss, orderId) {
  const sheet = ss.getSheetByName("Transactions");
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return;

  const header = data[0];
  const titleIdx = header.indexOf("title");
  const noteIdx = header.indexOf("note");

  // Vòng lặp Bottom-Up
  for (let i = data.length - 1; i > 0; i--) {
    let title = String(data[i][titleIdx] || "");
    let note = String(data[i][noteIdx] || "");

    // Nhận diện mã đơn hàng lồng trong tiêu đề hoặc ghi chú của phiếu Kế toán
    if (title.includes(orderId) || note.includes(orderId)) {
      sheet.deleteRow(i + 1);
    }
  }
}
/**
 * BLOCK CODE AN TOÀN: TỰ ĐỘNG TÍNH TOÁN ĐỊNH MỨC (BOM) VÀ GIÁ VỐN CHO BỂ KÍNH
 * Yêu cầu: Chạy hàm này khi có mã bể mới hoặc khi cập nhật giá Kính/Silicon đầu vào.
 */
function autoCalculateGlassTankBOM() {
  return autoCalculateGlassTankBOM_Dual();
}

// =========================================================================
// HÀM TÍNH TOÁN CÔNG NỢ NHÀ CUNG CẤP (CHỈ TÍNH PHIẾU NHẬP CHƯA THANH TOÁN)
// =========================================================================
function getRealSupplierDebt(supplierName, fullIEData, fullTxData) {
  if (!supplierName) return 0;
  var sName = String(supplierName).toLowerCase().trim();
  var unpaidDebt = 0;

  if (fullIEData && fullIEData.length > 1) {
    for (var i = 1; i < fullIEData.length; i++) {
      var type = String(fullIEData[i][1]).trim();
      var target = String(fullIEData[i][2]).trim().toLowerCase();
      var isPaid = fullIEData[i].length > 7 ? (fullIEData[i][7] === true || String(fullIEData[i][7]).toUpperCase() === 'TRUE') : false;
      if (type === 'Nhập' && target === sName && !isPaid) {
        unpaidDebt += Number(fullIEData[i][3]) || 0;
      }
    }
  }
  return unpaidDebt;
}

/**
 * =========================================================================
 * API TỰ ĐỘNG LÀM SẠCH VÀ SỬA LỖI CÔNG NỢ ÂM (NEGATIVE DEBT) NHÀ CUNG CẤP
 * =========================================================================
 */
function api_repairSupplierNegativeDebts() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var supSheet = ss.getSheetByName('Suppliers');
    if (!supSheet) return { success: false, message: 'Thiếu sheet Suppliers' };

    var sData = supSheet.getDataRange().getValues();
    if (sData.length <= 1) return { success: true, message: 'Suppliers rỗng' };

    var sHeaders = sData[0];
    var nameCol = sHeaders.indexOf('name');
    var debtCol = sHeaders.indexOf('totalDebt');

    if (nameCol === -1 || debtCol === -1) return { success: false, message: 'Thiếu cột name/totalDebt' };

    var ieSheet = ss.getSheetByName('ImportExport');
    var ieData = ieSheet ? ieSheet.getDataRange().getValues() : [];
    var ieHeaders = ieData.length > 0 ? ieData[0] : [];
    var ieTypeCol = ieHeaders.indexOf('type');
    var ieTargetCol = ieHeaders.indexOf('target');
    var ieAmtCol = ieHeaders.indexOf('totalAmount');
    var iePaidCol = ieHeaders.indexOf('isPaid');

    var modified = false;

    for (var i = 1; i < sData.length; i++) {
      var currentDebt = Number(sData[i][debtCol]);
      var sName = String(sData[i][nameCol] || '').trim();

      // Chỉ can thiệp tự động sửa khi công nợ bị ÂM (do lỗi cũ quét nhầm giao dịch trả lương/tạm ứng)
      if (currentDebt < 0 && sName) {
        var unpaidTicketsDebt = 0;
        if (ieData.length > 1 && ieTypeCol !== -1 && ieTargetCol !== -1 && ieAmtCol !== -1) {
          for (var j = 1; j < ieData.length; j++) {
            var iType = String(ieData[j][ieTypeCol] || '').trim();
            var iTarget = String(ieData[j][ieTargetCol] || '').trim();
            var isPaid = iePaidCol !== -1 ? (ieData[j][iePaidCol] === true || String(ieData[j][iePaidCol]).toUpperCase() === 'TRUE') : false;
            var iAmt = Number(ieData[j][ieAmtCol]) || 0;

            if (iType === 'Nhập' && iTarget.toLowerCase() === sName.toLowerCase() && !isPaid && iAmt > 0) {
              unpaidTicketsDebt += iAmt;
            }
          }
        }

        // Cập nhật lại công nợ về đúng số tiền các phiếu nợ thực tế (hoặc 0 nếu không có nợ)
        sData[i][debtCol] = unpaidTicketsDebt;
        modified = true;
      }
    }

    if (modified) {
      supSheet.getRange(1, 1, sData.length, sHeaders.length).setValues(sData);
      SpreadsheetApp.flush();
    }

    return { success: true, modified: modified };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// HÀM CHỐNG TRỪ KÉP KHO HÀNG (SAFE DEDUCT INVENTORY ON HANDOVER)
// =========================================================================
function safeDeductInventoryOnHandover(ordersToHandover, ss) {
  try {
    if (!ordersToHandover) return;
    if (!Array.isArray(ordersToHandover)) {
      ordersToHandover = [ordersToHandover];
    }
    if (ordersToHandover.length === 0) return;

    var prodSheet = ss.getSheetByName('Production');
    var prodData = prodSheet ? readSheet('Production', null, ss) : [];
    var productsSheet = ss.getSheetByName('Products');
    var productsData = productsSheet ? productsSheet.getDataRange().getValues() : [];
    if (productsData.length === 0) return;

    var pHeaders = productsData[0];
    var pIdCol = pHeaders.indexOf('id');
    var pNameCol = pHeaders.indexOf('name');
    var pQtyCol = pHeaders.indexOf('quantity');
    var pCostCol = pHeaders.indexOf('costPrice');
    var catColIdx = pHeaders.indexOf('category');
    var subCatColIdx = pHeaders.indexOf('sub_category');

    var productsModified = false;
    var totalExportValue = 0;
    var allItemsToExport = [];
    var orderCodes = [];

    ordersToHandover.forEach(function (order) {
      if (!order) return;
      var oCode = (order.orderCode || '').split(' | ')[0] || (order.id ? String(order.id).substring(0, 5) : '');
      if (oCode) orderCodes.push(oCode);

      // 1. Sản phẩm từ Production (Bể Kính / Layout): Chỉ trừ kho thành phẩm cho các món LẤY TỪ TỒN KHO CÓ SẴN (fulfilledFromStock = true). Hàng sản xuất mới (MTO) đã khấu trừ phôi BOM trước đó nên không trừ kho thành phẩm nữa để chống trừ kép.
      var oId = String(order.id || '').trim();
      var oFullCode = String(order.orderCode || '').trim();
      var oBaseCode = oFullCode.split(' | ')[0].split('|')[0].trim();
      var orderProds = prodData.filter(function (p) {
        if (!p) return false;
        var pOrderId = String(p.orderId || '').trim();
        var isMatch = pOrderId === oId || (oFullCode && pOrderId === oFullCode) || (oBaseCode && pOrderId === oBaseCode);
        if (!isMatch) return false;
        var status = String(p.status).trim().toUpperCase();
        if (normalizeStatus(status) === 'Đơn Huỷ') return false;
        var isFulfilledFromStock = p.fulfilledFromStock === true || String(p.fulfilledFromStock).toUpperCase() === 'TRUE';
        return isFulfilledFromStock;
      });
      var prodNamesAdded = {};
      orderProds.forEach(function (rp) {
        if (rp && rp.name) {
          var pNameStr = String(rp.name).trim();
          // Layout dạng "Cover" phải luôn bypass cơ chế trừ kho thành phẩm tự động
          if (pNameStr.toLowerCase().indexOf('cover') > -1) {
            return;
          }
          allItemsToExport.push({ name: rp.name, qty: 1 });
          var k = pNameStr.toLowerCase();
          prodNamesAdded[k] = (prodNamesAdded[k] || 0) + 1;
        }
      });

      // 2. Phụ kiện đóng gói: Chỉ trừ những món CHƯA được tính trong Production
      var accs = [];
      if (typeof order.accessories === 'string') {
        try { accs = JSON.parse(order.accessories); } catch (e) { }
      } else {
        accs = order.accessories || [];
      }
      if (Array.isArray(accs)) {
        accs.forEach(function (a) {
          if (!a) return;
          var aName = typeof a === 'string' ? a : (a.name || a.Name || '');
          var qty = typeof a === 'object' ? (Number(a.quantity || a.qty) || 1) : 1;
          var aNameKey = String(aName).trim().toLowerCase();

          // Bỏ qua nếu là cover hoặc có fulfilledFromStock
          if (typeof a === 'object' && (a.fulfilledFromStock === true || String(a.fulfilledFromStock).toUpperCase() === 'TRUE')) {
            return;
          }
          if (aNameKey.indexOf('cover') > -1) {
            return;
          }

          // Nếu món này đã được đưa vào danh sách xuất từ lệnh Production tương ứng thì trừ bớt
          if (prodNamesAdded[aNameKey] && prodNamesAdded[aNameKey] > 0) {
            var remainingQty = Math.max(0, qty - prodNamesAdded[aNameKey]);
            prodNamesAdded[aNameKey] -= (qty - remainingQty);
            if (remainingQty > 0) {
              allItemsToExport.push({ name: aName, qty: remainingQty });
            }
          } else if (typeof a === 'object' && (a.hasProduction === true || a.hasProduction === 'true') && orderProds.length > 0) {
            // Bỏ qua nếu là món hàng sản xuất nhưng đã có Production xử lý
            return;
          } else if (aName) {
            allItemsToExport.push({ name: aName, qty: qty });
          }
        });
      }
    });

    // Gom nhóm và trừ kho cho TẤT CẢ các đơn
    if (allItemsToExport.length > 0) {
      var groupedItems = {};
      allItemsToExport.forEach(function (item) {
        var n = String(item.name).trim();
        if (!groupedItems[n]) groupedItems[n] = { name: n, qty: 0, price: 0 };
        groupedItems[n].qty += item.qty;
      });

      Object.keys(groupedItems).forEach(function (pName) {
        var gItem = groupedItems[pName];
        for (var i = 1; i < productsData.length; i++) {
          if (String(productsData[i][pNameCol]).trim().toLowerCase() === pName.toLowerCase()) {
            var cost = Number(productsData[i][pCostCol]) || 0;
            gItem.price = cost;
            var currentQty = Number(productsData[i][pQtyCol]) || 0;
            var category = catColIdx >= 0 ? String(productsData[i][catColIdx]).trim().toUpperCase() : '';
            var subCategory = subCatColIdx >= 0 ? String(productsData[i][subCatColIdx]).trim().toUpperCase() : '';

            if (pName.toLowerCase().indexOf('cover') > -1 || subCategory === 'COVER') {
              delete groupedItems[pName];
              break; // Bỏ qua tự động trừ kho cho Layout "Cover"
            }

            var newQty = currentQty - gItem.qty;
            if ((category.indexOf('BỂ KÍNH') > -1 || category.indexOf('LAYOUT') > -1) && newQty < 0) {
              newQty = 0;
            }
            productsData[i][pQtyCol] = newQty;
            totalExportValue += gItem.qty * cost;
            productsModified = true;
            break;
          }
        }
      });

      var validGroupedList = Object.values(groupedItems);
      if (validGroupedList.length > 0) {
        // Ghi note gom danh sách đơn
        var codesStr = orderCodes.join(', ');
        if (codesStr.length > 80) codesStr = codesStr.substring(0, 75) + '...';

        var logId = 'IE_SAFE_OUT_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        var targetName = ordersToHandover.length > 1 ? 'Bàn Giao Khách Hàng (Hàng Loạt)' : 'Bàn Giao Khách Hàng';

        var ieRow = SCHEMA_ERP.ImportExport.map(function (h) {
          if (h === 'id') return logId;
          if (h === 'type') return 'Xuất';
          if (h === 'target') return targetName;
          if (h === 'totalAmount') return totalExportValue;
          if (h === 'date') return Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
          if (h === 'note') return 'Xuất kho an toàn cho đơn: ' + codesStr;
          if (h === 'itemsData') return JSON.stringify(validGroupedList);
          return '';
        });

        var ieSheet = ss.getSheetByName('ImportExport');
        if (ieSheet) {
          var numCols = ieSheet.getLastColumn() || ieRow.length;
          if (ieRow.length < numCols) {
            while (ieRow.length < numCols) ieRow.push('');
          } else if (ieRow.length > numCols) {
            ieRow = ieRow.slice(0, numCols);
          }
          ieSheet.getRange(ieSheet.getLastRow() + 1, 1, 1, ieRow.length).setValues([ieRow]);
        }
      }
    }

    if (productsModified && productsSheet) {
      productsSheet.getRange(1, 1, productsData.length, pHeaders.length).setValues(productsData);
    }
  } catch (err) {
    Logger.log('Lỗi safeDeductInventoryOnHandover: ' + err.toString());
  }
}

function repairKPIProgressSheetHeaders() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('KPI_Progress');
    if (!sheet) return;

    var expectedSchema = ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty', 'guide'];

    // Ghi chuẩn tiêu đề hàng 1 theo đúng Schema 23 bảng
    sheet.getRange(1, 1, 1, expectedSchema.length).setValues([expectedSchema]);
    sheet.getRange(1, 1, 1, expectedSchema.length).setFontWeight("bold");

    var lastRow = sheet.getLastRow();
    if (lastRow >= 2) {
      var lastCol = Math.max(sheet.getLastColumn(), 13);
      var range = sheet.getRange(2, 1, lastRow - 1, lastCol);
      var values = range.getValues();
      var isChanged = false;

      for (var i = 0; i < values.length; i++) {
        var row = values[i];
        if (row[13] !== undefined && String(row[13]).trim() !== '' && (!row[12] || String(row[12]).trim() === '' || String(row[12]) === '0')) {
          row[12] = row[13];
          row[13] = '';
          isChanged = true;
        }
      }
      if (isChanged) {
        range.setValues(values);
      }
    }
  } catch (err) {
    Logger.log('Err repairKPIProgressSheetHeaders: ' + err.toString());
  }
}

// [REMOVED] api_insertManualKPI bản cũ (dead code — đã bị shadow bởi bản mới ở dưới có validation + tryLock tốt hơn)
// Xem hàm api_insertManualKPI chính thức tại block "THÊM KPI THỦ CÔNG VÀO BẢNG KPI_Progress"

/**
 * =========================================================================
 * API NHẬN DỮ LIỆU TỪ MODAL: GIAO NHIỆM VỤ (Vào bảng KPI_Progress với isClaimed = false)
 * =========================================================================
 */
function api_insertManualTask(payload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var kpiSheet = ss.getSheetByName('KPI_Progress');
    if (!kpiSheet) {
      kpiSheet = ss.insertSheet('KPI_Progress');
      kpiSheet.appendRow(SCHEMA_ERP.KPI_Progress || ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty', 'guide']);
    }

    var now = new Date();
    var timestamp = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");
    var taskId = 'KPI_XU_' + now.getTime() + '_' + Math.floor(Math.random() * 1000);
    var amount = Number(payload && (payload.amount_xu || payload.amount || payload.reward)) || 0;
    var target = Number(payload && payload.target) || 1;
    var current = Number(payload && payload.current) || 0;
    var unit = String((payload && payload.unit) || 'Lần').trim();
    var penalty = Number(payload && payload.penalty) || 0;
    var title = String((payload && (payload.title || payload.kpiName)) || 'Nhiệm vụ Xu').trim();
    var guide = String((payload && (payload.note || payload.guide)) || '').trim();

    var year = now.getFullYear();
    var month = now.getMonth();
    var startDateObj = new Date(year, month, 1, 0, 0, 0);
    var endDateObj = new Date(year, month + 1, 0, 23, 59, 59);
    var startTime = payload.startTime || Utilities.formatDate(startDateObj, 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
    var endTime = payload.endTime || Utilities.formatDate(endDateObj, 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

    // Schema: ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty', 'guide']
    var newRow = [
      taskId,
      payload.user,
      title,
      current,
      target,
      unit,
      timestamp,
      startTime,
      endTime,
      amount,
      false, // isClaimed: QUAN TRỌNG - CHƯA DUYỆT (Phải hoàn thành 100% chỉ tiêu mới nhận Xu)
      penalty,
      guide
    ];

    kpiSheet.appendRow(newRow);
    SpreadsheetApp.flush();
    return { success: true, message: 'Đã giao nhiệm vụ thành công cho ' + payload.user + '!' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * API XỬ LÝ DƯ NỢ LƯƠNG ÂM THEO CHUẨN ERP
 */
function api_settleMonthlyDebt(payload, pin) {
  var pinToAuth = pin || (payload && payload.pin);
  if (!pinToAuth) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để quyết toán nợ lương!' };
  var auth = validatePin(pinToAuth);
  if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  if (!checkServerPermission(auth, 'HR_PAY_SALARY_ADVANCE')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Kế Toán hoặc Tối Cao mới có quyền quyết toán nợ lương!' };
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var bpSheet = ss.getSheetByName('BonusPenalty');
    if (!bpSheet) {
      bpSheet = ss.insertSheet('BonusPenalty');
      bpSheet.appendRow(SCHEMA_ERP.BonusPenalty);
    }

    var parts = payload.monthStr.split('-');
    var nextMonthObj = new Date(parseInt(parts[0]), parseInt(parts[1]), 1); // Ngày 1 tháng sau
    var nextMonthStr = Utilities.formatDate(nextMonthObj, Session.getScriptTimeZone(), "yyyy-MM-dd");
    var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

    // 1. Tạo phiếu Reset số dư tháng hiện tại về 0 trên Bảng Lương
    var resetRow = [
      'BP_RESET_' + Date.now(),
      payload.user,
      payload.amount, // Số tiền dương để bù trừ hoàn toàn khoản âm tháng này
      'Thu Nhập Khác',
      'Điều chỉnh kết chuyển dư nợ kỳ lương ' + payload.monthStr,
      todayStr,
      ''
    ];
    bpSheet.appendRow(resetRow);

    // 2. Tạo phiếu nợ/vay cho tháng tiếp theo
    if (payload.mode === 'LOAN_INSTALLMENT') {
      // Chuyển thành Khoản Vay Nội Bộ
      var noteText = 'Khoản vay nội bộ kết chuyển từ dư nợ ' + payload.monthStr;
      if (payload.monthlyDeduction > 0) {
        noteText += ' (Quy định trừ ' + Number(payload.monthlyDeduction).toLocaleString('vi-VN') + 'đ/tháng)';
      }

      var loanRow = [
        'LOAN_' + Date.now(),
        payload.user,
        -payload.amount, // Đánh dấu nợ âm ở sổ cho vay
        'Khoản Vay Nội Bộ',
        noteText,
        nextMonthStr,
        ''
      ];
      bpSheet.appendRow(loanRow);

    } else {
      // Chuyển thành Nợ Tháng Trước (Trừ sạch kỳ sau)
      var debtRow = [
        'DEBT_' + Date.now(),
        payload.user,
        -payload.amount,
        'Nợ Tháng Trước',
        'Dư nợ lũy kế kết chuyển từ kỳ lương ' + payload.monthStr,
        nextMonthStr,
        ''
      ];
      bpSheet.appendRow(debtRow);
    }

    SpreadsheetApp.flush();
    return { success: true, message: 'Đã xử lý dư nợ thành công!' };

  } catch (error) {
    return { success: false, message: 'Lỗi Backend: ' + error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * API HOÀN THÀNH LÔ BỂ KÍNH (Batch Production)
 */
function api_completeBatchProduction(idList) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Production');
    if (!sheet) return { success: false, message: 'Không tìm thấy bảng Production' };

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var idCol = headers.indexOf('id');
    var statusCol = headers.indexOf('status');
    var p1_statusCol = headers.indexOf('p1_status');
    var p2_statusCol = headers.indexOf('p2_status');
    var p1_endTimeCol = headers.indexOf('p1_endTime');
    var p2_endTimeCol = headers.indexOf('p2_endTime');

    if (idCol === -1 || statusCol === -1) return { success: false, message: 'Lỗi cấu trúc bảng' };

    var nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    var modified = false;

    for (var i = 1; i < data.length; i++) {
      if (idList.indexOf(String(data[i][idCol])) !== -1) {
        // Cập nhật trạng thái cho cả dòng
        sheet.getRange(i + 1, statusCol + 1).setValue('Done');

        if (p1_statusCol !== -1) sheet.getRange(i + 1, p1_statusCol + 1).setValue('Done');
        if (p2_statusCol !== -1) sheet.getRange(i + 1, p2_statusCol + 1).setValue('Done');
        if (p1_endTimeCol !== -1 && data[i][p1_endTimeCol] === '') sheet.getRange(i + 1, p1_endTimeCol + 1).setValue(nowStr);
        if (p2_endTimeCol !== -1 && data[i][p2_endTimeCol] === '') sheet.getRange(i + 1, p2_endTimeCol + 1).setValue(nowStr);
        modified = true;
      }
    }

    if (modified) SpreadsheetApp.flush();

    return { success: true, message: 'Đã cập nhật ' + idList.length + ' lệnh' };
  } catch (error) {
    return { success: false, message: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * THUẬT TOÁN BƠM ĐƠN BỂ KÍNH: GỘP LỆNH CHƯA LÀM, TÁCH LỆNH ĐÃ LÀM
 * @param {Object} ss - Spreadsheet Active
 * @param {Object} newProdItem - Thông tin sản phẩm bể kính mới từ đơn hàng
 */
function processSmartGlassTankDispatch(ss, newProdItem) {
  var prodSheet = ss.getSheetByName('Production');
  if (!prodSheet) return;

  var prodData = prodSheet.getDataRange().getValues();
  var headers = prodData[0];

  var idIdx = headers.indexOf('id');
  var nameIdx = headers.indexOf('name');
  var statusIdx = headers.indexOf('status');
  var p1StatusIdx = headers.indexOf('p1_status');
  var orderIdIdx = headers.indexOf('orderId');
  var noteIdx = headers.indexOf('note');

  var searchName = String(newProdItem.name).trim().toLowerCase();
  var targetRowIndex = -1;

  // 1. Quét tìm Lệnh cũ có cùng Tên Bể Kính VÀ chưa bắt đầu làm (p1_status === 'Pending' hoặc rỗng)
  for (var i = 1; i < prodData.length; i++) {
    var rowName = String(prodData[i][nameIdx]).trim().toLowerCase();
    var rowStatus = String(prodData[i][statusIdx]).trim().toUpperCase();
    var rowP1Status = String(prodData[i][p1StatusIdx]).trim().toUpperCase();

    var isSameProduct = (rowName === searchName);
    var isUnstarted = (rowP1Status === 'PENDING' || rowP1Status === '' || rowStatus === 'PENDING' || rowStatus === 'CHỜ SẢN XUẤT');

    if (isSameProduct && isUnstarted) {
      targetRowIndex = i + 1; // Tìm thấy dòng Lệnh Cũ chưa làm!
      break;
    }
  }

  // 2. PHÂN NHÁNH XỬ LÝ
  if (targetRowIndex !== -1) {
    // === TRƯỜNG HỢP A: LỆNH CŨ CHƯA LÀM -> GỘP ĐƠN VÀO LỆNH CŨ ===
    var currentOrderId = String(prodData[targetRowIndex - 1][orderIdIdx] || '');
    var currentNote = String(prodData[targetRowIndex - 1][noteIdx] || '');

    // Nối thêm ID đơn mới và Cập nhật Ghi chú Lô
    var updatedOrderId = currentOrderId + (newProdItem.orderId ? ' | ' + newProdItem.orderId : '');
    var updatedNote = currentNote + ' [Gộp đơn: ' + (newProdItem.orderId || 'SXT') + ']';

    prodSheet.getRange(targetRowIndex, orderIdIdx + 1).setValue(updatedOrderId);
    prodSheet.getRange(targetRowIndex, noteIdx + 1).setValue(updatedNote);

  } else {
    // === TRƯỜNG HỢP B: ĐÃ CẮT MÀI DÁN HOẶC CHƯA CÓ LỆNH -> TẠO LỆNH MỚI ĐỘC LẬP ===
    var newProdId = newProdItem.id || ('PROD_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
    var newRow = headers.map(function (h) {
      if (h === 'id') return newProdId;
      if (h === 'orderId') return newProdItem.orderId || '';
      if (h === 'type') return newProdItem.type || 'Bể Kính';
      if (h === 'name') return newProdItem.name || '';
      if (h === 'status') return 'Pending';
      if (h === 'p1_name') return (newProdItem.phases && newProdItem.phases.phase1 && newProdItem.phases.phase1.name) ? newProdItem.phases.phase1.name : 'Cắt Dán';
      if (h === 'p1_status') return 'Pending';
      if (h === 'p2_name') return (newProdItem.phases && newProdItem.phases.phase2 && newProdItem.phases.phase2.name) ? newProdItem.phases.phase2.name : 'Gọt Keo';
      if (h === 'p2_status') return 'Pending';
      if (h === 'note') return newProdItem.note || 'Lệnh sản xuất mới';
      if (h === 'deadline') return newProdItem.deadline || '';
      if (h === 'p1_user') return newProdItem.p1_user || newProdItem.responsibleUser || '';
      return '';
    });

    prodSheet.appendRow(newRow);
  }
}


/**
 * CẬP NHẬT TIẾN ĐỘ KPI TỰ ĐỘNG DỰA TRÊN DỮ LIỆU ĐƠN HÀNG
 */
function updateKpiProgressData() {
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);

    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const kpiSheet = ss.getSheetByName('KPI_Progress');
      const ordersSheet = ss.getSheetByName('Orders');

      if (!kpiSheet || !ordersSheet) return;

      const kpiData = kpiSheet.getDataRange().getValues();
      const ordersData = ordersSheet.getDataRange().getValues();

      if (kpiData.length < 2 || ordersData.length < 2) return;

      const txSheet = ss.getSheetByName('Transactions');
      let txList = [];
      if (txSheet) {
        const txData = txSheet.getDataRange().getValues();
        if (txData.length > 1) {
          const txHeaders = txData[0];
          const txDateIdx = txHeaders.indexOf('date') !== -1 ? txHeaders.indexOf('date') : txHeaders.indexOf('createdAt');
          const txCatIdx = txHeaders.indexOf('category');
          const txTypeIdx = txHeaders.indexOf('type');
          const txAmtIdx = txHeaders.indexOf('amount');
          const txTitleIdx = txHeaders.indexOf('title') !== -1 ? txHeaders.indexOf('title') : txHeaders.indexOf('note');
          txList = txData.slice(1).map(r => ({
            date: r[txDateIdx],
            category: String(r[txCatIdx] || ''),
            type: String(r[txTypeIdx] || ''),
            amount: Math.abs(Number(r[txAmtIdx]) || 0),
            title: String(r[txTitleIdx] || '')
          }));
        }
      }

      const kpiHeaders = kpiData[0];
      const idIdx = kpiHeaders.indexOf('id');
      const userIdx = kpiHeaders.indexOf('user');
      const kpiNameIdx = kpiHeaders.indexOf('kpiName');
      const currentIdx = kpiHeaders.indexOf('current');
      const unitIdx = kpiHeaders.indexOf('unit');
      const startTimeIdx = kpiHeaders.indexOf('startTime');
      const endTimeIdx = kpiHeaders.indexOf('endTime');
      const lastUpdatedIdx = kpiHeaders.indexOf('lastUpdated');

      const orderHeaders = ordersData[0];
      const oStatusIdx = orderHeaders.indexOf('status');
      const oIsReconciledIdx = orderHeaders.indexOf('isReconciled');
      const oNoteIdx = orderHeaders.indexOf('note');
      const oRevenueIdx = orderHeaders.indexOf('revenue');
      const oCogsIdx = orderHeaders.indexOf('cogs');
      const oFeeFixedIdx = orderHeaders.indexOf('feeFixed');
      const oFeeServiceIdx = orderHeaders.indexOf('feeService');
      const oFeePaymentIdx = orderHeaders.indexOf('feePayment');
      const oDiscountIdx = orderHeaders.indexOf('discount');
      const oShopVoucherIdx = orderHeaders.indexOf('shopVoucher');
      const oReconciledAtIdx = orderHeaders.indexOf('reconciledAt');
      let oDateIdx = orderHeaders.indexOf('createdAt');
      if (oDateIdx === -1) oDateIdx = orderHeaders.indexOf('date');

      // Convert orders to objects for easier filtering
      const orders = ordersData.slice(1).map(row => {
        const recAt = row[oReconciledAtIdx];
        const rawDate = row[oDateIdx];
        return {
          status: row[oStatusIdx],
          isReconciled: String(row[oIsReconciledIdx]).toLowerCase() === 'true' || row[oIsReconciledIdx] === true,
          note: row[oNoteIdx] || '',
          revenue: Number(row[oRevenueIdx]) || 0,
          cogs: oCogsIdx !== -1 ? Number(row[oCogsIdx]) || 0 : 0,
          feeFixed: oFeeFixedIdx !== -1 ? Number(row[oFeeFixedIdx]) || 0 : 0,
          feeService: oFeeServiceIdx !== -1 ? Number(row[oFeeServiceIdx]) || 0 : 0,
          feePayment: oFeePaymentIdx !== -1 ? Number(row[oFeePaymentIdx]) || 0 : 0,
          discount: oDiscountIdx !== -1 ? Number(row[oDiscountIdx]) || 0 : 0,
          shopVoucher: oShopVoucherIdx !== -1 ? Number(row[oShopVoucherIdx]) || 0 : 0,
          date: rawDate,
          reconciledAt: recAt || rawDate
        };
      });

      const updates = [];

      for (let i = 1; i < kpiData.length; i++) {
        const kpi = kpiData[i];
        const user = String(kpi[userIdx] || '').trim();
        const unit = String(kpi[unitIdx] || '').trim().toLowerCase();
        const kpiName = String(kpi[kpiNameIdx] || '').toLowerCase();

        // Quét tự động cho Diệu Hương (Sales & QC Đóng gói) và Nguyễn Ngọc Tiến (Founder / Toàn Doanh Nghiệp)
        const userLower = user.toLowerCase();
        const isHương = userLower.includes('diệu hương') || userLower.includes('hương');
        const isTiến = userLower.includes('nguyễn ngọc tiến') || userLower.includes('tiến') || userLower.includes('founder') || userLower.includes('giám đốc');
        
        if (!isHương && !isTiến) continue;
        if (unit === 'xu' || unit === 'bộ' || unit === 'cái' || unit === 'checklist' || unit === 'lần') continue;

        // Nếu KPI đang được Boss ghi đè thủ công, giữ nguyên số liệu đã nhập
        const guideIdx = kpiHeaders.indexOf('guide') !== -1 ? kpiHeaders.indexOf('guide') : kpiHeaders.indexOf('Guide');
        if (guideIdx !== -1 && String(kpi[guideIdx] || '').indexOf('[MANUAL_OVERRIDE]') !== -1) continue;

        function parseDateFlex(d, isEnd) {
          if (!d) return null;
          if (d instanceof Date) return isNaN(d.getTime()) ? null : d;
          var str = String(d).trim().split(' ')[0].split('T')[0];
          var curYear = new Date().getFullYear();
          if (str.indexOf('/') !== -1) {
            var parts = str.split('/');
            if (parts.length === 3) {
              if (parts[2].length === 4) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
              if (parts[0].length === 4) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            } else if (parts.length === 2) {
              if (parts[1].length === 4) {
                var m = Number(parts[0]) - 1;
                var y = Number(parts[1]);
                if (isEnd) return new Date(y, m + 1, 0, 23, 59, 59, 999);
                return new Date(y, m, 1, 0, 0, 0, 0);
              }
              return new Date(curYear, Number(parts[1]) - 1, Number(parts[0]));
            }
          } else if (str.indexOf('-') !== -1) {
            var parts = str.split('-');
            if (parts.length === 3) {
              if (parts[0].length === 4) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
              if (parts[2].length === 4) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            } else if (parts.length === 2) {
              if (parts[0].length === 4) {
                var y = Number(parts[0]);
                var m = Number(parts[1]) - 1;
                if (isEnd) return new Date(y, m + 1, 0, 23, 59, 59, 999);
                return new Date(y, m, 1, 0, 0, 0, 0);
              }
              return new Date(curYear, Number(parts[0]) - 1, Number(parts[1]));
            }
          }
          var dt = new Date(d);
          return isNaN(dt.getTime()) ? null : dt;
        }

        var start = parseDateFlex(kpi[startTimeIdx], false) || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        var end = parseDateFlex(kpi[endTimeIdx], true) || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        const currentVal = Number(kpi[currentIdx]) || 0;
        let newVal = currentVal;

        function parseCleanRevGAS(raw, ch) {
          if (raw === null || raw === undefined || raw === '') return 0;
          var num = 0;
          if (typeof raw === 'number') {
            num = raw;
          } else {
            var str = String(raw).replace(/[đĐ\sVNDvnd$฿₱RM]/g, '').trim();
            if (!str) return 0;
            if (str.indexOf('.') !== -1 && str.indexOf(',') !== -1) {
              if (str.lastIndexOf('.') > str.lastIndexOf(',')) str = str.replace(/,/g, '');
              else str = str.replace(/\./g, '').replace(/,/g, '.');
            } else if (str.indexOf(',') !== -1) {
              if (/\,\d{3}($|\D)/.test(str) || /^\d{1,3}(,\d{3})+$/.test(str)) str = str.replace(/,/g, '');
              else str = str.replace(/,/g, '.');
            } else if (str.indexOf('.') !== -1) {
              var parts = str.split('.');
              if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3 && parseInt(parts[0]) > 0)) {
                str = str.replace(/\./g, '');
              }
            }
            num = parseFloat(str);
          }
          if (isNaN(num) || num <= 0) return 0;
          if (num > 100000000 && Number.isInteger(num)) return 0;
          var channelStr = String(ch || '').toUpperCase();
          if (channelStr.indexOf('USD') !== -1 || (channelStr.indexOf('XUẤT KHẨU') !== -1 && num < 10000)) num *= 25500;
          return Math.round(num);
        }

        // Filter orders within KPI timeframe
        const periodOrders = orders.filter(o => {
          var d1 = parseDateFlex(o.date || o.createdAt);
          var d2 = parseDateFlex(o.reconciledAt || o.updatedAt);
          var in1 = d1 && d1 >= start && d1 <= end;
          var in2 = d2 && d2 >= start && d2 <= end;
          return in1 || in2;
        });

        // 1. NGUYỄN NGỌC TIẾN (FOUNDER):
        if (isTiến) {
          // A. Doanh thu tổng toàn xưởng (khớp 100% với Thống Kê Đơn Hàng)
          if (kpiName.includes('doanh thu') && (unit.includes('vnd') || unit.includes('vnđ') || unit.includes('đ') || unit === '')) {
            newVal = periodOrders.reduce((sum, o) => {
              const st = String(o._effectiveStatus || o.status || '').trim().toUpperCase();
              const ch = String(o.channel || '').trim();
              const note = String(o.note || '').toLowerCase();
              if (ch === 'Sản Xuất Tồn' || ch === 'Sản Xuất Bù Kho') return sum;
              if (normalizeStatus(st) === 'Đơn Huỷ' || note.indexOf('hủy đơn') !== -1 || note.indexOf('huỷ đơn') !== -1) return sum;
              if (st.indexOf('HOÀN') !== -1 || note.indexOf('[kn-thang]') !== -1 || note.indexOf('hàng hoàn') !== -1) return sum;

              var rev = parseCleanRevGAS(o.revenue, ch);
              return sum + rev;
            }, 0);
          }
          // B. Lợi nhuận ròng % — Quét 100% dữ liệu thực tế
          else if ((kpiName.includes('lợi nhuận') || kpiName.includes('net profit') || kpiName.includes('p&l')) && (unit === '%' || kpiName.includes('%') || unit === '')) {
            let totalRev = 0;
            let totalCOGS = 0;
            let totalPlatformFee = 0;
            let totalDiscount = 0;

            periodOrders.forEach(o => {
              const st = String(o.status || '').trim().toUpperCase();
              const ch = String(o.channel || '').trim();
              if (ch === 'Sản Xuất Tồn' || ch === 'Sản Xuất Bù Kho' || normalizeStatus(st) === 'Đơn Huỷ') return;
              if (st.indexOf('HOÀN') !== -1) return;

              let rev = parseCleanRevGAS(o.revenue, ch);
              if (rev <= 0) return;

              totalRev += rev;
              totalCOGS += (Number(o.cogs) > 0 ? Number(o.cogs) : Math.round(rev * 0.165));
              const fees = (Number(o.feeFixed) || 0) + (Number(o.feeService) || 0) + (Number(o.feePayment) || 0);
              totalPlatformFee += (fees > 0 ? fees : Math.round(rev * 0.156));
              totalDiscount += ((Number(o.shopVoucher) || 0) + (Number(o.discount) || 0));
            });

            // Quét chi phí thực tế từ Transactions
            let realOpExpense = 0;
            txList.forEach(t => {
              var tDate = parseDateFlex(t.date);
              if (!tDate || tDate < start || tDate > end) return;
              var cat = String(t.category || '').toLowerCase();
              var type = String(t.type || '').toUpperCase();
              if (type === 'TRANSFER' || type === 'CHUYỂN KHOẢN' || cat.includes('chuyển khoản') || cat.includes('nội bộ') || cat.includes('rút tiền') || cat.includes('chờ')) return;
              if (cat.includes('lương') || cat.includes('vận hành') || cat.includes('mặt bằng') || cat.includes('điện nước') || cat.includes('tiếp khách') || cat.includes('vật tư') || cat.includes('bao bì') || cat.includes('ads') || cat.includes('marketing') || (type === 'EXPENSE' && !cat.includes('nhập hàng') && !cat.includes('nhà cung cấp') && !cat.includes('trả nợ'))) {
                realOpExpense += t.amount;
              }
            });

            const finalOpExpense = realOpExpense > 0 ? realOpExpense : (totalRev * 0.20);
            const netProfit = totalRev - totalCOGS - totalPlatformFee - totalDiscount - finalOpExpense;
            const margin = totalRev > 0 ? ((netProfit / totalRev) * 100) : 0;
            newVal = Math.max(0, Math.round(margin * 10) / 10);
          }
        }
        // 2. DIỆU HƯƠNG (SALES & ĐÓNG GÓI):
        else if (isHương) {
          // Logic 1: Đóng gói hoàn thành
          if (kpiName.includes('đóng gói') || (kpiName.includes('năng suất') && unit.includes('kiện'))) {
            const packSheet = ss.getSheetByName('Packings');
            if (packSheet) {
              const packData = packSheet.getDataRange().getValues();
              if (packData.length > 1) {
                const pkHeaders = packData[0];
                const pkUserIdx = pkHeaders.indexOf('user');
                const pkStatusIdx = pkHeaders.indexOf('status');
                const pkEndIdx = pkHeaders.indexOf('endTime') !== -1 ? pkHeaders.indexOf('endTime') : pkHeaders.indexOf('date');
                let packCount = 0;
                for (let p = 1; p < packData.length; p++) {
                  const pkRow = packData[p];
                  const pkU = String(pkRow[pkUserIdx] || '').toLowerCase();
                  const pkSt = String(pkRow[pkStatusIdx] || '').toUpperCase();
                  if ((pkU.includes('hương') || pkU.includes('diệu hương')) && (pkSt === 'DONE' || pkSt === 'ĐÃ XONG')) {
                    const pkDt = parseDateFlex(pkRow[pkEndIdx]);
                    if (pkDt && pkDt >= start && pkDt <= end) {
                      packCount++;
                    }
                  }
                }
                newVal = packCount;
              }
            }
          }
          // Logic 2: Returned Item Processing (> 80%)
          else if (kpiName.includes('xử lý hàng hoàn') || (kpiName.includes('hàng hoàn') && unit === '%')) {
            const totalReturns = periodOrders.filter(o => {
              const st = String(o.status || '').toUpperCase();
              const note = String(o.note || '').toLowerCase();
              return st.includes('HOÀN') || note.includes('hàng hoàn') || note.includes('trả hàng');
            });
            const reconciledReturns = totalReturns.filter(o => o.isReconciled || String(o.status).toUpperCase().includes('ĐỐI SOÁT'));
            if (totalReturns.length > 0) {
              newVal = Math.round((reconciledReturns.length / totalReturns.length) * 100);
            } else {
              newVal = 100; // No returns = 100% processing
            }
          }
          // Logic 3: Dispute Win Rate (> 60%)
          else if (kpiName.includes('tỷ lệ thắng khiếu nại') || (kpiName.includes('khiếu nại') && unit === '%')) {
            const orderPool = (periodOrders.length > 0) ? periodOrders : orders;
            const winCount = orderPool.filter(o => {
              const noteLower = String(o.note || '').toLowerCase();
              const statusLower = String(o.status || '').toLowerCase();
              return noteLower.includes('[kn-thang]') || noteLower.includes('thắng khiếu nại') || noteLower.includes('khiếu nại hợp lệ') || statusLower.includes('thắng khiếu nại');
            }).length;

            const loseCount = orderPool.filter(o => {
              const noteLower = String(o.note || '').toLowerCase();
              const statusLower = String(o.status || '').toLowerCase();
              return noteLower.includes('[kn-thua]') || noteLower.includes('thua khiếu nại') || noteLower.includes('khiếu nại không hợp lệ') || statusLower.includes('thua khiếu nại');
            }).length;

            const totalDisputes = winCount + loseCount;
            if (totalDisputes > 0) {
              newVal = Math.round((winCount / totalDisputes) * 100);
            } else {
              newVal = 0;
            }
          }
          // Logic 4: Sales Revenue Target
          else if (kpiName.includes('doanh thu') && (unit.includes('vnd') || unit.includes('vnđ') || unit.includes('đ'))) {
            newVal = periodOrders.reduce((sum, o) => {
              const st = String(o.status || '').trim();
              const ch = String(o.channel || '').trim();
              const chLower = ch.toLowerCase();
              if (ch === 'Sản Xuất Tồn' || ch === 'Sản Xuất Bù Kho' || chLower.includes('cộng tác viên') || ch === 'CTV') return sum;

              const oUser = String(o.responsibleUser || o.sale || '').toLowerCase().trim();
              const isUserDirectMatch = oUser.includes('diệu hương') || oUser.includes('hương');
              const isDirectChannel = chLower.includes('bán lẻ') || chLower.includes('ban le') ||
                chLower.includes('bán sỉ') || chLower.includes('ban si') ||
                chLower.includes('facebook') || chLower.includes('fb') ||
                chLower.includes('zalo') || chLower.includes('tư vấn') ||
                chLower.includes('hotline') || chLower.includes('trực tiếp') ||
                chLower.includes('khách lẻ') || chLower.includes('cửa hàng') ||
                chLower.includes('messenger');

              if ((isUserDirectMatch || (!oUser && isDirectChannel)) && !st.includes('Hủy') && !st.includes('Huỷ') && !st.includes('Hoàn') && !st.includes('Thất bại') && st !== 'Cancelled' && st !== 'Returned') {
                let rev = Number(o.revenue) || 0;
                const chUpper = ch.toUpperCase();
                if (chUpper.includes('USD') || (chUpper.includes('XUẤT KHẨU') && rev < 10000)) rev *= 25500;
                return sum + Math.round(rev);
              }
              return sum;
            }, 0);
          }
        }

        if (newVal !== currentVal) {
          updates.push({ row: i + 1, col: currentIdx + 1, val: newVal });
          if (lastUpdatedIdx > -1) {
            updates.push({ row: i + 1, col: lastUpdatedIdx + 1, val: new Date() });
          }
        }
      }

      // Apply updates
      if (updates.length > 0) {
        updates.forEach(u => {
          kpiSheet.getRange(u.row, u.col).setValue(u.val);
        });
        Logger.log(`Updated ${updates.length / (lastUpdatedIdx > -1 ? 2 : 1)} KPIs in KPI_Progress.`);
      }

    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    Logger.log('Lỗi updateKpiProgressData: ' + err.toString());
  }
}

/**
 * TỰ ĐỘNG THIẾT LẬP TIME-DRIVEN TRIGGER QUÉT KPI
 * Chạy hàm này 1 lần duy nhất trong Google Apps Script Editor
 */
function setupKpiCronTrigger() {
  // Xóa các trigger cũ trùng tên để tránh chạy đúp
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    const handler = triggers[i].getHandlerFunction();
    if (
      handler === 'updateKpiProgressData' || 
      handler === 'updateKpiProgressData_Duong' || 
      handler === 'updateKpiProgressData_Tam' ||
      handler === 'updateKpiProgressData_Trang'
    ) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Tạo trigger mới: Chạy tự động mỗi 1 giờ
  ScriptApp.newTrigger('updateKpiProgressData')
    .timeBased()
    .everyHours(1)
    .create();

  ScriptApp.newTrigger('updateKpiProgressData_Duong')
    .timeBased()
    .everyHours(1)
    .create();

  ScriptApp.newTrigger('updateKpiProgressData_Tam')
    .timeBased()
    .everyHours(1)
    .create();

  ScriptApp.newTrigger('updateKpiProgressData_Trang')
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log('🟢 ĐÃ KHỞI TẠO TRIGGER TỰ ĐỘNG CẬP NHẬT KPI MỖI 1 GIỜ thành công!');
}

/**
 * CẬP NHẬT TIẾN ĐỘ KPI TỰ ĐỘNG CHO NGUYỄN HOÀNG DƯƠNG (Quản lý kho & Bể Kính)
 */
function updateKpiProgressData_Duong() {
  try {
    const lock = LockService.getScriptLock();
    // Chờ tối đa 15s để tránh đụng độ dữ liệu
    lock.waitLock(15000);

    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const kpiSheet = ss.getSheetByName('KPI_Progress');
      const prodSheet = ss.getSheetByName('Production');
      const productsSheet = ss.getSheetByName('Products');
      const importExportSheet = ss.getSheetByName('ImportExport');

      if (!kpiSheet || !prodSheet || !productsSheet || !importExportSheet) return;

      const kpiData = kpiSheet.getDataRange().getValues();
      const prodData = prodSheet.getDataRange().getValues();
      const productsData = productsSheet.getDataRange().getValues();
      const ieData = importExportSheet.getDataRange().getValues();

      if (kpiData.length < 2) return;

      const kpiHeaders = kpiData[0];
      const userIdx = kpiHeaders.indexOf('user');
      const kpiNameIdx = kpiHeaders.indexOf('kpiName');
      const currentIdx = kpiHeaders.indexOf('current');
      const startTimeIdx = kpiHeaders.indexOf('startTime');
      const endTimeIdx = kpiHeaders.indexOf('endTime');
      const lastUpdatedIdx = kpiHeaders.indexOf('lastUpdated');

      // Parse Production
      const prodHeaders = prodData[0];
      const p1UserIdx = prodHeaders.indexOf('p1_user');
      const p1StatusIdx = prodHeaders.indexOf('p1_status');
      const p1EndTimeIdx = prodHeaders.indexOf('p1_endTime');

      // Parse Products
      const prdHeaders = productsData[0];
      const skuIdx = prdHeaders.indexOf('sku');
      const categoryIdx = prdHeaders.indexOf('category');
      const quantityIdx = prdHeaders.indexOf('quantity');
      const minStockIdx = prdHeaders.indexOf('minStock');

      // Parse ImportExport (Caching O(N))
      const ieHeaders = ieData[0];
      const ieDateIdx = ieHeaders.indexOf('date');
      const ieItemsDataIdx = ieHeaders.indexOf('itemsData');

      // Khởi tạo thời gian hiện tại
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));

      // Cache ImportExport trong 24h qua thành chuỗi khổng lồ để quét (O(N))
      let recentIEString = "";
      for (let i = 1; i < ieData.length; i++) {
        const ieDate = new Date(ieData[i][ieDateIdx]);
        if (ieDate >= twentyFourHoursAgo) {
          recentIEString += String(ieData[i][ieItemsDataIdx] || "");
        }
      }

      const updates = [];

      // Bắt đầu quét KPI
      for (let i = 1; i < kpiData.length; i++) {
        const kpi = kpiData[i];
        if (String(kpi[userIdx]) !== 'Nguyễn Hoàng Dương') continue;

        const kpiName = String(kpi[kpiNameIdx] || '').toLowerCase();
        const start = new Date(kpi[startTimeIdx]);
        const end = new Date(kpi[endTimeIdx]);
        const currentVal = Number(kpi[currentIdx]) || 0;
        let newVal = currentVal;

        // KPI 4: Cân bằng Kho 5S -> BYPASSED
        if (kpiName.includes('cân bằng kho') || kpiName.includes('5s')) {
          // Bypassed: Quản lý sẽ có toàn quyền kiểm tra thực tế kho và gõ % trực tiếp
          continue;
        }

        // Lọc dữ liệu Production trong tháng cho Dương
        const duongProds = [];
        for (let j = 1; j < prodData.length; j++) {
          const row = prodData[j];
          if (row[p1UserIdx] === 'Nguyễn Hoàng Dương' && row[p1StatusIdx] === 'Done') {
            const endTime = new Date(row[p1EndTimeIdx]);
            if (endTime >= start && endTime <= end) {
              duongProds.push(endTime);
            }
          }
        }

        // KPI 1: Năng suất Cắt & Dán Bể Kính Hoàn Thành (Target: 180 Bể)
        if (kpiName.includes('cắt & dán') || kpiName.includes('năng suất')) {
          newVal = duongProds.length;
        }

        // KPI 2: SLA Cấp Phôi Kính Ca Sáng (Đạt trước 11:30 AM)
        else if (kpiName.includes('sla') || kpiName.includes('ca sáng')) {
          let onTimeCount = 0;
          duongProds.forEach(dt => {
            // Sử dụng set múi giờ bằng format (GMT+7)
            const hourStr = Utilities.formatDate(dt, 'Asia/Ho_Chi_Minh', 'HH');
            const minStr = Utilities.formatDate(dt, 'Asia/Ho_Chi_Minh', 'mm');
            const hh = parseInt(hourStr, 10);
            const mm = parseInt(minStr, 10);

            // <= 11:30:59
            if (hh < 11 || (hh === 11 && mm <= 30)) {
              onTimeCount++;
            }
          });

          if (duongProds.length > 0) {
            newVal = Math.round((onTimeCount / duongProds.length) * 100);
          } else {
            newVal = 100; // Chưa làm gì trong tháng thì coi như SLA 100%
          }
        }

        // KPI 3: Cảnh báo Chống Đứt gãy Vật tư (Target: 0)
        else if (kpiName.includes('đứt gãy') || kpiName.includes('vật tư')) {
          let violationCount = 0;

          for (let p = 1; p < productsData.length; p++) {
            const prdRow = productsData[p];
            if (prdRow[categoryIdx] === 'DANH MỤC SẢN XUẤT') {
              const qty = Number(prdRow[quantityIdx]) || 0;
              const minStock = Number(prdRow[minStockIdx]) || 0;

              if (qty <= minStock) {
                const sku = String(prdRow[skuIdx]);
                // Kiểm tra xem SKU cạn này có nằm trong chuỗi JSON ImportExport 24h qua không
                if (!recentIEString.includes(sku)) {
                  violationCount++;
                }
              }
            }
          }
          newVal = violationCount;
        }

        if (newVal !== currentVal) {
          updates.push({ row: i + 1, col: currentIdx + 1, val: newVal });
          if (lastUpdatedIdx > -1) {
            updates.push({ row: i + 1, col: lastUpdatedIdx + 1, val: new Date() });
          }
        }
      }

      // Áp dụng updates
      if (updates.length > 0) {
        updates.forEach(u => {
          kpiSheet.getRange(u.row, u.col).setValue(u.val);
        });
        Logger.log(`Đã cập nhật ${updates.length / (lastUpdatedIdx > -1 ? 2 : 1)} KPIs cho Nguyễn Hoàng Dương.`);
      }

    } catch (innerErr) {
      Logger.log('Lỗi updateKpiProgressData_Duong (inner): ' + innerErr.toString());
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    Logger.log('Lỗi updateKpiProgressData_Duong: ' + err.toString());
  }
}

/**
 * CẬP NHẬT TIẾN ĐỘ KPI TỰ ĐỘNG CHO LẠI TRƯỜNG TÂM (Quản lý Nhân sự & Khâu 2)
 */
function updateKpiProgressData_Tam() {
  try {
    const lock = LockService.getScriptLock();
    // Chờ tối đa 15s để chống ghi đè đồng thời
    lock.waitLock(15000);

    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const kpiSheet = ss.getSheetByName('KPI_Progress');
      const attSheet = ss.getSheetByName('Attendance');
      const prodSheet = ss.getSheetByName('Production');

      if (!kpiSheet || !attSheet || !prodSheet) return;

      const kpiData = kpiSheet.getDataRange().getValues();
      const attData = attSheet.getDataRange().getValues();
      const prodData = prodSheet.getDataRange().getValues();

      if (kpiData.length < 2) return;

      const kpiHeaders = kpiData[0];
      const userIdx = kpiHeaders.indexOf('user');
      const kpiNameIdx = kpiHeaders.indexOf('kpiName');
      const currentIdx = kpiHeaders.indexOf('current');
      const startTimeIdx = kpiHeaders.indexOf('startTime');
      const endTimeIdx = kpiHeaders.indexOf('endTime');
      const lastUpdatedIdx = kpiHeaders.indexOf('lastUpdated');

      // Parse Attendance
      const attHeaders = attData[0];
      const attUserIdx = attHeaders.indexOf('user');
      const attDateIdx = attHeaders.indexOf('date');
      const attStatusIdx = attHeaders.indexOf('status');
      const attPenaltyIdx = attHeaders.indexOf('penalty');

      // Parse Production
      const prodHeaders = prodData[0];
      const p2UserIdx = prodHeaders.indexOf('p2_user');
      const p2StatusIdx = prodHeaders.indexOf('p2_status');
      const p2EndTimeIdx = prodHeaders.indexOf('p2_endTime');
      const qcStatusIdx = prodHeaders.indexOf('qc_status');
      const prodStatusIdx = prodHeaders.indexOf('status');

      const updates = [];

      // Bắt đầu quét KPI cho Lại Trường Tâm
      for (let i = 1; i < kpiData.length; i++) {
        const kpi = kpiData[i];
        const user = String(kpi[userIdx] || '').trim();
        if (user !== 'Lại Trường Tâm') continue;

        const kpiName = String(kpi[kpiNameIdx] || '').toLowerCase().trim();
        const start = new Date(kpi[startTimeIdx]);
        const end = new Date(kpi[endTimeIdx]);
        end.setHours(23, 59, 59, 999);
        const currentVal = Number(kpi[currentIdx]) || 0;
        let newVal = currentVal;

        // 1. KPI Kỷ luật chấm công & giờ giấc xưởng (Target: 100%)
        if (kpiName.includes('kỷ luật') || kpiName.includes('chấm công') || kpiName.includes('giờ giấc') || kpiName.includes('5s')) {
          let totalShifts = 0;
          let violationShifts = 0;

          for (let a = 1; a < attData.length; a++) {
            const attRow = attData[a];
            if (!attRow[attUserIdx]) continue;

            const attDate = new Date(attRow[attDateIdx]);
            if (isNaN(attDate.getTime()) || attDate < start || attDate > end) continue;

            totalShifts++;

            const st = String(attRow[attStatusIdx] || '').toLowerCase();
            const pen = Number(attRow[attPenaltyIdx] || 0);

            // Ca vi phạm: quên chấm ra, đi muộn, muộn >1h, nghỉ không phép, hoặc có tiền phạt vi phạm
            if (
              st.includes('quên chấm') || 
              st.includes('đi muộn') || 
              st.includes('muộn') || 
              st.includes('không phép') || 
              st.includes('vi phạm') || 
              pen > 0
            ) {
              violationShifts++;
            }
          }

          if (totalShifts > 0) {
            newVal = Math.max(0, Math.round((1 - (violationShifts / totalShifts)) * 100));
          } else {
            newVal = 100; // Chưa phát sinh dữ liệu chấm công -> 100%
          }
        }

        // 2. KPI Năng suất Khâu 2 (Gọt Keo & Gia Cố)
        else if (kpiName.includes('năng suất') || kpiName.includes('khâu 2') || kpiName.includes('gọt keo') || kpiName.includes('gia cố')) {
          if (!kpiName.includes('kcs') && !kpiName.includes('vòng 1') && !kpiName.includes('đạt chuẩn')) {
            let tamDoneCount = 0;
            for (let p = 1; p < prodData.length; p++) {
              const pRow = prodData[p];
              const p2U = String(pRow[p2UserIdx] || '').trim();
              const p2St = String(pRow[p2StatusIdx] || '').trim();
              if (p2U === 'Lại Trường Tâm' && (p2St === 'Done' || p2St === 'ĐÃ XONG')) {
                const p2End = new Date(pRow[p2EndTimeIdx]);
                if (!isNaN(p2End.getTime()) && p2End >= start && p2End <= end) {
                  tamDoneCount++;
                }
              }
            }
            newVal = tamDoneCount;
          }
        }

        // 3. KPI Tỷ lệ đạt chuẩn KCS Khâu 2 vòng 1 (Target: 95%)
        if (kpiName.includes('kcs') || kpiName.includes('vòng 1') || kpiName.includes('đạt chuẩn')) {
          let totalTamProds = 0;
          let passFirstRound = 0;

          for (let p = 1; p < prodData.length; p++) {
            const pRow = prodData[p];
            const p2U = String(pRow[p2UserIdx] || '').trim();
            const p2St = String(pRow[p2StatusIdx] || '').trim();
            if (p2U === 'Lại Trường Tâm' && (p2St === 'Done' || p2St === 'ĐÃ XONG')) {
              const p2End = new Date(pRow[p2EndTimeIdx]);
              if (!isNaN(p2End.getTime()) && p2End >= start && p2End <= end) {
                totalTamProds++;

                const qcSt = String(pRow[qcStatusIdx] || '').toUpperCase().trim();
                const pSt = String(pRow[prodStatusIdx] || '').toUpperCase().trim();

                // Đạt KCS ngay lần đầu: qc_status không bị FAIL / Lỗi / Hỏng và không bị trả lại sửa
                if (qcSt !== 'FAIL' && qcSt !== 'LỖI' && qcSt !== 'SỬA LẠI' && !pSt.includes('LỖI')) {
                  passFirstRound++;
                }
              }
            }
          }

          if (totalTamProds > 0) {
            newVal = Math.min(100, Math.max(0, Math.round((passFirstRound / totalTamProds) * 100)));
          } else {
            newVal = 100;
          }
        }

        if (newVal !== currentVal) {
          updates.push({ row: i + 1, col: currentIdx + 1, val: newVal });
          if (lastUpdatedIdx > -1) {
            updates.push({ row: i + 1, col: lastUpdatedIdx + 1, val: new Date() });
          }
        }
      }

      // Áp dụng updates
      if (updates.length > 0) {
        updates.forEach(u => {
          kpiSheet.getRange(u.row, u.col).setValue(u.val);
        });
        Logger.log(`Đã cập nhật ${updates.length / (lastUpdatedIdx > -1 ? 2 : 1)} KPIs cho Lại Trường Tâm.`);
      }

    } catch (innerErr) {
      Logger.log('Lỗi updateKpiProgressData_Tam (inner): ' + innerErr.toString());
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    Logger.log('Lỗi updateKpiProgressData_Tam: ' + err.toString());
  }
}

/**
 * CẬP NHẬT TIẾN ĐỘ KPI TỰ ĐỘNG CHO NGUYỄN THỊ HUYỀN TRANG (Kế Toán)
 */
function updateKpiProgressData_Trang() {
  try {
    const lock = LockService.getScriptLock();
    // Chờ tối đa 15s để chống ghi đè đồng thời
    lock.waitLock(15000);

    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const kpiSheet = ss.getSheetByName('KPI_Progress');
      const txSheet = ss.getSheetByName('Transactions');
      const suppSheet = ss.getSheetByName('Suppliers');
      const ieSheet = ss.getSheetByName('ImportExport');
      const snapSheet = ss.getSheetByName('Monthly_Snapshots');

      if (!kpiSheet) return;

      const kpiData = kpiSheet.getDataRange().getValues();
      if (kpiData.length < 2) return;

      const txData = txSheet ? txSheet.getDataRange().getValues() : [];
      const suppData = suppSheet ? suppSheet.getDataRange().getValues() : [];
      const ieData = ieSheet ? ieSheet.getDataRange().getValues() : [];
      const snapData = snapSheet ? snapSheet.getDataRange().getValues() : [];

      const kpiHeaders = kpiData[0];
      const userIdx = kpiHeaders.indexOf('user');
      const kpiNameIdx = kpiHeaders.indexOf('kpiName');
      const currentIdx = kpiHeaders.indexOf('current');
      const startTimeIdx = kpiHeaders.indexOf('startTime');
      const endTimeIdx = kpiHeaders.indexOf('endTime');
      const lastUpdatedIdx = kpiHeaders.indexOf('lastUpdated');

      // Parse Transactions
      const txHeaders = txData.length > 0 ? txData[0] : [];
      const txTypeIdx = txHeaders.indexOf('type');
      const txDateIdx = txHeaders.indexOf('date');
      const txClearedIdx = txHeaders.indexOf('isCleared');
      const txNoteIdx = txHeaders.indexOf('note');
      const txTitleIdx = txHeaders.indexOf('title');
      const txAmtIdx = txHeaders.indexOf('amount');

      // Parse Suppliers
      const suppHeaders = suppData.length > 0 ? suppData[0] : [];
      const suppNameIdx = suppHeaders.indexOf('name');
      const suppDebtIdx = suppHeaders.indexOf('totalDebt');

      // Parse ImportExport
      const ieHeaders = ieData.length > 0 ? ieData[0] : [];
      const ieTypeIdx = ieHeaders.indexOf('type');
      const ieTargetIdx = ieHeaders.indexOf('target');
      const ieTotalAmtIdx = ieHeaders.indexOf('totalAmount');
      const ieDateIdx = ieHeaders.indexOf('date');

      // Parse Monthly_Snapshots
      const snapHeaders = snapData.length > 0 ? snapData[0] : [];
      const snapMonthIdx = snapHeaders.indexOf('month');

      const updates = [];

      // Bắt đầu quét KPI cho Nguyễn Thị Huyền Trang
      for (let i = 1; i < kpiData.length; i++) {
        const kpi = kpiData[i];
        const user = String(kpi[userIdx] || '').trim();
        if (user !== 'Nguyễn Thị Huyền Trang') continue;

        const kpiName = String(kpi[kpiNameIdx] || '').toLowerCase().trim();
        const start = new Date(kpi[startTimeIdx]);
        const end = new Date(kpi[endTimeIdx]);
        end.setHours(23, 59, 59, 999);
        const currentVal = Number(kpi[currentIdx]) || 0;
        let newVal = currentVal;

        // 1. KPI Khớp lệnh đối soát dòng tiền tự động (Target: 100%)
        if (kpiName.includes('đối soát') || kpiName.includes('dòng tiền') || kpiName.includes('khớp lệnh') || kpiName.includes('sao kê')) {
          let totalTx = 0;
          let clearedTx = 0;

          if (txData.length > 1 && txDateIdx > -1) {
            for (let t = 1; t < txData.length; t++) {
              const txRow = txData[t];
              const txDate = new Date(txRow[txDateIdx]);
              if (isNaN(txDate.getTime()) || txDate < start || txDate > end) continue;

              totalTx++;
              const isClr = txClearedIdx > -1 ? txRow[txClearedIdx] : null;
              if (isClr === true || isClr === 'true' || isClr === 1 || isClr === '1') {
                clearedTx++;
              }
            }
          }

          if (totalTx > 0) {
            newVal = Math.min(100, Math.max(0, Math.round((clearedTx / totalTx) * 100)));
          } else {
            newVal = 100; // Chưa có giao dịch trong kỳ -> 100%
          }
        }

        // 2. KPI Khóa sổ kế toán & bảng lương đúng hạn (Target: 1 Kỳ)
        else if (kpiName.includes('khóa sổ') || kpiName.includes('bảng lương') || kpiName.includes('snapshot') || kpiName.includes('kỳ lương')) {
          let isLocked = false;
          const kpiMonthStr = Utilities.formatDate(start, 'Asia/Ho_Chi_Minh', 'yyyy-MM');

          if (snapData.length > 1 && snapMonthIdx > -1) {
            for (let s = 1; s < snapData.length; s++) {
              const sMonth = String(snapData[s][snapMonthIdx] || '').trim();
              if (sMonth === kpiMonthStr || sMonth.startsWith(kpiMonthStr)) {
                isLocked = true;
                break;
              }
            }
          }
          newVal = isLocked ? 1 : 0;
        }

        // 3. KPI Quản trị công nợ Nhà Cung Cấp (Target: 100%)
        else if (kpiName.includes('công nợ') || kpiName.includes('nhà cung cấp') || kpiName.includes('ncc')) {
          let totalSuppliers = 0;
          let validSuppliers = 0;

          if (suppData.length > 1 && suppNameIdx > -1) {
            for (let sp = 1; sp < suppData.length; sp++) {
              const spRow = suppData[sp];
              const spName = String(spRow[suppNameIdx] || '').trim();
              if (!spName) continue;

              totalSuppliers++;
              const trackedDebt = suppDebtIdx > -1 ? Number(spRow[suppDebtIdx] || 0) : 0;

              // Tính tổng nhập hàng từ NCC này
              let totalImportAmt = 0;
              if (ieData.length > 1 && ieTargetIdx > -1 && ieTypeIdx > -1) {
                for (let ie = 1; ie < ieData.length; ie++) {
                  const ieRow = ieData[ie];
                  const ieTarget = String(ieRow[ieTargetIdx] || '').trim();
                  const ieType = String(ieRow[ieTypeIdx] || '').trim();
                  if (ieTarget === spName && ieType.toLowerCase().includes('nhập')) {
                    totalImportAmt += Number(ieRow[ieTotalAmtIdx] || 0);
                  }
                }
              }

              // Tính tổng chi thanh toán cho NCC này
              let totalPaidAmt = 0;
              if (txData.length > 1 && txTypeIdx > -1) {
                for (let tx = 1; tx < txData.length; tx++) {
                  const txRow = txData[tx];
                  const txType = String(txRow[txTypeIdx] || '').trim();
                  const txNote = String(txRow[txNoteIdx] || '') + ' ' + String(txRow[txTitleIdx] || '');
                  if (txType.toLowerCase().includes('chi') && txNote.includes(spName)) {
                    totalPaidAmt += Number(txRow[txAmtIdx] || 0);
                  }
                }
              }

              // Công nợ hợp lệ: Không bị âm vô lý và khớp logic quản trị
              const calculatedDebt = totalImportAmt - totalPaidAmt;
              if (trackedDebt >= 0 && (totalImportAmt === 0 || Math.abs(trackedDebt - calculatedDebt) < 1000000 || trackedDebt === calculatedDebt)) {
                validSuppliers++;
              }
            }
          }

          if (totalSuppliers > 0) {
            newVal = Math.min(100, Math.max(0, Math.round((validSuppliers / totalSuppliers) * 100)));
          } else {
            newVal = 100;
          }
        }

        if (newVal !== currentVal) {
          updates.push({ row: i + 1, col: currentIdx + 1, val: newVal });
          if (lastUpdatedIdx > -1) {
            updates.push({ row: i + 1, col: lastUpdatedIdx + 1, val: new Date() });
          }
        }
      }

      // Áp dụng updates
      if (updates.length > 0) {
        updates.forEach(u => {
          kpiSheet.getRange(u.row, u.col).setValue(u.val);
        });
        Logger.log(`Đã cập nhật ${updates.length / (lastUpdatedIdx > -1 ? 2 : 1)} KPIs cho Nguyễn Thị Huyền Trang.`);
      }

    } catch (innerErr) {
      Logger.log('Lỗi updateKpiProgressData_Trang (inner): ' + innerErr.toString());
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    Logger.log('Lỗi updateKpiProgressData_Trang: ' + err.toString());
  }
}


// =========================================================================
// MODULE: RCA RESOLVER & AUTO-BOM / SLA / LOAD BALANCING AUTOMATION
// Tác giả: AI Operations Leader - Rich Fish Aquarium
// =========================================================================



/**
 * 2. SLA AUTOMATION (processSlaAutomation)
 * Tự động chuyển Orders.status sang 'Sẵn sàng đóng gói' khi KCS Passed và đủ phụ kiện
 */
function processSlaAutomation(orderId) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) return { success: false, message: 'Hệ thống bận.' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var oSheet = ss.getSheetByName('Orders');
    var prodSheet = ss.getSheetByName('Products');
    if (!oSheet || !prodSheet) return { success: false, message: 'Không tìm thấy sheet Orders hoặc Products!' };

    var oData = oSheet.getDataRange().getValues();
    var oHead = oData[0];
    var idCol = oHead.indexOf('id');
    var stCol = oHead.indexOf('status');
    var accCol = oHead.indexOf('accessories');

    var targetOrderRow = -1;
    var targetOrder = null;
    for (var i = 1; i < oData.length; i++) {
      if (String(oData[i][idCol]) === String(orderId)) {
        targetOrderRow = i + 1;
        targetOrder = {
          id: oData[i][idCol],
          status: oData[i][stCol],
          accessories: oData[i][accCol]
        };
        break;
      }
    }

    if (!targetOrder) return { success: false, message: 'Không tìm thấy orderId: ' + orderId };

    // Giải mã phụ kiện an toàn
    var accList = [];
    try {
      if (typeof targetOrder.accessories === 'string' && targetOrder.accessories.trim() !== '') {
        accList = JSON.parse(targetOrder.accessories);
      }
    } catch (e) {
      accList = [];
    }

    // Đọc tồn kho các phụ kiện từ Products
    var prData = prodSheet.getDataRange().getValues();
    var prHead = prData[0];
    var prNameCol = prHead.indexOf('name');
    var prQtyCol = prHead.indexOf('quantity');

    var isAllAccAvailable = true;
    if (Array.isArray(accList) && accList.length > 0) {
      accList.forEach(function (acc) {
        if (!acc) return;
        if (acc.hasProduction === true || acc.hasProduction === 'true') return;

        var accName = typeof acc === 'string' ? acc : (acc.name || acc.Name || '');
        var accQty = typeof acc === 'object' ? (Number(acc.quantity || acc.qty) || 1) : 1;

        var foundStock = 0;
        var foundCat = '';
        var foundProd = false;
        var cleanAccName = String(accName).trim().toLowerCase().replace(/\s+/g, ' ');
        for (var p = 1; p < prData.length; p++) {
          var cleanPrName = String(prData[p][prNameCol]).trim().toLowerCase().replace(/\s+/g, ' ');
          if (cleanPrName === cleanAccName) {
            foundProd = true;
            foundStock = Number(prData[p][prQtyCol]) || 0;
            var catCol = prHead.indexOf('category');
            var subCatCol = prHead.indexOf('sub_category');
            if (catCol !== -1) foundCat = String(prData[p][catCol]).toUpperCase().trim();
            if (subCatCol !== -1 && (!foundCat || foundCat === 'LAYOUT' || foundCat === 'BỂ KÍNH')) {
              var sCat = String(prData[p][subCatCol]).toUpperCase().trim();
              if (sCat === 'LAYOUT' || sCat === 'BỂ KÍNH') foundCat = sCat;
            }
            break;
          }
        }
        if (foundCat === 'LAYOUT' || foundCat === 'BỂ KÍNH') return;

        if (foundProd && foundStock < accQty) {
          isAllAccAvailable = false;
        }
      });
    }

    if (isAllAccAvailable) {
      oSheet.getRange(targetOrderRow, stCol + 1).setValue('Sẵn sàng đóng gói');
      return { success: true, message: 'Đã tự động chuyển đơn ' + orderId + ' sang Sẵn sàng đóng gói' };
    } else {
      oSheet.getRange(targetOrderRow, stCol + 1).setValue('Chờ Phụ Kiện');
      return { success: true, message: 'Đơn ' + orderId + ' đang Chờ Phụ Kiện' };
    }
  } catch (err) {
    Logger.log('Lỗi processSlaAutomation: ' + err.toString());
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 3. DYNAMIC LOAD BALANCING (processDynamicLoadBalancing)
 * Quét Attendance để tự phân bổ nhân sự active tại xưởng cho p2_user khi Khâu 1 Done
 */
function processDynamicLoadBalancing(prodId) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) return { success: false, message: 'Hệ thống bận.' };

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var pSheet = ss.getSheetByName('Production');
    var attSheet = ss.getSheetByName('Attendance');
    if (!pSheet || !attSheet) return { success: false, message: 'Không tìm thấy sheet Production hoặc Attendance!' };

    var pData = pSheet.getDataRange().getValues();
    var pHead = pData[0];
    var idCol = pHead.indexOf('id');
    var p1StCol = pHead.indexOf('p1_status');
    var p2StCol = pHead.indexOf('p2_status');
    var p2UserCol = pHead.indexOf('p2_user');

    var pRowIdx = -1;
    for (var i = 1; i < pData.length; i++) {
      if (String(pData[i][idCol]) === String(prodId)) {
        pRowIdx = i + 1;
        break;
      }
    }
    if (pRowIdx === -1) return { success: false, message: 'Không tìm thấy prodId: ' + prodId };

    // Đọc danh sách nhân sự đang có mặt tại xưởng hôm nay
    var attData = attSheet.getDataRange().getValues();
    var attHead = attData[0];
    var userCol = attHead.indexOf('user');
    var dateCol = attHead.indexOf('date');
    var timeInCol = attHead.indexOf('timeIn');
    var timeOutCol = attHead.indexOf('timeOut');
    var stCol = attHead.indexOf('status');

    var todayStr = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd');
    var activeWorkers = [];

    for (var a = 1; a < attData.length; a++) {
      var rDate = attData[a][dateCol];
      var rDateStr = typeof rDate === 'object' ? Utilities.formatDate(rDate, 'GMT+7', 'yyyy-MM-dd') : String(rDate).slice(0, 10);

      if (rDateStr === todayStr) {
        var tIn = attData[a][timeInCol];
        var tOut = attData[a][timeOutCol];
        var aSt = String(attData[a][stCol] || '').toUpperCase();

        if (tIn && (!tOut || String(tOut).trim() === '') && aSt !== 'NGHỈ') {
          activeWorkers.push(String(attData[a][userCol]).trim());
        }
      }
    }

    if (activeWorkers.length === 0) {
      return { success: false, message: 'Không có thợ nào đang điểm danh Active tại xưởng.' };
    }

    // Phân bổ nhân sự đầu tiên trong danh sách Active
    var assignedUser = activeWorkers[0];
    pSheet.getRange(pRowIdx, p2UserCol + 1).setValue(assignedUser);

    return { success: true, message: 'Đã phân bổ động thợ ' + assignedUser + ' vào Khâu 2 cho lệnh ' + prodId };
  } catch (err) {
    Logger.log('Lỗi processDynamicLoadBalancing: ' + err.toString());
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * TỔNG HỢP RCA RESOLVER RUNNER (processRcaResolver)
 * Tự động chạy cả 3 luồng tối ưu hóa cho lệnh sản xuất
 */
function processRcaResolver(payload) {
  var results = {
    autoBom: null,
    slaAuto: null,
    loadBalancing: null
  };

  try {
    if (payload && payload.prodId) {
      results.autoBom = processMaterialDeduction(payload.prodId, payload.materialUsageData);
      results.loadBalancing = processDynamicLoadBalancing(payload.prodId);
    }
    if (payload && payload.orderId) {
      results.slaAuto = processSlaAutomation(payload.orderId);
    }
    return { success: true, results: results, message: 'Đã hoàn thành chạy RCA Resolver thành công!' };
  } catch (err) {
    Logger.log('Lỗi processRcaResolver: ' + err.toString());
    return { success: false, error: err.toString() };
  }
}

/**
 * THÊM KPI THỦ CÔNG VÀO BẢNG KPI_Progress
 * Schema: id, user, kpiName, current, target, unit, lastUpdated, startTime, endTime, reward, isClaimed, penalty, guide
 */
function api_insertManualKPI(payload) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(15000)) {
      return { success: false, message: 'Hệ thống đang bận, vui lòng thử lại sau vài giây!' };
    }

    if (!payload || !payload.user || !payload.kpiName) {
      return { success: false, message: 'Thiếu thông tin bắt buộc (Nhân sự hoặc Tên KPI)!' };
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var kpiSheet = ss.getSheetByName('KPI_Progress');
    if (!kpiSheet) {
      return { success: false, message: 'Không tìm thấy bảng KPI_Progress trong CSDL!' };
    }

    var now = new Date();
    var cycle = String(payload.cycle || 'MONTH').toUpperCase();
    var kpiId = (cycle === 'WEEK' ? 'KPI_W_' : 'KPI_M_') + Date.now();
    var user = String(payload.user).trim();
    var kpiName = String(payload.kpiName).trim();
    var current = 0;
    var target = Number(payload.target) || 0;
    var unit = String(payload.unit || '%').trim();
    var lastUpdated = Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

    var startDateObj, endDateObj;
    if (cycle === 'WEEK') {
      var dayOfWeek = now.getDay(); // 0: CN, 1: T2...
      var diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
      startDateObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0);
      endDateObj = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), startDateObj.getDate() + 6, 23, 59, 59);
    } else {
      var year = now.getFullYear();
      var month = now.getMonth();
      startDateObj = new Date(year, month, 1, 0, 0, 0);
      endDateObj = new Date(year, month + 1, 0, 23, 59, 59);
    }

    var startTime = payload.startTime || Utilities.formatDate(startDateObj, 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
    var endTime = payload.endTime || Utilities.formatDate(endDateObj, 'GMT+7', 'yyyy-MM-dd HH:mm:ss');

    var reward = Number(payload.reward) || 0;
    var isClaimed = false;
    var penalty = Number(payload.penalty) || 0;
    var guide = String(payload.guide || '').trim();

    // Map theo đúng cột trong Schema KPI_Progress:
    // ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty', 'guide']
    var rowData = [
      kpiId,
      user,
      kpiName,
      current,
      target,
      unit,
      lastUpdated,
      startTime,
      endTime,
      reward,
      isClaimed,
      penalty,
      guide
    ];

    kpiSheet.appendRow(rowData);

    return {
      success: true,
      message: 'Đã tạo KPI thành công cho ' + user + '!',
      id: kpiId,
      rowData: rowData
    };

  } catch (err) {
    Logger.log('Lỗi api_insertManualKPI: ' + err.toString());
    return { success: false, message: 'Lỗi Server: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// 🚀 ENGINE TỰ ĐỘNG HÓA REALTIME & BATCH UPDATE (ON-EDIT TRIGGER)
// Schema match 100%: Orders, Production, Products, ImportExport, BOM_Config
// =========================================================================

/**
 * Trigger tự động kích hoạt khi có thao tác sửa trực tiếp (onEdit) trên Google Sheets
 */
function onEdit(e) {
  if (!e || !e.range) return;
  try {
    var sheet = e.range.getSheet();
    var sheetName = sheet.getName();
    var row = e.range.getRow();
    var col = e.range.getColumn();
    if (row < 2) return; // Bỏ qua dòng tiêu đề

    // 1. Thao tác trên bảng Production
    if (sheetName === 'Production') {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var p1StatusCol = headers.indexOf('p1_status') + 1;
      var statusCol = headers.indexOf('status') + 1;
      var idCol = headers.indexOf('id') + 1;
      var orderIdCol = headers.indexOf('orderId') + 1;

      var newVal = String(e.value || '').trim().toUpperCase();

      // Nghiệp vụ A: Trừ Kho BOM CHỈ KHI status tổng = 'Done' (đủ 2 khâu). p1_status riêng lẻ KHÔNG kích hoạt.
      if (col === statusCol && (newVal === 'DONE' || newVal === 'ĐÃ XONG')) {
        var prodId = sheet.getRange(row, idCol).getValue();
        if (prodId) {
          processMaterialDeduction(prodId, null);
        }
      }

      // Nghiệp vụ B: Kiểm tra Auto-Forward SLA khi status hoặc p1_status chuyển thành Done
      if ((col === statusCol || col === p1StatusCol) && newVal === 'DONE') {
        var orderId = sheet.getRange(row, orderIdCol).getValue();
        if (orderId) {
          processBatchAutoForwardSLA(orderId);
        }
      }
    }

    // 2. Thao tác trên bảng Orders
    if (sheetName === 'Orders') {
      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var statusCol = headers.indexOf('status') + 1;
      var idCol = headers.indexOf('id') + 1;

      var newVal = String(e.value || '').trim().toUpperCase();

      // Nghiệp vụ C: Xử lý Đơn Hủy khi status = 'Đơn Huỷ' hoặc 'Đã Huỷ'
      if (col === statusCol && normalizeStatus(newVal) === 'Đơn Huỷ') {
        var orderId = sheet.getRange(row, idCol).getValue();
        if (orderId) {
          processCascadeCancelOrder(orderId, false);
        }
      }
    }
  } catch (err) {
    console.error("Lỗi Realtime onEdit Trigger:", err);
  }
}



/**
 * Nâng cấp Batch-Update: Cập nhật SLA Đơn Hàng tự động
 */
function processBatchAutoForwardSLA(orderId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return;
  }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var prodSheet = ss.getSheetByName('Production');
    if (!prodSheet) return;
    var prodData = prodSheet.getDataRange().getValues();
    var pHeaders = prodData[0];
    var pOrderIdIdx = pHeaders.indexOf('orderId');
    var pStatusIdx = pHeaders.indexOf('status');
    var pStockIdx = pHeaders.indexOf('fulfilledFromStock');

    var childProds = [];
    for (var i = 1; i < prodData.length; i++) {
      if (String(prodData[i][pOrderIdIdx]).trim() === String(orderId).trim()) {
        var rawStatus = String(prodData[i][pStatusIdx] || '').trim();
        var statusUpper = rawStatus.toUpperCase();
        if (normalizeStatus(statusUpper) === 'Đơn Huỷ') {
          continue;
        }
        var isStock = prodData[i][pStockIdx] === true || String(prodData[i][pStockIdx]).toUpperCase() === 'TRUE';
        childProds.push({
          status: statusUpper,
          fulfilledFromStock: isStock
        });
      }
    }
    if (childProds.length === 0) return;

    var isAllReady = childProds.every(function (p) {
      return p.status === 'DONE' || p.status === 'ĐÃ XONG' || p.status === 'HOÀN KHO ĐẠT' || p.fulfilledFromStock === true;
    });

    if (isAllReady) {
      var ordSheet = ss.getSheetByName('Orders');
      if (!ordSheet) return;
      var ordRange = ordSheet.getDataRange();
      var ordData = ordRange.getValues();
      var oHeaders = ordData[0];
      var oIdIdx = oHeaders.indexOf('id');
      var oStatusIdx = oHeaders.indexOf('status');

      var isOrderChanged = false;
      for (var o = 1; o < ordData.length; o++) {
        if (String(ordData[o][oIdIdx]).trim() === String(orderId).trim()) {
          var curSt = String(ordData[o][oStatusIdx] || '').trim();
          if (['Chờ Sản Xuất', 'Đang Sản Xuất', 'Quét Tự Động'].indexOf(curSt) > -1) {
            ordData[o][oStatusIdx] = 'Sẵn sàng đóng gói';
            isOrderChanged = true;
          }
          break;
        }
      }
      if (isOrderChanged) {
        ordRange.setValues(ordData);
      }
    }
  } catch (e) {
    console.error("Lỗi processBatchAutoForwardSLA:", e);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Nâng cấp Batch-Update: Xử lý Đơn Hủy (Cascade Cancel) mượt mà không deadlock
 * Khi Đơn hàng bị HỦY (Orders.status = 'Đơn Huỷ'):
 * - Nếu p1_status = 'Pending' (chưa dán/làm): Hủy lệnh sản xuất (status = 'Đã Huỷ')
 * - Nếu p1_status = 'Done' (đã hoàn thành): Ngắt orderId, chuyển lệnh thành 'SẢN XUẤT TỒN' để làm tài sản kho
 */
function processCascadeCancelOrder(orderId, isHandedOver) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận!' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ordSheet = ss.getSheetByName('Orders');
    var prodSheet = ss.getSheetByName('Production');

    if (!ordSheet || !prodSheet) return { success: false, message: 'Thiếu bảng CSDL Orders/Production' };

    // 1. Cập nhật bảng Orders sang trạng thái 'Đơn Huỷ'
    var ordRange = ordSheet.getDataRange();
    var ordData = ordRange.getValues();
    var oHeaders = ordData[0];
    var oIdIdx = oHeaders.indexOf('id');
    var oStatusIdx = oHeaders.indexOf('status');

    var isOrdChanged = false;
    for (var o = 1; o < ordData.length; o++) {
      if (String(ordData[o][oIdIdx]).trim() === String(orderId).trim()) {
        ordData[o][oStatusIdx] = 'Đơn Huỷ';
        isOrdChanged = true;
        break;
      }
    }
    if (isOrdChanged) ordRange.setValues(ordData);

    // 2. Quét và bẻ gãy liên kết / xử lý lệnh con trong Production
    var prodRange = prodSheet.getDataRange();
    var prodData = prodRange.getValues();
    var pHeaders = prodData[0];
    var orderIdIdx = pHeaders.indexOf('orderId');
    var statusIdx = pHeaders.indexOf('status');
    var p1StatusIdx = pHeaders.indexOf('p1_status');
    var noteIdx = pHeaders.indexOf('note');

    var isProdChanged = false;
    var canceledCount = 0;
    var stockConvertedCount = 0;

    for (var i = 1; i < prodData.length; i++) {
      if (String(prodData[i][orderIdIdx]).trim() === String(orderId).trim()) {
        var p1Status = String(prodData[i][p1StatusIdx] || '').trim().toUpperCase();
        var curNote = String(prodData[i][noteIdx] || '');

        if (p1Status === 'DONE' || p1Status === 'ĐÃ XONG' || p1Status === 'HOÀN KHO ĐẠT') {
          // Thợ đã dán xong -> Ngắt liên kết orderId, đổi thành tài sản tồn kho xưởng
          prodData[i][orderIdIdx] = 'SẢN XUẤT TỒN';
          prodData[i][noteIdx] = curNote + ' [Ngắt liên kết do đơn gốc ' + orderId + ' bị HỦY - Chuyển thành sản xuất bù tồn kho]';
          stockConvertedCount++;
        } else {
          // Chưa dán xong -> Hủy lệnh để thợ không làm nữa
          prodData[i][statusIdx] = 'Đã Huỷ';
          prodData[i][noteIdx] = curNote + ' [Hủy tự động theo đơn gốc ' + orderId + ']';
          canceledCount++;
        }
        isProdChanged = true;
      }
    }

    if (isProdChanged) {
      prodRange.setValues(prodData);
    }

    // 3. Nếu đơn đã từng bàn giao (isHandedOver) -> Hoàn trả tồn kho phụ kiện / hàng hóa vào Products
    var restoredItems = [];
    if (isHandedOver) {
      try {
        var canceledOrderRow = null;
        for (var o2 = 1; o2 < ordData.length; o2++) {
          if (String(ordData[o2][oIdIdx]).trim() === String(orderId).trim()) {
            canceledOrderRow = ordData[o2];
            break;
          }
        }
        var oAccIdx = oHeaders.indexOf('accessories');
        if (canceledOrderRow && oAccIdx !== -1) {
          var accsRaw = canceledOrderRow[oAccIdx];
          var accsList = [];
          if (typeof accsRaw === 'string') {
            try { accsList = JSON.parse(accsRaw); } catch (e) { }
          } else if (Array.isArray(accsRaw)) {
            accsList = accsRaw;
          }

          if (Array.isArray(accsList) && accsList.length > 0) {
            var prodStockSheet = ss.getSheetByName('Products');
            if (prodStockSheet) {
              var psData = prodStockSheet.getDataRange().getValues();
              var psHeaders = psData[0];
              var psNameCol = psHeaders.indexOf('name');
              var psSkuCol = psHeaders.indexOf('sku');
              var psQtyCol = psHeaders.indexOf('quantity');
              var psPriceCol = psHeaders.indexOf('price');
              var psCostCol = psHeaders.indexOf('costPrice');
              var psChanged = false;
              var totalRestoreValue = 0;

              accsList.forEach(function (item) {
                if (!item) return;
                var itName = typeof item === 'string' ? item : (item.name || item.Name || '');
                var itQty = typeof item === 'object' ? (Number(item.quantity || item.qty) || 1) : 1;
                if (!itName || itQty <= 0) return;

                var itKey = String(itName).trim().toLowerCase();
                for (var pr = 1; pr < psData.length; pr++) {
                  var pName = String(psData[pr][psNameCol] || '').trim().toLowerCase();
                  var pSku = String(psData[pr][psSkuCol] || '').trim().toLowerCase();
                  if (pName === itKey || pSku === itKey) {
                    var curQty = Number(psData[pr][psQtyCol]) || 0;
                    psData[pr][psQtyCol] = curQty + itQty;
                    var itemCost = Number(psData[pr][psCostCol] || psData[pr][psPriceCol]) || 0;
                    totalRestoreValue += itQty * itemCost;
                    restoredItems.push({ name: psData[pr][psNameCol], qty: itQty, costPrice: itemCost });
                    psChanged = true;
                    break;
                  }
                }
              });

              if (psChanged) {
                prodStockSheet.getRange(1, 1, psData.length, psHeaders.length).setValues(psData);
                var ieSheet = ss.getSheetByName('ImportExport');
                if (ieSheet && restoredItems.length > 0) {
                  var ieLogId = 'IE_RESTORE_' + String(orderId).replace(/[^a-zA-Z0-9]/g, '') + '_' + Date.now();
                  var safeDateNow = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
                  ieSheet.appendRow([
                    ieLogId,
                    'Nhập',
                    'Hoàn Kho Đơn Hủy',
                    Math.round(totalRestoreValue),
                    safeDateNow,
                    'Hoàn kho phụ kiện tự động do hủy đơn đã bàn giao: ' + orderId,
                    JSON.stringify(restoredItems)
                  ]);
                }
              }
            }
          }
        }
      } catch (restoreErr) {
        Logger.log('Lỗi hoàn kho đơn hủy: ' + restoreErr.toString());
      }
    }

    return {
      success: true,
      message: 'Đã hủy ' + canceledCount + ' lệnh chưa làm, chuyển ' + stockConvertedCount + ' lệnh thành tài sản bù kho' + (restoredItems.length > 0 ? (', và hoàn ' + restoredItems.length + ' món vào kho Products!') : '!'),
      canceledCount: canceledCount,
      stockConvertedCount: stockConvertedCount,
      restoredCount: restoredItems.length
    };

  } catch (e) {
    console.error("Lỗi processCascadeCancelOrder:", e);
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}



function cleanStr(s) {
  if (!s) return '';
  return String(s).trim().toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Cấn trừ Vật tư Tự động (BOM Deduction)
 * Trừ số lượng vật tư trong bảng Products theo BOM_Config khi lệnh sản xuất hoàn thành
 * Ghi log xuất kho vào bảng ImportExport chuẩn 100%
 */
function findMaterialSkuByAlias(rawString) {
  var ALIAS_MAP = {
      // 1. NGUYÊN LIỆU LAYOUT
      'NL-LAY-SX-502-1CHAI': ['NLSX-502-1CHAI', 'NLSX-KEO-502', 'KEO 502', '502', '502-1CHAI', 'KEO 502 CHAI', 'KEO CON VOI', 'KEO502', 'NL-LAY-KEO-502'],
      'NL-LAY-SX-CANHTHANG': ['NLSX-CANHTHANG', 'CANHTHANG', 'CANH THANG', 'LUA CANH THANG', 'LUA CANH'],
      'NL-LAY-SX-CATTRANG': ['NLSX-CATTRANG', 'CATTRANG', 'CAT TRANG', '1KG CAT TRANG'],
      'NL-LAY-SX-CATXAM': ['NLSX-CATXAM', 'CATXAM', 'CAT XAM', '1KG CAT XAM'],
      'NL-LAY-SX-CATVANG': ['NLSX-CATVANG', 'CATVANG', 'CAT VANG', '1KG CAT VANG'],
      'NL-LAY-SX-CUOI': ['NLSX-CUOI', 'CUOI', 'DA CUOI', 'BIOTOP CUOI', 'DA-CUOI', 'NL-LAY-CUOI'],
      'NL-LAY-SX-DAVOI': ['NLSX-DAVOI', 'DAVOI', 'DA VOI', 'DA DA VOI'],
      'NL-LAY-SX-DOQUYEN': ['NLSX-DOQUYEN', 'DOQUYEN', 'DO QUYEN', 'LUA DO QUYEN', 'NL-LAY-DOQUYEN'],
      'NL-LAY-SX-FOMEX-8LI': ['NLSX-FOMEX-8LI', 'NLSX-FOMEX-8li', 'NLSX-FOMEX-8', 'FOMEX 8LI', 'FOMEX 8 LI', 'FOMEX 8', 'FOMEX8', 'FOMEX 8 LI (M2)', 'FOMEX-8LI', 'FOMEX', 'NL-LAY-FOMEX-8'],
      'NL-LAY-SX-FOMEX10-54': ['NLSX-FOMEX-10LI', 'NLSX-FOMEX-10li', 'NLSX-FOMEX-10', 'NLSX-FOMEX10-54', 'FOMEX10-54', 'FOMEX 10LI', 'FOMEX 10 LI', 'FOMEX 10', 'FOMEX10', 'FOMEX 10 LI (M2)', 'FOMEX-10LI', 'NL-LAY-SX-FOMEX-10LI', 'NL-LAY-FOMEX-10'],
      'NL-LAY-SX-HAISONQUY': ['NLSX-HAISONQUY', 'HAISONQUY', 'HAI SON QUY', 'LUA HAI SON QUY'],
      'NL-LAY-SX-LUASANCANH': ['NLSX-LUASANCANH', 'NLSX-DANHCANH', 'NLSX-LUASANHTHANG', 'LUASANCANH', 'SAN CANH', 'DANG CANH', 'LUA DANG CANH', 'LUA SAN CANH', 'SANCANH'],
      'NL-LAY-SX-LUASANMIENG': ['NLSX-LUASANMIENG', 'LUASANMIENG', 'SAN MIENG', 'LUA SAN MIENG', 'LUA SAM MIENG', 'SANMIENG', 'NL-LAY-LUASANMIENG'],
      'NL-LAY-SX-LUASANTRANG': ['NLSX-LUASANTRANG', 'LUASANTRANG', 'SAN TRANG', 'LUA SAN TRANG', 'SANTRANG'],
      'NL-LAY-SX-NHAMXANH': ['NLSX-NHAMXANH', 'NLSX-NHAM', 'NHAMXANH', 'NHAM XANH', 'DA NHAM XANH', 'NHAM', 'NL-LAY-NHAM'],
      'NL-LAY-SX-NHONOI': ['NLSX-NHONOI', 'NLSX-NOIN', 'NHONOI', 'NOIN', 'NHO NOI', 'LUA NHO NOI', 'DA NHAM NHO NOI', 'NHAMNONOI', 'NL-LAY-SX-NOIN'],
      'NL-LAY-SX-RE': ['NLSX-RE', 'NLSX-REEN', 'NL-LAY-SX-RF', 'NLSX-RF', 'RE RUNG', 'RE EN', 'LUA RE RUNG', 'RF', 'RE', 'NL-LAY-RE'],
      'NL-LAY-SX-REU-A04': ['NLSX-REU-A04', 'NL-LAY-SX-REU_XANH', 'REU_XANH', 'REU XANH', 'REU BOT MAU XANH', 'REU BOT XANH', 'REU-A04', 'A04', 'REU XANH A04', 'NL-LAY-REU-A04'],
      'NL-LAY-SX-REU-A11': ['NLSX-REU-A11', 'NL-LAY-SX-REU_DO', 'REU_DO', 'REU DO', 'REU BOT MAU DO', 'REU BOT DO', 'REU-A11', 'A11', 'REU DO A11', 'NL-LAY-REU-A11'],
      'NL-LAY-SX-TAIMEO': ['NLSX-TAIMEO', 'TAIMEO', 'TAI MEO', 'DA TAI MEO', 'NL-LAY-TAIMEO'],
      'NL-LAY-SX-TANTUNG': ['NLSX-TANTUNG', 'TANTUNG', 'TAN TUNG'],
      'NL-LAY-SX-THACHSUNG': ['NLSX-THACHSUNG', 'THACHSUNG', 'THACH SUNG', 'LUA THACH SUNG'],
      'NL-LAY-SX-VIA': ['NLSX-VIA', 'NLSX-VIAVOI', 'VIA', 'VIA VOI', 'DA VIA VOI', 'DA VIA', 'NL-LAY-VIA'],
      'NL-LAY-SX-XUONGCHUM': ['NLSX-XUONGCHUM', 'XUONGCHUM', 'XUONG CHUM', 'LUA XUONG CHUM'],

      // 2. NGUYÊN LIỆU BỂ KÍNH
      'NL-BE-KINH4LI-60100': ['KINH 4LI 60X100', 'KINH 4LI (CAT DAY) - 60X100CM', 'NL-BE-KINH4LI-60100', 'KINH 4LI (CAT DAY) - 60X100'],
      'NL-BE-KINH4LI-6080': ['KINH 4LI 60X80', 'KINH 4LI (CAT DAY) - 60X80CM', 'NL-BE-KINH4LI-6080', 'NL-BE-K4LI-12', 'NL-BE-K4LU-12', 'NL-BE-K4LI-6080', 'NL-BE-KINH4LI', 'NLSX-KINH-4LI', 'KINH 4LI (CAT DAY) - 60X80'],
      'NL-BE-VTSX-A300': ['NLSX-VTSX-A300', 'NL-BE-VTSX-A300', 'KEO SILICON A300', 'KEO SILICONE A300', 'A300', 'SILICON A300', 'VTSX-A300', 'NL-BE-VTSX-A300 (TRONG)'],
      'NL-BE-VTSX-A500': ['NLSX-VTSX-A500', 'NL-BE-VTSX-A500', 'KEO SILICON A500', 'KEO SILICONE A500', 'A500', 'SILICON A500', 'VTSX-A500', 'NL-BE-VTSX-A500 (DEN)'],
      'NL-BE-KEO-WACKER': ['NLSX-KEO-WACKER', 'KEO WACKER', 'WACKER', 'SILICONE WACKER', 'KEO DAN BE WACKER', 'KEO WACKER 121'],
      'DICHVU-MAI-CNC': ['NLSX-MAI-CNC', 'MAI CNC', 'MAI VI TINH', 'MAI CNC VI TINH', 'CONG MAI CNC', 'MAI VI TINH CNC', 'GIA CONG MAI CNC'],

      // 3. VẬT TƯ SẢN XUẤT
      'VT-000032': ['LUOI MAI KINH 100MM', 'LUOI MAI KINH', 'VT-000032'],
      'VT-BANGDINHXOP': ['BANG DINH XOP', 'BANG KEO XOP', 'VT-BANGDINHXOP'],
      'VT-DG': ['HOP DAO', 'DAO', 'VT-DG'],
      'VT-GA': ['BINH GA MINI', 'BINH GA', 'GA MINI', 'VT-GA'],
      'VT-GANGTAY': ['GANG TAY', 'BAO TAY', 'VT-GANGTAY'],
      'VT-GIAYVS-BICH': ['GIAY DA NANG', 'GIAY VE SINH', 'VT-GIAYVS-BICH'],
      'VT-LOGO': ['LOGO', 'TEM LOGO', 'VT-LOGO'],
      'VT-NLSX-FOAM': ['FOAM APOLLO', 'FOAM', 'VT-NLSX-FOAM']
  };
  
  function cl(s) {
    if (!s) return '';
    return String(s).trim().toUpperCase()
      .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, 'A').replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, 'E')
      .replace(/[ÌÍỊỈĨ]/g, 'I').replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, 'O')
      .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, 'U').replace(/[ỲÝỴỶỸ]/g, 'Y').replace(/Đ/g, 'D');
  }
  
  var cleanRaw = cl(rawString);
  for (var standardSku in ALIAS_MAP) {
      if (standardSku === cleanRaw) return standardSku;
      var aliases = ALIAS_MAP[standardSku];
      for (var i = 0; i < aliases.length; i++) {
          if (aliases[i] === cleanRaw || cl(aliases[i]) === cleanRaw) {
              return standardSku;
          }
      }
  }
  return rawString;
}

/**
 * Trích xuất định mức vật tư chuẩn 100% từ Sheet BomLayout trong Google Spreadsheet
 */
function getBomFromBomLayoutSheet(ss, prodName, targetSku) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var bomLayoutSheet = ss.getSheetByName('BomLayout') || ss.getSheetByName('BOM_Layout') || ss.getSheetByName('Bản để làm appp không sài đến') || ss.getSheetByName('DinhMuc_Mau');
  if (!bomLayoutSheet) return null;

  var data = bomLayoutSheet.getDataRange().getValues();
  if (!data || data.length < 6) return null;

  function cleanStr(s) {
    if (!s) return '';
    return String(s).trim().toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]/g, '');
  }

  var searchNameClean = cleanStr(prodName);
  var searchSkuClean = cleanStr(targetSku);

  // Đọc danh sách SKU cột nguyên liệu từ dòng 2 (index 1)
  // Dòng 3 (index 2): Đơn giá nhập
  // Dòng 4 (index 3): Đơn vị nhập (1kg, 1g, m², Chai 162g)
  // Dòng 5 (index 4): Đơn vị sản xuất / định mức xuất kho (gam, m², gam)
  var skuHeaders = [];
  var rowSkuIndex = 1;
  var rowPriceIndex = 2;
  var rowImportUnitIndex = 3;
  var rowProdUnitIndex = 4;

  for (var c = 2; c < data[rowSkuIndex].length; c++) {
    var rawSku = String(data[rowSkuIndex][c] || '').trim().toUpperCase();
    var rawPriceStr = String(data[rowPriceIndex] ? (data[rowPriceIndex][c] || '') : '');
    var rawImportUnit = String(data[rowImportUnitIndex] ? (data[rowImportUnitIndex][c] || '') : '').trim();
    var rawProdUnit = String(data[rowProdUnitIndex] ? (data[rowProdUnitIndex][c] || '') : '').trim();

    var priceNum = 0;
    var priceMatch = rawPriceStr.replace(/\./g, '').replace(/,/g, '').match(/\d+/);
    if (priceMatch) priceNum = Number(priceMatch[0]);

    if (!rawSku) {
      rawSku = String(data[0][c] || '').trim().toUpperCase();
    }
    if (rawSku) {
      rawSku = findMaterialSkuByAlias(rawSku);
      skuHeaders.push({
        col: c,
        sku: rawSku,
        price: priceNum,
        importUnit: rawImportUnit || '1kg',
        prodUnit: rawProdUnit || 'gam'
      });
    }
  }

  // Quét từ dòng 6 (index 5) trở đi (Chứa các mã Layout BOM-001, CAU-001, DAO-001...)
  for (var r = 5; r < data.length; r++) {
    var rowSku = String(data[r][0] || '').trim();
    var rowName = String(data[r][1] || '').trim();
    if (!rowSku && !rowName) continue;

    var rowSkuClean = cleanStr(rowSku);
    var rowNameClean = cleanStr(rowName);

    var isMatch = false;
    if (searchNameClean && (rowNameClean === searchNameClean || rowSkuClean === searchNameClean)) {
      isMatch = true;
    } else if (searchSkuClean && (rowSkuClean === searchSkuClean || rowNameClean === searchSkuClean)) {
      isMatch = true;
    } else if (searchNameClean && rowNameClean && (searchNameClean.indexOf(rowNameClean) !== -1 || rowNameClean.indexOf(searchNameClean) !== -1)) {
      isMatch = true;
    }

    if (isMatch) {
      var items = {};
      var totalKeoGrams = 0;

      skuHeaders.forEach(function(h) {
        var val = Number(data[r][h.col]) || 0;
        if (val <= 0) return;

        var sku = h.sku;
        if (sku.indexOf('502') !== -1 || sku.indexOf('KEO') !== -1) {
          totalKeoGrams += val;
        } else {
          if (!items[sku]) {
            items[sku] = {
              sku: sku,
              qty: val,
              prodUnit: h.prodUnit || 'gam',
              importUnit: h.importUnit || '1kg',
              unit: h.prodUnit || 'gam',
              price: h.price || 0
            };
          } else {
            items[sku].qty += val;
          }
        }
      });

      if (totalKeoGrams > 0) {
        // 1 chai keo 502: 162g tổng - 62g vỏ = 100g keo thực tế, giá 22.000đ/100g
        var bottleQty = Number((totalKeoGrams / 100).toFixed(3));
        items['NLSX-502-1CHAI'] = {
          sku: 'NLSX-502-1CHAI',
          qty: bottleQty,
          grams: totalKeoGrams,
          prodUnit: 'gam',
          importUnit: 'Chai 100g',
          unit: 'Chai',
          price: 22000
        };
      }

      return { found: true, layoutCode: rowSku, layoutName: rowName, bomMap: items };
    }
  }

  return null;
}

/**
 * XỬ LÝ KHẤU TRỪ VẬT TƯ (BOM DEDUCTION ENGINE)
 * Tự động đọc định mức từ Sheet BomLayout hoặc bảng BOM_Config
 * Trừ số lượng vật tư trong bảng Products khi lệnh sản xuất hoàn thành
 * Ghi log xuất kho vào bảng ImportExport chuẩn 100%
 */
function _processMaterialDeduction_Core(prodId, materialUsageData, ss) {
  try {
    if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
    var prodSheet = ss.getSheetByName('Production');
    var bomSheet = ss.getSheetByName('BOM_Config');
    var productSheet = ss.getSheetByName('Products');
    var ieSheet = ss.getSheetByName('ImportExport');

    if (!prodSheet || !productSheet || !ieSheet) {
      return { success: false, message: 'Thiếu bảng dữ liệu!' };
    }

    var prodData = prodSheet.getDataRange().getValues();
    var prodHeaders = prodData[0];
    var pIdIdx = prodHeaders.indexOf('id');
    var pNameIdx = prodHeaders.indexOf('name');
    var pOrderIdIdx = prodHeaders.indexOf('orderId');
    var pTypeIdx = prodHeaders.indexOf('type');
    var pNoteIdx = prodHeaders.indexOf('note');
    var pFulfilledFromStockIdx = prodHeaders.indexOf('fulfilledFromStock');
    var pStatusIdx = prodHeaders.indexOf('status');

    var targetProd = null;
    for (var i = 1; i < prodData.length; i++) {
      if (String(prodData[i][pIdIdx]).trim() === String(prodId).trim()) {
        targetProd = {
          id: prodData[i][pIdIdx],
          name: prodData[i][pNameIdx],
          orderId: prodData[i][pOrderIdIdx],
          type: pTypeIdx >= 0 ? prodData[i][pTypeIdx] : '',
          note: pNoteIdx >= 0 ? prodData[i][pNoteIdx] : '',
          fulfilledFromStock: pFulfilledFromStockIdx >= 0 ? prodData[i][pFulfilledFromStockIdx] : false,
          status: pStatusIdx >= 0 ? prodData[i][pStatusIdx] : ''
        };
        break;
      }
    }

    if (!targetProd) {
      return { success: false, message: 'Không tìm thấy lệnh sản xuất: ' + prodId };
    }

    var targetProdIdStr = String(targetProd.id).trim();

    // GUARD 1: HÀNG LẤY TỪ TỒN KHO CÓ SẴN -> TUYỆT ĐỐI KHÔNG TRỪ VẬT TƯ BOM!
    var isFromStock = targetProd.fulfilledFromStock === true || 
                      String(targetProd.fulfilledFromStock).toUpperCase() === 'TRUE' ||
                      String(targetProd.status).trim() === 'Hoàn Kho Đạt' ||
                      String(targetProd.note || '').indexOf('Lấy từ tồn kho') !== -1;

    if (isFromStock) {
      return { 
        success: true, 
        message: 'Lệnh sản xuất ' + targetProdIdStr + ' lấy từ tồn kho có sẵn, không trừ vật tư BOM.',
        isStockFulfillment: true 
      };
    }

    // GUARD 2: SẢN PHẨM 2 KHÂU - BẮT BUỘC CẢ 2 KHÂU DONE MỚI ĐƯỢC TRỪ BOM & NHẬP KHO!
    var p2NameIdx = prodHeaders.indexOf('p2_name');
    var p1StatusGuardIdx = prodHeaders.indexOf('p1_status');
    var p2StatusGuardIdx = prodHeaders.indexOf('p2_status');
    if (p2NameIdx >= 0 && p2StatusGuardIdx >= 0) {
      for (var g = 1; g < prodData.length; g++) {
        if (String(prodData[g][pIdIdx]).trim() === targetProdIdStr) {
          var g_p2Name = String(prodData[g][p2NameIdx] || '').trim();
          var g_p1St = String(prodData[g][p1StatusGuardIdx] || '').trim().toUpperCase();
          var g_p2St = String(prodData[g][p2StatusGuardIdx] || '').trim().toUpperCase();
          if (g_p2Name && g_p2St !== 'DONE' && g_p2St !== 'ĐÃ XONG') {
            Logger.log('GUARD 2 chặn BOM: Lệnh ' + targetProdIdStr + ' có 2 khâu nhưng Khâu 2 chưa Done (p2_status=' + g_p2St + ')');
            return {
              success: false,
              message: 'Lệnh ' + targetProdIdStr + ' chưa hoàn thành đủ 2 khâu sản xuất. Khâu 2 đang: ' + (g_p2St || 'Pending') + '. Chờ thợ hoàn thành khâu 2 trước khi trừ BOM!',
              isGuard2Block: true
            };
          }
          break;
        }
      }
    }

    // 0. Kiểm tra chống trùng lặp & Nhật ký phục hồi sự cố (Idempotency & Journal Recovery)
    var journalKey = 'BOM_JOURNAL_' + targetProdIdStr;
    var scriptProps = (typeof PropertiesService !== 'undefined' && PropertiesService.getScriptProperties) ? PropertiesService.getScriptProperties() : null;
    var existingJournalStr = scriptProps ? scriptProps.getProperty(journalKey) : null;
    var existingJournal = null;
    if (existingJournalStr) {
      try {
        existingJournal = JSON.parse(existingJournalStr);
      } catch (e) {
        existingJournal = null;
      }
    }

    var ieData = ieSheet.getDataRange().getValues();
    if (ieData.length > 1) {
      var ieHeaders = ieData[0];
      var idIdx = ieHeaders.indexOf('id');
      for (var k = 1; k < ieData.length; k++) {
        var logId = String(ieData[k][idIdx] || '');
        if (logId === 'IE_BOM_' + targetProdIdStr) {
          if (scriptProps) {
            try { scriptProps.deleteProperty(journalKey); } catch (e) {}
          }
          return { success: true, message: 'Lệnh sản xuất ' + targetProdIdStr + ' đã được trừ vật tư trước đó.' };
        }
      }
    }

    var prodName = String(targetProd.name || '').trim();
    var prodNameLower = prodName.toLowerCase();
    var prodTypeUpper = String(targetProd.type || '').toUpperCase().trim();

    function cleanStr(s) {
      if (!s) return '';
      return String(s).trim().toLowerCase()
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]/g, '');
    }

    var layoutClean = cleanStr(prodName);

    // 1. Phân định chính xác 100%: BỂ KÍNH vs LAYOUT (Ưu tiên kiểm tra trực tiếp trong Sheet BomLayout trước)
    var layoutBomRes = getBomFromBomLayoutSheet(ss, prodName, '');
    var isLayout = (layoutBomRes && layoutBomRes.found) ||
                   prodTypeUpper.includes('LAYOUT') || 
                   /(layout|rừng|rung|bonsai|cầu vồng|cau vong|đảo bay|dao bay|cuội|cuoi|đá|da|lũa|lua|biotop|cover|tiểu cảnh|tieu canh|vách|vach|hẻm|hem|đảo|dao|nhất trụ|nhat tru|núi|nui|hang|cầu|cau|biotope)/i.test(prodNameLower);

    var isGlass = !isLayout && (
      prodTypeUpper.includes('BỂ KÍNH') || 
      prodTypeUpper.includes('BE KINH') || 
      prodTypeUpper.includes('HỒ KÍNH') ||
      prodTypeUpper.includes('BỂ') ||
      /(bể kính|be kinh|hồ kính|ho kinh|bể siêu trong|dán bể|hồ cá|bể cá|hồ đúc|bể đúc|\bbể\b|\bhồ\b|\btank\b)/i.test(prodNameLower)
    );

    if (!isLayout && !isGlass) {
      if (/(\d+)\s*[xX*×]\s*(\d+)\s*[xX*×]\s*(\d+)/.test(prodNameLower) && !/(cầu|cau|bonsai|rừng|rung|đảo|dao|hang|hẻm|hem|cuội|cuoi)/i.test(prodNameLower)) {
        isGlass = true;
      } else {
        isLayout = true;
      }
    }

    var targetType = isGlass ? 'Sản Xuất Bể Kính' : 'Sản Xuất Layout';

    // Tìm SKU của sản phẩm tương ứng trong Products nếu có
    var pRange = productSheet.getDataRange();
    var pData = pRange.getValues();
    var prHeaders = pData[0];
    var prSkuIdx = prHeaders.indexOf('sku');
    var prNameIdx = prHeaders.indexOf('name');
    var prQtyIdx = prHeaders.indexOf('quantity');
    var prCostIdx = prHeaders.indexOf('costPrice');
    var prUnitIdx = prHeaders.indexOf('unit');
    var prCatIdx = prHeaders.indexOf('category');
    var prConvRateIdx = prHeaders.indexOf('conversionRate');
    var prImportUnitIdx = prHeaders.indexOf('importUnit');

    var targetSku = '';
    for (var p = 1; p < pData.length; p++) {
      var pN = String(pData[p][prNameIdx] || '').trim();
      var pS = String(pData[p][prSkuIdx] || '').trim();
      var pCat = String(prCatIdx !== -1 ? pData[p][prCatIdx] : '').toUpperCase().trim();
      
      if (isGlass && (pCat.includes('LAYOUT') || pCat === 'THÀNH PHẨM')) continue;
      if (isLayout && (pCat.includes('BỂ') || pCat === 'BỂ KÍNH')) continue;

      if (pN.toLowerCase() === prodNameLower || pS.toLowerCase() === prodNameLower ||
          cleanStr(pN) === layoutClean || cleanStr(pS) === layoutClean) {
        targetSku = pS;
        break;
      }
    }

    var bomMap = {};

    // 0. ƯU TIÊN SỐ 0: Sử dụng dữ liệu quyết toán thực tế (materialUsageData) từ thợ (Quy trình 2 Chạm cho BỂ LẺ SIZE & LAYOUT COVER)
    if (materialUsageData && Array.isArray(materialUsageData) && materialUsageData.length > 0) {
      for (var mu = 0; mu < materialUsageData.length; mu++) {
        var mItem = materialUsageData[mu];
        if (!mItem) continue;
        var actQty = Number(mItem.actualQty != null ? mItem.actualQty : (mItem.qty != null ? mItem.qty : (Number(mItem.requestedQty || 0) - Number(mItem.returnedQty || 0))));
        if (actQty > 0) {
          var mSku = String(mItem.sku || mItem.name || '').trim();
          bomMap[mSku] = {
            qty: actQty,
            unit: mItem.unit || 'kg',
            name: mItem.name || mSku,
            defaultPrice: Number(mItem.costPrice || mItem.price || 0)
          };
        }
      }
    }

    // 2. ƯU TIÊN SỐ 1: Đọc trực tiếp từ Sheet BomLayout chuẩn nếu chưa có materialUsageData
    if (Object.keys(bomMap).length === 0 && isLayout) {
      var layoutBomRes = getBomFromBomLayoutSheet(ss, prodName, targetSku);
      if (layoutBomRes && layoutBomRes.found && layoutBomRes.bomMap) {
        bomMap = layoutBomRes.bomMap;
      }
    }

    // 3. ƯU TIÊN SỐ 2: Quét bảng BOM_Config nếu chưa tìm thấy trong BomLayout
    if (Object.keys(bomMap).length === 0 && bomSheet) {
      var bomData = bomSheet.getDataRange().getValues();
      var bHeaders = bomData[0];
      var bLayoutIdx = bHeaders.indexOf('layoutCode');
      var bSkuIdx = bHeaders.indexOf('materialSku');
      var bQtyIdx = bHeaders.indexOf('defaultQty');
      var bUnitIdx = bHeaders.indexOf('unit');

      for (var b = 1; b < bomData.length; b++) {
        var layoutCode = String(bomData[b][bLayoutIdx] || '').trim();
        var layoutCodeLower = layoutCode.toLowerCase();
        var layoutCodeClean = cleanStr(layoutCode);
        var mSku = String(bomData[b][bSkuIdx] || '').trim().toUpperCase();

        if (isLayout && (mSku.includes('KINH') || mSku.includes('MAI-CNC') || mSku.includes('SILICON') || mSku.includes('WACKER'))) continue;
        if (isGlass && (mSku.includes('CUOI') || mSku.includes('TAIMEO') || mSku.includes('NHAM') || mSku.includes('SANMIENG') || mSku.includes('DOQUYEN') || mSku.includes('FOMEX') || mSku.includes('502'))) continue;

        var isMatch = layoutCode && (
          layoutCodeLower === prodNameLower ||
          (targetSku && layoutCodeLower === targetSku.toLowerCase()) ||
          (layoutClean && layoutCodeClean && layoutClean === layoutCodeClean) ||
          (targetSku && cleanStr(targetSku) === layoutCodeClean)
        );

        if (isMatch) {
          var sku = String(bomData[b][bSkuIdx] || '').trim();
          var q = Number(bomData[b][bQtyIdx]) || 0;
          var u = String(bomData[b][bUnitIdx] || '').trim();
          if (sku && q > 0) {
            if (!bomMap[sku]) bomMap[sku] = { qty: 0, unit: u };
            bomMap[sku].qty += q;
          }
        }
      }
    }

    // 4. ƯU TIÊN SỐ 3: Fallback Engine Bể Kính với Mã SKU Kho Thật (NL-BE-...)
    if (Object.keys(bomMap).length === 0 && isGlass) {
      var dims = prodName.match(/(\d+)\s*[xX*×]\s*(\d+)\s*[xX*×]\s*(\d+)/);
      var L = 40, W = 20, H = 20;
      if (dims) {
        L = parseFloat(dims[1]);
        W = parseFloat(dims[2]);
        H = parseFloat(dims[3]);
      }

      var areaM2 = Number((((L * W) + 2 * (L * H) + 2 * (W * H)) / 10000 * 1.1).toFixed(4));
      var perimeterM = Number(((2 * (L + W)) / 100).toFixed(2));
      var glueQty = Number((((L + W + H) / 100) * 0.15).toFixed(2));

      var glassThickness = (Math.max(L, W, H) >= 60) ? '8LI' : '5LI';
      var glassSku = 'NL-BE-KINH' + glassThickness;

      bomMap[glassSku] = { qty: areaM2, unit: 'm2', name: 'Kính Siêu Trong ' + glassThickness.toLowerCase(), defaultPrice: (glassThickness === '8LI' ? 240000 : 150000) };
      bomMap['NL-BE-KEO-WACKER'] = { qty: glueQty, unit: 'chai', name: 'Keo Silicone Wacker Chuyên Dụng', defaultPrice: 55000 };
      // Chi phí mài CNC vi tính là Dịch Vụ / Gia Công Ngoài (không trừ tồn kho vật lý):
      bomMap['DICHVU-MAI-CNC'] = { qty: perimeterM, unit: 'mét', isService: true, defaultPrice: 25000, name: 'Mài CNC Cạnh Vi Tính (Gia công)' };
    }

    // Bảng ALIAS ánh xạ thông minh từ mã quy ước sang mã SKU thực tế trong kho
    var ALIAS_MAP = {
      'NLSX-KINH-5LI': ['NL-BE-KINH5LI', 'NL-BE-KINH-5LI', 'NL-BE-KINH5LI-6080', 'NL-BE-KINH5MM'],
      'NLSX-KINH-8LI': ['NL-BE-KINH8LI', 'NL-BE-KINH-8LI', 'NL-BE-KINH8MM'],
      'NLSX-KINH-3LI': ['NL-BE-KINH3LI', 'NL-BE-KINH3LI-100', 'NL-BE-KINH-3LI'],
      'NLSX-KINH-4LI': ['NL-BE-KINH4LI', 'NL-BE-KINH4LI-6080', 'NL-BE-KINH-4LI'],
      'NL-BE-KINH5LI': ['NL-BE-KINH5LI', 'NL-BE-KINH-5LI', 'NL-BE-KINH5LI-6080', 'NLSX-KINH-5LI'],
      'NL-BE-KINH8LI': ['NL-BE-KINH8LI', 'NL-BE-KINH-8LI', 'NLSX-KINH-8LI'],
      'NL-BE-KINH3LI': ['NL-BE-KINH3LI', 'NL-BE-KINH3LI-100', 'NL-BE-KINH-3LI'],
      'NL-BE-KINH4LI': ['NL-BE-KINH4LI', 'NL-BE-KINH4LI-6080', 'NL-BE-KINH-4LI'],
      'NLSX-KEO-WACKER': ['NL-BE-KEO-WACKER', 'VT-KEO-WACKER', 'NL-BE-KEO-SILICONE', 'VT-KEO-SILICONE'],
      'NL-BE-KEO-WACKER': ['NL-BE-KEO-WACKER', 'VT-KEO-WACKER', 'NLSX-KEO-WACKER'],
      'NLSX-MAI-CNC': ['DICHVU-MAI-CNC', 'VT-MAI-CNC'],
      'DICHVU-MAI-CNC': ['DICHVU-MAI-CNC', 'VT-MAI-CNC', 'NLSX-MAI-CNC'],
      'NLSX-LUASANMIENG': ['NL-LAY-LUASANMIENG', 'NL-LAY-LUA-SANMIENG'],
      'NLSX-TAIMEO': ['NL-LAY-TAIMEO', 'NL-LAY-DA-TAIMEO'],
      'NLSX-CUOI': ['NL-LAY-CUOI', 'NL-LAY-DA-CUOI'],
      'NLSX-NHAM': ['NL-LAY-NHAM', 'NL-LAY-NHAMTHACH'],
      'NLSX-DOQUYEN': ['NL-LAY-DOQUYEN', 'NL-LAY-LUA-DOQUYEN'],
      'NLSX-RF': ['NL-LAY-SX-RF', 'NL-LAY-RF'],
      'NL-LAY-SX-RF': ['NL-LAY-SX-RF', 'NL-LAY-RF', 'NLSX-RF'],
      'NLSX-REU-A04': ['NL-LAY-REU-A04'],
      'NLSX-REU-A11': ['NL-LAY-REU-A11'],
      'NLSX-502-1CHAI': ['NL-LAY-KEO-502', 'VT-KEO-502', 'NLSX-KEO-502'],
      'NLSX-KEO-502': ['NL-LAY-KEO-502', 'VT-KEO-502', 'NLSX-502-1CHAI'],
      'NLSX-FOMEX-8': ['NL-LAY-FOMEX-8'],
      'NLSX-FOMEX-10': ['NL-LAY-FOMEX-10']
    };

    // 5. Trừ tồn kho trong Products & tính chi phí
    var itemsDeducted = [];
    var totalCost = 0;
    var isProductChanged = false;

    var alreadyDeductedFromJournal = (existingJournal && existingJournal.status === 'PRODUCTS_DEDUCTED');
    if (alreadyDeductedFromJournal) {
      totalCost = Number(existingJournal.totalCost) || 0;
      itemsDeducted = Array.isArray(existingJournal.itemsDeducted) ? existingJournal.itemsDeducted : [];
      isProductChanged = false;
      Logger.log('BOM Journal phục hồi: Lệnh ' + targetProdIdStr + ' đã trừ tồn kho trước đó, bỏ qua trừ lại để chống trùng lặp.');
    } else {
      for (var p = 1; p < pData.length; p++) {
        var pSku = String(pData[p][prSkuIdx] || '').trim();
        var pName = String(pData[p][prNameIdx] || '').trim();
        var pSkuUpper = pSku.toUpperCase();
        var pNameClean = cleanStr(pName);

        var deductQty = 0;
        var bomUnit = '';
        var matchedKey = null;

        for (var bKey in bomMap) {
          var bKeyTrim = String(bKey).trim();
          var bKeyUpper = bKeyTrim.toUpperCase();
          var bKeyClean = cleanStr(bKeyTrim);

          var isAliasMatch = ALIAS_MAP[bKeyUpper] && ALIAS_MAP[bKeyUpper].some(function(alias) {
            return alias.toUpperCase() === pSkuUpper || cleanStr(alias) === pNameClean;
          });

          if (bKeyUpper === pSkuUpper || bKeyTrim.toLowerCase() === pName.toLowerCase() ||
              isAliasMatch ||
              (pSkuUpper && bKeyUpper && (bKeyUpper === pSkuUpper || bKeyUpper.indexOf(pSkuUpper) !== -1 || pSkuUpper.indexOf(bKeyUpper) !== -1)) ||
              (bKeyClean && pNameClean && (bKeyClean === pNameClean || bKeyClean.indexOf(pNameClean) !== -1 || pNameClean.indexOf(bKeyClean) !== -1))) {
            deductQty = bomMap[bKey].qty;
            bomUnit = bomMap[bKey].unit;
            matchedKey = bKey;
            break;
          }
        }

        if (deductQty > 0 && matchedKey) {
          var curQty = Number(pData[p][prQtyIdx]);
          if (isNaN(curQty)) curQty = 0;
          var rawCost = Number(pData[p][prCostIdx]) || 0;
          var matUnit = String(pData[p][prUnitIdx] || '').toLowerCase().trim();
          var convRate = (prConvRateIdx !== -1 && Number(pData[p][prConvRateIdx])) ? Number(pData[p][prConvRateIdx]) : 1;
          var importUnit = (prImportUnitIdx !== -1) ? String(pData[p][prImportUnitIdx] || '').toLowerCase().trim() : '';
          
          var bomItem = bomMap[matchedKey] || {};
          var bomProdUnit = (bomItem.prodUnit || bomUnit || '').toLowerCase().trim();
          var bomImportUnit = (bomItem.importUnit || '').toLowerCase().trim();

          var matNameLower = pName.toLowerCase();
          var matUnitClean = matUnit.replace(/[^a-z0-9]/g, '');
          var prodUnitClean = bomProdUnit.replace(/[^a-z0-9]/g, '');

          var isMatKg = matUnitClean === 'kg' || matUnitClean === 'can' || matUnitClean === 'ki' || matUnitClean === 'kilogram' || matUnitClean === '1kg';
          var isProdGram = prodUnitClean === 'gam' || prodUnitClean === 'g' || prodUnitClean === 'gram' || prodUnitClean === 'gr' || prodUnitClean === '1g';
          var isMatGram = matUnitClean === 'gam' || matUnitClean === 'g' || matUnitClean === 'gram' || matUnitClean === 'gr' || matUnitClean === '1g';
          var isKeo502 = pSku.toLowerCase().indexOf('502') !== -1 || matNameLower.indexOf('502') !== -1 || matNameLower.indexOf('keo') !== -1;
          var isMatChai = matUnitClean === 'chai' || matNameLower.indexOf('chai') !== -1;

          var convertedDeductQty = deductQty;
          var displayUnit = matUnit || bomProdUnit || 'kg';
          var unitPrice = rawCost;

          if (isKeo502) {
            // Keo 502: 1 chai 162g - vỏ 62g = 100g keo thực tế, giá 22.000đ / 100g = 220đ/gam
            var totalKeoGrams = bomItem.grams || (isProdGram ? (deductQty > 10 ? deductQty : deductQty * 100) : (deductQty <= 10 ? deductQty * 100 : deductQty));
            if (isMatChai || matUnitClean === 'chai') {
              // Kho quản lý bằng CHAI: Trừ số chai thực tế tiêu hao (1 chai = 100g keo)
              convertedDeductQty = Number((totalKeoGrams / 100).toFixed(3));
              displayUnit = 'Chai';
              unitPrice = (rawCost > 0) ? rawCost : 22000;
            } else {
              // Kho quản lý bằng GAM: Trừ số gam keo thực tế tiêu hao
              convertedDeductQty = Number(totalKeoGrams.toFixed(2));
              displayUnit = 'gam';
              unitPrice = 220; // 22.000đ / 100g = 220đ/gam
            }
          } else if (isMatKg && isProdGram) {
            // Kho quản lý bằng KG, BOM xuất bằng GAM -> quy đổi số lượng xuất sang KG (đơn giá giữ nguyên theo KG)
            convertedDeductQty = Number((deductQty / 1000).toFixed(4));
            displayUnit = 'kg';
            unitPrice = rawCost;
          } else if (isMatGram && (convRate === 1000 || bomImportUnit === '1kg' || bomImportUnit === 'kg' || importUnit === '1kg' || importUnit === 'kg' || rawCost >= 1000)) {
            // Kho quản lý bằng GAM, nhưng Đơn giá nhập rawCost là giá cho 1 KG (1000g) -> quy đổi Đơn giá sang giá / 1 GAM
            convertedDeductQty = deductQty;
            displayUnit = 'gam';
            var actualConv = (convRate > 1) ? convRate : 1000;
            unitPrice = Number((rawCost / actualConv).toFixed(2));
          } else if (isProdGram && !isMatKg && (convRate === 1000 || bomImportUnit === '1kg' || bomImportUnit === 'kg' || rawCost >= 1000)) {
            // Fallback: Đơn vị xuất là GAM và giá nhập theo KG -> quy đổi Đơn giá sang giá / 1 GAM
            convertedDeductQty = deductQty;
            displayUnit = 'gam';
            var actualConv = (convRate > 1) ? convRate : 1000;
            unitPrice = Number((rawCost / actualConv).toFixed(2));
          } else if (prodUnitClean === 'm2' || prodUnitClean === 'm') {
            convertedDeductQty = Number(deductQty.toFixed(4));
            displayUnit = 'm²';
            unitPrice = rawCost;
          } else if (convRate > 1) {
            unitPrice = Number((rawCost / convRate).toFixed(2));
          }

          var roundedDeductQty = Math.round(convertedDeductQty * 1000) / 1000;
          var newQty = Math.round(Math.max(0, curQty - roundedDeductQty) * 1000) / 1000;

          pData[p][prQtyIdx] = newQty;
          isProductChanged = true;

          var lineTotal = Math.round(roundedDeductQty * unitPrice);
          totalCost += lineTotal;
          itemsDeducted.push({
            sku: pSku,
            name: pName || pSku,
            qty: roundedDeductQty,
            deductedQty: roundedDeductQty,
            unit: displayUnit,
            price: unitPrice,
            costPrice: unitPrice,
            amount: Math.round(lineTotal)
          });

          delete bomMap[matchedKey];
        }
      }

      // 5b. Xử lý các hạng mục Dịch vụ (như Mài CNC) hoặc các mã BOM còn lại chưa có trong kho
      for (var remainKey in bomMap) {
        var itemObj = bomMap[remainKey];
        if (!itemObj) continue;
        
        var sQty = Math.round((Number(itemObj.qty) || 0) * 1000) / 1000;
        var sPrice = Number(itemObj.defaultPrice || itemObj.price || 0);
        if (remainKey === 'DICHVU-MAI-CNC' || itemObj.isService) {
          sPrice = sPrice || 25000;
        } else if (remainKey.includes('KINH5LI') || remainKey.includes('KINH-5LI')) {
          sPrice = sPrice || 150000;
        } else if (remainKey.includes('KINH8LI') || remainKey.includes('KINH-8LI')) {
          sPrice = sPrice || 240000;
        } else if (remainKey.includes('KEO-WACKER')) {
          sPrice = sPrice || 55000;
        }

        var sLineAmt = Math.round(sQty * sPrice);
        totalCost += sLineAmt;
        
        var displaySkuName = remainKey;
        if (remainKey.startsWith('NLSX-')) {
          displaySkuName = remainKey.replace('NLSX-KINH-5LI', 'NL-BE-KINH5LI')
                                    .replace('NLSX-KINH-8LI', 'NL-BE-KINH8LI')
                                    .replace('NLSX-MAI-CNC', 'DICHVU-MAI-CNC')
                                    .replace('NLSX-KEO-WACKER', 'NL-BE-KEO-WACKER')
                                    .replace('NLSX-RF', 'NL-LAY-SX-RF')
                                    .replace('NLSX-LUASANMIENG', 'NL-LAY-LUASANMIENG')
                                    .replace('NLSX-TAIMEO', 'NL-LAY-TAIMEO')
                                    .replace('NLSX-REU-A04', 'NL-LAY-REU-A04')
                                    .replace('NLSX-502-1CHAI', 'NL-LAY-KEO-502');
        }

        itemsDeducted.push({
          sku: displaySkuName,
          name: itemObj.name || displaySkuName,
          qty: sQty,
          deductedQty: itemObj.isService ? 0 : sQty,
          unit: itemObj.unit || 'cái',
          price: sPrice,
          costPrice: sPrice,
          amount: sLineAmt,
          isService: !!itemObj.isService
        });
      }

      if (isProductChanged) {
        if (scriptProps) {
          try {
            scriptProps.setProperty(journalKey, JSON.stringify({
              status: 'PRODUCTS_DEDUCTED',
              targetProdIdStr: targetProdIdStr,
              totalCost: totalCost,
              itemsDeducted: itemsDeducted,
              timestamp: new Date().toISOString()
            }));
          } catch (jpErr) {
            Logger.log('Lỗi lưu BOM journal: ' + jpErr.toString());
          }
        }
        pRange.setValues(pData);
      }
    }

    // 6. Ghi Log vào ImportExport với targetType chuẩn xác 100%
    if (itemsDeducted.length > 0) {
      var safeDate = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
      var logId = 'IE_BOM_' + targetProdIdStr;
      var note = 'Trừ vật tư lệnh sản xuất ' + prodName + (targetProd.orderId ? ' đơn ' + targetProd.orderId : '');

      // 6.1. Phiếu Xuất Nguyên Liệu BOM
      ieSheet.appendRow([
        logId,
        'Xuất',
        targetType,
        Math.round(totalCost),
        safeDate,
        note,
        JSON.stringify(itemsDeducted)
      ]);

      // 6.2. Phiếu Nhập Kho Thành Phẩm Hoàn Thành Sản Xuất
      var tpLogId = 'IE_TP_' + targetProdIdStr;
      var tpNote = 'Nhập kho thành phẩm sản xuất: ' + prodName + (targetProd.orderId ? ' (Đơn ' + targetProd.orderId + ')' : ' (Sản xuất lưu kho)');
      var tpItems = [{
        sku: targetProdIdStr,
        name: prodName,
        qty: 1,
        unit: (targetProd.type === 'Layout' ? 'Cái' : 'Bể'),
        price: Math.round(totalCost),
        costPrice: Math.round(totalCost),
        amount: Math.round(totalCost)
      }];

      ieSheet.appendRow([
        tpLogId,
        'Nhập',
        'Xưởng Sản Xuất',
        Math.round(totalCost),
        safeDate,
        tpNote,
        JSON.stringify(tpItems)
      ]);

      // 6.3. Nếu là sản xuất lưu kho / bù kho (không gắn mã đơn khách), tự động cộng tồn kho thành phẩm trong Products
      if (!targetProd.orderId || String(targetProd.orderId).toUpperCase().indexOf('INTERNAL') !== -1 || String(targetProd.orderId).toUpperCase().indexOf('KHO') !== -1) {
        try {
          if (prQtyIdx >= 0) {
            for (var r = 1; r < pData.length; r++) {
              var rowName2 = String(pData[r][prNameIdx] || '').trim();
              var rowSku2 = String(pData[r][prSkuIdx] || '').trim();
              if (rowName2 === prodName || rowSku2 === prodName) {
                var currentStock = Number(pData[r][prQtyIdx] || 0);
                pData[r][prQtyIdx] = currentStock + 1;
                productSheet.getRange(r + 1, prQtyIdx + 1).setValue(currentStock + 1);
                break;
              }
            }
          }
        } catch (stockErr) {
          Logger.log('Lỗi cộng tồn kho thành phẩm: ' + stockErr.toString());
        }
      } else {
        // 6.4. Cập nhật Giá Vốn Thực Tế vào Orders.cogs
        try {
          var orderSheet = ss.getSheetByName('Orders');
          if (orderSheet) {
            var oData = orderSheet.getDataRange().getValues();
            var oHeaders = oData[0];
            var oIdCol = oHeaders.indexOf('id');
            var oCodeCol = oHeaders.indexOf('orderCode');
            var oCogsCol = oHeaders.indexOf('cogs');
            if (oCogsCol >= 0) {
              var targetOrderIdStr = String(targetProd.orderId).trim();
              for (var oRow = 1; oRow < oData.length; oRow++) {
                var rowOId = String(oData[oRow][oIdCol] || '').trim();
                var rowOCode = String(oData[oRow][oCodeCol] || '').trim();
                if (rowOId === targetOrderIdStr || rowOCode === targetOrderIdStr) {
                  var curCogs = Number(oData[oRow][oCogsCol]) || 0;
                  var newCogs = Math.round(curCogs + totalCost);
                  orderSheet.getRange(oRow + 1, oCogsCol + 1).setValue(newCogs);
                  break;
                }
              }
            }
          }
        } catch (cogsErr) {
          Logger.log('Lỗi cập nhật Orders.cogs: ' + cogsErr.toString());
        }
      }
    }

    if (scriptProps) {
      try {
        scriptProps.deleteProperty(journalKey);
      } catch (e) {}
    }

    return {
      success: true,
      message: 'Đã cấn trừ vật tư BOM tự động cho lệnh sản xuất ' + prodName + ' (' + targetType + ')',
      deducted: itemsDeducted
    };

  } catch (err) {
    console.error("Lỗi _processMaterialDeduction_Core:", err);
    return { success: false, message: 'Lỗi: ' + err.toString() };
  }
}

function processMaterialDeduction(prodId, materialUsageData) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, thử lại sau!' };
  }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    return _processMaterialDeduction_Core(prodId, materialUsageData, ss);
  } catch (err) {
    console.error("Lỗi processMaterialDeduction:", err);
    return { success: false, message: 'Lỗi: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Chuẩn hóa toàn bộ các phiếu xuất kho BOM cũ trong bảng ImportExport theo bảng chuẩn BomLayout:
 * 1. Sửa đối tượng: Bể Kính -> 'Sản Xuất Bể Kính', Layout -> 'Sản Xuất Layout'
 * 2. Tra cứu chính xác 100% định mức từ Sheet BomLayout cho tất cả các mẫu Layout
 * 3. Quy đổi đơn vị tính chuẩn (gam -> kg, gam keo -> chai) và tính đúng thành tiền
 */
function repairAllBomTickets() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, vui lòng thử lại!' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ieSheet = ss.getSheetByName('ImportExport');
    var prodSheet = ss.getSheetByName('Products');
    if (!ieSheet) return { success: false, message: 'Không tìm thấy sheet ImportExport!' };

    var ieData = ieSheet.getDataRange().getValues();
    if (ieData.length <= 1) return { success: true, message: 'Không có dữ liệu phiếu xuất!' };

    var headers = ieData[0];
    var idIdx = headers.indexOf('id');
    var targetIdx = headers.indexOf('target');
    var totalAmountIdx = headers.indexOf('totalAmount');
    var noteIdx = headers.indexOf('note');
    var itemsDataIdx = headers.indexOf('itemsData');

    var pData = prodSheet ? prodSheet.getDataRange().getValues() : [];
    var pHeaders = pData.length > 0 ? pData[0] : [];
    var prSkuIdx = pHeaders.indexOf('sku');
    var prNameIdx = pHeaders.indexOf('name');
    var prCostIdx = pHeaders.indexOf('costPrice');
    var prUnitIdx = pHeaders.indexOf('unit');

    function getProductInfo(skuOrName, defaultCost, defaultUnit) {
      if (!pData || pData.length <= 1) return { sku: skuOrName, name: skuOrName, cost: defaultCost, unit: defaultUnit };
      var targetSkuClean = cleanStr(skuOrName);
      
      // 1. Khớp chính xác 100% theo SKU trong bảng Products
      for (var p = 1; p < pData.length; p++) {
        var s = String(pData[p][prSkuIdx] || '').trim();
        var sClean = cleanStr(s);
        if (sClean && (sClean === targetSkuClean || sClean === cleanStr(findMaterialSkuByAlias(skuOrName)))) {
          var cost = Number(pData[p][prCostIdx]);
          var u = prUnitIdx !== -1 ? String(pData[p][prUnitIdx] || '') : defaultUnit;
          var name = String(pData[p][prNameIdx] || skuOrName);
          return {
            sku: s,
            name: name,
            cost: (!isNaN(cost) && cost > 0) ? cost : defaultCost,
            unit: u || defaultUnit
          };
        }
      }

      // 2. Khớp theo Tên Hàng chính xác 100% (nếu không có SKU)
      for (var p = 1; p < pData.length; p++) {
        var n = String(pData[p][prNameIdx] || '').trim();
        var nClean = cleanStr(n);
        if (nClean && nClean === targetSkuClean) {
          var cost = Number(pData[p][prCostIdx]);
          var u = prUnitIdx !== -1 ? String(pData[p][prUnitIdx] || '') : defaultUnit;
          var s = String(pData[p][prSkuIdx] || skuOrName);
          return {
            sku: s,
            name: n,
            cost: (!isNaN(cost) && cost > 0) ? cost : defaultCost,
            unit: u || defaultUnit
          };
        }
      }

      return { sku: skuOrName, name: skuOrName, cost: defaultCost, unit: defaultUnit };
    }

    var updatedCount = 0;

    for (var r = 1; r < ieData.length; r++) {
      var rowId = String(ieData[r][idIdx] || '');
      var rowNote = String(ieData[r][noteIdx] || '');
      var isBomTicket = rowId.startsWith('IE_BOM_') || rowNote.indexOf('Trừ vật tư BOM') !== -1;

      if (!isBomTicket) continue;

      // Trích xuất tên sản phẩm từ note
      var prodName = '';
      var nameMatch = rowNote.match(/-\s*([^)]+)\)/);
      if (nameMatch) {
        prodName = nameMatch[1].trim();
      } else {
        prodName = rowNote;
      }

      // Khớp 100% theo Sheet BomLayout: Nếu tìm thấy trong BomLayout -> Chắc chắn là Sản Xuất Layout
      var bomRes = getBomFromBomLayoutSheet(ss, prodName, '');
      var isLayout = false;
      var isGlass = false;

      if (bomRes && bomRes.found) {
        isLayout = true;
      } else {
        var pNameClean = cleanStr(prodName);
        if (pNameClean.indexOf('be') === 0 || pNameClean.indexOf('ho') === 0 || pNameClean.indexOf('tank') !== -1 || pNameClean.indexOf('bekinh') !== -1 || pNameClean.indexOf('hokinh') !== -1) {
          isGlass = true;
        } else {
          isLayout = true;
        }
      }

      var correctTarget = isGlass ? 'Sản Xuất Bể Kính' : 'Sản Xuất Layout';
      var isChanged = false;

      if (ieData[r][targetIdx] !== correctTarget) {
        ieData[r][targetIdx] = correctTarget;
        isChanged = true;
      }

      if (isLayout) {
        // Tra cứu định mức 100% chuẩn từ SKU cột trong Sheet BomLayout
        if (!bomRes || !bomRes.found) {
          bomRes = getBomFromBomLayoutSheet(ss, prodName, '');
        }
        if (bomRes && bomRes.found && bomRes.bomMap) {
          var newItems = [];
          for (var skuKey in bomRes.bomMap) {
            var item = bomRes.bomMap[skuKey];
            var pInfo = getProductInfo(item.sku, item.price || 0, item.prodUnit || 'gam');
            
            var displayQty = item.qty;
            var displayUnit = pInfo.unit || item.prodUnit || 'gam';
            var unitCost = pInfo.cost || item.price || 0;

            var uLower = (pInfo.unit || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            var itemProdUnitLower = (item.prodUnit || item.unit || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
            var isKg = uLower === 'kg' || uLower === 'can' || uLower === 'ki' || uLower === 'kilogram' || uLower === '1kg';
            var isGram = itemProdUnitLower === 'gam' || itemProdUnitLower === 'g' || itemProdUnitLower === 'gram';
            var isKeo = item.sku.indexOf('502') !== -1;

            if (isKeo) {
              if (item.grams) {
                displayQty = Number((item.grams / 100).toFixed(3));
              } else if (isGram) {
                displayQty = Number((item.qty / 100).toFixed(3));
              }
              displayUnit = 'Chai';
              unitCost = 22000;
            } else if (isKg) {
              if (item.qty >= 10 || isGram) {
                displayQty = Number((item.qty / 1000).toFixed(4));
              } else {
                displayQty = Number(item.qty.toFixed(4));
              }
              displayUnit = 'kg';
              unitCost = pInfo.cost || item.price || 0;
            } else if (uLower === 'gam' || uLower === 'g' || isGram) {
              displayQty = item.qty;
              displayUnit = 'gam';
              var rawCost = pInfo.cost || item.price || 0;
              unitCost = (rawCost >= 1000 || item.importUnit === '1kg' || item.importUnit === 'kg') ? Number((rawCost / 1000).toFixed(2)) : rawCost;
            } else if (itemProdUnitLower === 'm2' || itemProdUnitLower === 'm') {
              displayQty = Number(item.qty.toFixed(4));
              displayUnit = 'm²';
              unitCost = pInfo.cost || item.price || 0;
            }

            var lineAmount = Math.round(displayQty * unitCost);
            newItems.push({
              sku: item.sku,
              name: pInfo.name,
              qty: displayQty,
              unit: displayUnit,
              price: unitCost,
              amount: lineAmount
            });
          }

          if (newItems.length > 0) {
            var newTotal = newItems.reduce(function(sum, it) { return sum + it.amount; }, 0);
            ieData[r][itemsDataIdx] = JSON.stringify(newItems);
            ieData[r][totalAmountIdx] = Math.round(newTotal);
            isChanged = true;
          }
        }
      } else if (isGlass) {
        // Bể Kính: Phân tích kích thước
        var dims = prodName.match(/(\d+)\s*[xX*×]\s*(\d+)\s*[xX*×]\s*(\d+)/);
        var L = 40, W = 20, H = 20;
        if (dims) {
          L = parseFloat(dims[1]);
          W = parseFloat(dims[2]);
          H = parseFloat(dims[3]);
        }

        var areaM2 = Number((((L * W) + 2 * (L * H) + 2 * (W * H)) / 10000 * 1.1).toFixed(4));
        var perimeterM = Number(((2 * (L + W)) / 100).toFixed(2));
        var glueQty = Number((((L + W + H) / 100) * 0.15).toFixed(2));

        var glassThickness = (Math.max(L, W, H) >= 60) ? '8LI' : '5LI';
        var glassSku = 'NLSX-KINH-' + glassThickness;
        var pGlass = getProductInfo(glassSku, 150000, 'm2');
        var pCnc = getProductInfo('NLSX-MAI-CNC', 25000, 'mét');
        var pGlue = getProductInfo('NLSX-KEO-WACKER', 55000, 'chai');

        var glassItems = [
          { sku: glassSku, name: pGlass.name || 'Kính Siêu Trong', qty: areaM2, unit: 'm2', price: Math.round(pGlass.cost), amount: Math.round(areaM2 * pGlass.cost) },
          { sku: 'NLSX-MAI-CNC', name: pCnc.name || 'Mài Vi Tính CNC', qty: perimeterM, unit: 'mét', price: Math.round(pCnc.cost), amount: Math.round(perimeterM * pCnc.cost) },
          { sku: 'NLSX-KEO-WACKER', name: pGlue.name || 'Keo Silicon Wacker', qty: glueQty, unit: 'chai', price: Math.round(pGlue.cost), amount: Math.round(glueQty * pGlue.cost) }
        ];

        var gTotal = glassItems.reduce(function(sum, it) { return sum + it.amount; }, 0);
        ieData[r][itemsDataIdx] = JSON.stringify(glassItems);
        ieData[r][totalAmountIdx] = Math.round(gTotal);
        isChanged = true;
      }

      if (isChanged) updatedCount++;
    }

    if (updatedCount > 0) {
      ieSheet.getRange(1, 1, ieData.length, headers.length).setValues(ieData);
    }

    return {
      success: true,
      repairedCount: updatedCount,
      message: 'Đã chuẩn hoá và áp dụng định mức BomLayout chính thức cho ' + updatedCount + ' phiếu xuất kho BOM!'
    };

  } catch (err) {
    console.error('Lỗi repairAllBomTickets:', err);
    return { success: false, message: 'Lỗi: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * DỌN DẸP PHIẾU XUẤT BOM ẢO & TRÙNG LẶP, ĐỒNG THỜI BÙ PHIẾU BOM CHO CÁC LỆNH SẢN XUẤT THẬT
 */
function cleanupPhantomBomTickets() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Script locked' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ieSheet = ss.getSheetByName('ImportExport');
    var prodSheet = ss.getSheetByName('Production');
    var productSheet = ss.getSheetByName('Products');
    if (!ieSheet || !prodSheet || !productSheet) return { success: false, message: 'Thiếu bảng CSDL!' };

    var prodData = prodSheet.getDataRange().getValues();
    var prodHeaders = prodData[0];
    var pIdIdx = prodHeaders.indexOf('id');
    var pNameIdx = prodHeaders.indexOf('name');
    var pFfsIdx = prodHeaders.indexOf('fulfilledFromStock');
    var pStIdx = prodHeaders.indexOf('status');
    var pP1StIdx = prodHeaders.indexOf('p1_status');
    var pQcIdx = prodHeaders.indexOf('qc_status');
    var pNoteIdx = prodHeaders.indexOf('note');

    var inStockProdIds = {};
    var realDoneProdIds = [];

    for (var i = 1; i < prodData.length; i++) {
      var id = String(prodData[i][pIdIdx] || '').trim();
      var ffs = prodData[i][pFfsIdx];
      var st = String(prodData[i][pStIdx] || '').trim();
      var p1St = String(prodData[i][pP1StIdx] || '').trim().toUpperCase();
      var qcSt = String(prodData[i][pQcIdx] || '').trim().toUpperCase();
      var nt = String(prodData[i][pNoteIdx] || '').trim();

      var isFromStock = (ffs === true || String(ffs).toUpperCase() === 'TRUE' || st === 'Hoàn Kho Đạt' || nt.indexOf('Lấy từ tồn kho') !== -1);
      if (isFromStock) {
        inStockProdIds[id] = true;
      } else {
        var p2StIdx = prodHeaders.indexOf('p2_status');
        var p2StVal = p2StIdx >= 0 ? String(prodData[i][p2StIdx] || '').trim().toUpperCase() : '';
        var p2NameCleanIdx = prodHeaders.indexOf('p2_name');
        var hasP2Phase = p2NameCleanIdx >= 0 && String(prodData[i][p2NameCleanIdx] || '').trim() !== '';
        // Sản phẩm 2 khâu: BẮT BUỘC cả 2 khâu Done. Sản phẩm 1 khâu: p1 Done là đủ.
        var isDone = st.toUpperCase() === 'DONE' || st.toUpperCase() === 'ĐÃ XONG' || st.toUpperCase() === 'HOÀN THÀNH' ||
                     (hasP2Phase ? (p1St === 'DONE' && p2StVal === 'DONE') : p1St === 'DONE') ||
                     qcSt.indexOf('DUYỆT') !== -1 || qcSt.indexOf('PASS') !== -1;
        if (isDone && id) {
          realDoneProdIds.push(id);
        }
      }
    }

    var ieData = ieSheet.getDataRange().getValues();
    if (ieData.length <= 1) return { success: true, message: 'Không có phiếu kho nào.' };

    var ieHeaders = ieData[0];
    var ieIdIdx = ieHeaders.indexOf('id');
    var ieItemsIdx = ieHeaders.indexOf('itemsData');
    var deletedRowsCount = 0;
    var existingBomMap = {};

    // Duyệt ngược từ dưới lên để xóa dòng an toàn
    for (var r = ieData.length - 1; r >= 1; r--) {
      var rowId = String(ieData[r][ieIdIdx] || '').trim();

      // 1. Xóa các phiếu IE_AUTO_IMPORT_ cũ bị trùng lặp
      if (rowId.startsWith('IE_AUTO_IMPORT_')) {
        ieSheet.deleteRow(r + 1);
        deletedRowsCount++;
        continue;
      }

      // 2. Xóa các phiếu IE_BOM_ ảo của hàng có sẵn và hoàn trả vật tư
      if (rowId.startsWith('IE_BOM_')) {
        var prodIdFromTicket = rowId.replace('IE_BOM_', '').trim();
        existingBomMap[prodIdFromTicket] = true;

        if (inStockProdIds[prodIdFromTicket]) {
          // Khôi phục lại tồn kho nguyên liệu
          var itemsDataStr = ieData[r][ieItemsIdx];
          if (itemsDataStr) {
            try {
              var parsedItems = JSON.parse(itemsDataStr);
              if (Array.isArray(parsedItems)) {
                var pData = productSheet.getDataRange().getValues();
                var pHeaders = pData[0];
                var prSkuIdx = pHeaders.indexOf('sku');
                var prNameIdx = pHeaders.indexOf('name');
                var prQtyIdx = pHeaders.indexOf('quantity');
                
                parsedItems.forEach(function(item) {
                  if (item.sku || item.name) {
                    for (var pr = 1; pr < pData.length; pr++) {
                      var pSku = String(pData[pr][prSkuIdx] || '').trim();
                      var pName = String(pData[pr][prNameIdx] || '').trim();
                      if ((item.sku && pSku === item.sku) || (item.name && pName === item.name)) {
                        var currQty = Number(pData[pr][prQtyIdx] || 0);
                        var refundQty = Number(item.deductedQty || item.qty || 0);
                        if (refundQty > 0) {
                          productSheet.getRange(pr + 1, prQtyIdx + 1).setValue(currQty + refundQty);
                        }
                        break;
                      }
                    }
                  }
                });
              }
            } catch (jsonErr) {}
          }

          ieSheet.deleteRow(r + 1);
          deletedRowsCount++;
        }
      }
    }

    // 3. Tự động sinh bù phiếu BOM và Nhập kho Thành phẩm cho các lệnh sản xuất thật bị thiếu
    var createdBomCount = 0;
    realDoneProdIds.forEach(function(realProdId) {
      if (!existingBomMap[realProdId]) {
        try {
          processMaterialDeduction(realProdId, null);
          createdBomCount++;
        } catch (bomErr) {
          Logger.log('Lỗi bù BOM cho ' + realProdId + ': ' + bomErr.toString());
        }
      }
    });

    return {
      success: true,
      message: 'Đã dọn dẹp ' + deletedRowsCount + ' phiếu ảo/trùng lặp và sinh bù ' + createdBomCount + ' phiếu BOM sản xuất chuẩn xác.',
      deletedCount: deletedRowsCount,
      createdCount: createdBomCount
    };

  } catch (err) {
    Logger.log('Lỗi cleanupPhantomBomTickets: ' + err.toString());
    return { success: false, message: 'Lỗi: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * SỬA ĐỊNH MỨC & GIÁ KEO 502 TRÊN TOÀN HỆ THỐNG
 * 1 chai keo 502: tổng 162g, vỏ chai rỗng 62g -> còn 100g keo thực tế.
 * Giá mua 22.000đ / chai (100g keo) -> Đơn giá thực tế = 220đ / gam keo!
 */
function repairKeo502PriceAndBom() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, vui lòng thử lại sau!' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var results = { productsUpdated: 0, bomLayoutUpdated: 0, ieTicketsUpdated: 0 };

    // 1. Cập nhật bảng Products
    var pSheet = ss.getSheetByName('Products');
    if (pSheet) {
      var pData = pSheet.getDataRange().getValues();
      var pHeaders = pData[0];
      var skuIdx = pHeaders.indexOf('sku');
      var nameIdx = pHeaders.indexOf('name');
      var costIdx = pHeaders.indexOf('costPrice');
      var unitIdx = pHeaders.indexOf('unit');
      var importUnitIdx = pHeaders.indexOf('importUnit');
      var convRateIdx = pHeaders.indexOf('conversionRate');

      for (var r = 1; r < pData.length; r++) {
        var sku = String(pData[r][skuIdx] || '').trim().toUpperCase();
        var name = String(pData[r][nameIdx] || '').trim().toLowerCase();
        if (sku.indexOf('502') !== -1 || name.indexOf('502') !== -1 || name.indexOf('keo 502') !== -1) {
          if (costIdx >= 0) pSheet.getRange(r + 1, costIdx + 1).setValue(22000);
          if (importUnitIdx >= 0) pSheet.getRange(r + 1, importUnitIdx + 1).setValue('Chai 100g');
          if (convRateIdx >= 0) pSheet.getRange(r + 1, convRateIdx + 1).setValue(100);
          results.productsUpdated++;
        }
      }
    }

    // 2. Cập nhật bảng BomLayout
    var bSheet = ss.getSheetByName('BomLayout');
    if (bSheet) {
      var bData = bSheet.getDataRange().getValues();
      if (bData.length >= 5) {
        for (var c = 2; c < bData[0].length; c++) {
          var header = String(bData[1] ? bData[1][c] : '').toUpperCase();
          if (header.indexOf('502') !== -1 || header.indexOf('KEO') !== -1) {
            // Dòng 3 (index 2): Đơn giá nhập = 22.000 đ
            if (bData[2]) {
              bSheet.getRange(3, c + 1).setValue('22.000 đ');
            }
            // Dòng 4 (index 3): Đơn vị nhập = Chai 100g
            if (bData[3]) {
              bSheet.getRange(4, c + 1).setValue('Chai 100g');
            }
            results.bomLayoutUpdated++;
          }
        }
      }
    }

    // 3. Sửa lại các phiếu xuất BOM cũ trong ImportExport bị sai giá 136đ/215đ
    var ieSheet = ss.getSheetByName('ImportExport');
    if (ieSheet) {
      var ieData = ieSheet.getDataRange().getValues();
      var ieHeaders = ieData[0];
      var idIdx = ieHeaders.indexOf('id');
      var totalAmtIdx = ieHeaders.indexOf('totalAmount');
      var itemsIdx = ieHeaders.indexOf('itemsData');

      for (var i = 1; i < ieData.length; i++) {
        var rowId = String(ieData[i][idIdx] || '').trim();
        if (rowId.startsWith('IE_BOM_')) {
          var rawJson = ieData[i][itemsIdx];
          if (!rawJson) continue;
          try {
            var items = JSON.parse(rawJson);
            if (!Array.isArray(items)) continue;
            var isChanged = false;
            var newTotal = 0;

            items.forEach(function(it) {
              var itSku = String(it.sku || '').toUpperCase();
              var itName = String(it.name || '').toLowerCase();
              var isKeo = itSku.indexOf('502') !== -1 || itName.indexOf('502') !== -1 || itName.indexOf('keo') !== -1;
              if (isKeo && (Number(it.price) < 500 || Number(it.amount) <= 500)) {
                var uClean = String(it.unit || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
                var isChai = uClean === 'chai' || uClean.indexOf('chai') !== -1;
                if (isChai) {
                  it.price = 22000;
                  it.costPrice = 22000;
                  it.unit = 'Chai';
                  it.amount = Math.round(it.qty * 22000);
                } else {
                  it.price = 220;
                  it.costPrice = 220;
                  it.unit = 'gam';
                  it.amount = Math.round(it.qty * 220);
                }
                isChanged = true;
              }
              newTotal += Number(it.amount || 0);
            });

            if (isChanged) {
              ieSheet.getRange(i + 1, itemsIdx + 1).setValue(JSON.stringify(items));
              ieSheet.getRange(i + 1, totalAmtIdx + 1).setValue(Math.round(newTotal));
              results.ieTicketsUpdated++;

              // Đồng bộ cập nhật phiếu Nhập Thành Phẩm IE_TP_ tương ứng
              var tpLogId = rowId.replace('IE_BOM_', 'IE_TP_');
              for (var j = 1; j < ieData.length; j++) {
                if (String(ieData[j][idIdx] || '').trim() === tpLogId) {
                  ieSheet.getRange(j + 1, totalAmtIdx + 1).setValue(Math.round(newTotal));
                  var tpItemsJson = ieData[j][itemsIdx];
                  if (tpItemsJson) {
                    try {
                      var tpItems = JSON.parse(tpItemsJson);
                      if (Array.isArray(tpItems) && tpItems[0]) {
                        tpItems[0].price = Math.round(newTotal);
                        tpItems[0].costPrice = Math.round(newTotal);
                        tpItems[0].amount = Math.round(newTotal);
                        ieSheet.getRange(j + 1, itemsIdx + 1).setValue(JSON.stringify(tpItems));
                      }
                    } catch (e) {}
                  }
                  break;
                }
              }
            }
          } catch (e) {}
        }
      }
    }

    return { success: true, results: results, message: 'Đã chuẩn hóa giá Keo 502 (100g keo, 220đ/g) thành công!' };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Top-level API wrapper cho runGAS / Frontend
 */
function deductInventoryBOM(payload, pin) {
  var userPin = (payload && payload.pin) || pin;
  var auth = validatePin(userPin);
  if (!auth || !auth.valid) return { success: false, message: 'Xác thực thất bại!' };
  var prodId = (payload && payload.prodId) || payload;
  var matUsage = (payload && payload.materialUsageData) || null;
  return processMaterialDeduction(prodId, matUsage);
}

/**
 * Auto-Allocation (Bơm Đơn & Định Tuyến Tự Động)
 * Khi có đơn hàng mới hoặc chạy tự động:
 * Quét Products.quantity. Nếu quantity >= 1:
 * Đặt fulfilledFromStock = true ở Production và chuyển Orders.status = 'Sẵn sàng đóng gói'
 */
function processAutoAllocation(orderId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Script locked' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var ordSheet = ss.getSheetByName('Orders');
    var prodSheet = ss.getSheetByName('Production');
    var pSheet = ss.getSheetByName('Products');

    if (!ordSheet || !prodSheet || !pSheet) return { success: false, message: 'Thiếu bảng CSDL!' };

    var pData = pSheet.getDataRange().getValues();
    var pHeaders = pData[0];
    var pNameIdx = pHeaders.indexOf('name');
    var pSkuIdx = pHeaders.indexOf('sku');
    var pQtyIdx = pHeaders.indexOf('quantity');
    var pCostIdx = pHeaders.indexOf('costPrice');

    var stockMap = {};
    for (var p = 1; p < pData.length; p++) {
      var nameKey = String(pData[p][pNameIdx] || '').trim().toLowerCase();
      var skuKey = String(pData[p][pSkuIdx] || '').trim().toLowerCase();
      var qty = Number(pData[p][pQtyIdx] || 0);
      var cost = Number(pData[p][pCostIdx] || 0);

      var stockObj = { qty: qty, rowIndex: p, sku: String(pData[p][pSkuIdx] || ''), name: String(pData[p][pNameIdx] || ''), cost: cost };
      if (nameKey) stockMap[nameKey] = stockObj;
      if (skuKey) stockMap[skuKey] = stockObj;
    }

    var prodRange = prodSheet.getDataRange();
    var prodData = prodRange.getValues();
    var prHeaders = prodData[0];
    var prOrderIdIdx = prHeaders.indexOf('orderId');
    var prNameIdx = prHeaders.indexOf('name');
    var prStockIdx = prHeaders.indexOf('fulfilledFromStock');
    var prStatusIdx = prHeaders.indexOf('status');
    var prP1StatusIdx = prHeaders.indexOf('p1_status');

    var isProdChanged = false;
    var isProductChanged = false;
    var allocatedCount = 0;
    var itemsDeducted = [];
    var totalCost = 0;

    for (var i = 1; i < prodData.length; i++) {
      var rowOrdId = String(prodData[i][prOrderIdIdx] || '').trim();
      if (!orderId || rowOrdId === String(orderId).trim()) {
        var itemProdName = String(prodData[i][prNameIdx] || '').trim().toLowerCase();
        var isStockFulfilled = prodData[i][prStockIdx] === true || String(prodData[i][prStockIdx]).toUpperCase() === 'TRUE';

        var stockObj = stockMap[itemProdName];
        if (!isStockFulfilled && stockObj && stockObj.qty >= 1) {
          prodData[i][prStockIdx] = true;
          prodData[i][prStatusIdx] = 'Done';
          prodData[i][prP1StatusIdx] = 'HOÀN KHO ĐẠT';
          isProdChanged = true;
          allocatedCount++;

          // Trừ trực tiếp số lượng để các đơn sau không lấy được nữa
          stockObj.qty -= 1;
          pData[stockObj.rowIndex][pQtyIdx] = stockObj.qty;
          isProductChanged = true;

          totalCost += stockObj.cost;
          itemsDeducted.push({
            sku: stockObj.sku,
            name: stockObj.name,
            quantity: 1,
            costPrice: stockObj.cost,
            amount: stockObj.cost
          });
        }
      }
    }

    if (isProdChanged) {
      prodRange.setValues(prodData);
    }

    if (isProductChanged) {
      pSheet.getDataRange().setValues(pData);

      var ieSheet = ss.getSheetByName('ImportExport');
      if (ieSheet && itemsDeducted.length > 0) {
        var safeDate = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss');
        var logId = 'IE_ALLOC_' + Date.now();
        var logNote = 'Xuất kho thành phẩm bù đơn ' + (orderId || 'hàng loạt');
        ieSheet.appendRow([
          logId,
          'Xuất',
          'Xuất Đơn Hàng',
          totalCost,
          safeDate,
          logNote,
          JSON.stringify(itemsDeducted)
        ]);
      }
    }

    if (orderId) {
      processBatchAutoForwardSLA(orderId);
    }

    return { success: true, message: 'Đã tự động bơm đơn và xuất kho cho ' + allocatedCount + ' sản phẩm!' };

  } catch (err) {
    console.error("Lỗi processAutoAllocation:", err);
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * TỰ ĐỘNG CHUẨN HÓA BOM KÍNH ĐÁY + KÍNH MVT VÀ GIÁ VỐN CHUẨN
 * Tác giả: AI Operations Leader - Rich Fish Aquarium
 */
// =========================================================================
// THUẬT TOÁN ĐỊNH MỨC & COGS BỂ KÍNH ĐÁY + KÍNH THÀNH MVT + KEO SILICON
// =========================================================================

/**
 * 1. Thuật toán tính toán định mức bóc tách diện tích Kính Đáy, Kính MVT và Keo Silicon
 * @param {string} nameOrDimensions Tên sản phẩm hoặc chuỗi kích thước (vd: "40x30x30", "Bể 50x30x30 5li", "TERA_35_20_20")
 * @param {string|number} customThickness Độ dày kính (tùy chọn: 3, 4, 5, 8 li)
 * @returns {object|null}
 */
function calculateGlassTankSpecs(nameOrDimensions, customThickness) {
  if (!nameOrDimensions) return null;
  var str = String(nameOrDimensions).toLowerCase();

  // Bóc tách kích thước Dài x Rộng x Cao
  var match = str.match(/(\d+(?:\.\d+)?)\s*(?:x|\*|_|\s)\s*(\d+(?:\.\d+)?)\s*(?:x|\*|_|\s)\s*(\d+(?:\.\d+)?)/);
  if (!match) return null;

  var L = parseFloat(match[1]); // cm
  var W = parseFloat(match[2]);
  var H = parseFloat(match[3]);

  if (L <= 0 || W <= 0 || H <= 0) return null;

  // Bóc tách độ dày kính (mặc định 4li nếu không chỉ định)
  var thickness = 4;
  if (customThickness) {
    thickness = parseInt(String(customThickness).replace(/\D/g, '')) || 4;
  } else if (str.indexOf('8li') !== -1 || str.indexOf('8 li') !== -1 || str.indexOf('8mm') !== -1) {
    thickness = 8;
  } else if (str.indexOf('5li') !== -1 || str.indexOf('5 li') !== -1 || str.indexOf('5mm') !== -1) {
    thickness = 5;
  } else if (str.indexOf('3li') !== -1 || str.indexOf('3 li') !== -1 || str.indexOf('3mm') !== -1) {
    thickness = 3;
  }

  // Đơn giá vật tư theo độ dày
  var priceBottom = 165000;
  var priceSide = 180000;
  if (thickness === 3) {
    priceBottom = 135000; priceSide = 150000;
  } else if (thickness === 5) {
    priceBottom = 250000; priceSide = 280000;
  } else if (thickness === 8) {
    priceBottom = 400000; priceSide = 450000;
  }

  var PRICE_GRINDING_PER_M = 25000; // Phí mài 25k/m dài miệng bể
  var PRICE_SILICON_PER_M = 5000;   // Keo 5k/m
  var LABOR_COST = 15000;           // Công khoán mài/dán

  var l_m = L / 100;
  var w_m = W / 100;
  var h_m = H / 100;

  // Định mức tiêu hao (+10% hao hụt theo chuẩn Lean)
  var bottomArea = Number(((l_m * w_m) * 1.1).toFixed(4));
  var sideArea = Number(((2 * (l_m * h_m) + 2 * (w_m * h_m)) * 1.1).toFixed(4));
  var totalGlassArea = Number((bottomArea + sideArea).toFixed(4));
  var grindingLength = Number((2 * (l_m + w_m)).toFixed(3));
  var siliconLength = Number(((2 * l_m) + (2 * w_m) + (4 * h_m)).toFixed(2));

  var bottomCost = bottomArea * priceBottom;
  var sideCost = sideArea * priceSide;
  var grindingCost = grindingLength * PRICE_GRINDING_PER_M;
  var siliconCost = siliconLength * PRICE_SILICON_PER_M;

  var totalCOGS = Math.round(bottomCost + sideCost + grindingCost + siliconCost + LABOR_COST);

  var bottomMat = "KINH" + thickness + "LI_DAY";
  var sideMat = "KINH" + thickness + "LI_MVT";

  return {
    L: L, W: W, H: H,
    dimensionsStr: L + 'x' + W + 'x' + H,
    thickness: thickness,
    bottomArea: bottomArea,
    sideArea: sideArea,
    totalGlassArea: totalGlassArea,
    grindingLength: grindingLength,
    siliconLength: siliconLength,
    bottomMat: bottomMat,
    sideMat: sideMat,
    bottomCost: bottomCost,
    sideCost: sideCost,
    grindingCost: grindingCost,
    siliconCost: siliconCost,
    laborCost: LABOR_COST,
    totalCOGS: totalCOGS
  };
}

/**
 * 2. Tự động kiểm tra & ghi định mức BOM_Config cho bất kỳ bể kính nào (kể cả bể lẻ size mới)
 */
function ensureGlassTankBOM(tankNameOrSku, customThickness) {
  if (!tankNameOrSku) return null;
  var specs = calculateGlassTankSpecs(tankNameOrSku, customThickness);
  if (!specs) return null;

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var bomSheet = ss.getSheetByName("BOM_Config");
    if (!bomSheet) return specs;

    var layoutKey = String(tankNameOrSku).trim();
    var bomData = bomSheet.getDataRange().getValues();
    var bomHeaders = bomData[0];
    var idIdx = bomHeaders.indexOf("id");
    var layoutIdx = bomHeaders.indexOf("layoutCode");
    var matIdx = bomHeaders.indexOf("materialSku");
    var qtyIdx = bomHeaders.indexOf("defaultQty");
    var unitIdx = bomHeaders.indexOf("unit");

    var existingRows = {};
    for (var i = 1; i < bomData.length; i++) {
      var lCode = String(bomData[i][layoutIdx] || "").trim();
      var bId = String(bomData[i][idIdx] || "").trim();
      if (lCode.toLowerCase() === layoutKey.toLowerCase() || bId.toLowerCase() === ("BOM_" + layoutKey).toLowerCase()) {
        var mSku = String(bomData[i][matIdx] || "").trim();
        existingRows[mSku] = i + 1;
      }
    }

    var items = [
      { id: "BOM_" + layoutKey + "_BOTTOM", mat: specs.bottomMat, qty: specs.bottomArea, unit: "m2" },
      { id: "BOM_" + layoutKey + "_SIDE", mat: specs.sideMat, qty: specs.sideArea, unit: "m2" },
      { id: "BOM_" + layoutKey + "_SILICON", mat: "SILICON", qty: specs.siliconLength, unit: "met" }
    ];

    items.forEach(function(item) {
      if (existingRows[item.mat]) {
        var row = existingRows[item.mat];
        bomSheet.getRange(row, qtyIdx + 1).setValue(item.qty);
        if (unitIdx >= 0) bomSheet.getRange(row, unitIdx + 1).setValue(item.unit);
      } else {
        bomSheet.appendRow([item.id, layoutKey, item.mat, item.qty, item.unit]);
      }
    });

    return specs;
  } catch (e) {
    Logger.log("Lỗi ensureGlassTankBOM: " + e.toString());
    return specs;
  } finally {
    lock.releaseLock();
  }
}

/**
 * 3. Tự động quét toàn diện Products, Production và Orders để chuẩn hóa BOM & COGS bể kính
 */
function autoCalculateGlassTankBOM_Dual() {
  const lock = LockService.getScriptLock();

  try {
    // 1. Kỷ luật An Toàn: Khóa tiến trình 15s để chống đè dữ liệu (Concurrency)
    lock.waitLock(15000);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const prodSheet = ss.getSheetByName("Products");
    const bomSheet = ss.getSheetByName("BOM_Config");
    const ordSheet = ss.getSheetByName("Orders");
    const pSheet = ss.getSheetByName("Production");

    if (!prodSheet || !bomSheet) {
      throw new Error("Không tìm thấy sheet 'Products' hoặc 'BOM_Config'!");
    }

    const prodData = prodSheet.getDataRange().getValues();
    const prodHeaders = prodData[0];

    const skuIdx = prodHeaders.indexOf("sku");
    const nameIdx = prodHeaders.indexOf("name");
    const costIdx = prodHeaders.indexOf("costPrice");

    // Đọc dữ liệu BOM cũ để thực hiện Upsert (chống trùng lặp)
    const bomData = bomSheet.getDataRange().getValues();
    const bomHeaders = bomData[0];
    const bomIdIdx = bomHeaders.indexOf("id");
    const bomLayoutIdx = bomHeaders.indexOf("layoutCode");
    const bomQtyIdx = bomHeaders.indexOf("defaultQty");
    const bomMatIdx = bomHeaders.indexOf("materialSku");
    const bomUnitIdx = bomHeaders.indexOf("unit");

    const bomRowMap = {};
    for (let j = 1; j < bomData.length; j++) {
      const bomId = String(bomData[j][bomIdIdx]).trim();
      const lCode = String(bomData[j][bomLayoutIdx]).trim();
      const mSku = String(bomData[j][bomMatIdx]).trim();
      if (bomId) bomRowMap[bomId] = j + 1;
      if (lCode && mSku) bomRowMap[lCode + '_' + mSku] = j + 1;
    }

    let updatedCount = 0;

    // A. Quét toàn bộ bảng Products
    for (let i = 1; i < prodData.length; i++) {
      const sku = String(prodData[i][skuIdx] || "").trim();
      const name = String(prodData[i][nameIdx] || "").trim();

      const specs = calculateGlassTankSpecs(name) || calculateGlassTankSpecs(sku);
      if (specs && (sku.startsWith("BE") || sku.startsWith("TERA") || name.toLowerCase().includes("bể") || name.toLowerCase().includes("hồ"))) {
        // Cập nhật giá vốn chuẩn vào Products
        if (costIdx >= 0) {
          prodSheet.getRange(i + 1, costIdx + 1).setValue(specs.totalCOGS);
        }

        // Cập nhật BOM_Config (3 dòng: Kính Đáy + Kính Thành MVT + Silicon)
        const itemsToUpdate = [
          { id: `BOM_${sku || specs.dimensionsStr}_BOTTOM`, layout: sku || name, mat: specs.bottomMat, qty: specs.bottomArea, unit: "m2" },
          { id: `BOM_${sku || specs.dimensionsStr}_SIDE`, layout: sku || name, mat: specs.sideMat, qty: specs.sideArea, unit: "m2" },
          { id: `BOM_${sku || specs.dimensionsStr}_SILICON`, layout: sku || name, mat: "SILICON", qty: specs.siliconLength, unit: "met" }
        ];

        itemsToUpdate.forEach(item => {
          const rowKey = bomRowMap[item.id] || bomRowMap[item.layout + '_' + item.mat];
          if (rowKey) {
            bomSheet.getRange(rowKey, bomQtyIdx + 1).setValue(item.qty);
            if (bomMatIdx >= 0) bomSheet.getRange(rowKey, bomMatIdx + 1).setValue(item.mat);
            if (bomUnitIdx >= 0) bomSheet.getRange(rowKey, bomUnitIdx + 1).setValue(item.unit);
          } else {
            bomSheet.appendRow([item.id, item.layout, item.mat, item.qty, item.unit]);
          }
        });

        updatedCount++;
      }
    }

    // B. Quét các lệnh sản xuất bể lẻ trong Production nếu có kích thước mới
    if (pSheet) {
      const pData = pSheet.getDataRange().getValues();
      const pHeaders = pData[0];
      const pNameIdx = pHeaders.indexOf("name");

      for (let p = 1; p < pData.length; p++) {
        const prodName = String(pData[p][pNameIdx] || "").trim();
        const specs = calculateGlassTankSpecs(prodName);
        if (specs) {
          const itemsToUpdate = [
            { id: `BOM_${prodName}_BOTTOM`, layout: prodName, mat: specs.bottomMat, qty: specs.bottomArea, unit: "m2" },
            { id: `BOM_${prodName}_SIDE`, layout: prodName, mat: specs.sideMat, qty: specs.sideArea, unit: "m2" },
            { id: `BOM_${prodName}_SILICON`, layout: prodName, mat: "SILICON", qty: specs.siliconLength, unit: "met" }
          ];

          itemsToUpdate.forEach(item => {
            const rowKey = bomRowMap[item.id] || bomRowMap[item.layout + '_' + item.mat];
            if (rowKey) {
              bomSheet.getRange(rowKey, bomQtyIdx + 1).setValue(item.qty);
              if (bomMatIdx >= 0) bomSheet.getRange(rowKey, bomMatIdx + 1).setValue(item.mat);
            } else {
              bomSheet.appendRow([item.id, item.layout, item.mat, item.qty, item.unit]);
              bomRowMap[item.id] = bomSheet.getLastRow();
            }
          });
        }
      }
    }

    // C. Cập nhật COGS cho các đơn hàng trong Orders nếu đang cogs = 0
    if (ordSheet) {
      const ordData = ordSheet.getDataRange().getValues();
      const ordHeaders = ordData[0];
      const accIdx = ordHeaders.indexOf("accessories");
      const cogsIdx = ordHeaders.indexOf("cogs");

      if (accIdx >= 0 && cogsIdx >= 0) {
        for (let o = 1; o < ordData.length; o++) {
          const currentCogs = Number(ordData[o][cogsIdx]) || 0;
          const accStr = String(ordData[o][accIdx] || "");
          if (currentCogs === 0 && accStr) {
            const specs = calculateGlassTankSpecs(accStr);
            if (specs) {
              ordSheet.getRange(o + 1, cogsIdx + 1).setValue(specs.totalCOGS);
            }
          }
        }
      }
    }

    SpreadsheetApp.flush();
    const msg = `🟢 Đã chuẩn hóa thành công BOM (Kính Đáy + Kính MVT + Keo Silicon) & Giá vốn cho ${updatedCount} mã bể.`;
    Logger.log(msg);
    return { success: true, message: msg };

  } catch (e) {
    Logger.log("Lỗi hệ thống autoCalculateGlassTankBOM_Dual: " + e.message);
    throw e;
  } finally {
    // Luôn nhả Lock dù có báo lỗi
    lock.releaseLock();
  }
}

/**
 * CRONJOB: Kiểm tra phạt trễ đóng gói (19:30 hằng ngày)
 * Lọc các đơn đang ở trạng thái 'Sẵn sàng đóng gói' nhưng chưa có Packings DONE
 * Phạt 50,000 VND vào quỹ của Nguyễn Thị Diệu Hương
 */
function cronCheckUnpackedOrdersAt1930() {
  const now = new Date();
  if (isWorkshopOffDay(now)) {
    Logger.log('Hôm nay là ngày nghỉ của xưởng (Chủ nhật / Nghỉ lễ / Nghỉ đột xuất). Bỏ qua tự động phạt đóng gói SLA 19:30.');
    return;
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ordSheet = ss.getSheetByName('Orders');
    const packSheet = ss.getSheetByName('Packings');
    const bpSheet = ss.getSheetByName('BonusPenalty');

    if (!ordSheet || !packSheet || !bpSheet) return;

    const ordData = ordSheet.getDataRange().getValues();
    const ordHeaders = ordData[0];
    const oIdIdx = ordHeaders.indexOf('id');
    const oStatusIdx = ordHeaders.indexOf('status');
    const oCodeIdx = ordHeaders.indexOf('orderCode');

    const packData = packSheet.getDataRange().getValues();
    const packHeaders = packData[0];
    const pOrderIdIdx = packHeaders.indexOf('orderId');
    const pStatusIdx = packHeaders.indexOf('status');

    // Lọc ra danh sách Order ID đã đóng gói xong (Done / ĐÃ XONG)
    const donePacks = {};
    for (let i = 1; i < packData.length; i++) {
      const pStat = String(packData[i][pStatusIdx] || '').toUpperCase().trim();
      const pOrdId = String(packData[i][pOrderIdIdx] || '').trim();
      if (pStat === 'DONE' || pStat === 'ĐÃ XONG') {
        donePacks[pOrdId] = true;
      }
    }

    const safeDate = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd");

    // Lấy danh sách các đơn đã bị phạt hôm nay để tránh phạt trùng lặp
    const bpData = bpSheet.getDataRange().getValues();
    const bpHeaders = bpData[0];
    const bpOrderCodeIdx = bpHeaders.indexOf('orderCode');
    const bpDateIdx = bpHeaders.indexOf('date');
    const bpTypeIdx = bpHeaders.indexOf('type');

    const existingPenalties = {};
    for (let b = 1; b < bpData.length; b++) {
      const bDate = String(bpData[b][bpDateIdx] || '').slice(0, 10);
      const bCode = String(bpData[b][bpOrderCodeIdx] || '').trim();
      const bType = String(bpData[b][bpTypeIdx] || '').trim();
      if (bDate === safeDate && (bType === 'Phạt' || bType === 'Phạt Quy Định')) {
        existingPenalties[bCode] = true;
      }
    }

    let penaltyCount = 0;
    const newPenaltyRows = [];

    for (let i = 1; i < ordData.length; i++) {
      const oId = String(ordData[i][oIdIdx] || '').trim();
      const oCode = String(ordData[i][oCodeIdx] || '').trim();
      const oStat = String(ordData[i][oStatusIdx] || '').trim();
      const oStatUpper = oStat.toUpperCase();

      if (oStatUpper === 'SẴN SÀNG ĐÓNG GÓI' || oStat === 'Sẵn sàng đóng gói') {
        if (!donePacks[oId]) {
          const targetCode = oCode || oId;
          if (!existingPenalties[targetCode]) {
            const bpId = 'PENALTY_SLA_' + Date.now() + '_' + penaltyCount;
            // Schema BonusPenalty: id, user, amount, type, note, date, orderCode
            newPenaltyRows.push([
              bpId,
              'Nguyễn Thị Diệu Hương',
              -50000,
              'Phạt',
              'Phạt trễ đóng gói trước 19:30 - Đơn ' + targetCode,
              safeDate,
              targetCode
            ]);
            existingPenalties[targetCode] = true;
            penaltyCount++;
          }
        }
      }
    }

    if (newPenaltyRows.length > 0) {
      bpSheet.getRange(bpSheet.getLastRow() + 1, 1, newPenaltyRows.length, newPenaltyRows[0].length).setValues(newPenaltyRows);
      Logger.log('Đã phạt ' + penaltyCount + ' đơn trễ đóng gói SLA lúc 19:30');
    }

  } catch (e) {
    Logger.log('Lỗi cronCheckUnpackedOrdersAt1930: ' + e.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * RESTORE LỖI LẤY TỪ KHO
 * Khôi phục lại trạng thái "Đã xong" cho các lệnh đã lấy từ kho nhưng bị nhầm thành Pending
 */
function restoreFulfilledFromStock() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
      SpreadsheetApp.getUi().alert('Hệ thống đang bận, thử lại sau!');
    }
    return;
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var prodSheet = ss.getSheetByName('Production');
    if (!prodSheet) return;
    var data = prodSheet.getDataRange().getValues();
    var headers = data[0];

    var statusCol = headers.indexOf('status');
    var fulCol = headers.indexOf('fulfilledFromStock');
    var noteCol = headers.indexOf('note');
    var p1StatusCol = headers.indexOf('p1_status');
    var p2StatusCol = headers.indexOf('p2_status');
    var qcStatusCol = headers.indexOf('qc_status');

    var count = 0;

    for (var i = 1; i < data.length; i++) {
      var status = String(data[i][statusCol]).trim();
      var note = String(data[i][noteCol]).trim();

      // Nếu có chữ lấy từ tồn kho hoặc các cụm từ tương tự, nhưng lại KHÔNG có dòng Sửa về Chờ Sản Xuất do kho âm
      var isFulfilledNote = (note.indexOf('Lấy từ tồn kho có sẵn') !== -1 ||
        note.indexOf('Có sẵn ở kho') !== -1 ||
        note.indexOf('Tự động bốc từ kho') !== -1 ||
        note.indexOf('LẤY TỪ TỒN KHO') !== -1);

      if (isFulfilledNote && note.indexOf('Sửa về Chờ Sản Xuất do kho âm') === -1) {
        // Dù cho thợ có lỡ ấn nhận việc hay làm xong rồi (do lỗi reset nhầm),
        // thì bản chất lệnh này là lấy từ kho, nên ta sẽ ép nó về đúng bản chất.
        prodSheet.getRange(i + 1, fulCol + 1).setValue(true);
        prodSheet.getRange(i + 1, statusCol + 1).setValue('Hoàn Kho Đạt');

        // Trả lại các khâu về Done để hệ thống hiểu là không cần làm nữa
        if (p1StatusCol !== -1) prodSheet.getRange(i + 1, p1StatusCol + 1).setValue('Done');
        if (p2StatusCol !== -1) prodSheet.getRange(i + 1, p2StatusCol + 1).setValue('Done');
        if (qcStatusCol !== -1) prodSheet.getRange(i + 1, qcStatusCol + 1).setValue('Done');

        count++;
      }
    }

    if (typeof SpreadsheetApp !== 'undefined' && SpreadsheetApp.getUi) {
      SpreadsheetApp.getUi().alert('Đã khôi phục thành công ' + count + ' lệnh bị lỗi hiển thị "Chờ nhận việc"!');
    }
  } catch (err) {
    console.error("Lỗi restoreFulfilledFromStock:", err);
  } finally {
    lock.releaseLock();
  }
}

/**
 * THUẬT TOÁN GỘP LỆNH BỂ KÍNH THÔNG MINH
 * Quét toàn bộ Production đang Pending có chứa từ khoá "Bể kính" (hoặc type là Bể kính).
 * Gom các lệnh cùng name (kích thước) vào và phân công cho cùng một thợ (tự động chọn thợ đang active).
 * Đổi trạng thái p1_status = 'In Progress'.
 */
function batchDispatchSmartGlassTanks() {
  // YÊU CẦU CỦA USER: "không gộp lệnh như này. làm logic bên bể kính giống bên layout ấy"
  // Áp dụng triết lý One-Piece Flow, vô hiệu hoá thuật toán gộp và tự động giao việc.
  // Bể Kính sẽ do thợ tự vào ứng dụng bấm "Nhận làm" cho từng lệnh đơn lẻ giống Layout.
  return { success: true, message: 'Đã chuyển sang One-Piece Flow. Lệnh bể kính không còn tự động gộp.' };
}

/**
 * RICH FISH AQUARIUM - ENGINE TỰ ĐỘNG TÍNH ĐỊNH MỨC & ĐỒNG BỘ BOM LAYOUT
 * Tác giả: AI Operations Leader
 */
function autoGenerateAndSyncLayoutBOM() {
  const notifyUi = function (msg) {
    Logger.log(msg);
    try {
      SpreadsheetApp.getUi().alert(msg);
    } catch (e) {
      // Chạy từ Apps Script Editor, Trigger hoặc WebApp không có container UI
    }
  };

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    notifyUi('⚠️ Hệ thống đang bận, vui lòng thử lại sau vài giây!');
    return { success: false, message: 'Hệ thống đang bận' };
  }

  try {
    const activeSs = SpreadsheetApp.getActiveSpreadsheet();
    let sheetEstimate = null;

    // 1. Tìm trong chính file hiện tại (active spreadsheet)
    const activeSheets = activeSs.getSheets();
    sheetEstimate = activeSheets.find(s => {
      const n = s.getName().toLowerCase().trim();
      return n.includes('bản để làm') || n.includes('định mức bom') || n === 'layout';
    });

    // 2. Nếu không có, mở file BẢNG GIÁ HÀNG HOÁ RF AQUARIUM bên ngoài
    if (!sheetEstimate) {
      const extFileId = '1485FsgYjTXA1EkqsaEQ-kCI1EyFUsVueAd9GirhFis';
      try {
        const extSs = SpreadsheetApp.openById(extFileId);
        const extSheets = extSs.getSheets();
        sheetEstimate = extSheets.find(s => {
          const n = s.getName().toLowerCase().trim();
          return n.includes('bản để làm') || n.includes('app') || n.includes('định mức');
        }) || extSheets[extSheets.length - 1];
      } catch (extErr) {
        Logger.log('Lỗi mở file Bảng Giá ngoài (' + extFileId + '): ' + extErr.toString());
      }
    }

    if (!sheetEstimate) {
      const guideMsg = "⚠️ Không tìm thấy bảng định mức!\n\nCách xử lý đơn giản nhất:\nAnh hãy mở file 'BẢNG GIÁ HÀNG HOÁ RF AQUARIUM', nhấp chuột phải vào tab 'Bản để làm appp không sài đến' -> Chọn 'Sao chép vào (Copy to)' -> Chọn file 'RF Workspace Pro (Bản Chính Thức Chuẩn)' này, sau đó bấm Chạy lại là xong ngay!";
      notifyUi(guideMsg);
      return { success: false, message: guideMsg };
    }

    const data = sheetEstimate.getDataRange().getValues();
    if (data.length < 5) {
      throw new Error("Bảng định mức '" + sheetEstimate.getName() + "' không đủ số dòng dữ liệu!");
    }

    // 1. Ánh xạ các cột trên bảng tính định mức (Dòng 2 & 4: Cột C đến T)
    const COL = {
      SAN_MIENG: 2,   // C - Lũa San Miếng (gam)
      TAI_MEO: 3,     // D - Đá Tai Mèo (gam)
      NHAM_XANH: 4,   // E - Đá Nham Xanh (gam)
      CUOI: 5,        // F - Đá Cuội (gam)
      SAN: 6,         // G - Đá San (gam)
      VIA: 7,         // H - Đá Vỉa (gam)
      DA_VOI: 8,      // I - Đá Da Voi (gam)
      SAN_CANH: 9,    // J - Lũa San Cành (gam)
      DO_QUYEN: 10,   // K - Lũa Đỗ Quyên (gam)
      RE_RUNG: 11,    // L - Rễ Rừng (gam)
      THACH_SUNG: 12, // M - Lũa Thạch Sùng (gam)
      NHO_NOI: 13,    // N - Lũa Nhọ Nồi (gam)
      REU_XANH: 14,   // O - Rêu Xanh A04 (gam)
      REU_DO: 15,     // P - Rêu Đỏ (gam)
      FOMEX_8LI: 16,  // Q - Fomex 8li (m²)
      FOMEX_10LI: 17, // R - Fomex 10li (m²)
      KEO_DK: 18,     // S - Keo Dựng Khung (Chai 100g keo / gam)
      KEO_GC: 19      // T - Keo Gia Cố (Chai 100g keo / gam)
    };

    const woodCols = [COL.SAN_MIENG, COL.SAN_CANH, COL.DO_QUYEN, COL.RE_RUNG, COL.THACH_SUNG, COL.NHO_NOI];
    const stoneCols = [COL.TAI_MEO, COL.NHAM_XANH, COL.CUOI, COL.SAN, COL.VIA, COL.DA_VOI];
    const mossCols = [COL.REU_XANH, COL.REU_DO];

    // Hệ số chuẩn hóa (Từ Size 30 làm mốc chuẩn)
    const SCALE_FROM_30 = {
      TO_20: { stone: 0.8000, wood: 0.4286, moss: 0.8000, fomex8li: 0.0255, fomex10li: 0, keoDK: 40, keoGC: 120 },
      TO_40: { stone: 1.4667, wood: 1.5714, moss: 1.6000, fomex8li: 0, fomex10li: 0.0920, keoDK: 140, keoGC: 230 }
    };

    // Hệ số chuẩn hóa (Từ Size 20 làm mốc chuẩn)
    const SCALE_FROM_20 = {
      TO_30: { stone: 1.2500, wood: 2.3333, moss: 1.2500, fomex8li: 0.0405, fomex10li: 0, keoDK: 60, keoGC: 190 },
      TO_40: { stone: 1.8333, wood: 3.6667, moss: 2.0000, fomex8li: 0, fomex10li: 0.0920, keoDK: 140, keoGC: 230 }
    };

    // Xử lý ô trống là 0
    for (let r = 4; r < data.length; r++) {
      for (let c = 2; c <= 19; c++) {
        if (data[r][c] === '' || data[r][c] === null || isNaN(Number(data[r][c]))) {
          data[r][c] = 0;
        } else {
          data[r][c] = Number(data[r][c]);
        }
      }
    }

    // 2. Thuật toán tự động sinh số liệu cho Size 20, Size 30, Size 40
    let updatedRowsCount = 0;
    for (let r = 4; r < data.length; r++) {
      const sku = String(data[r][0] || '').trim();
      if (!sku) continue;

      // TRƯỜNG HỢP A: Có sẵn mẫu Size 30 (-302020)
      if (sku.endsWith('-302020')) {
        const prefix = sku.replace('-302020', '');
        const row30 = data[r];
        const hasData = woodCols.concat(stoneCols, mossCols).some(c => Number(row30[c]) > 0);
        if (!hasData) continue;

        // Điền cố định Fomex & Keo cho Size 30 nếu chưa có
        if (row30[COL.FOMEX_8LI] === 0) row30[COL.FOMEX_8LI] = 0.0405;
        if (row30[COL.KEO_DK] === 0) row30[COL.KEO_DK] = 40;
        if (row30[COL.KEO_GC] === 0) row30[COL.KEO_GC] = 120;

        for (let targetR = 4; targetR < data.length; targetR++) {
          const targetSku = String(data[targetR][0] || '').trim();

          // Tính Size 20
          if (targetSku === `${prefix}-202020`) {
            woodCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_20.wood); });
            stoneCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_20.stone); });
            mossCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_20.moss); });

            data[targetR][COL.FOMEX_8LI] = SCALE_FROM_30.TO_20.fomex8li;
            data[targetR][COL.FOMEX_10LI] = SCALE_FROM_30.TO_20.fomex10li;
            data[targetR][COL.KEO_DK] = SCALE_FROM_30.TO_20.keoDK;
            data[targetR][COL.KEO_GC] = SCALE_FROM_30.TO_20.keoGC;
            updatedRowsCount++;
          }

          // Tính Size 40
          if (targetSku === `${prefix}-402325`) {
            woodCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_40.wood); });
            stoneCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_40.stone); });
            mossCols.forEach(c => { data[targetR][c] = Math.round(Number(row30[c]) * SCALE_FROM_30.TO_40.moss); });

            data[targetR][COL.FOMEX_8LI] = SCALE_FROM_30.TO_40.fomex8li;
            data[targetR][COL.FOMEX_10LI] = SCALE_FROM_30.TO_40.fomex10li;
            data[targetR][COL.KEO_DK] = SCALE_FROM_30.TO_40.keoDK;
            data[targetR][COL.KEO_GC] = SCALE_FROM_30.TO_40.keoGC;
            updatedRowsCount++;
          }
        }
      }
    }

    // Ghi lại toàn bộ bảng tính định mức 1 lần duy nhất (Batch Write)
    if (sheetEstimate.getMaxColumns() >= data[0].length) {
      sheetEstimate.getRange(1, 1, data.length, data[0].length).setValues(data);
    }

    // 3. ĐỒNG BỘ TRỰC TIẾP VÀO BẢNG BOM_Config
    const BOM_HEADERS = ['id', 'layoutCode', 'materialSku', 'defaultQty', 'unit'];
    let bomSheet = activeSs.getSheetByName('BOM_Config');
    if (!bomSheet) {
      bomSheet = activeSs.insertSheet('BOM_Config');
      bomSheet.appendRow(BOM_HEADERS);
      bomSheet.setFrozenRows(1);
    }

    // Bảng SKU & Đơn Vị Tính Mapping chuẩn khớp 100% Header BomLayout
    const SKU_MAP = {
      [COL.SAN_MIENG]: { sku: 'NLSX-LUASANMIENG', unit: 'gam' },
      [COL.TAI_MEO]: { sku: 'NLSX-TAIMEO', unit: 'gam' },
      [COL.NHAM_XANH]: { sku: 'NLSX-NHAMXANH', unit: 'gam' },
      [COL.CUOI]: { sku: 'NLSX-CUOI', unit: 'gam' },
      [COL.SAN]: { sku: 'NLSX-SAN', unit: 'gam' },
      [COL.VIA]: { sku: 'NLSX-VIAVOI', unit: 'gam' },
      [COL.DA_VOI]: { sku: 'NLSX-DAVOI', unit: 'gam' },
      [COL.SAN_CANH]: { sku: 'NLSX-DANHCANH', unit: 'gam' },
      [COL.DO_QUYEN]: { sku: 'NLSX-DOQUYEN', unit: 'gam' },
      [COL.RE_RUNG]: { sku: 'NLSX-REEN', unit: 'gam' },
      [COL.THACH_SUNG]: { sku: 'NLSX-THACHSUNG', unit: 'gam' },
      [COL.NHO_NOI]: { sku: 'NLSX-NHONOI', unit: 'gam' },
      [COL.REU_XANH]: { sku: 'NLSX-REU-A04', unit: 'gam' },
      [COL.REU_DO]: { sku: 'NLSX-REU-A11', unit: 'gam' },
      [COL.FOMEX_8LI]: { sku: 'NLSX-FOMEX-8li', unit: 'm²' },
      [COL.FOMEX_10LI]: { sku: 'NLSX-FOMEX10-54', unit: 'm²' }
    };

    // Giữ lại các BOM Bể Kính đã có sẵn
    const existingBomData = bomSheet.getDataRange().getValues();
    const newBomRows = [BOM_HEADERS];

    if (existingBomData && existingBomData.length > 1) {
      for (let b = 1; b < existingBomData.length; b++) {
        const row = existingBomData[b];
        const code = String(row[1] || '').trim();
        if (code.startsWith('BE') || code.startsWith('TERA') || code.includes('Bể Kính')) {
          newBomRows.push([
            row[0] || `BOM_${code}`,
            code,
            row[2] || '',
            Number(row[3]) || 0,
            row[4] || ''
          ]);
        }
      }
    }

    // Nạp toàn bộ định mức Layout mới vào (Quét từ dòng 6 - index 5 trở đi)
    for (let r = 5; r < data.length; r++) {
      const layoutSku = String(data[r][0] || '').trim();
      const layoutName = String(data[r][1] || '').trim();
      if (!layoutSku) continue;

      const targetCodes = [layoutSku];
      if (layoutName && layoutName !== layoutSku) targetCodes.push(layoutName);

      targetCodes.forEach(targetCode => {
        // Gom Keo 502 (Dựng Khung + Gia Cố)
        const totalKeoGrams = (Number(data[r][COL.KEO_DK]) || 0) + (Number(data[r][COL.KEO_GC]) || 0);
        if (totalKeoGrams > 0) {
          // 1 chai keo 502: 162g tổng - 62g vỏ = 100g keo thực tế, giá 22.000đ/100g
          const bottleQty = Number((totalKeoGrams / 100).toFixed(2));
          newBomRows.push([
            `BOM_${targetCode}_502`,
            targetCode,
            'NLSX-502-1CHAI',
            bottleQty,
            'Chai'
          ]);
        }

        // Nạp các nguyên liệu còn lại (Giữ nguyên giá trị gam / m2 chuẩn từ bảng tính)
        Object.keys(SKU_MAP).forEach(colIdx => {
          const c = Number(colIdx);
          const val = Number(data[r][c]) || 0;
          if (val > 0) {
            const mat = SKU_MAP[c];
            newBomRows.push([
              `BOM_${targetCode}_${mat.sku}`,
              targetCode,
              mat.sku,
              val,
              mat.unit
            ]);
          }
        });
      });
    }

    // Ghi đè BOM_Config an toàn (Cố định đúng 5 cột)
    bomSheet.clearContents();
    bomSheet.getRange(1, 1, newBomRows.length, 5).setValues(newBomRows);

    // 4. ĐỒNG BỘ GIÁ VỐN TỪ DÒNG SỐ 3 VÀO BẢNG Products (ERP)
    let priceSyncCount = 0;
    try {
      const prodSheet = activeSs.getSheetByName('Products');
      if (prodSheet) {
        const prodData = prodSheet.getDataRange().getValues();
        const priceMap = {};

        // Parse giá từ dòng 3 (index 2) - Lọc lấy phần số (ví dụ: "35000 / 1kg" -> 35000)
        Object.keys(SKU_MAP).forEach(colIdx => {
          const c = Number(colIdx);
          const rawPriceStr = String(data[2][c] || '');
          const cleanStr = rawPriceStr.replace(/\./g, '').replace(/,/g, '');
          const match = cleanStr.match(/\d+/);
          if (match) priceMap[SKU_MAP[c].sku] = Number(match[0]);
        });

        // Đặc thù Keo 502
        const keoRaw = String(data[2][COL.KEO_DK] || '');
        const keoMatch = keoRaw.replace(/\./g, '').replace(/,/g, '').match(/\d+/);
        if (keoMatch) priceMap['NLSX-502-1CHAI'] = Number(keoMatch[0]);

        let costPriceColIdx = -1;
        let skuColIdx = -1;
        for (let i = 0; i < prodData[0].length; i++) {
          if (prodData[0][i] === 'costPrice') costPriceColIdx = i;
          if (prodData[0][i] === 'sku') skuColIdx = i;
        }

        if (costPriceColIdx !== -1 && skuColIdx !== -1) {
          let hasChanges = false;
          for (let r = 1; r < prodData.length; r++) {
            const rowSku = String(prodData[r][skuColIdx] || '').trim();
            if (priceMap[rowSku] !== undefined && priceMap[rowSku] > 0) {
              if (Number(prodData[r][costPriceColIdx]) !== priceMap[rowSku]) {
                prodData[r][costPriceColIdx] = priceMap[rowSku];
                hasChanges = true;
                priceSyncCount++;
              }
            }
          }
          if (hasChanges) {
            prodSheet.getRange(1, 1, prodData.length, prodData[0].length).setValues(prodData);
          }
        }
      }
    } catch (err) {
      Logger.log('Lỗi đồng bộ giá vốn: ' + err.message);
    }

    SpreadsheetApp.flush();
    const successMsg = `✅ Thành công!\n- Đã tự động tính toán hoàn tất ${updatedRowsCount} phân loại kích thước.\n- Đã đồng bộ ${newBomRows.length - 1} bản ghi định mức vào bảng BOM_Config.\n- Đã tự động cập nhật Giá Vốn cho ${priceSyncCount} mã vật tư từ Bảng Chuẩn sang Kho!`;
    notifyUi(successMsg);
    return { success: true, message: successMsg, updatedRows: updatedRowsCount, bomRecords: newBomRows.length - 1 };


  } catch (err) {
    const errMsg = '❌ Lỗi xử lý: ' + err.toString();
    notifyUi(errMsg);
    return { success: false, error: errMsg };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// API DASHBOARD LỖI KCS & TỒN KHO
// =========================================================================
function getDashboardErrors(params) {
  return api_getDashboardErrors(params);
}

function api_getDashboardErrors(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Lấy lỗi KCS (Từ chối)
    var prodSheet = ss.getSheetByName('Production');
    var kcsErrors = [];
    if (prodSheet) {
      var pData = prodSheet.getDataRange().getValues();
      var pHead = pData[0];
      var qcStatusCol = pHead.indexOf('qc_status');
      var p1StatusCol = pHead.indexOf('p1_status');
      var p2StatusCol = pHead.indexOf('p2_status');
      var statusCol = pHead.indexOf('status');

      for (var i = 1; i < pData.length; i++) {
        var qc = String(pData[i][qcStatusCol] || '').toUpperCase().trim();
        var p1 = String(pData[i][p1StatusCol] || '').toUpperCase().trim();
        var p2 = String(pData[i][p2StatusCol] || '').toUpperCase().trim();
        var st = String(pData[i][statusCol] || '').toUpperCase().trim();

        var isQcError = (qc === 'FAIL' || qc === 'REJECT' || qc.indexOf('TỪ CHỐI') > -1 || qc.indexOf('LỖI') > -1 || p1 === 'REJECT' || p2 === 'REJECT' || st.indexOf('LỖI') > -1 || st.indexOf('SỬA') > -1);
        if (isQcError) {
          var rowObj = {};
          pHead.forEach(function (h, idx) {
            rowObj[h] = pData[i][idx];
          });
          kcsErrors.push(rowObj);
        }
      }
    }

    // 2. Lấy lỗi Tồn Kho (Lệch Tồn hoặc Cảnh Báo)
    var invSheet = ss.getSheetByName('Products');
    var invErrors = [];
    if (invSheet) {
      var iData = invSheet.getDataRange().getValues();
      var iHead = iData[0];
      var qtyCol = iHead.indexOf('quantity');
      var minCol = iHead.indexOf('minStock');
      var maxCol = iHead.indexOf('maxStock');
      if (qtyCol > -1 && minCol > -1) {
        for (var j = 1; j < iData.length; j++) {
          var qty = Number(iData[j][qtyCol]) || 0;
          var min = Number(iData[j][minCol]) || 0;
          var max = Number(iData[j][maxCol]) || 0;
          if (qty < 0 || (min > 0 && qty <= min)) {
            var rObj = {};
            iHead.forEach(function (h, idx) {
              rObj[h] = iData[j][idx];
            });
            rObj._errorType = qty < 0 ? 'ÂM KHO' : 'CHẠM ĐÁY TỒN KHO';
            invErrors.push(rObj);
          }
        }
      }
    }

    return { success: true, data: { kcsErrors: kcsErrors, invErrors: invErrors } };
  } catch (err) {
    return { success: false, message: 'Lỗi tải Dashboard: ' + err.message };
  }
}

/**
 * RICH FISH AQUARIUM - AUTO GENERATE BOM & COGS ENGINE
 * Tự động tính số vật tư và gán thẳng giá vốn vào Products từ Sheet Định Mức Mẫu
 */
function autoCalculateBOMAndProductCosts() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return { success: false, message: '⚠️ Hệ thống đang bận, vui lòng thử lại sau vài giây!' };
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const estimateSheet = ss.getSheetByName('Bản để làm appp không sài đến') || ss.getSheetByName('DinhMuc_Mau') || ss.getActiveSheet();
    const prodSheet = ss.getSheetByName('Products');
    const bomSheet = ss.getSheetByName('BOM_Config');

    if (!estimateSheet || !prodSheet || !bomSheet) {
      return { success: false, message: '❌ Không tìm thấy đủ các sheet: Products, BOM_Config, hoặc Sheet Định Mức!' };
    }

    const estData = estimateSheet.getDataRange().getValues();
    const prodData = prodSheet.getDataRange().getValues();
    const prodHeaders = prodData[0];
    const skuIdx = prodHeaders.indexOf('sku');
    const nameIdx = prodHeaders.indexOf('name');
    const costIdx = prodHeaders.indexOf('costPrice');
    const catIdx = prodHeaders.indexOf('category');

    // 1. ÁNH XẠ CỘT TRÊN SHEET ĐỊNH MỨC MẪU
    // Cột mặc định theo sheet "Bản để làm appp không sài đến":
    // C (2): San Miếng, D (3): Tai Mèo, E (4): Nham Xanh, F (5): Cuội, G (6): Sạn, H (7): Vỉa, I (8): Da Voi
    // J (9): San Cành, K (10): Đỗ Quyên, L (11): Rễ Rừng, M (12): Thạch Sùng, N (13): Nhọ Nồi
    // O (14): Rêu Xanh, P (15): Rêu Đỏ, Q (16): Fomex 8li, R (17): Fomex 10li, S (18): Keo DK, T (19): Keo GC
    const colMap = {
      sanMieng: 2, taiMeo: 3, nhamXanh: 4, cuoi: 5, san: 6, via: 7, daVoi: 8,
      sanCanh: 9, doQuyen: 10, reRung: 11, thachSung: 12, nhoNoi: 13,
      reuXanh: 14, reuDo: 15, fomex8: 16, fomex10: 17, keoDK: 18, keoGC: 19
    };

    // Quét 6 dòng đầu tiên để map động nếu các cột có dịch chuyển
    for (let c = 0; c < (estData[0] ? estData[0].length : 25); c++) {
      let combinedHeader = '';
      for (let r = 0; r < Math.min(6, estData.length); r++) {
        combinedHeader += ' ' + String(estData[r][c] || '');
      }
      const hStr = combinedHeader.toLowerCase();
      if (hStr.includes('san miếng') || hStr.includes('san mieng')) colMap.sanMieng = c;
      else if (hStr.includes('tai mèo') || hStr.includes('tai meo')) colMap.taiMeo = c;
      else if (hStr.includes('nham xanh') || hStr.includes('nham')) colMap.nhamXanh = c;
      else if (hStr.includes('cuội') || hStr.includes('cuoi')) colMap.cuoi = c;
      else if (hStr.includes('sạn') || hStr.includes('san')) colMap.san = c;
      else if (hStr.includes('vỉa') || hStr.includes('via')) colMap.via = c;
      else if (hStr.includes('da voi')) colMap.daVoi = c;
      else if (hStr.includes('san cành') || hStr.includes('san canh')) colMap.sanCanh = c;
      else if (hStr.includes('đỗ quyên') || hStr.includes('do quyen')) colMap.doQuyen = c;
      else if (hStr.includes('rễ rừng') || hStr.includes('re rung')) colMap.reRung = c;
      else if (hStr.includes('thạch sùng') || hStr.includes('thach sung')) colMap.thachSung = c;
      else if (hStr.includes('nhọ nồi') || hStr.includes('nho noi')) colMap.nhoNoi = c;
      else if (hStr.includes('rêu xanh') || hStr.includes('reu xanh')) colMap.reuXanh = c;
      else if (hStr.includes('rêu đỏ') || hStr.includes('reu do')) colMap.reuDo = c;
      else if (hStr.includes('fomex 8li') || hStr.includes('fomex 8')) colMap.fomex8 = c;
      else if (hStr.includes('fomex 10li') || hStr.includes('fomex 10')) colMap.fomex10 = c;
      else if (hStr.includes('dựng khung') || hStr.includes('dung khung')) colMap.keoDK = c;
      else if (hStr.includes('gia cố') || hStr.includes('gia co')) colMap.keoGC = c;
    }

    // Đơn giá vật tư gốc
    const MATERIAL_COST = {
      'NLSX-LUASANMIENG': 35000, 'NLSX-TAIMEO': 5000, 'NLSX-NHAM': 5000,
      'NLSX-CUOI': 5000, 'NLSX-SAN': 5000, 'NLSX-VIA': 7000, 'NLSX-DAVOI': 7000,
      'NLSX-LUASANCANH': 35000, 'NLSX-DOQUYEN': 120000, 'NLSX-RE': 100000,
      'NLSX-THACHSUNG': 35000, 'NLSX-NOIN': 70000, 'NLSX-REU-A04': 450,
      'NLSX-REU-A11': 450, 'NLSX-FOMEX-8li': 100779, 'NLSX-FOMEX10-54': 117576,
      'NLSX-502-1CHAI': 22000
    };

    // 2. BÓC TÁCH MẪU CHUẨN TỪ CÁC DÒNG SIZE 30x20x20 (hoặc dòng mẫu đầu tiên của mã)
    const baseMap = {};
    for (let r = 0; r < estData.length; r++) {
      const sku = String(estData[r][0] || '').trim().toUpperCase();
      if (!sku || sku === 'MÃ' || sku === 'MA' || sku.startsWith('TÊN')) continue;

      const parts = sku.split('-');
      const prefix = parts.length >= 2 ? parts.slice(0, 2).join('-') : parts[0];
      const row = estData[r];

      const parsedData = {
        sanMieng: Number(row[colMap.sanMieng]) || 0,
        taiMeo: Number(row[colMap.taiMeo]) || 0,
        nhamXanh: Number(row[colMap.nhamXanh]) || 0,
        cuoi: Number(row[colMap.cuoi]) || 0,
        san: Number(row[colMap.san]) || 0,
        via: Number(row[colMap.via]) || 0,
        daVoi: Number(row[colMap.daVoi]) || 0,
        sanCanh: Number(row[colMap.sanCanh]) || 0,
        doQuyen: Number(row[colMap.doQuyen]) || 0,
        reRung: Number(row[colMap.reRung]) || 0,
        thachSung: Number(row[colMap.thachSung]) || 0,
        nhoNoi: Number(row[colMap.nhoNoi]) || 0,
        reuXanh: Number(row[colMap.reuXanh]) || 0,
        reuDo: Number(row[colMap.reuDo]) || 0,
        keoDK: Number(row[colMap.keoDK]) || 40,
        keoGC: Number(row[colMap.keoGC]) || 120
      };

      // Ưu tiên dòng 302020 làm chuẩn gốc
      if (sku.includes('302020') || !baseMap[prefix]) {
        baseMap[prefix] = parsedData;
      }
    }

    // 3. TỰ ĐỘNG TÍNH TOÁN CHO TẤT CẢ SẢN PHẨM LAYOUT TRONG PRODUCTS
    const newBomRows = [['id', 'layoutCode', 'materialSku', 'defaultQty', 'unit']];
    let updatedProductsCount = 0;

    // Giữ lại BOM Bể Kính cũ
    const oldBom = bomSheet.getDataRange().getValues();
    for (let b = 1; b < oldBom.length; b++) {
      const code = String(oldBom[b][1] || '').trim();
      if (code.startsWith('BE') || code.startsWith('TERA') || code.startsWith('BETTA')) {
        newBomRows.push(oldBom[b]);
      }
    }

    for (let p = 1; p < prodData.length; p++) {
      const cat = String(prodData[p][catIdx] || '').toUpperCase();
      if (cat !== 'LAYOUT') continue;

      const prodSku = String(prodData[p][skuIdx] || '').trim();
      const prodName = String(prodData[p][nameIdx] || '').trim();
      if (!prodSku) continue;

      // Phân tích mã ver và kích thước
      let match = prodSku.match(/^([A-Z]+-\d{3})-(\d{2,3})(\d{2})(\d{2})$/);
      let prefix = '';
      let L = 30, W = 20, H = 20;

      if (match) {
        prefix = match[1];
        L = parseInt(match[2]);
        W = parseInt(match[3]);
        H = parseInt(match[4]);
      } else {
        const nameDimMatch = prodName.match(/(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/i);
        const namePrefixMatch = prodSku.match(/^([A-Z]+-\d{3})/);
        if (nameDimMatch && namePrefixMatch) {
          prefix = namePrefixMatch[1];
          L = parseInt(nameDimMatch[1]);
          W = parseInt(nameDimMatch[2]);
          H = parseInt(nameDimMatch[3]);
        }
      }

      const base = baseMap[prefix];
      if (!base) continue;

      // Hệ số mở rộng theo thể tích và diện tích đáy
      const V0 = 30 * 20 * 20;
      const S0 = 30 * 20;
      const V = L * W * H;
      const S = L * W;

      const kStone = Math.pow(V / V0, 0.65);
      const kWood = Math.pow(V / V0, 0.75);
      const kMoss = Math.pow(S / S0, 0.65);
      const kKeo = Math.pow(V / V0, 0.70);

      // Fomex
      const isBigTank = (L >= 40 || W >= 23);
      const fomexAreaM2 = Number(((S * 0.9) / 10000).toFixed(4));
      const fomexSku = isBigTank ? 'NLSX-FOMEX10-54' : 'NLSX-FOMEX-8li';
      const fomexPrice = isBigTank ? MATERIAL_COST['NLSX-FOMEX10-54'] : MATERIAL_COST['NLSX-FOMEX-8li'];

      let totalCOGS = 0;

      // A. Tính Đá (gam -> Kg)
      const stoneList = [
        { sku: 'NLSX-TAIMEO', val: base.taiMeo },
        { sku: 'NLSX-NHAM', val: base.nhamXanh },
        { sku: 'NLSX-CUOI', val: base.cuoi },
        { sku: 'NLSX-SAN', val: base.san },
        { sku: 'NLSX-VIA', val: base.via },
        { sku: 'NLSX-DAVOI', val: base.daVoi }
      ];

      stoneList.forEach(st => {
        if (st.val > 0) {
          const qtyKg = Number(((st.val * kStone) / 1000).toFixed(3));
          totalCOGS += qtyKg * (MATERIAL_COST[st.sku] || 5000);
          newBomRows.push([`BOM_${prodSku}_${st.sku}`, prodSku, st.sku, qtyKg, 'Cân']);
        }
      });

      // B. Tính Lũa (gam -> Kg)
      const woodList = [
        { sku: 'NLSX-LUASANMIENG', val: base.sanMieng },
        { sku: 'NLSX-LUASANCANH', val: base.sanCanh },
        { sku: 'NLSX-DOQUYEN', val: base.doQuyen },
        { sku: 'NLSX-RE', val: base.reRung },
        { sku: 'NLSX-THACHSUNG', val: base.thachSung },
        { sku: 'NLSX-NOIN', val: base.nhoNoi }
      ];

      woodList.forEach(w => {
        if (w.val > 0) {
          const qtyKg = Number(((w.val * kWood) / 1000).toFixed(3));
          totalCOGS += qtyKg * (MATERIAL_COST[w.sku] || 45000);
          newBomRows.push([`BOM_${prodSku}_${w.sku}`, prodSku, w.sku, qtyKg, 'Cân']);
        }
      });

      // C. Tính Rêu (gam)
      if (base.reuXanh > 0) {
        const qtyG = Math.round(base.reuXanh * kMoss);
        totalCOGS += qtyG * MATERIAL_COST['NLSX-REU-A04'];
        newBomRows.push([`BOM_${prodSku}_REU_XANH`, prodSku, 'NLSX-REU-A04', qtyG, 'Gam']);
      }
      if (base.reuDo > 0) {
        const qtyG = Math.round(base.reuDo * kMoss);
        totalCOGS += qtyG * MATERIAL_COST['NLSX-REU-A11'];
        newBomRows.push([`BOM_${prodSku}_REU_DO`, prodSku, 'NLSX-REU-A11', qtyG, 'Gam']);
      }

      // D. Tính Fomex
      totalCOGS += fomexAreaM2 * fomexPrice;
      newBomRows.push([`BOM_${prodSku}_FOMEX`, prodSku, fomexSku, fomexAreaM2, 'm²']);

      // E. Tính Keo 502 (Quy đổi ra chai 160g)
      const totalKeoGrams = (base.keoDK + base.keoGC) * kKeo;
      const totalBottles = Number((totalKeoGrams / 160).toFixed(2));
      totalCOGS += totalBottles * MATERIAL_COST['NLSX-502-1CHAI'];
      newBomRows.push([`BOM_${prodSku}_KEO502`, prodSku, 'NLSX-502-1CHAI', totalBottles, 'Chai']);

      // Cập nhật giá vốn trực tiếp vào dòng của bảng Products
      const finalCOGS = Math.round(totalCOGS);
      prodData[p][costIdx] = finalCOGS;
      updatedProductsCount++;
    }

    // 4. BATCH WRITE TRỞ LẠI SHEETS (Tối ưu chống tràn Quota)
    prodSheet.getRange(1, 1, prodData.length, prodHeaders.length).setValues(prodData);
    bomSheet.clearContents();
    bomSheet.getRange(1, 1, newBomRows.length, newBomRows[0].length).setValues(newBomRows);

    SpreadsheetApp.flush();
    return {
      success: true,
      message: `✅ HOÀN TẤT THÀNH CÔNG!\n- Đã tự động nhân bản & gán giá vốn (costPrice) cho ${updatedProductsCount} SKU Layout.\n- Đã đồng bộ ${newBomRows.length - 1} bản ghi BOM chuẩn vào BOM_Config.`
    };

  } catch (err) {
    return { success: false, message: '❌ Lỗi xử lý: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// ============================================================================
// RF_WORKSPACE_PRO - WEB PUSH NOTIFICATION BACKEND ENGINE
// ============================================================================

/**
 * 0. Khởi tạo bảng Push_Subscriptions trên Google Spreadsheet nếu chưa tồn tại
 */
function initPushSubscriptionsSheet() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = 'Push_Subscriptions';
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['id', 'user', 'subscription', 'userAgent', 'updatedAt']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#E2E8F0');
      Logger.log('✅ Đã khởi tạo thành công bảng Push_Subscriptions');
    } else {
      Logger.log('ℹ️ Bảng Push_Subscriptions đã tồn tại');
    }
    return sheet;
  } catch (e) {
    Logger.log('❌ Lỗi initPushSubscriptionsSheet: ' + e.toString());
    return null;
  } finally {
    lock.releaseLock();
  }
}

/**
 * 1. Lưu hoặc Cập nhật Push Subscription của nhân sự (Bảo vệ LockService)
 */
function saveUserPushSubscription(data) {
  if (!data || !data.user || !data.subscription) {
    return { success: false, message: 'Dữ liệu không hợp lệ' };
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = 'Push_Subscriptions';
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['id', 'user', 'subscription', 'userAgent', 'updatedAt']);
      sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#E2E8F0');
    }

    var values = sheet.getDataRange().getValues();
    var user = String(data.user).trim();
    var subscriptionStr = String(data.subscription).trim();
    var foundRow = -1;

    for (var i = 1; i < values.length; i++) {
      if (String(values[i][1]).trim() === user && String(values[i][2]).trim() === subscriptionStr) {
        foundRow = i + 1;
        break;
      }
    }

    var nowStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');

    if (foundRow > 0) {
      sheet.getRange(foundRow, 4).setValue(data.userAgent || '');
      sheet.getRange(foundRow, 5).setValue(nowStr);
    } else {
      var newId = 'SUB_' + Utilities.getUuid().substring(0, 8);
      sheet.appendRow([newId, user, subscriptionStr, data.userAgent || '', nowStr]);
    }

    return { success: true };
  } catch (e) {
    Logger.log('❌ Lỗi saveUserPushSubscription: ' + e.toString());
    return { success: false, error: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * 2. Gửi thông báo đẩy Web Push tới nhân sự cụ thể hoặc ALL
 * @param {string} targetUserName Tên nhân sự hoặc "ALL"
 * @param {string} title Tiêu đề thông báo
 * @param {string} message Nội dung tóm tắt
 * @param {string} targetUrl Đường dẫn khi nhấp vào banner
 */
function sendPushNotificationToStaff(targetUserName, title, message, targetUrl, extraOptions) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var subSheet = ss.getSheetByName('Push_Subscriptions');
    if (!subSheet) {
      Logger.log('⚠️ Bảng Push_Subscriptions chưa có, đang tự động khởi tạo...');
      subSheet = initPushSubscriptionsSheet();
    }
    if (!subSheet) {
      return { success: false, message: 'Không thể khởi tạo bảng Push_Subscriptions' };
    }

    var data = subSheet.getDataRange().getValues();
    if (data.length <= 1) return { success: false, message: 'Chưa có đăng ký subscription nào' };

    var targetUser = String(targetUserName || 'ALL').trim();
    var subsToSend = [];

    for (var i = 1; i < data.length; i++) {
      var staffName = String(data[i][1]).trim();
      var rawSub = String(data[i][2]).trim();

      if ((targetUser === 'ALL' || staffName === targetUser) && rawSub) {
        try {
          subsToSend.push({
            staff: staffName,
            sub: JSON.parse(rawSub)
          });
        } catch (err) {
          Logger.log('Lỗi parse subscription dòng ' + (i + 1));
        }
      }
    }

    if (subsToSend.length === 0) {
      Logger.log('ℹ️ Không có token subscription nào khớp cho: ' + targetUser);
      return { success: false, count: 0 };
    }

    var RELAY_ENDPOINT = PropertiesService.getScriptProperties().getProperty('PUSH_RELAY_URL') || 'https://floral-poetry-4aadrf-push-relay.nicezin-98.workers.dev/';
    var AUTH_TOKEN = PropertiesService.getScriptProperties().getProperty('PUSH_AUTH_TOKEN') || 'RF_WORK_PRO_SECURE_TOKEN_2026';

    var opts = extraOptions || {};
    var sentCount = 0;
    subsToSend.forEach(function (item) {
      var payload = {
        title: title || 'Rich Fish Aquarium',
        body: message || '',
        url: targetUrl || '',
        tag: opts.tag || ('rf-alert-' + (opts.type || 'info') + '-' + new Date().getTime()),
        type: opts.type || 'info',
        targetTab: opts.targetTab || 'dashboard',
        orderId: opts.orderId || '',
        timestamp: Date.now()
      };

      var fetchOptions = {
        method: 'post',
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + AUTH_TOKEN
        },
        payload: JSON.stringify({
          subscription: item.sub,
          payload: payload
        }),
        muteHttpExceptions: true
      };

      try {
        var response = UrlFetchApp.fetch(RELAY_ENDPOINT, fetchOptions);
        if (response.getResponseCode() >= 200 && response.getResponseCode() < 300) {
          sentCount++;
        }
      } catch (errReq) {
        Logger.log('❌ Lỗi UrlFetchApp Push tới [' + item.staff + ']: ' + errReq.toString());
      }
    });

    return { success: true, count: sentCount, total: subsToSend.length };
  } catch (e) {
    Logger.log('❌ Lỗi tổng quát sendPushNotificationToStaff: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

/**
 * 3. Kích hoạt thông báo đẩy cảnh báo đơn trễ / tiến độ 19:30
 */
function triggerDailyPackSlaAlert() {
  var title = '🚨 CẢNH BÁO TIẾN ĐỘ 19:30';
  var message = 'Còn đơn hàng Shopee/TikTok cần đóng gói trước giờ xe lấy. Kiểm tra ngay!';
  var targetUrl = 'https://script.google.com/macros/s/exec?tab=packings';

  sendPushNotificationToStaff('Diệu Hương', title, message, targetUrl, { type: 'urgent', targetTab: 'packings' });
  sendPushNotificationToStaff('Nguyễn Hoàng Dương', title, message, targetUrl, { type: 'urgent', targetTab: 'packings' });
}

/**
 * 4. API Bắn Web Push Đơn Hàng Gấp Tới Xưởng
 */
function api_sendUrgentOrderPush(orderCode, message, pin) {
  var auth = validatePin(pin);
  var title = '⚡ [ĐƠN GẤP HỎA TỐC] ' + (orderCode || '');
  var msg = message || ('Đơn gấp ' + (orderCode || '') + ' cần xưởng ưu tiên sản xuất & đóng gói ngay!');
  return sendPushNotificationToStaff('ALL', title, msg, 'https://script.google.com/macros/s/exec?tab=orders', {
    type: 'urgent',
    targetTab: 'orders',
    orderId: orderCode
  });
}

/**
 * 5. API Bắn Web Push Cảnh Báo SOS Khẩn Cấp Xưởng
 */
function api_sendFactorySOSPush(sosType, note, pin) {
  var auth = validatePin(pin);
  var title = '🚨 [CẢNH BÁO SOS XƯỞNG] ' + (sosType || 'Khẩn Cấp');
  var msg = (note ? note : 'Có sự cố khẩn cấp tại xưởng sản xuất cần hỗ trợ ngay!') + ' (Báo bởi: ' + (auth.user || 'Thợ Xưởng') + ')';
  return sendPushNotificationToStaff('ALL', title, msg, 'https://script.google.com/macros/s/exec?tab=production', {
    type: 'sos',
    targetTab: 'production'
  });
}

/**
 * 6. Hàm Test thử nghiệm bắn thông báo tức thì tới tất cả thiết bị đã đăng ký
 */
function testSendPushNotification() {
  var title = '🔔 TEST THÔNG BÁO RF WORKSPACE PRO';
  var message = 'Hệ thống thông báo đẩy 24/7 khi tắt app đã hoạt động thành công!';
  var result = sendPushNotificationToStaff('ALL', title, message, 'https://script.google.com/macros/s/exec', { type: 'info' });
  Logger.log('Kết quả test Web Push: ' + JSON.stringify(result));
  return result;
}

/**
 * =========================================================================
 * 🔍 HÀM PHÂN TÍCH TỶ LỆ LỖI SẢN XUẤT THEO THỢ (REWORK / KCS REJECT RATE)
 * =========================================================================
 */
function analyzeReworkRate(monthStr) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var prodSheet = ss.getSheetByName('Production');
  if (!prodSheet) {
    Logger.log('❌ Lỗi: Không tìm thấy sheet Production');
    return [];
  }

  var targetMonth = '';
  if (monthStr && typeof monthStr === 'string' && monthStr.trim() !== '') {
    targetMonth = monthStr.trim().slice(0, 7);
  } else {
    targetMonth = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM");
  }

  var data = prodSheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var deadlineCol = headers.indexOf('deadline');
  var fulfilledCol = headers.indexOf('fulfilledFromStock');
  var p1UserCol = headers.indexOf('p1_user');
  var p1StatusCol = headers.indexOf('p1_status');
  var p2UserCol = headers.indexOf('p2_user');
  var p2StatusCol = headers.indexOf('p2_status');
  var qcStatusCol = headers.indexOf('qc_status');

  if (deadlineCol === -1 || p1UserCol === -1 || p2UserCol === -1 || qcStatusCol === -1) {
    Logger.log('❌ Lỗi: Thiếu cột cốt lõi trong Schema bảng Production');
    return [];
  }

  var workerMap = {};

  function initWorker(userName) {
    if (!workerMap[userName]) {
      workerMap[userName] = { total: 0, fails: 0 };
    }
  }

  for (var i = 1; i < data.length; i++) {
    var row = data[i];

    var isFulfilledFromStock = String(row[fulfilledCol] || '').toUpperCase() === 'TRUE';
    if (isFulfilledFromStock) continue;

    var rawDeadline = row[deadlineCol];
    if (!rawDeadline) continue;

    var rowMonth = '';
    if (rawDeadline instanceof Date) {
      rowMonth = Utilities.formatDate(rawDeadline, "Asia/Ho_Chi_Minh", "yyyy-MM");
    } else {
      var d = new Date(rawDeadline);
      if (!isNaN(d.getTime())) {
        rowMonth = Utilities.formatDate(d, "Asia/Ho_Chi_Minh", "yyyy-MM");
      } else {
        rowMonth = String(rawDeadline).slice(0, 7);
      }
    }

    if (rowMonth !== targetMonth) continue;

    var qcStat = String(row[qcStatusCol] || '').toUpperCase().trim();
    var isQcFail = /FAIL|TỪ CHỐI|TU CHOI|REJECT/i.test(qcStat);

    var p1User = String(row[p1UserCol] || '').trim();
    var p1Status = String(row[p1StatusCol] || '').toUpperCase().trim();
    var isP1Done = (p1Status === 'DONE' || p1Status === 'ĐÃ XONG' || p1Status === 'HOÀN KHO ĐẠT');

    if (p1User && isP1Done) {
      initWorker(p1User);
      workerMap[p1User].total += 1;
      if (isQcFail) {
        workerMap[p1User].fails += 1;
      }
    }

    var p2User = String(row[p2UserCol] || '').trim();
    var p2Status = String(row[p2StatusCol] || '').toUpperCase().trim();
    var isP2Done = (p2Status === 'DONE' || p2Status === 'ĐÃ XONG' || p2Status === 'HOÀN KHO ĐẠT');

    if (p2User && isP2Done) {
      initWorker(p2User);
      workerMap[p2User].total += 1;
      if (isQcFail) {
        workerMap[p2User].fails += 1;
      }
    }
  }

  var results = [];
  Object.keys(workerMap).forEach(function (user) {
    var stats = workerMap[user];
    var errorRate = stats.total > 0 ? Number(((stats.fails / stats.total) * 100).toFixed(1)) : 0.0;

    results.push({
      user: user,
      total: stats.total,
      fails: stats.fails,
      errorRate: errorRate
    });
  });

  results.sort(function (a, b) {
    if (b.errorRate !== a.errorRate) {
      return b.errorRate - a.errorRate;
    }
    return b.fails - a.fails;
  });

  Logger.log('📊 [BÁO CÁO KCS SẢN XUẤT THÁNG ' + targetMonth + ']:\n' + JSON.stringify(results, null, 2));
  return results;
}

/**
 * =========================================================================
 * 🛡️ HÀM KIỂM ĐỊNH TỒN KHO TRƯỚC KHI HOÀN TẤT ĐÓNG GÓI
 * =========================================================================
 */
function validateInventoryBeforePacking(orderId) {
  if (!orderId) {
    return { success: false, errorType: 'INVALID_ORDER_ID', message: 'Thiếu mã đơn hàng' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var ordersSheet = ss.getSheetByName('Orders');
  if (!ordersSheet) {
    return { success: false, errorType: 'SHEET_NOT_FOUND', message: 'Không tìm thấy sheet Orders' };
  }

  var oData = ordersSheet.getDataRange().getValues();
  if (oData.length <= 1) {
    return { success: false, errorType: 'ORDER_NOT_FOUND', message: 'Sheet Orders rỗng' };
  }

  var oHeaders = oData[0];
  var oIdCol = oHeaders.indexOf('id');
  var oAccCol = oHeaders.indexOf('accessories');

  if (oIdCol === -1 || oAccCol === -1) {
    return { success: false, errorType: 'SCHEMA_ERROR', message: 'Thiếu cột id hoặc accessories trong sheet Orders' };
  }

  var targetOrder = null;
  for (var i = 1; i < oData.length; i++) {
    if (String(oData[i][oIdCol]).trim() === String(orderId).trim()) {
      targetOrder = {
        id: String(oData[i][oIdCol]).trim(),
        accessoriesRaw: oData[i][oAccCol]
      };
      break;
    }
  }

  if (!targetOrder) {
    return { success: false, errorType: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng với ID: ' + orderId };
  }

  var accessoriesList = [];
  try {
    if (typeof targetOrder.accessoriesRaw === 'string' && targetOrder.accessoriesRaw.trim() !== '') {
      accessoriesList = JSON.parse(targetOrder.accessoriesRaw);
    } else if (Array.isArray(targetOrder.accessoriesRaw)) {
      accessoriesList = targetOrder.accessoriesRaw;
    }
  } catch (e) {
    Logger.log('⚠️ Cảnh báo lỗi parse JSON accessories đơn ' + orderId + ': ' + e.message);
    accessoriesList = [];
  }

  var prodSheet = ss.getSheetByName('Production');
  var producedItemsMap = {};

  if (prodSheet) {
    var pData = prodSheet.getDataRange().getValues();
    if (pData.length > 1) {
      var pHeaders = pData[0];
      var pOrderIdCol = pHeaders.indexOf('orderId');
      var pNameCol = pHeaders.indexOf('name');
      var pFulfilledCol = pHeaders.indexOf('fulfilledFromStock');

      for (var p = 1; p < pData.length; p++) {
        var pRow = pData[p];
        var pOrdId = String(pRow[pOrderIdCol]).trim();
        var pName = String(pRow[pNameCol]).trim().toLowerCase();
        var isFulfilledFromStock = String(pRow[pFulfilledCol]).toUpperCase() === 'TRUE';

        if ((pOrdId === targetOrder.id || pOrdId.indexOf(targetOrder.id + '_') === 0) && !isFulfilledFromStock) {
          producedItemsMap[pName] = (producedItemsMap[pName] || 0) + 1;
        }
      }
    }
  }

  var requiredQtyMap = {};

  if (Array.isArray(accessoriesList)) {
    accessoriesList.forEach(function (item) {
      if (!item) return;
      var itemName = typeof item === 'string' ? item : (item.name || item.Name || '');
      var itemQty = typeof item === 'object' ? (Number(item.quantity || item.qty) || 1) : 1;
      var hasProdFlag = typeof item === 'object' && (item.hasProduction === true || item.hasProduction === 'true');
      var cleanName = String(itemName).trim().toLowerCase();

      if (!cleanName) return;

      if (producedItemsMap[cleanName] && producedItemsMap[cleanName] > 0) {
        var remainingAfterProd = Math.max(0, itemQty - producedItemsMap[cleanName]);
        producedItemsMap[cleanName] -= (itemQty - remainingAfterProd);
        if (remainingAfterProd > 0) {
          requiredQtyMap[cleanName] = (requiredQtyMap[cleanName] || 0) + remainingAfterProd;
        }
      } else if (!hasProdFlag) {
        requiredQtyMap[cleanName] = (requiredQtyMap[cleanName] || 0) + itemQty;
      }
    });
  }

  if (Object.keys(requiredQtyMap).length === 0) {
    return { success: true };
  }

  var productsSheet = ss.getSheetByName('Products');
  if (!productsSheet) {
    return { success: false, errorType: 'SHEET_NOT_FOUND', message: 'Không tìm thấy sheet Products' };
  }

  var prodData = productsSheet.getDataRange().getValues();
  if (prodData.length <= 1) {
    return { success: false, errorType: 'PRODUCTS_EMPTY', message: 'Sheet Products rỗng' };
  }

  var prHeaders = prodData[0];
  var prNameCol = prHeaders.indexOf('name');
  var prQtyCol = prHeaders.indexOf('quantity');
  var prMinStockCol = prHeaders.indexOf('minStock');

  if (prNameCol === -1 || prQtyCol === -1) {
    return { success: false, errorType: 'SCHEMA_ERROR', message: 'Thiếu cột name hoặc quantity trong sheet Products' };
  }

  var catalogMap = {};
  for (var k = 1; k < prodData.length; k++) {
    var rName = String(prodData[k][prNameCol]).trim();
    if (!rName) continue;

    var rQty = Number(prodData[k][prQtyCol]) || 0;
    var rMinStock = prMinStockCol !== -1 ? (Number(prodData[k][prMinStockCol]) || 0) : 0;

    catalogMap[rName.toLowerCase()] = {
      realName: rName,
      quantity: rQty,
      minStock: rMinStock
    };
  }

  var lowStockItems = [];

  Object.keys(requiredQtyMap).forEach(function (reqNameKey) {
    var neededQty = requiredQtyMap[reqNameKey];
    var productInStock = catalogMap[reqNameKey];

    if (productInStock) {
      var currentStock = productInStock.quantity;
      var minStock = productInStock.minStock;
      var afterDeductStock = currentStock - neededQty;

      if (afterDeductStock < 0 || afterDeductStock <= minStock || currentStock <= minStock) {
        lowStockItems.push(productInStock.realName + ' (Tồn: ' + currentStock + ', Cần: ' + neededQty + ', Min: ' + minStock + ')');
      }
    }
  });

  if (lowStockItems.length > 0) {
    return {
      success: false,
      errorType: 'LOW_STOCK',
      items: lowStockItems,
      message: 'Không đủ tồn kho an toàn để đóng gói đơn hàng ' + orderId
    };
  }

  return { success: true };
}

/**
 * =========================================================================
 * 💰 HÀM AUDIT DÒNG TIỀN & LỢI NHUẬN GỘP (FINANCIAL AUDIT)
 * Yêu cầu: Chạy tự động 23:00 hàng ngày
 * =========================================================================
 */
function auditMissingCashflowAndMargin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var transSheet = ss.getSheetByName('Transactions');
  if (!transSheet) {
    Logger.log('❌ Lỗi: Không tìm thấy sheet Transactions');
    return;
  }
  var tData = transSheet.getDataRange().getValues();
  var tHeaders = tData[0];
  var tTypeCol = tHeaders.indexOf('type');
  var tTitleCol = tHeaders.indexOf('title');
  var tNoteCol = tHeaders.indexOf('note');

  var allReceiptsText = "";
  for (var i = 1; i < tData.length; i++) {
    if (String(tData[i][tTypeCol]).trim() === 'Thu') {
      allReceiptsText += String(tData[i][tTitleCol] || '') + " " + String(tData[i][tNoteCol] || '') + " | ";
    }
  }

  var ordersSheet = ss.getSheetByName('Orders');
  if (!ordersSheet) return;
  var oData = ordersSheet.getDataRange().getValues();
  var oHeaders = oData[0];

  var col = {
    id: oHeaders.indexOf('id'),
    orderCode: oHeaders.indexOf('orderCode'),
    date: oHeaders.indexOf('date'),
    status: oHeaders.indexOf('status'),
    revenue: oHeaders.indexOf('revenue'),
    prePaid: oHeaders.indexOf('prePaid'),
    costTotal: oHeaders.indexOf('costTotal'),
    cogs: oHeaders.indexOf('cogs'),
    feeFixed: oHeaders.indexOf('feeFixed'),
    feeService: oHeaders.indexOf('feeService'),
    feePayment: oHeaders.indexOf('feePayment'),
    feeAffiliate: oHeaders.indexOf('feeAffiliate'),
    shopVoucher: oHeaders.indexOf('shopVoucher'),
    tax: oHeaders.indexOf('tax')
  };

  var thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  var negativeMarginOrders = [];
  var missingCodOrders = [];

  for (var r = 1; r < oData.length; r++) {
    var row = oData[r];
    var status = String(row[col.status]).toUpperCase().trim();

    if (status !== 'HOÀN THÀNH' && status !== 'ĐÃ BÀN GIAO' && status !== 'ĐỐI SOÁT THÀNH CÔNG') continue;

    var orderDate = new Date(row[col.date]);
    if (isNaN(orderDate.getTime()) || orderDate < thirtyDaysAgo) continue;

    var oId = String(row[col.id]).trim();
    var oCode = String(row[col.orderCode]).trim();
    var rev = Number(row[col.revenue]) || 0;
    var prePaid = Number(row[col.prePaid]) || 0;

    var cogs = Number(row[col.cogs]) || 0;
    var shippingFee = Number(row[col.costTotal]) || 0;
    var feeF = Number(row[col.feeFixed]) || 0;
    var feeS = Number(row[col.feeService]) || 0;
    var feeP = Number(row[col.feePayment]) || 0;
    var feeA = Number(row[col.feeAffiliate]) || 0;
    var voucher = Number(row[col.shopVoucher]) || 0;
    var tax = Number(row[col.tax]) || 0;

    var netProfit = rev - cogs - shippingFee - (feeF + feeS + feeP + feeA + voucher + tax);

    if (netProfit < 0) {
      negativeMarginOrders.push({
        id: oId,
        orderCode: oCode,
        revenue: rev,
        netProfit: netProfit,
        reason: 'Lợi nhuận gộp âm'
      });
    }

    var unpaidCod = rev - prePaid;
    if (unpaidCod > 0) {
      var isReceiptFound = allReceiptsText.indexOf(oId) > -1 || (oCode && allReceiptsText.indexOf(oCode) > -1);

      if (!isReceiptFound) {
        missingCodOrders.push({
          id: oId,
          orderCode: oCode,
          revenue: rev,
          prePaid: prePaid,
          unpaidCod: unpaidCod,
          reason: 'Chưa có phiếu Thu trong Transactions'
        });
      }
    }
  }

  if (negativeMarginOrders.length === 0 && missingCodOrders.length === 0) {
    Logger.log('✅ Audit hoàn tất. Không phát hiện rủi ro thất thoát.');
    return;
  }

  var reportData = {
    totalNegativeMargin: negativeMarginOrders.length,
    totalMissingCOD: missingCodOrders.length,
    negativeMarginOrders: negativeMarginOrders,
    missingCodOrders: missingCodOrders
  };

  var trackSheet = ss.getSheetByName('Tracking_Log');
  if (trackSheet) {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(15000);

      var newRow = [];
      var trackHeaders = trackSheet.getDataRange().getValues()[0];

      trackHeaders.forEach(function (header) {
        if (header === 'Thời gian') newRow.push(new Date());
        else if (header === 'Tên nhân sự') newRow.push('HỆ THỐNG KIỂM TOÁN TỰ ĐỘNG');
        else if (header === 'Hoàn thành') newRow.push(false);
        else if (header === 'Hỏi AI') newRow.push('Cảnh báo rủi ro tài chính & thất thoát dòng tiền (Audit)');
        else if (header === 'Ghi chú thêm') newRow.push(JSON.stringify(reportData, null, 2));
        else newRow.push('');
      });

      trackSheet.appendRow(newRow);
      SpreadsheetApp.flush();
    } catch (e) {
      Logger.log('❌ Lỗi ghi Tracking_Log: ' + e.message);
    } finally {
      lock.releaseLock();
    }
  }

  Logger.log('⚠️ Phát hiện rủi ro. Đã ghi log cảnh báo vào Tracking_Log');
}

function setupAuditTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'auditMissingCashflowAndMargin') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('auditMissingCashflowAndMargin')
    .timeBased()
    .everyDays(1)
    .atHour(23)
    .create();

  Logger.log('✅ Đã thiết lập CronJob auditMissingCashflowAndMargin thành công lúc 23:00 hàng ngày.');
}

/**
 * =========================================================================
 * ⏱️ HÀM ĐÁNH GIÁ HIỆU SUẤT & THỜI GIAN LÀM VIỆC THỰC TẾ CỦA THỢ
 * =========================================================================
 */
function calculateRealWorkingHours(dateStr) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var targetDate = '';
  if (dateStr && typeof dateStr === 'string' && dateStr.trim() !== '') {
    targetDate = dateStr.trim().slice(0, 10);
  } else {
    targetDate = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
  }

  var attendanceMap = {};
  var workerActiveHours = {};
  var ghostWorkers = [];

  function getHoursDiff(start, end) {
    if (!start || !end || isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) return 0;
    var s = new Date(start).getTime();
    var e = new Date(end).getTime();
    if (e <= s) return 0;
    return (e - s) / (1000 * 60 * 60);
  }

  function getDateString(d) {
    if (!d || isNaN(new Date(d).getTime())) return '';
    return Utilities.formatDate(new Date(d), "Asia/Ho_Chi_Minh", "yyyy-MM-dd");
  }

  var attSheet = ss.getSheetByName('Attendance');
  if (attSheet) {
    var attData = attSheet.getDataRange().getValues();
    var attHeaders = attData[0];
    var aUserCol = attHeaders.indexOf('user');
    var aDateCol = attHeaders.indexOf('date');
    var aTimeInCol = attHeaders.indexOf('timeIn');
    var aTimeOutCol = attHeaders.indexOf('timeOut');
    var aTotalHrsCol = attHeaders.indexOf('totalHours');

    for (var i = 1; i < attData.length; i++) {
      var rDate = getDateString(attData[i][aDateCol]);
      if (rDate === targetDate) {
        var user = String(attData[i][aUserCol] || '').trim();
        if (user) {
          attendanceMap[user] = {
            timeIn: attData[i][aTimeInCol],
            timeOut: attData[i][aTimeOutCol],
            totalHours: Number(attData[i][aTotalHrsCol]) || 0
          };
          workerActiveHours[user] = 0;
        }
      }
    }
  }

  var prodSheet = ss.getSheetByName('Production');
  if (prodSheet) {
    var pData = prodSheet.getDataRange().getValues();
    var pHeaders = pData[0];

    var col = {
      p1User: pHeaders.indexOf('p1_user'),
      p1Status: pHeaders.indexOf('p1_status'),
      p1Start: pHeaders.indexOf('p1_start'),
      p1End: pHeaders.indexOf('p1_endTime'),
      p2User: pHeaders.indexOf('p2_user'),
      p2Status: pHeaders.indexOf('p2_status'),
      p2Start: pHeaders.indexOf('p2_start'),
      p2End: pHeaders.indexOf('p2_endTime')
    };

    for (var r = 1; r < pData.length; r++) {
      var row = pData[r];

      var p1User = String(row[col.p1User] || '').trim();
      var p1Stat = String(row[col.p1Status] || '').toUpperCase().trim();
      if (p1User && getDateString(row[col.p1End]) === targetDate) {
        var attP1 = attendanceMap[p1User];
        if (p1Stat === 'DONE' && (!attP1 || !attP1.timeIn || String(attP1.timeIn).trim() === '')) {
          if (ghostWorkers.indexOf(p1User) === -1) ghostWorkers.push(p1User);
        }
        workerActiveHours[p1User] = (workerActiveHours[p1User] || 0) + getHoursDiff(row[col.p1Start], row[col.p1End]);
      }

      var p2User = String(row[col.p2User] || '').trim();
      var p2Stat = String(row[col.p2Status] || '').toUpperCase().trim();
      if (p2User && getDateString(row[col.p2End]) === targetDate) {
        workerActiveHours[p2User] = (workerActiveHours[p2User] || 0) + getHoursDiff(row[col.p2Start], row[col.p2End]);
      }
    }
  }

  var packSheet = ss.getSheetByName('Packings');
  if (packSheet) {
    var pkData = packSheet.getDataRange().getValues();
    var pkHeaders = pkData[0];

    var pkUserCol = pkHeaders.indexOf('user');
    var pkStartCol = pkHeaders.indexOf('start');
    var pkEndCol = pkHeaders.indexOf('endTime');

    for (var k = 1; k < pkData.length; k++) {
      var pkUser = String(pkData[k][pkUserCol] || '').trim();
      if (pkUser && getDateString(pkData[k][pkEndCol]) === targetDate) {
        workerActiveHours[pkUser] = (workerActiveHours[pkUser] || 0) + getHoursDiff(pkData[k][pkStartCol], pkData[k][pkEndCol]);
      }
    }
  }

  var idleStats = [];

  Object.keys(attendanceMap).forEach(function (user) {
    var totalHrs = attendanceMap[user].totalHours;
    var activeHrs = workerActiveHours[user] || 0;

    var idleTime = totalHrs - activeHrs;
    if (idleTime < 0) idleTime = 0;

    var isLazyFlag = false;
    if (totalHrs > 0) {
      if ((idleTime / totalHrs) > 0.4) {
        isLazyFlag = true;
      }
    }

    idleStats.push({
      user: user,
      totalHours: Number(totalHrs.toFixed(2)),
      activeHours: Number(activeHrs.toFixed(2)),
      idleTime: Number(idleTime.toFixed(2)),
      isLazy: isLazyFlag
    });
  });

  idleStats.sort(function (a, b) {
    return b.idleTime - a.idleTime;
  });

  var resultObj = {
    ghostWorkers: ghostWorkers,
    idleStats: idleStats
  };

  Logger.log('📊 [ĐÁNH GIÁ HIỆU SUẤT NGÀY ' + targetDate + ']:\n' + JSON.stringify(resultObj, null, 2));
  return resultObj;
}

/**
 * =========================================================================
 * 💥 HÀM XỬ LÝ KHỦNG HOẢNG HÀNG VỠ/HỎNG (DAMAGE CONTROL)
 * Trigger từ giao diện khi QC hoặc thợ báo cáo vỡ hàng.
 * =========================================================================
 */
function processDamageControl(prodId, faultReason, penaltyUser) {
  if (!prodId) return { success: false, message: 'Thiếu Production ID' };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(15000);

    var prodSheet = ss.getSheetByName('Production');
    var productsSheet = ss.getSheetByName('Products');
    var ieSheet = ss.getSheetByName('ImportExport');
    var bpSheet = ss.getSheetByName('BonusPenalty');

    if (!prodSheet || !productsSheet || !ieSheet || !bpSheet) {
      return { success: false, message: 'Lỗi cấu trúc: Không tìm thấy một trong các sheet cần thiết.' };
    }

    var pData = prodSheet.getDataRange().getValues();
    var pHeaders = pData[0];
    var pIdCol = pHeaders.indexOf('id');
    var pOrderIdCol = pHeaders.indexOf('orderId');
    var pNameCol = pHeaders.indexOf('name');
    var pStatusCol = pHeaders.indexOf('status');

    var targetProdRowIndex = -1;
    var targetName = '';
    var targetOrderId = '';

    for (var i = 1; i < pData.length; i++) {
      if (String(pData[i][pIdCol]).trim() === String(prodId).trim()) {
        targetProdRowIndex = i + 1;
        targetName = String(pData[i][pNameCol]).trim();
        targetOrderId = String(pData[i][pOrderIdCol]).trim();
        break;
      }
    }

    if (targetProdRowIndex === -1) {
      return { success: false, message: 'Không tìm thấy lệnh sản xuất ID: ' + prodId };
    }

    var prData = productsSheet.getDataRange().getValues();
    var prHeaders = prData[0];
    var prNameCol = prHeaders.indexOf('name');
    var prCostCol = prHeaders.indexOf('costPrice');
    var prQtyCol = prHeaders.indexOf('quantity');
    var prSkuCol = prHeaders.indexOf('sku');

    var targetProductsRowIndex = -1;
    var costPrice = 0;
    var currentQty = 0;
    var skuStr = '';

    if (targetName) {
      for (var j = 1; j < prData.length; j++) {
        if (String(prData[j][prNameCol]).trim().toLowerCase() === targetName.toLowerCase()) {
          targetProductsRowIndex = j + 1;
          costPrice = Number(prData[j][prCostCol]) || 0;
          currentQty = Number(prData[j][prQtyCol]) || 0;
          skuStr = String(prData[j][prSkuCol] || '');
          break;
        }
      }
    }

    if (targetProductsRowIndex !== -1) {
      var newQty = currentQty - 1;
      productsSheet.getRange(targetProductsRowIndex, prQtyCol + 1).setValue(newQty);
    }

    var today = new Date();
    var newIeId = 'IE_' + Utilities.getUuid().slice(0, 8).toUpperCase();
    var itemJson = JSON.stringify([{
      name: targetName,
      sku: skuStr,
      qty: 1,
      price: costPrice
    }]);

    var ieHeaders = ieSheet.getDataRange().getValues()[0];
    var ieNewRow = [];
    ieHeaders.forEach(function (header) {
      if (header === 'id') ieNewRow.push(newIeId);
      else if (header === 'type') ieNewRow.push('Xuất');
      else if (header === 'target') ieNewRow.push('Hủy Hàng');
      else if (header === 'totalAmount') ieNewRow.push(0);
      else if (header === 'date') ieNewRow.push(today);
      else if (header === 'note') ieNewRow.push('Xuất hủy vỡ do ' + (faultReason || 'Lỗi KCS'));
      else if (header === 'itemsData') ieNewRow.push(itemJson);
      else ieNewRow.push('');
    });
    ieSheet.appendRow(ieNewRow);

    if (penaltyUser) {
      var newBpId = 'BP_' + Utilities.getUuid().slice(0, 8).toUpperCase();
      var bpHeaders = bpSheet.getDataRange().getValues()[0];
      var bpNewRow = [];
      bpHeaders.forEach(function (header) {
        if (header === 'id') bpNewRow.push(newBpId);
        else if (header === 'user') bpNewRow.push(penaltyUser);
        else if (header === 'amount') bpNewRow.push(-costPrice);
        else if (header === 'type') bpNewRow.push('Phạt Vi Phạm');
        else if (header === 'note') bpNewRow.push('Đền bù hàng vỡ/hỏng: ' + targetName);
        else if (header === 'date') bpNewRow.push(today);
        else if (header === 'orderCode') bpNewRow.push(targetOrderId);
        else bpNewRow.push('');
      });
      bpSheet.appendRow(bpNewRow);
    }

    prodSheet.getRange(targetProdRowIndex, pStatusCol + 1).setValue('Hủy/Vỡ');

    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Đã xử lý hủy hỏng: Trừ kho ' + targetName + ', tạo phiếu xuất và ghi phạt đền bù ' + penaltyUser
    };

  } catch (err) {
    Logger.log('❌ Lỗi processDamageControl: ' + err.toString());
    return { success: false, message: 'Lỗi hệ thống: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * 🏦 HÀM TỰ ĐỘNG CẤN TRỪ CÔNG NỢ NHÀ CUNG CẤP (SUPPLIER RECONCILIATION)
 * =========================================================================
 * @param {string} txId - ID của giao dịch chi tiền trong Transactions.
 * @param {Array<string>} importIdsArray - Mảng chứa các ID phiếu nhập (ImportExport).
 * @param {string} supplierName - Tên nhà cung cấp.
 * @return {Object} { success, message }
 */
function autoReconcileSupplierDebt(txId, importIdsArray, supplierName) {
  if (!txId || !importIdsArray || importIdsArray.length === 0 || !supplierName) {
    return { success: false, message: 'Thiếu dữ liệu đầu vào để đối soát.' };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(15000);

    var transSheet = ss.getSheetByName('Transactions');
    var ieSheet = ss.getSheetByName('ImportExport');
    var supSheet = ss.getSheetByName('Suppliers');

    if (!transSheet || !ieSheet || !supSheet) {
      return { success: false, message: 'Lỗi cấu trúc: Không tìm thấy sheet Transactions, ImportExport hoặc Suppliers.' };
    }

    // 1. KIỂM TRA TRANSACTIONS
    var tData = transSheet.getDataRange().getValues();
    var tHeaders = tData[0];
    var tIdCol = tHeaders.indexOf('id');
    var tAmountCol = tHeaders.indexOf('amount');
    var tNoteCol = tHeaders.indexOf('note');

    var txRowIndex = -1;
    var txNoteVal = '';

    for (var i = 1; i < tData.length; i++) {
      if (String(tData[i][tIdCol]).trim() === String(txId).trim()) {
        txRowIndex = i + 1;
        txNoteVal = String(tData[i][tNoteCol] || '');
        break;
      }
    }

    if (txRowIndex === -1) {
      return { success: false, message: 'Không tìm thấy mã giao dịch: ' + txId };
    }

    // 2. TÍNH TỔNG NỢ & CẬP NHẬT PHIẾU NHẬP (IMPORT/EXPORT)
    var ieData = ieSheet.getDataRange().getValues();
    var ieHeaders = ieData[0];
    var ieIdCol = ieHeaders.indexOf('id');
    var ieTypeCol = ieHeaders.indexOf('type');
    var ieTotalCol = ieHeaders.indexOf('totalAmount');
    var ieStatusCol = ieHeaders.indexOf('isPaid');
    var iePaidAtCol = ieHeaders.indexOf('paidAt');

    var totalImportAmount = 0;
    var matchedImportIds = 0;

    for (var j = 1; j < ieData.length; j++) {
      var rowId = String(ieData[j][ieIdCol]).trim();
      var rowType = String(ieData[j][ieTypeCol]).trim();

      if (rowType === 'Nhập' && importIdsArray.indexOf(rowId) !== -1) {
        totalImportAmount += (Number(ieData[j][ieTotalCol]) || 0);
        matchedImportIds++;

        if (ieStatusCol !== -1) ieSheet.getRange(j + 1, ieStatusCol + 1).setValue(true);
        if (iePaidAtCol !== -1) ieSheet.getRange(j + 1, iePaidAtCol + 1).setValue(new Date());
      }
    }

    if (matchedImportIds === 0) {
      return { success: false, message: 'Không tìm thấy phiếu nhập kho nào hợp lệ để đối soát.' };
    }

    var newTxNote = txNoteVal ? (txNoteVal + ' | [Đã đối soát công nợ: ' + supplierName + ']') : '[Đã đối soát công nợ: ' + supplierName + ']';
    transSheet.getRange(txRowIndex, tNoteCol + 1).setValue(newTxNote);

    // 4. TRỪ CÔNG NỢ NHÀ CUNG CẤP (SUPPLIERS)
    var sData = supSheet.getDataRange().getValues();
    var sHeaders = sData[0];
    var sNameCol = sHeaders.indexOf('name');
    var sDebtCol = sHeaders.indexOf('totalDebt');

    var supRowIndex = -1;
    var currentDebt = 0;

    for (var k = 1; k < sData.length; k++) {
      if (String(sData[k][sNameCol]).trim() === String(supplierName).trim()) {
        supRowIndex = k + 1;
        currentDebt = Number(sData[k][sDebtCol]) || 0;
        break;
      }
    }

    if (supRowIndex !== -1 && sDebtCol !== -1) {
      var newDebt = currentDebt - totalImportAmount;
      supSheet.getRange(supRowIndex, sDebtCol + 1).setValue(newDebt);
    }

    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Đã đối soát thành công. Tổng nợ giảm: ' + totalImportAmount + 'đ cho ' + supplierName
    };

  } catch (err) {
    Logger.log('❌ Lỗi autoReconcileSupplierDebt: ' + err.toString());
    return { success: false, message: 'Lỗi hệ thống: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * 🚑 HÀM KHÔI PHỤC DỮ LIỆU BẢNG PRODUCTION BỊ MẤT/XOÁ
 * =========================================================================
 */
function recoverLostProduction() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    Logger.log('Hệ thống đang bận. Thử lại sau!');
    try { SpreadsheetApp.getUi().alert('Hệ thống đang bận. Thử lại sau!'); } catch (errUi) { }
    return;
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var pSheet = ss.getSheetByName('Production');
    if (!pSheet) return;

    var pData = pSheet.getDataRange().getValues();
    var pHeaders = pData[0];
    var pIdCol = pHeaders.indexOf('id');

    var activeMap = {};
    for (var j = 1; j < pData.length; j++) {
      var pId = String(pData[j][pIdCol]).trim();
      if (pId) activeMap[pId] = j;
    }

    var backupId = '1Fpbv32kw-EqJGeGOwNv6lPWtlfhGvCIkjlbyFskpU8E';
    var backupSs = SpreadsheetApp.openById(backupId);
    var bSheet = backupSs.getSheetByName('Production');
    if (!bSheet) {
      Logger.log('File Backup không có sheet Production!');
      try { SpreadsheetApp.getUi().alert('File Backup không có sheet Production!'); } catch (errUi) { }
      return;
    }

    var bData = bSheet.getDataRange().getValues();
    var bHeaders = bData[0];
    var bIdCol = bHeaders.indexOf('id');

    var restoredCount = 0;
    var appendedCount = 0;
    var newRowsToAppend = [];

    for (var i = 1; i < bData.length; i++) {
      var bId = String(bData[i][bIdCol]).trim();
      if (!bId) continue;

      if (activeMap[bId] !== undefined) {
        var activeRowIdx = activeMap[bId];
        var isModified = false;

        for (var col = 0; col < pHeaders.length; col++) {
          var headerName = pHeaders[col];
          var bColIdx = bHeaders.indexOf(headerName);
          if (bColIdx !== -1) {
            var activeVal = String(pData[activeRowIdx][col] || '').trim();
            var backupVal = String(bData[i][bColIdx] || '').trim();

            if (activeVal === '' && backupVal !== '') {
              pData[activeRowIdx][col] = bData[i][bColIdx];
              isModified = true;
            }
          }
        }
        if (isModified) restoredCount++;
      } else {
        var newRow = [];
        for (var col = 0; col < pHeaders.length; col++) {
          var headerName = pHeaders[col];
          var bColIdx = bHeaders.indexOf(headerName);
          if (bColIdx !== -1) {
            newRow.push(bData[i][bColIdx]);
          } else {
            newRow.push('');
          }
        }
        newRowsToAppend.push(newRow);
        appendedCount++;
      }
    }

    if (restoredCount > 0) {
      pSheet.getRange(1, 1, pData.length, pHeaders.length).setValues(pData);
    }
    if (newRowsToAppend.length > 0) {
      pSheet.getRange(pSheet.getLastRow() + 1, 1, newRowsToAppend.length, pHeaders.length).setValues(newRowsToAppend);
    }

    var msg = '✅ Đã khôi phục thành công Production!\n- Lấp đầy dữ liệu bị trống cho: ' + restoredCount + ' lệnh.\n- Khôi phục (chèn thêm) các lệnh bị xoá mất: ' + appendedCount + ' lệnh.';
    Logger.log(msg);
    try { SpreadsheetApp.getUi().alert(msg); } catch (errUi) { }

  } catch (err) {
    Logger.log('Lỗi khôi phục: ' + err.message);
    try { SpreadsheetApp.getUi().alert('Lỗi khôi phục: ' + err.message); } catch (errUi) { }
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * 🏷️ HÀM TỰ ĐỘNG TÍNH & CẬP NHẬT GIÁ BÁN CHO HÀNG HOÁ LAYOUT
 * =========================================================================
 */
function updateSellingPriceForSpecificSizes() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    try {
      SpreadsheetApp.getUi().alert("⚠️ Hệ thống đang bận xử lý dữ liệu khác, vui lòng thử lại sau vài giây.");
    } catch (uiErr) {
      Logger.log("⚠️ Hệ thống đang bận: " + e.message);
    }
    return;
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "Products";
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      var notFoundMsg = "❌ Lỗi: Không tìm thấy sheet '" + sheetName + "'.";
      Logger.log(notFoundMsg);
      try { SpreadsheetApp.getUi().alert(notFoundMsg); } catch (uiErr) {}
      return;
    }
    
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    if (values.length < 2) {
      var emptyMsg = "⚠️ Bảng 'Products' chưa có dữ liệu để tính toán.";
      Logger.log(emptyMsg);
      try { SpreadsheetApp.getUi().alert(emptyMsg); } catch (uiErr) {}
      return;
    }
    
    var headers = values[0].map(function(h) { return h.toString().trim(); });
    var nameColIdx = headers.indexOf("name");
    var costPriceColIdx = headers.indexOf("costPrice");
    var priceColIdx = headers.indexOf("price");
    var categoryColIdx = headers.indexOf("category");
    var subCategoryColIdx = headers.indexOf("sub_category");
    
    if (nameColIdx === -1 || costPriceColIdx === -1 || priceColIdx === -1) {
      var schemaErrMsg = "❌ Lỗi: Thiếu cột bắt buộc trong sheet Products!\n" +
        "- 'name' (tìm thấy: " + (nameColIdx !== -1) + ")\n" +
        "- 'costPrice' (tìm thấy: " + (costPriceColIdx !== -1) + ")\n" +
        "- 'price' (tìm thấy: " + (priceColIdx !== -1) + ")";
      Logger.log(schemaErrMsg);
      try { SpreadsheetApp.getUi().alert(schemaErrMsg); } catch (uiErr) {}
      return;
    }
    
    // Danh sách kích thước không áp dụng nhân giá tự động (chuẩn hóa không dấu, viết liền)
    var excludedSizePatterns = ["20x20x20", "30x20x20", "40x23x25"];
    var marginMultiplier = 1.5; 
    
    var updateCount = 0;
    var skippedExcludedCount = 0;
    var skippedNotLayoutCount = 0;
    var skippedNoCostCount = 0;
    
    for (var i = 1; i < values.length; i++) {
      var productName = values[i][nameColIdx] ? values[i][nameColIdx].toString() : "";
      var category = (categoryColIdx !== -1 && values[i][categoryColIdx]) ? values[i][categoryColIdx].toString() : "";
      var subCategory = (subCategoryColIdx !== -1 && values[i][subCategoryColIdx]) ? values[i][subCategoryColIdx].toString() : "";
      var rawCostPrice = values[i][costPriceColIdx];
      var costPrice = Number(rawCostPrice);
      
      var normName = productName.toUpperCase();
      var normCat = category.toUpperCase();
      var normSubCat = subCategory.toUpperCase();
      
      // 1. Kiểm tra có phải hàng hoá LAYOUT không
      var isLayout = normCat.indexOf("LAYOUT") > -1 || 
                     normSubCat.indexOf("LAYOUT") > -1 || 
                     normName.indexOf("LAYOUT") > -1;
      
      // 2. Kiểm tra có phải là Bể Kính hoặc Phụ Kiện không (nếu là bể kính/phụ kiện thì TUYỆT ĐỐI không sửa)
      var isTank = normCat.indexOf("BỂ KÍNH") > -1 || normCat.indexOf("BE KINH") > -1 || 
                   normSubCat.indexOf("BỂ KÍNH") > -1 || normSubCat.indexOf("BE KINH") > -1 ||
                   (normName.indexOf("BỂ KÍNH") > -1 && normCat.indexOf("LAYOUT") === -1) ||
                   (normName.indexOf("BE KINH") > -1 && normCat.indexOf("LAYOUT") === -1);
                   
      var isAccessory = normCat.indexOf("PHỤ KIỆN") > -1 || normCat.indexOf("PHU KIEN") > -1 ||
                        normCat.indexOf("ĐÈN") > -1 || normCat.indexOf("LỌC") > -1 || normCat.indexOf("VẬT LIỆU") > -1 ||
                        normSubCat.indexOf("PHỤ KIỆN") > -1 || normSubCat.indexOf("PHU KIEN") > -1;
      
      if (!isLayout || isTank || isAccessory) {
        skippedNotLayoutCount++;
        continue;
      }
      
      // 3. Kiểm tra xem tên sản phẩm có chứa kích thước nằm trong danh sách đen không
      var cleanNameNoSpace = productName.toLowerCase().replace(/\s+/g, "");
      var isExcludedSize = excludedSizePatterns.some(function(pattern) {
        return cleanNameNoSpace.indexOf(pattern) > -1;
      });
      
      if (isExcludedSize) {
        skippedExcludedCount++;
        continue;
      }
      
      // 4. Nếu có giá vốn hợp lệ > 0 thì cập nhật giá bán
      if (!isNaN(costPrice) && costPrice > 0) {
        var calculatedPrice = costPrice * marginMultiplier;
        var finalSellingPrice = Math.round(calculatedPrice / 1000) * 1000;
        values[i][priceColIdx] = finalSellingPrice;
        updateCount++;
      } else {
        skippedNoCostCount++;
      }
    }
    
    // 5. Ghi dữ liệu xuống Google Sheet
    if (updateCount > 0) {
      dataRange.setValues(values);
      var finishMsg = "✅ HOÀN TẤT CẬP NHẬT GIÁ BÁN LAYOUT!\n\n" +
        "• Đã cập nhật giá bán cho: " + updateCount + " sản phẩm LAYOUT.\n" +
        "• Bỏ qua (kích thước loại trừ 20x20x20, 30x20x20, 40x23x25): " + skippedExcludedCount + " sản phẩm.\n" +
        "• Bỏ qua (bể kính / phụ kiện / không phải layout): " + skippedNotLayoutCount + " sản phẩm.\n" +
        "• Bỏ qua (chưa có giá vốn/giá vốn = 0): " + skippedNoCostCount + " sản phẩm.";
      Logger.log(finishMsg);
      try { SpreadsheetApp.getUi().alert(finishMsg); } catch (uiErr) {}
    } else {
      var noMatchMsg = "⚠️ Không có sản phẩm LAYOUT nào thỏa mãn điều kiện để cập nhật giá.";
      Logger.log(noMatchMsg);
      try { SpreadsheetApp.getUi().alert(noMatchMsg); } catch (uiErr) {}
    }
    
  } catch (err) {
    var errMsg = "❌ Có lỗi xảy ra trong quá trình cập nhật: " + err.message;
    Logger.log(errMsg);
    try { SpreadsheetApp.getUi().alert(errMsg); } catch (uiErr) {}
  } finally {
    lock.releaseLock();
  }
}

/**
 * API CẬP NHẬT TRẠNG THÁI NGHỈ PHÉP / CHẤM CÔNG VÀ ĐỒNG BỘ PHẠT
 */
function api_updateLeaveStatus(attendanceId, newStatus, penaltyAmount, note, pin) {
  if (!pin) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để duyệt đơn nghỉ phép!' };
  var auth = validatePin(pin);
  if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  if (!checkServerPermission(auth, 'HR_EDIT_ATTENDANCE')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Quản Lý Nhân Sự hoặc Tối Cao mới có quyền duyệt đơn nghỉ phép!' };
  }
  var lock = LockService.getScriptLock();
  try {
    if (!lock.waitLock(15000)) return { success: false, message: 'Hệ thống bận.' };
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var attSheet = ss.getSheetByName('Attendance');
    var bpSheet = ss.getSheetByName('BonusPenalty');
    if (!attSheet) return { success: false, message: 'Không tìm thấy sheet Attendance.' };

    var attData = attSheet.getDataRange().getValues();
    var headers = attData[0];
    var idIdx = headers.indexOf('id');
    var userIdx = headers.indexOf('user');
    var dateIdx = headers.indexOf('date');
    var statusIdx = headers.indexOf('status');
    var penaltyIdx = headers.indexOf('penalty');
    var isEditedIdx = headers.indexOf('isEdited');
    var noteIdx = headers.indexOf('note');
    var leaveTypeIdx = headers.indexOf('leaveType');

    var targetRow = -1;
    var targetUser = '';
    var targetDate = '';

    for (var i = 1; i < attData.length; i++) {
      if (String(attData[i][idIdx]).trim() === String(attendanceId).trim()) {
        targetRow = i + 1;
        targetUser = String(attData[i][userIdx]).trim();
        targetDate = String(attData[i][dateIdx]).trim();
        break;
      }
    }

    if (targetRow === -1) {
      return { success: false, message: 'Không tìm thấy bản ghi chấm công.' };
    }

    var lType = newStatus.includes('có phép') ? 'Có phép' : (newStatus.includes('không phép') ? 'Không phép' : '');
    var penVal = Number(penaltyAmount) || 0;

    if (statusIdx > -1) attSheet.getRange(targetRow, statusIdx + 1).setValue(newStatus);
    if (penaltyIdx > -1) attSheet.getRange(targetRow, penaltyIdx + 1).setValue(penVal);
    if (isEditedIdx > -1) attSheet.getRange(targetRow, isEditedIdx + 1).setValue(true);
    if (leaveTypeIdx > -1) attSheet.getRange(targetRow, leaveTypeIdx + 1).setValue(lType);
    if (noteIdx > -1 && note !== undefined) attSheet.getRange(targetRow, noteIdx + 1).setValue(note);

    // Đồng bộ vào BonusPenalty nếu có phạt
    if (bpSheet) {
      var bpData = bpSheet.getDataRange().getValues();
      var bpH = bpData[0];
      var bpUserIdx = bpH.indexOf('user');
      var bpDateIdx = bpH.indexOf('date');
      var bpTypeIdx = bpH.indexOf('type');
      var bpAmtIdx = bpH.indexOf('amount');
      var bpNoteIdx = bpH.indexOf('note');

      var existingBpRow = -1;
      for (var b = 1; b < bpData.length; b++) {
        var bRow = bpData[b];
        if (
          String(bRow[bpUserIdx]).trim() === targetUser &&
          String(bRow[bpDateIdx]).trim().startsWith(targetDate.substring(0, 10)) &&
          String(bRow[bpTypeIdx]).includes('Phạt')
        ) {
          existingBpRow = b + 1;
          break;
        }
      }

      if (penVal > 0) {
        if (existingBpRow > -1) {
          if (bpAmtIdx > -1) bpSheet.getRange(existingBpRow, bpAmtIdx + 1).setValue(-Math.abs(penVal));
          if (bpNoteIdx > -1) bpSheet.getRange(existingBpRow, bpNoteIdx + 1).setValue(note || ('Phạt vi phạm ngày ' + targetDate));
        } else {
          var newBpId = 'BP_PEN_' + Date.now();
          bpSheet.appendRow([newBpId, targetUser, -Math.abs(penVal), 'Phạt Quy Định', note || ('Phạt vi phạm ngày ' + targetDate), targetDate, '']);
        }
      } else if (existingBpRow > -1 && penVal === 0) {
        bpSheet.deleteRow(existingBpRow);
      }
    }

    return { success: true, message: 'Đã cập nhật trạng thái lịch nghỉ thành công!' };
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * API TẶNG XU CHO TOÀN BỘ NHÂN VIÊN (LƯU VÀO BẢNG THỐNG KÊ TÍCH LŨY XU)
 * =========================================================================
 */
function api_giftXuToAllStaff(payload, pin) {
  var pinToAuth = pin || (payload && payload.pin);
  if (!pinToAuth) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để thực hiện thao tác!' };
  var auth = validatePin(pinToAuth);
  if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  if (!checkServerPermission(auth, 'HR_CONFIG_STAFF')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Boss Tối Cao mới có quyền tặng Xu toàn bộ nhân viên!' };
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var hrSheet = ss.getSheetByName('Config_NhanSu');
    if (!hrSheet) return { success: false, message: 'Không tìm thấy bảng Config_NhanSu!' };

    var hrData = hrSheet.getDataRange().getValues();
    if (hrData.length <= 1) return { success: false, message: 'Không có nhân sự nào trong Config_NhanSu!' };

    var headers = hrData[0];
    var nameIdx = headers.indexOf('Tên Nhân Sự');
    if (nameIdx === -1) nameIdx = 0;

    var users = [];
    for (var i = 1; i < hrData.length; i++) {
      var uName = String(hrData[i][nameIdx] || '').trim();
      if (uName && users.indexOf(uName) === -1) {
        users.push(uName);
      }
    }

    var xuSheet = ss.getSheetByName('ThongKe_TichLuyXu');
    if (!xuSheet) {
      xuSheet = ss.insertSheet('ThongKe_TichLuyXu');
      xuSheet.appendRow(SCHEMA_ERP.ThongKe_TichLuyXu || ['id', 'user', 'type', 'amount_xu', 'date', 'orderCode', 'note', 'timestamp']);
      xuSheet.setFrozenRows(1);
      xuSheet.getRange(1, 1, 1, 8).setBackground('#78350f').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
    }

    var giftAmount = Number(payload && (payload.amount_xu || payload.amount)) || 50000;
    var giftNote = (payload && payload.note) || 'Boss tặng xu khai ví lấy động lực';
    var now = new Date();
    var timestamp = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");
    var dateStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd");

    var rowsToAppend = [];
    users.forEach(function (u, idx) {
      var id = 'XU_GIFT_' + now.getTime() + '_' + (idx + 1);
      // Schema ThongKe_TichLuyXu: id, user, type, amount_xu, date, orderCode, note, timestamp
      rowsToAppend.push([id, u, 'XU_REWARD', giftAmount, dateStr, '', giftNote, timestamp]);
    });

    if (rowsToAppend.length > 0) {
      xuSheet.getRange(xuSheet.getLastRow() + 1, 1, rowsToAppend.length, 8).setValues(rowsToAppend);
      SpreadsheetApp.flush();
    }

    return { success: true, count: users.length, message: 'Đã tặng ' + giftAmount.toLocaleString('vi-VN') + ' Xu vào bảng ThongKe_TichLuyXu cho ' + users.length + ' nhân sự thành công!' };
  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * API DI DỜI DỮ LIỆU XU TỪ BẢNG BONUSPENALTY SANG BẢNG THỐNG KÊ TÍCH LŨY XU
 * =========================================================================
 */
function api_migrateXuFromBonusPenaltyToThongKeTichLuyXu(pin) {
  if (!pin) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để thực hiện thao tác!' };
  var auth = validatePin(pin);
  if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  if (!checkServerPermission(auth, 'HR_CONFIG_STAFF')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Boss Tối Cao mới có quyền di dời dữ liệu Xu!' };
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var bpSheet = ss.getSheetByName('BonusPenalty');
    if (!bpSheet) return { success: false, message: 'Không tìm thấy sheet BonusPenalty' };

    var xuSheet = ss.getSheetByName('ThongKe_TichLuyXu');
    if (!xuSheet) {
      xuSheet = ss.insertSheet('ThongKe_TichLuyXu');
      xuSheet.appendRow(SCHEMA_ERP.ThongKe_TichLuyXu || ['id', 'user', 'type', 'amount_xu', 'date', 'orderCode', 'note', 'timestamp']);
      xuSheet.setFrozenRows(1);
      xuSheet.getRange(1, 1, 1, 8).setBackground('#78350f').setFontColor('#ffffff').setFontWeight('bold').setHorizontalAlignment('center');
    }

    var bpData = bpSheet.getDataRange().getValues();
    if (bpData.length <= 1) return { success: true, message: 'BonusPenalty không có dữ liệu' };

    var headers = bpData[0];
    var idIdx = headers.indexOf('id');
    var userIdx = headers.indexOf('user');
    var amountIdx = headers.indexOf('amount');
    var typeIdx = headers.indexOf('type');
    var noteIdx = headers.indexOf('note');
    var dateIdx = headers.indexOf('date');
    var orderCodeIdx = headers.indexOf('orderCode');
    if (idIdx === -1) idIdx = 0;
    if (userIdx === -1) userIdx = 1;
    if (amountIdx === -1) amountIdx = 2;
    if (typeIdx === -1) typeIdx = 3;
    if (noteIdx === -1) noteIdx = 4;
    if (dateIdx === -1) dateIdx = 5;
    if (orderCodeIdx === -1) orderCodeIdx = 6;

    // Đọc danh sách ID hiện có trong ThongKe_TichLuyXu để chống trùng lặp
    var xuData = xuSheet.getDataRange().getValues();
    var existingXuIds = {};
    for (var x = 1; x < xuData.length; x++) {
      var exId = String(xuData[x][0] || '').trim();
      if (exId) existingXuIds[exId] = true;
    }

    var rowsToAppendToXu = [];
    var bpRowsToDelete = [];

    for (var i = 1; i < bpData.length; i++) {
      var row = bpData[i];
      var rowId = String(row[idIdx] || '').trim();
      var rowUser = String(row[userIdx] || '').trim();
      var rowAmount = Number(row[amountIdx]) || 0;
      var rowType = String(row[typeIdx] || '').trim();
      var rowNote = String(row[noteIdx] || '').trim();
      var rowDate = String(row[dateIdx] || '').trim();
      var rowOrderCode = String(row[orderCodeIdx] || '').trim();

      var isXuRecord = rowType === 'XU_REWARD' || 
                       rowId.indexOf('BP_XU_') === 0 || 
                       rowNote.indexOf('Boss tặng xu') > -1 || 
                       rowNote.indexOf('tặng xu khai ví') > -1 ||
                       rowNote.toLowerCase().indexOf('thưởng xu') > -1;

      if (isXuRecord) {
        bpRowsToDelete.push(i + 1); // 1-based index

        var xuId = rowId.replace(/^BP_XU_/, 'XU_').replace(/^BP_/, 'XU_');
        if (xuId.indexOf('XU_') !== 0) xuId = 'XU_' + xuId;

        if (!existingXuIds[xuId]) {
          var dateOnly = rowDate ? rowDate.slice(0, 10) : Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
          var timestamp = rowDate.length > 10 ? rowDate : Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
          rowsToAppendToXu.push([
            xuId,
            rowUser,
            rowType || 'XU_REWARD',
            rowAmount,
            dateOnly,
            rowOrderCode,
            rowNote,
            timestamp
          ]);
          existingXuIds[xuId] = true;
        }
      }
    }

    // Chuyển toàn bộ các dòng Xu sang ThongKe_TichLuyXu
    if (rowsToAppendToXu.length > 0) {
      xuSheet.getRange(xuSheet.getLastRow() + 1, 1, rowsToAppendToXu.length, 8).setValues(rowsToAppendToXu);
    }

    // Xóa triệt để các dòng Xu khỏi BonusPenalty (xóa từ dưới lên trên)
    for (var d = bpRowsToDelete.length - 1; d >= 0; d--) {
      bpSheet.deleteRow(bpRowsToDelete[d]);
    }

    SpreadsheetApp.flush();
    return {
      success: true,
      migratedCount: rowsToAppendToXu.length,
      deletedFromBP: bpRowsToDelete.length,
      message: 'Đã chuyển ' + bpRowsToDelete.length + ' bản ghi Xu sang đúng bảng ThongKe_TichLuyXu và dọn dẹp sạch bảng BonusPenalty!'
    };
  } catch (err) {
    return { success: false, message: 'Lỗi migrate Xu: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * API TỰ ĐỘNG PHỤC HỒI NHIỆM VỤ ĐANG LÀM TỪ ThongKe_TichLuyXu VỀ KPI_Progress
 * =========================================================================
 */
function api_repairAndRestoreTasksFromXuSheet(pin) {
  if (!pin) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để thực hiện thao tác!' };
  var auth = validatePin(pin);
  if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  if (!checkServerPermission(auth, 'HR_CONFIG_STAFF')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Boss Tối Cao mới có quyền phục hồi nhiệm vụ!' };
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var xuSheet = ss.getSheetByName('ThongKe_TichLuyXu');
    var kpiSheet = ss.getSheetByName('KPI_Progress');
    if (!xuSheet || !kpiSheet) return { success: false, message: 'Thiếu sheet CSDL' };

    var xuData = xuSheet.getDataRange().getValues();
    if (xuData.length <= 1) return { success: true, message: 'ThongKe_TichLuyXu rỗng' };

    var kpiData = kpiSheet.getDataRange().getValues();
    var existingKpiIds = {};
    for (var k = 1; k < kpiData.length; k++) {
      var kId = String(kpiData[k][0] || '').trim();
      if (kId) existingKpiIds[kId] = true;
    }

    var xuRowsToDelete = [];
    var kpiRowsToAppend = [];
    var now = new Date();
    var timestamp = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");

    var year = now.getFullYear();
    var month = now.getMonth();
    var defaultStart = Utilities.formatDate(new Date(year, month, 1), 'GMT+7', 'yyyy-MM-dd 00:00:00');
    var defaultEnd = Utilities.formatDate(new Date(year, month + 1, 0), 'GMT+7', 'yyyy-MM-dd 23:59:59');

    for (var i = 1; i < xuData.length; i++) {
      var row = xuData[i];
      var rowId = String(row[0] || '').trim();
      var rowUser = String(row[1] || '').trim();
      var rowType = String(row[2] || '').trim();
      var rowAmount = Number(row[3]) || 0;
      var rowDate = String(row[4] || '').trim();
      var rowOrderCode = String(row[5] || '').trim(); // "Chỉ tiêu: 8 Bộ"
      var rowNote = String(row[6] || '').trim();      // "Thanh Lý Layout Lẻ Size"

      var isTaskRow = rowId.indexOf('XU_TASK_') === 0 || rowType === 'XU_TASK';
      if (isTaskRow) {
        xuRowsToDelete.push(i + 1);

        var kpiId = rowId.replace(/^XU_TASK_/, 'KPI_XU_');
        if (kpiId.indexOf('KPI_XU_') !== 0) kpiId = 'KPI_XU_' + kpiId;

        // Trích xuất target và unit từ rowOrderCode (ví dụ: "Chỉ tiêu: 8 Bộ" -> target: 8, unit: "Bộ")
        var targetNum = 1;
        var unitStr = 'Lần';
        if (rowOrderCode) {
          var match = rowOrderCode.match(/Chỉ tiêu:\s*(\d+)\s*(.*)/i);
          if (match) {
            targetNum = Number(match[1]) || 1;
            unitStr = match[2] ? match[2].trim() : 'Lần';
          }
        }

        // Với trường hợp Diệu Hương "Thanh Lý Layout Lẻ Size", tiến độ thực tế là 1/8 bộ
        var currentNum = 0;
        if (rowNote.toLowerCase().indexOf('thanh lý') > -1 && targetNum === 8) {
          currentNum = 1;
        }

        if (!existingKpiIds[kpiId]) {
          // Schema KPI_Progress:
          // ['id', 'user', 'kpiName', 'current', 'target', 'unit', 'lastUpdated', 'startTime', 'endTime', 'reward', 'isClaimed', 'penalty', 'guide']
          kpiRowsToAppend.push([
            kpiId,
            rowUser,
            rowNote || 'Nhiệm vụ Xu',
            currentNum,
            targetNum,
            unitStr,
            timestamp,
            defaultStart,
            defaultEnd,
            rowAmount,
            false, // isClaimed = FALSE (Đang làm, chưa duyệt)
            0,     // penalty
            rowNote
          ]);
          existingKpiIds[kpiId] = true;
        }
      }
    }

    // Ghi vào KPI_Progress
    if (kpiRowsToAppend.length > 0) {
      kpiSheet.getRange(kpiSheet.getLastRow() + 1, 1, kpiRowsToAppend.length, 13).setValues(kpiRowsToAppend);
    }

    // Xóa các dòng task khỏi ThongKe_TichLuyXu (xóa từ dưới lên trên)
    for (var d = xuRowsToDelete.length - 1; d >= 0; d--) {
      xuSheet.deleteRow(xuRowsToDelete[d]);
    }

    SpreadsheetApp.flush();
    return {
      success: true,
      restoredCount: kpiRowsToAppend.length,
      deletedFromXu: xuRowsToDelete.length,
      message: 'Đã phục hồi ' + kpiRowsToAppend.length + ' nhiệm vụ về bảng KPI_Progress và làm sạch ThongKe_TichLuyXu!'
    };
  } catch (err) {
    return { success: false, message: 'Lỗi repair tasks: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================
 * API CHUẨN HÓA CÁC GIAO DỊCH ĐIỀU CHỈNH SỐ DƯ (Tránh bị tính nhầm vào Doanh thu/Chi phí)
 * =========================================================================
 */
function api_repairAdjustmentTransactions() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var txSheet = ss.getSheetByName('Transactions');
    if (!txSheet) return { success: false, message: 'Thiếu sheet Transactions' };

    var txData = txSheet.getDataRange().getValues();
    if (txData.length <= 1) return { success: true, message: 'Transactions rỗng' };

    var headers = txData[0];
    var idCol = headers.indexOf('id');
    var catCol = headers.indexOf('category');
    var titleCol = headers.indexOf('title');
    var noteCol = headers.indexOf('note');

    if (idCol === -1 || catCol === -1) return { success: false, message: 'Thiếu headers' };

    var modified = false;
    for (var i = 1; i < txData.length; i++) {
      var txId = String(txData[i][idCol] || '').trim();
      var txCat = String(txData[i][catCol] || '').trim();
      var txTitle = titleCol !== -1 ? String(txData[i][titleCol] || '').toLowerCase().trim() : '';
      var txNote = noteCol !== -1 ? String(txData[i][noteCol] || '').toLowerCase().trim() : '';

      var isAdj = txId.indexOf('TX_ADJ_') === 0 ||
                  txTitle.indexOf('điều chỉnh số dư') > -1 ||
                  txNote.indexOf('điều chỉnh số dư') > -1 ||
                  txNote.indexOf('sinh phiếu điều chỉnh') > -1;

      if (isAdj && txCat !== 'Điều Chỉnh Số Dư') {
        txData[i][catCol] = 'Điều Chỉnh Số Dư';
        modified = true;
      }
    }

    if (modified) {
      txSheet.getRange(1, 1, txData.length, headers.length).setValues(txData);
      SpreadsheetApp.flush();
    }

    return { success: true, modified: modified };
  } catch (err) {
    return { success: false, message: err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// -------------------------------------------------------------------------
// TỰ ĐỘNG TẠO MENU TRÊN GOOGLE SHEETS
// -------------------------------------------------------------------------
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('⚡ RF Hệ Thống')
      .addItem('🔥 Nạp Sạch & Chuẩn Hóa Sao Kê (CTY & Giám Đốc)', 'AAA_IMPORT_REAL_STATEMENTS_TO_DB')
      .addSeparator()
      .addItem('📦 Đồng bộ SKU Nguyên Liệu (Products ➡️ BOM_Config)', 'AAA_SYNC_BOM_MATERIAL_SKUS')
      .addItem('🏷️ Chuẩn hóa mã SKU Kho (Products & Sync All)', 'standardizeWarehouseSKU')
      .addItem('🧹 Xóa Sạch Phạt & Cảnh Báo SLA Đóng Gói', 'AAA_CLEANUP_PACKING_SLA_PENALTIES')
      .addSeparator()
      .addItem('🧹 Dọn dẹp dữ liệu Tháng 6 (Giải phóng RAM)', 'emergencyCleanAllJuneData')
      .addToUi();
  } catch (e) {
    // Ignore if not running in UI context
  }
}

// -------------------------------------------------------------------------
// SCRIPT DỌN DẸP TOÀN BỘ DỮ LIỆU THÁNG 6 TRÊN MỌI TRANG (GIẢI PHÓNG RAM)
// -------------------------------------------------------------------------
function emergencyCleanAllJuneData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const lock = LockService.getScriptLock();
  
  // Cấu hình: Quét các Sheet sau và tìm tháng 6 dựa trên các cột thời gian ưu tiên
  const targets = [
    { name: 'Orders', dateCols: ['createdAt', 'date'] },
    { name: 'Production', dateCols: ['deadline', 'p1_start', 'p2_start'] },
    { name: 'Packings', dateCols: ['start', 'endTime'] },
    { name: 'Attendance', dateCols: ['date'] },
    { name: 'Transactions', dateCols: ['date'] },
    { name: 'ImportExport', dateCols: ['date'] },
    { name: 'BonusPenalty', dateCols: ['date'] },
    { name: 'CTV_Finance', dateCols: ['date'] },
    { name: 'Reimbursements', dateCols: ['createdAt'] },
    { name: 'Orders_Archive', dateCols: ['createdAt', 'date'] }
  ];
  
  let report = [];
  
  // LockService bọc đúng chuẩn Rule 2B
  lock.waitLock(15000);
  try {
    targets.forEach(target => {
      const sheet = ss.getSheetByName(target.name);
      if (!sheet) return;
      
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) return; // Bỏ qua nếu sheet rỗng
      
      const headers = data[0];
      // Xác định vị trí các cột thời gian có tồn tại trong sheet
      const colIndexes = target.dateCols
                           .map(col => headers.indexOf(col))
                           .filter(idx => idx !== -1);
      
      if (colIndexes.length === 0) return;
      
      const filteredData = [headers];
      let deletedCount = 0;
      
      for (let i = 1; i < data.length; i++) {
        let isJune = false;
        
        for (let j = 0; j < colIndexes.length; j++) {
          const cellValue = data[i][colIndexes[j]];
          if (!cellValue) continue;
          
          if (cellValue instanceof Date) {
            if (cellValue.getMonth() === 5) { // getMonth() từ 0, tháng 6 là 5
              isJune = true;
              break;
            }
          } else {
            const dateStr = String(cellValue);
            if (dateStr.includes('-06-') || dateStr.includes('/06/')) {
              isJune = true;
              break;
            }
          }
        }
        
        if (!isJune) {
          filteredData.push(data[i]);
        } else {
          deletedCount++;
        }
      }
      
      if (deletedCount > 0) {
        sheet.clearContents();
        sheet.getRange(1, 1, filteredData.length, filteredData[0].length).setValues(filteredData);
        report.push(`- Trang [${target.name}]: Đã dọn sạch ${deletedCount} dòng`);
      }
    });
    
    const ui = SpreadsheetApp.getUi();
    if (report.length > 0) {
      ui.alert('✅ KẾT QUẢ DỌN DẸP DỮ LIỆU THÁNG 6:\n\n' + report.join('\n') + '\n\nVui lòng tải lại Web App (F5) để kiểm tra!');
    } else {
      ui.alert('Không tìm thấy dữ liệu tháng 6 nào cần dọn dẹp thêm.');
    }
    return { success: true, report: report };
  } catch (e) {
    try {
      SpreadsheetApp.getUi().alert('❌ Có lỗi xảy ra: ' + e.message);
    } catch (err) {}
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}
/**
 * 📦 TRUY VẾT HIỆN VẬT TỒN KHO: Lấy danh sách sản phẩm tồn khả dụng của SKU / Tên SP
 * Hỗ trợ Bể Kính (kèm serialCode 4 số) và Layout (kèm ảnh KCS + thợ Dựng Khung/Gia Cố).
 * Chỉ lấy các lệnh chưa bị gán đơn hàng khác (!usedByOrderCode).
 */
function api_getAvailableStockItems(skuOrName, type) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Production');
    if (!sheet) return { success: false, message: 'Không tìm thấy bảng Production', items: [] };

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: true, items: [] };

    var headers = data[0];
    var idCol = headers.indexOf('id');
    var orderIdCol = headers.indexOf('orderId');
    var typeCol = headers.indexOf('type');
    var nameCol = headers.indexOf('name');
    var statusCol = headers.indexOf('status');
    var p1NameCol = headers.indexOf('p1_name');
    var p1UserCol = headers.indexOf('p1_user');
    var p1PhotoCol = headers.indexOf('p1_photo');
    var p1EndTimeCol = headers.indexOf('p1_endTime');
    var p2NameCol = headers.indexOf('p2_name');
    var p2UserCol = headers.indexOf('p2_user');
    var p2PhotoCol = headers.indexOf('p2_photo');
    var p2EndTimeCol = headers.indexOf('p2_endTime');
    var qcPhotoCol = headers.indexOf('qc_front_photo');
    var qcSideCol = headers.indexOf('qc_side_photo');
    var serialCol = headers.indexOf('serialCode');
    var usedByCol = headers.indexOf('usedByOrderCode');
    var deadlineCol = headers.indexOf('deadline');

    var searchKey = String(skuOrName || '').trim().toLowerCase().replace(/\s+/g, ' ');
    var cleanSearchKey = searchKey.replace(/[\u2010-\u2015\u2212-]/g, '-');

    var items = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowUsedBy = usedByCol !== -1 ? String(row[usedByCol] || '').trim() : '';
      if (rowUsedBy) continue; // Đã bị đơn khác xuất

      var rowStatus = statusCol !== -1 ? String(row[statusCol] || '').trim() : '';
      var normStatus = normalizeStatus(rowStatus);
      // Chỉ lấy các lệnh đã hoàn thành (Done, Hoàn Kho Đạt)
      if (normStatus !== 'Done' && rowStatus !== 'HOÀN KHO ĐẠT' && rowStatus !== 'ĐÃ XONG') continue;

      var rowName = nameCol !== -1 ? String(row[nameCol] || '').trim().toLowerCase().replace(/[\u2010-\u2015\u2212-]/g, '-').replace(/\s+/g, ' ') : '';
      var rowType = typeCol !== -1 ? String(row[typeCol] || '').trim() : '';

      // Kiểm tra so khớp tên sản phẩm hoặc SKU
      var match = false;
      if (!cleanSearchKey) {
        match = true;
      } else if (rowName === cleanSearchKey || rowName.indexOf(cleanSearchKey) !== -1 || cleanSearchKey.indexOf(rowName) !== -1) {
        match = true;
      }

      if (type) {
        var tLower = String(type).toLowerCase();
        var rowTLower = rowType.toLowerCase();
        if (tLower.includes('bể') || tLower.includes('kính')) {
          if (!rowTLower.includes('bể') && !rowTLower.includes('kính') && !rowName.includes('bể') && !rowName.includes('kính')) match = false;
        } else if (tLower.includes('layout')) {
          if (!rowTLower.includes('layout') && !rowName.includes('layout')) match = false;
        }
      }

      if (!match) continue;

      var rowId = idCol !== -1 ? String(row[idCol] || '') : '';
      var rowSerial = serialCol !== -1 ? String(row[serialCol] || '').trim() : '';
      if (!rowSerial && (rowType.includes('Bể') || rowName.includes('bể'))) {
        var numOnly = rowId.replace(/\D/g, '');
        var sCode = numOnly.length >= 4 ? numOnly.slice(-4) : (rowId.slice(-4) || '0000');
        rowSerial = '#' + sCode;
      }

      var p1U = p1UserCol !== -1 ? String(row[p1UserCol] || '') : '';
      var p2U = p2UserCol !== -1 ? String(row[p2UserCol] || '') : '';
      var p1Photo = p1PhotoCol !== -1 ? String(row[p1PhotoCol] || '') : '';
      var p2Photo = p2PhotoCol !== -1 ? String(row[p2PhotoCol] || '') : '';
      var qcPhoto = qcPhotoCol !== -1 ? String(row[qcPhotoCol] || '') : '';
      var pDate = p2EndTimeCol !== -1 && row[p2EndTimeCol] ? String(row[p2EndTimeCol]) : (p1EndTimeCol !== -1 && row[p1EndTimeCol] ? String(row[p1EndTimeCol]) : (deadlineCol !== -1 ? String(row[deadlineCol] || '') : ''));

      items.push({
        id: rowId,
        rowIndex: i + 1,
        name: nameCol !== -1 ? String(row[nameCol] || '') : '',
        type: rowType,
        serialCode: rowSerial,
        p1_name: p1NameCol !== -1 ? String(row[p1NameCol] || '') : 'Khâu 1',
        p1_user: p1U,
        p1_photo: p1Photo,
        p2_name: p2NameCol !== -1 ? String(row[p2NameCol] || '') : 'Khâu 2',
        p2_user: p2U,
        p2_photo: p2Photo,
        qc_front_photo: qcPhoto || p2Photo || p1Photo,
        date: pDate ? pDate.slice(0, 16).replace('T', ' ') : ''
      });
    }

    return { success: true, items: items };
  } catch (e) {
    return { success: false, message: e.toString(), items: [] };
  }
}

/**
 * 🔒 KHÓA & GÁN SẢN PHẨM TỒN VÀO ĐƠN HÀNG (CONCURRENCY SAFE)
 * Đảm bảo 1 sản phẩm chỉ gán cho đúng 1 đơn duy nhất.
 * Cập nhật usedByOrderCode vào Production tồn, đồng thời chuyển thông tin thợ thật vào đơn.
 */
function api_assignStockItemToOrder(prodId, orderCode, serialCode) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    return { success: false, message: 'Hệ thống đang bận, vui lòng thử lại sau vài giây!' };
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var prodSheet = ss.getSheetByName('Production');
    if (!prodSheet) return { success: false, message: 'Không tìm thấy bảng Production' };

    var data = prodSheet.getDataRange().getValues();
    var headers = data[0];
    var idCol = headers.indexOf('id');
    var orderIdCol = headers.indexOf('orderId');
    var nameCol = headers.indexOf('name');
    var p1UserCol = headers.indexOf('p1_user');
    var p1PhotoCol = headers.indexOf('p1_photo');
    var p2UserCol = headers.indexOf('p2_user');
    var p2PhotoCol = headers.indexOf('p2_photo');
    var qcPhotoCol = headers.indexOf('qc_front_photo');
    var serialCol = headers.indexOf('serialCode');
    var usedByCol = headers.indexOf('usedByOrderCode');
    var usedAtCol = headers.indexOf('usedAt');
    var noteCol = headers.indexOf('note');

    // Bổ sung cột nếu chưa có trong trang tính
    var missingCols = [];
    if (serialCol === -1) missingCols.push('serialCode');
    if (usedByCol === -1) missingCols.push('usedByOrderCode');
    if (usedAtCol === -1) missingCols.push('usedAt');
    if (missingCols.length > 0) {
      var lastCol = prodSheet.getLastColumn();
      prodSheet.getRange(1, lastCol + 1, 1, missingCols.length).setValues([missingCols]).setFontWeight("bold");
      data = prodSheet.getDataRange().getValues();
      headers = data[0];
      serialCol = headers.indexOf('serialCode');
      usedByCol = headers.indexOf('usedByOrderCode');
      usedAtCol = headers.indexOf('usedAt');
    }

    // 1. Tìm bản ghi sản phẩm tồn
    var targetRowIndex = -1;
    var targetStockItem = null;

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rId = String(row[idCol] || '').trim();
      var rSerial = serialCol !== -1 ? String(row[serialCol] || '').trim().toUpperCase() : '';

      var isMatch = false;
      if (prodId && rId === String(prodId).trim()) {
        isMatch = true;
      } else if (serialCode && rSerial) {
        var cleanTargetSerial = String(serialCode).trim().toUpperCase().replace(/^#/, '');
        var cleanRowSerial = rSerial.replace(/^#/, '');
        if (cleanRowSerial === cleanTargetSerial) isMatch = true;
      }

      if (isMatch) {
        targetRowIndex = i + 1; // 1-indexed sheet row
        targetStockItem = {
          id: rId,
          name: nameCol !== -1 ? String(row[nameCol] || '') : '',
          p1_user: p1UserCol !== -1 ? String(row[p1UserCol] || '') : '',
          p1_photo: p1PhotoCol !== -1 ? String(row[p1PhotoCol] || '') : '',
          p2_user: p2UserCol !== -1 ? String(row[p2UserCol] || '') : '',
          p2_photo: p2PhotoCol !== -1 ? String(row[p2PhotoCol] || '') : '',
          qc_front_photo: qcPhotoCol !== -1 ? String(row[qcPhotoCol] || '') : '',
          serialCode: rSerial || serialCode || '',
          usedByOrderCode: usedByCol !== -1 ? String(row[usedByCol] || '').trim() : ''
        };
        break;
      }
    }

    if (!targetStockItem || targetRowIndex === -1) {
      return { success: false, message: 'Không tìm thấy sản phẩm tồn có mã định danh này trong kho!' };
    }

    if (targetStockItem.usedByOrderCode && targetStockItem.usedByOrderCode !== orderCode) {
      return { success: false, message: 'Hiện vật này đã được xuất cho đơn ' + targetStockItem.usedByOrderCode + '! Vui lòng chọn hiện vật khác.' };
    }

    // 2. Cập nhật khóa hiện vật tồn
    var nowIso = new Date().toISOString();
    prodSheet.getRange(targetRowIndex, usedByCol + 1).setValue(orderCode);
    prodSheet.getRange(targetRowIndex, usedAtCol + 1).setValue(nowIso);
    if (serialCode && serialCol !== -1 && !targetStockItem.serialCode) {
      prodSheet.getRange(targetRowIndex, serialCol + 1).setValue(serialCode);
      targetStockItem.serialCode = serialCode;
    }

    // 3. Tìm và cập nhật lệnh sản xuất đại diện của đơn hàng trong Production (nếu có)
    for (var j = 1; j < data.length; j++) {
      var oRow = data[j];
      var rOrdId = String(oRow[orderIdCol] || '').trim();
      var rOrdCode = String(oRow[idCol] || '').trim();

      if (rOrdId === orderCode || rOrdCode.indexOf(orderCode) !== -1 || rOrdId === String(orderCode).replace('ORD_', '')) {
        if (p1UserCol !== -1 && targetStockItem.p1_user) prodSheet.getRange(j + 1, p1UserCol + 1).setValue(targetStockItem.p1_user);
        if (p2UserCol !== -1 && targetStockItem.p2_user) prodSheet.getRange(j + 1, p2UserCol + 1).setValue(targetStockItem.p2_user);
        if (p1PhotoCol !== -1 && targetStockItem.p1_photo) prodSheet.getRange(j + 1, p1PhotoCol + 1).setValue(targetStockItem.p1_photo);
        if (p2PhotoCol !== -1 && targetStockItem.p2_photo) prodSheet.getRange(j + 1, p2PhotoCol + 1).setValue(targetStockItem.p2_photo);
        if (qcPhotoCol !== -1 && targetStockItem.qc_front_photo) prodSheet.getRange(j + 1, qcPhotoCol + 1).setValue(targetStockItem.qc_front_photo);
        if (serialCol !== -1 && targetStockItem.serialCode) prodSheet.getRange(j + 1, serialCol + 1).setValue(targetStockItem.serialCode);
        if (noteCol !== -1) {
          var oldNote = String(oRow[noteCol] || '');
          var newNote = (oldNote ? oldNote + ' | ' : '') + 'Xuất từ tồn kho (' + (targetStockItem.serialCode || targetStockItem.id) + ')';
          prodSheet.getRange(j + 1, noteCol + 1).setValue(newNote);
        }
      }
    }

    return {
      success: true,
      message: 'Gán hiện vật xuất kho thành công!',
      stockItem: targetStockItem
    };
  } catch (err) {
    return { success: false, message: 'Lỗi gán sản phẩm tồn: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * ⚡ BẬT/TẮT TRẠNG THÁI "ĐƠN HỎA TỐC / ƯU TIÊN LÀM NGAY" ĐỒNG BỘ 2 CHIỀU (ORDERS 🔁 PRODUCTION)
 */
function api_toggleOrderUrgent(orderId, isUrgent, pin) {
  if (!orderId) return { success: false, message: 'Thiếu mã đơn hàng!' };
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var nowIso = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    var urgentFlag = isUrgent === true || String(isUrgent).toUpperCase() === 'TRUE';
    var urgentTime = urgentFlag ? nowIso : '';

    // 1. Cập nhật trong bảng Orders
    var oSheet = ss.getSheetByName('Orders');
    var matchedOrderCode = '';
    var updatedOrder = null;
    if (oSheet) {
      var oData = oSheet.getDataRange().getValues();
      if (oData.length > 1) {
        var oHeaders = oData[0];
        var idCol = oHeaders.indexOf('id');
        var codeCol = oHeaders.indexOf('orderCode');
        var urgCol = oHeaders.indexOf('isUrgent');
        var urgAtCol = oHeaders.indexOf('urgentAt');

        if (urgCol === -1) {
          oSheet.getRange(1, oHeaders.length + 1).setValue('isUrgent');
          urgCol = oHeaders.length;
          oHeaders.push('isUrgent');
        }
        if (urgAtCol === -1) {
          oSheet.getRange(1, oHeaders.length + 1).setValue('urgentAt');
          urgAtCol = oHeaders.length;
          oHeaders.push('urgentAt');
        }

        for (var i = 1; i < oData.length; i++) {
          var rowId = String(oData[i][idCol] || '').trim();
          var rowCode = codeCol !== -1 ? String(oData[i][codeCol] || '').trim() : '';
          if (rowId === String(orderId).trim() || (rowCode && rowCode === String(orderId).trim())) {
            matchedOrderCode = rowCode || rowId;
            oSheet.getRange(i + 1, urgCol + 1).setValue(urgentFlag ? 'TRUE' : 'FALSE');
            oSheet.getRange(i + 1, urgAtCol + 1).setValue(urgentTime);
            updatedOrder = { id: rowId, orderCode: rowCode, isUrgent: urgentFlag, urgentAt: urgentTime };
            break;
          }
        }
      }
    }

    // 2. Cập nhật đồng bộ các lệnh sản xuất trong bảng Production
    var pSheet = ss.getSheetByName('Production');
    var updatedProds = [];
    if (pSheet) {
      var pData = pSheet.getDataRange().getValues();
      if (pData.length > 1) {
        var pHeaders = pData[0];
        var pIdCol = pHeaders.indexOf('id');
        var pOrderIdCol = pHeaders.indexOf('orderId');
        var pUrgCol = pHeaders.indexOf('isUrgent');
        var pUrgAtCol = pHeaders.indexOf('urgentAt');

        if (pUrgCol === -1) {
          pSheet.getRange(1, pHeaders.length + 1).setValue('isUrgent');
          pUrgCol = pHeaders.length;
          pHeaders.push('isUrgent');
        }
        if (pUrgAtCol === -1) {
          pSheet.getRange(1, pHeaders.length + 1).setValue('urgentAt');
          pUrgAtCol = pHeaders.length;
          pHeaders.push('urgentAt');
        }

        for (var j = 1; j < pData.length; j++) {
          var pOrdId = String(pData[j][pOrderIdCol] || '').trim();
          if (pOrdId === String(orderId).trim() || (matchedOrderCode && pOrdId === matchedOrderCode)) {
            pSheet.getRange(j + 1, pUrgCol + 1).setValue(urgentFlag ? 'TRUE' : 'FALSE');
            pSheet.getRange(j + 1, pUrgAtCol + 1).setValue(urgentTime);
            updatedProds.push({ id: pData[j][pIdCol], orderId: pOrdId, isUrgent: urgentFlag, urgentAt: urgentTime });
          }
        }
      }
    }

    return {
      success: true,
      orderId: orderId,
      orderCode: matchedOrderCode || orderId,
      isUrgent: urgentFlag,
      urgentAt: urgentTime,
      updatedOrder: updatedOrder,
      updatedProdsCount: updatedProds.length,
      message: urgentFlag ? 'Đã bật chế độ ƯU TIÊN LÀM NGAY!' : 'Đã tắt chế độ hỏa tốc.'
    };
  } catch (err) {
    return { success: false, message: 'Lỗi bật/tắt hỏa tốc: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// 🤖 HÀM TIẾP NHẬN KẾT QUẢ AI KCS THẨM ĐỊNH TỰ ĐỘNG TỪ CLIENT-SIDE
// =========================================================================
/**
 * Cập nhật kết quả thẩm định ảnh từ AI KCS Inspector vào bảng Production
 * @param {string} productionId - ID lệnh sản xuất
 * @param {Object} updatePayload - Dữ liệu cập nhật {qc_status, qc_note, p1_status, p2_status, status}
 * @returns {Object} {success, message}
 */
function api_applyAiQcResult(productionId, updatePayload) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Production');
    if (!sheet) return { success: false, message: "Không tìm thấy sheet Production" };

    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: false, message: "Bảng Production trống" };

    var headers = data[0];
    var colId = headers.indexOf('id');
    var colQcStatus = headers.indexOf('qc_status');
    var colQcNote = headers.indexOf('qc_note');
    var colP1Status = headers.indexOf('p1_status');
    var colP2Status = headers.indexOf('p2_status');
    var colStatus = headers.indexOf('status');

    if (colId === -1 || colQcStatus === -1) {
      return { success: false, message: "Thiếu cột id hoặc qc_status trong Schema Production!" };
    }

    for (var r = 1; r < data.length; r++) {
      if (String(data[r][colId]).trim() === String(productionId).trim()) {
        var rowIdx = r + 1;
        if (updatePayload.qc_status && colQcStatus !== -1) {
          sheet.getRange(rowIdx, colQcStatus + 1).setValue(updatePayload.qc_status);
        }
        if (updatePayload.qc_note && colQcNote !== -1) {
          sheet.getRange(rowIdx, colQcNote + 1).setValue(updatePayload.qc_note);
        }
        if (updatePayload.p1_status && colP1Status !== -1) {
          sheet.getRange(rowIdx, colP1Status + 1).setValue(updatePayload.p1_status);
        }
        if (updatePayload.p2_status && colP2Status !== -1) {
          sheet.getRange(rowIdx, colP2Status + 1).setValue(updatePayload.p2_status);
        }
        if (updatePayload.status && colStatus !== -1) {
          sheet.getRange(rowIdx, colStatus + 1).setValue(updatePayload.status);
        }

        // Tự động ghi nhận log vào Tracking_Log
        try {
          var logSheet = ss.getSheetByName('Tracking_Log');
          if (logSheet) {
            var nowStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
            logSheet.appendRow([
              nowStr,
              'AI KCS Inspector',
              'Thẩm định ' + (updatePayload.qc_status || 'Xong') + ' cho lệnh #' + productionId,
              'Gemini 3.6 Flash',
              updatePayload.qc_note || ''
            ]);
          }
        } catch (logErr) {
          console.warn("Lỗi ghi log KCS: ", logErr);
        }

        return { 
          success: true, 
          productionId: productionId,
          qc_status: updatePayload.qc_status,
          message: "Đã cập nhật kết quả AI KCS thành công!" 
        };
      }
    }
    return { success: false, message: "Không tìm thấy lệnh sản xuất ID: " + productionId };
  } catch (err) {
    Logger.log("Lỗi api_applyAiQcResult: " + err.toString());
    return { success: false, message: "Lỗi hệ thống: " + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

// Cache buster: 1788366000000