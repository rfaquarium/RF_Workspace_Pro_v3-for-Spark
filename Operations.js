// =========================================================================
// MODULE: OPERATIONS ALERTS & KPI CALCULATION
// Cập nhật: Tự động hoá quản trị vận hành RF_Workspace_Pro
// =========================================================================

/**
 * [RCA] Tái cấu trúc (Refactoring): Hệ thống cũ bị hardcode từng cá nhân, làm code phình to O(N) và rất khó mở rộng khi thêm nhân sự mới.
 * Khắc phục bằng mô hình "Role-Based KPI", tự động mapping theo `Chức Danh` trong bảng `Config_NhanSu`.
 * Tối ưu hóa Database: Dùng Batch Write (setValues) ghi toàn bộ data của tất cả nhân sự trong 1 lần gọi API duy nhất thay vì lặp qua từng người (O(1) thay vì O(N)).
 *
 * Tính toán KPI hàng tháng cho TOÀN BỘ nhân sự (Role-Based KPI)
 * @param {Object} allStatsMap - Map chứa chỉ số thực tế của từng nhân sự, key là tên nhân sự. 
 * Ví dụ: { "Nguyễn Hoàng Dương": { actualWorkingDays: 26, inventoryMatched: 1, qcFailedRate: 0.04, docsComplete: 1, outputVolume: 160, negotiationRate: 1 }, "Nguyễn Thị Diệu Hương": { actualWorkingDays: 26, revenueAchieved: 26000000, ... } }
 * @returns {Object} Kết quả KPI và Lương
 */
function api_generateMonthlyKPI_All(allStatsMap, pin) {
  var pinToAuth = pin || (allStatsMap && allStatsMap.pin);
  if (!pinToAuth) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để thực hiện thao tác!' };
  var auth = validatePin(pinToAuth);
  if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  if (!checkServerPermission(auth, 'HR_EDIT_KPI_TARGET')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Boss Tối Cao mới có quyền sinh KPI hàng loạt!' };
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Quét danh sách nhân sự từ Config_NhanSu
    var hrSheet = ss.getSheetByName('Config_NhanSu');
    if (!hrSheet) throw new Error('Không tìm thấy bảng Config_NhanSu');
    var hrData = hrSheet.getDataRange().getValues();
    var hrHeaders = hrData[0];
    
    // v2.11 Audit Fix R4: Sửa tên cột đúng theo SCHEMA.Config_NhanSu
    var nameCol = hrHeaders.indexOf('Tên Nhân Sự');
    if (nameCol === -1) nameCol = hrHeaders.indexOf('Họ và Tên'); // Legacy fallback
    if (nameCol === -1) nameCol = hrHeaders.indexOf('user');
    
    var roleCol = hrHeaders.indexOf('Chức Danh');
    var baseSalaryCol = hrHeaders.indexOf('Lương Cơ Bản');
    var funcSalaryCol = hrHeaders.indexOf('Lương Chức Vụ');
    
    if (nameCol === -1 || roleCol === -1) throw new Error('Cấu trúc Config_NhanSu thiếu cột Tên Nhân Sự hoặc Chức Danh');

    var kpiSheet = ss.getSheetByName('KPI_Progress');
    if (!kpiSheet) throw new Error('Không tìm thấy bảng KPI_Progress');
    var kpiHeaderData = kpiSheet.getRange(1, 1, 1, kpiSheet.getLastColumn()).getValues()[0];
    
    // 2. Role-Based Configuration (Object Mapping)
    var ROLE_KPI_CONFIG = {
      "Quản Lý Bán Hàng": [
        { key: "revenueAchieved", name: "[PHAT_TRIEN] Doanh thu bán hàng (Mục tiêu 25M)", target: 25000000, reward: 1040000, unit: "VNĐ", condition: function(c, t) { return c >= t; } },
        { key: "responseRate", name: "[PHAT_TRIEN] Tỉ lệ phản hồi > 96%", target: 0.961, reward: 260000, unit: "%", condition: function(c, t) { return c >= t; } },
        { key: "refundHandlingRate", name: "[PHAT_TRIEN] Xử lý hàng hoàn > 80%", target: 0.801, reward: 520000, unit: "%", condition: function(c, t) { return c >= t; } },
        { key: "complaintWinRate", name: "[PHAT_TRIEN] Khiếu nại thắng > 50%", target: 0.501, reward: 260000, unit: "%", condition: function(c, t) { return c >= t; } },
        { key: "msgResponseRate", name: "[PHAT_TRIEN] Phản hồi tin nhắn 100%", target: 1.0, reward: 260000, unit: "%", condition: function(c, t) { return c >= t; } },
        { key: "lowRatingWinRate", name: "[PHAT_TRIEN] Xử lý đánh giá thấp > 50%", target: 0.501, reward: 260000, unit: "%", condition: function(c, t) { return c >= t; } }
      ],
      "Quản Lý Kho": [
        { key: "inventoryMatched", name: "[PHAT_TRIEN] Đảm bảo giá vốn, phân loại khớp 100%", target: 1, reward: 500000, unit: "SLA", condition: function(c, t) { return c >= t; } },
        { key: "docsComplete", name: "[PHAT_TRIEN] Lưu trữ đầy đủ 100% chứng từ/Hóa đơn", target: 1, reward: 250000, unit: "SLA", condition: function(c, t) { return c >= t; } },
        { key: "outputVolume", name: "[PHAT_TRIEN] Sản lượng đạt 160 bể (80 done/khâu)", target: 160, reward: 500000, unit: "SP", condition: function(c, t) { return c >= t; } },
        { key: "qcFailedRate", name: "[PHAT_TRIEN] Tỉ lệ hàng hóa hoàn < 5%", target: 0.05, reward: 500000, unit: "%", condition: function(c, t) { return c < t; } },
        { key: "materialSLA", name: "[PHAT_TRIEN] Nguyên liệu không thiếu hụt (100% SLA)", target: 1, reward: 375000, unit: "SLA", condition: function(c, t) { return c >= t; } },
        { key: "negotiationRate", name: "[PHAT_TRIEN] Quản lý công nợ NCC tốt (100% đối soát)", target: 1, reward: 375000, unit: "SLA", condition: function(c, t) { return c >= t; } }
      ]
    };
    
    var dataToAppend = [];
    var monthStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM");
    var timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
    var eMonth = new Date(); eMonth.setMonth(eMonth.getMonth() + 1); eMonth.setDate(0);
    var endTimeStr = Utilities.formatDate(eMonth, "GMT+7", "yyyy-MM-dd") + ' 23:59:59';
    var logs = [];

    // 3. Duyệt toàn bộ nhân sự (O(N) data build)
    allStatsMap = allStatsMap || {};
    
    for (var i = 1; i < hrData.length; i++) {
      var userName = String(hrData[i][nameCol]).trim();
      if (!userName) continue;
      
      var role = String(hrData[i][roleCol]).trim();
      var baseSal = Number(hrData[i][baseSalaryCol]) || 0;
      var funcSal = Number(hrData[i][funcSalaryCol]) || 0;
      
      var stats = allStatsMap[userName] || {};
      var actualDays = Number(stats.actualWorkingDays) || 26;
      var timeSalary = ((baseSal + funcSal) / 26) * actualDays; // Tính lương thời gian
      
      var roleConfigs = ROLE_KPI_CONFIG[role];
      if (roleConfigs && roleConfigs.length > 0) {
        var userBonus = 0;
        for (var j = 0; j < roleConfigs.length; j++) {
          var cnf = roleConfigs[j];
          var currentVal = Number(stats[cnf.key]) || 0;
          var isMet = cnf.condition(currentVal, cnf.target);
          var actualReward = isMet ? cnf.reward : 0;
          userBonus += actualReward;
          
          logs.push({ user: userName, role: role, timeSalary: timeSalary, kpi: cnf.name, current: currentVal, target: cnf.target, reward: actualReward });
          
          var newRow = kpiHeaderData.map(function(colName) {
            if (colName === 'id') return 'KPI_' + Date.now() + '_' + i + '_' + j;
            if (colName === 'user') return userName;
            if (colName === 'kpiName') return cnf.name;
            if (colName === 'current') return currentVal;
            if (colName === 'target') return cnf.target;
            if (colName === 'unit') return cnf.unit;
            if (colName === 'lastUpdated') return timestamp;
            if (colName === 'startTime') return monthStr + '-01 00:00:00';
            if (colName === 'endTime') return endTimeStr;
            if (colName === 'reward') return actualReward;
            if (colName === 'isClaimed') return true;
            return '';
          });
          dataToAppend.push(newRow);
        }
      }
    }

    // 4. Batch Write (O(1) execution)
    if (dataToAppend.length > 0) {
      kpiSheet.getRange(kpiSheet.getLastRow() + 1, 1, dataToAppend.length, dataToAppend[0].length).setValues(dataToAppend);
    }

    return {
      success: true,
      message: 'Đã sinh KPI hàng loạt thành công cho ' + (dataToAppend.length) + ' dòng mục tiêu!',
      data: logs
    };
  } catch (error) {
    return { success: false, message: 'Lỗi khi tạo KPI hàng loạt: ' + error.toString() };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// 🪙 MODULE PHỤ TRỢ: QUẢN LÝ VÀ GHI NHẬN QUỸ XU TÍCH LŨY DÀI HẠN
// Đảm bảo tách biệt hoàn toàn giữa Xu (Tích lũy cuối năm) và VNĐ (Lương tháng)
// =========================================================================

/**
 * Ghi nhận biến động Xu tích lũy của nhân sự vào bảng tính độc lập.
 * Tự động khởi tạo bảng 'ThongKe_TichLuyXu' ở danh sách bên trái nếu chưa tồn tại.
 * 
 * @param {string} user - Tên hoặc email nhân sự thực hiện
 * @param {number} amountXu - Số xu biến động (Dương là thưởng, Âm là phạt)
 * @param {string} type - Loại nghiệp vụ (Ví dụ: "Thưởng nhiệm vụ", "Phạt Anti-cheat")
 * @param {string} note - Ghi chú chi tiết lý do biến động
 * @param {string} orderCode - Mã đơn hàng hoặc mã nhiệm vụ liên quan (nếu có)
 * @returns {Object} Trạng thái thực thi
 */
function api_recordXuTransaction(user, amountXu, type, note, orderCode) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = 'ThongKe_TichLuyXu';
    var sheet = ss.getSheetByName(sheetName);
    
    // BƯỚC 1: Tự động khởi tạo bảng tính bên trái nếu chưa có (Zero-configuration)
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Thiết lập cấu trúc cột dữ liệu chuẩn hóa cho hệ thống lưu vết quỹ
      sheet.appendRow([
        'id', 
        'user', 
        'type', 
        'amount_xu', 
        'date', 
        'orderCode', 
        'note', 
        'timestamp'
      ]);
      // Định dạng dòng tiêu đề cho dễ nhìn và quản lý
      sheet.getRange(1, 1, 1, 8)
           .setBackground('#78350f') // Màu nâu hổ phách đặc trưng của Xu
           .setFontColor('#ffffff')
           .setFontWeight('bold')
           .setHorizontalAlignment('center');
    }
    
    // BƯỚC 2: Chuẩn bị dữ liệu dòng ghi nhận mới
    var timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
    var dateStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd");
    var uniqueId = 'XU_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    var newRow = [
      uniqueId,
      String(user).trim(),
      String(type).trim(),
      Number(amountXu) || 0,
      dateStr,
      orderCode ? String(orderCode).trim() : '',
      note ? String(note).trim() : '',
      timestamp
    ];
    
    // BƯỚC 3: Ghi dữ liệu vào dòng cuối cùng của bảng tính
    sheet.appendRow(newRow);
    
    return { 
      success: true, 
      message: 'Đã ghi nhận thành công ' + amountXu + ' Xu vào quỹ tích lũy của nhân sự ' + user 
    };
  } catch (error) {
    return { 
      success: false, 
      message: 'Lỗi phát sinh khi ghi nhận quỹ Xu tích lũy: ' + error.toString() 
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Tính tổng số dư Xu tích lũy hiện tại của một nhân sự từ lịch sử bảng tính.
 * Dùng để trả về dữ liệu thời gian thực hiển thị trên Badge của Tab_HR.html
 * 
 * @param {string} userName - Tên nhân sự cần tính toán số dư
 * @returns {number} Tổng số xu tích lũy hiện tại
 */
function api_getUserXuBalance(userName) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('ThongKe_TichLuyXu');
    if (!sheet) return 0;
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return 0; // Chỉ có dòng tiêu đề
    
    var userCol = 1;     // Cột 'user'
    var amountCol = 3;   // Cột 'amount_xu'
    var totalBalance = 0;
    
    var targetUser = String(userName).trim().toLowerCase();
    
    for (var i = 1; i < data.length; i++) {
      var rowUser = String(data[i][userCol]).trim().toLowerCase();
      if (rowUser === targetUser) {
        totalBalance += (Number(data[i][amountCol]) || 0);
      }
    }
    
    return totalBalance;
  } catch (e) {
    console.error('Lỗi khi tính số dư Xu của ' + userName + ': ' + e.toString());
    return 0;
  }
}

/**
 * Wrapper for google.script.run
 */
function getOperationsHealth() {
  return api_getOperationsHealth();
}

/**
 * Quét toàn bộ hệ thống trả về Cảnh Báo Vận Hành
 */
function api_getOperationsHealth() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var alerts = {
    sla: [],
    bottleneck: [],
    inventory: [],
    packingEmergency: null
  };
  
  try {
    var now = new Date();

    // 1. Quét Cảnh Báo Trễ SLA (Bảng Orders)
    var orderSheet = ss.getSheetByName('Orders');
    if (orderSheet) {
      var orderData = orderSheet.getDataRange().getValues();
      var oHeaders = orderData[0];
      var oStatusCol = oHeaders.indexOf('status');
      var oDeadlineCol = oHeaders.indexOf('deadline');
      var oCodeCol = oHeaders.indexOf('orderCode');
      var oChannelCol = oHeaders.indexOf('channel');
      var oProdCol = oHeaders.indexOf('hasProduction');
      
      // Bỏ qua dòng tiêu đề, lọc từ dưới lên tối đa 1000 đơn gần nhất để tối ưu tốc độ
      var scanLimit = Math.max(1, orderData.length - 1000);
      for (var i = orderData.length - 1; i >= scanLimit; i--) {
        var status = String(orderData[i][oStatusCol] || '').trim();
        var isTerm = isTerminalStatus(status) || status.toUpperCase() === 'HOÀN TẤT' || status.toUpperCase() === 'ĐÃ GỬI HÀNG';
        if (!status || !isTerm) { // Chưa hoàn thành
          var deadlineRaw = orderData[i][oDeadlineCol];
          if (deadlineRaw) {
            var deadline = new Date(deadlineRaw);
            if (!isNaN(deadline.getTime()) && deadline < now) {
              var channel = orderData[i][oChannelCol] || 'Trực tiếp';
              var code = orderData[i][oCodeCol] || ('D-' + i);
              var hasProd = orderData[i][oProdCol] ? 'Có sản xuất' : 'Giao thẳng';
              var hoursLate = Math.floor((now - deadline) / (1000 * 60 * 60));
              if (alerts.sla.length < 15) {
                alerts.sla.push(`[${channel}] Đơn ${code} trễ SLA ${hoursLate} tiếng. (${hasProd})`);
              }
            }
          }
        }
      }
    }

    // 2. Quét Nghẽn Khâu Sản Xuất (Bảng Production)
    var prodSheet = ss.getSheetByName('Production');
    if (prodSheet) {
      var prodData = prodSheet.getDataRange().getValues();
      var pHeaders = prodData[0];
      var p1UserCol = pHeaders.indexOf('p1_user');
      var p1StatusCol = pHeaders.indexOf('p1_status');
      var p2UserCol = pHeaders.indexOf('p2_user');
      var p2StatusCol = pHeaders.indexOf('p2_status');

      var userBacklog = {};
      
      for (var j = 1; j < prodData.length; j++) {
        var p1Status = prodData[j][p1StatusCol];
        var p1User = prodData[j][p1UserCol];
        if (p1Status === 'Pending' && p1User) {
          userBacklog[p1User] = (userBacklog[p1User] || 0) + 1;
        }

        var p2Status = prodData[j][p2StatusCol];
        var p2User = prodData[j][p2UserCol];
        if (p2Status === 'Pending' && p2User) {
          userBacklog[p2User] = (userBacklog[p2User] || 0) + 1;
        }
      }

      for (var user in userBacklog) {
        if (userBacklog[user] >= 5) { // Cảnh báo nếu ai đó ôm >= 5 tasks Pending
          alerts.bottleneck.push(`Nhân sự ${user} đang bị nghẽn: ${userBacklog[user]} tasks Pending.`);
        }
      }
    }

    // 3. Quét Lệch Kho (Bảng Products)
    var productSheet = ss.getSheetByName('Products');
    if (productSheet) {
      var productData = productSheet.getDataRange().getValues();
      var prHeaders = productData[0];
      var prQtyCol = prHeaders.indexOf('quantity');
      var prMinCol = prHeaders.indexOf('minStock');
      var prSkuCol = prHeaders.indexOf('sku');
      var prNameCol = prHeaders.indexOf('name');

      for (var k = 1; k < productData.length; k++) {
        var qty = Number(productData[k][prQtyCol]) || 0;
        var minStock = Number(productData[k][prMinCol]) || 0;
        if (qty <= minStock && minStock > 0) { // Cảnh báo khi có minStock
          var sku = productData[k][prSkuCol];
          var name = productData[k][prNameCol];
          alerts.inventory.push(`Sản phẩm ${sku} (${name}) chỉ còn ${qty}. Dưới định mức tối thiểu (${minStock}).`);
        }
      }
    }

    return { success: true, data: alerts };
  } catch (error) {
    return { success: false, message: 'Lỗi khi quét vận hành: ' + error.toString() };
  }
}

// =========================================================================
// 🛠️ TOOL DỌN DẸP: BUNG CÁC LỆNH BỊ GỘP TRỞ LẠI THÀNH CÁC LỆNH ĐỘC LẬP
// =========================================================================
function TOOL_SplitGroupedProductionTasks() {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Production');
    if (!sheet) return { success: false, message: 'Không tìm thấy bảng Production' };
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var idCol = headers.indexOf('id');
    var orderIdCol = headers.indexOf('orderId');
    var noteCol = headers.indexOf('note');
    
    var newRows = [];
    var modifiedCount = 0;
    
    // Duyệt ngược từ dưới lên
    for (var i = data.length - 1; i >= 1; i--) {
      var orderIdRaw = String(data[i][orderIdCol] || '');
      var noteRaw = String(data[i][noteCol] || '');
      
      if (orderIdRaw.indexOf('|') !== -1) {
        var ids = orderIdRaw.split('|').map(function(s) { return s.trim(); }).filter(Boolean);
        if (ids.length > 1) {
          var firstOrderId = ids[0];
          var cleanNote = noteRaw.replace(/\[Gộp đơn:.*?\]/g, '').trim();
          
          sheet.getRange(i + 1, orderIdCol + 1).setValue(firstOrderId);
          sheet.getRange(i + 1, noteCol + 1).setValue(cleanNote);
          modifiedCount++;
          
          for (var j = 1; j < ids.length; j++) {
            var clonedRow = data[i].slice();
            clonedRow[idCol] = 'PROD_SPLIT_' + Date.now() + '_' + i + '_' + j;
            clonedRow[orderIdCol] = ids[j];
            clonedRow[noteCol] = 'Tách từ lệnh gộp gốc';
            newRows.push(clonedRow);
          }
        }
      }
    }
    
    if (newRows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, headers.length).setValues(newRows);
    }
    
    return { 
      success: true, 
      message: 'Đã bung thành công ' + modifiedCount + ' nhóm lệnh thành ' + (modifiedCount + newRows.length) + ' lệnh độc lập.' 
    };
  } catch (err) {
    return { success: false, message: 'Lỗi: ' + err.message };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// 🧹 DỌN DẸP TOÀN BỘ CÁC KHOẢN PHẠT & CẢNH BÁO SLA ĐÓNG GÓI CŨ
// =========================================================================
function api_cleanupAllPackingSlaPenalties(pin) {
  if (!pin) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để thực hiện thao tác!' };
  var auth = validatePin(pin);
  if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  if (!checkServerPermission(auth, 'HR_BONUS_PENALTY')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Bạn không có quyền xóa phạt SLA!' };
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var deletedBpCount = 0;
    var deletedTrackCount = 0;
    
    // 1. Dọn dẹp triệt để trong bảng BonusPenalty
    var bpSheet = ss.getSheetByName('BonusPenalty');
    if (bpSheet) {
      var bpData = bpSheet.getDataRange().getValues();
      var bpHeaders = bpData[0];
      var idCol = bpHeaders.indexOf('id');
      var typeCol = bpHeaders.indexOf('type');
      var noteCol = bpHeaders.indexOf('note');
      
      for (var i = bpData.length - 1; i >= 1; i--) {
        var rowId = String(bpData[i][idCol] || '');
        var rowType = String(bpData[i][typeCol] || '');
        var rowNote = String(bpData[i][noteCol] || '');
        
        var isPackingPenalty = (
          rowId.indexOf('BP_SLA_PACK_') !== -1 ||
          rowId.indexOf('BP_AUTO_SHOPEE_21H_') !== -1 ||
          rowType.indexOf('Cảnh Báo SLA Đóng Gói') !== -1 ||
          rowNote.indexOf('SLA Đóng Gói') !== -1 ||
          rowNote.indexOf('Shopee VN chưa đóng gói') !== -1 ||
          rowNote.indexOf('đơn hàng sẵn sàng đóng gói chưa xử lý') !== -1 ||
          rowNote.indexOf('Tự động phạt sau 21:00') !== -1
        );
        if (isPackingPenalty) {
          bpSheet.deleteRow(i + 1);
          deletedBpCount++;
        }
      }
    }

    // 2. Dọn dẹp trong bảng Tracking_Log (Combat Log)
    var trackSheet = ss.getSheetByName('Tracking_Log');
    if (trackSheet) {
      var trackData = trackSheet.getDataRange().getValues();
      var tHeaders = trackData[0];
      var actionCol = tHeaders.indexOf('Hoàn thành');
      var aiCol = tHeaders.indexOf('Hỏi AI');

      for (var t = trackData.length - 1; t >= 1; t--) {
        var aText = String(trackData[t][actionCol] || '');
        var aiText = String(trackData[t][aiCol] || '');

        var isTrackPacking = (
          aText.indexOf('SLA Đóng Gói') !== -1 ||
          aText.indexOf('phạt Shopee 21:00') !== -1 ||
          aiText.indexOf('chưa đóng gói') !== -1 ||
          aiText.indexOf('Đã tự động phạt Diệu Hương') !== -1 ||
          aiText.indexOf('SLA đóng gói') !== -1
        );
        if (isTrackPacking) {
          trackSheet.deleteRow(t + 1);
          deletedTrackCount++;
        }
      }
    }

    Logger.log(`🧹 Đã xóa sạch ${deletedBpCount} dòng phạt trong BonusPenalty và ${deletedTrackCount} dòng log trong Tracking_Log.`);
    return {
      success: true,
      message: `Đã xóa sạch thành công ${deletedBpCount} dòng phạt trong BonusPenalty và ${deletedTrackCount} dòng log trong Tracking_Log.`
    };
  } catch (e) {
    Logger.log('Lỗi dọn dẹp phạt SLA Đóng Gói: ' + e.message);
    return { success: false, message: 'Lỗi: ' + e.message };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// 🚨 TỰ ĐỘNG XỬ LÝ ĐƠN HOÀN QUÁ HẠN 72H (SLA 72H) — XUẤT HUỶ & PHẠT GIÁ VỐN HƯƠNG
// =========================================================================
/**
 * Quét toàn bộ đơn Hàng Hoàn trong bảng Orders:
 * Nếu quá 72 giờ chưa xử lý / đối soát:
 * 1. Chuyển status -> 'Hoàn Thành' (Đã đối soát xong)
 * 2. Đánh dấu isReconciled = true
 * 3. Ghi nhận Xuất Huỷ trong ImportExport
 * 4. Phạt đúng 100% Giá Vốn (COGS) vào BonusPenalty cho Nguyễn Thị Diệu Hương
 * 5. Ghi log vào Tracking_Log
 */
function api_auditOverdueReturnOrdersSLA(ss) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    ss = ss || SpreadsheetApp.getActiveSpreadsheet();
    var now = new Date();
    var todayStr = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd");
    var timestamp = Utilities.formatDate(now, "GMT+7", "yyyy-MM-dd HH:mm:ss");

    var orderSheet = ss.getSheetByName('Orders');
    if (!orderSheet) return { success: false, message: 'Không tìm thấy bảng Orders' };
    
    var oData = orderSheet.getDataRange().getValues();
    var oHeaders = oData[0];
    
    var idCol = oHeaders.indexOf('id');
    var oCdCol = oHeaders.indexOf('orderCode');
    var stCol = oHeaders.indexOf('status');
    var recCol = oHeaders.indexOf('isReconciled');
    var recAtCol = oHeaders.indexOf('reconciledAt');
    var dtCol = oHeaders.indexOf('createdAt') !== -1 ? oHeaders.indexOf('createdAt') : oHeaders.indexOf('date');
    var noteCol = oHeaders.indexOf('note');
    var cogsCol = oHeaders.indexOf('cogs');
    var revCol = oHeaders.indexOf('revenue');
    var costTotCol = oHeaders.indexOf('costTotal');

    var staffName = 'Nguyễn Thị Diệu Hương';
    var overdueOrders = [];
    var bpRowsToAppend = [];
    var ieRowsToAppend = [];
    var trackRowsToAppend = [];

    // Duyệt qua các đơn hàng
    for (var i = 1; i < oData.length; i++) {
      var row = oData[i];
      var rawStatus = String(row[stCol] || '').toUpperCase().trim();
      var isReconciled = row[recCol] === true || String(row[recCol]).toUpperCase() === 'TRUE';
      
      var isReturn = (rawStatus === 'HÀNG HOÀN' || rawStatus.indexOf('HOÀN CHỜ XỬ') !== -1 || rawStatus.indexOf('KIỂM HÀNG HOÀN') !== -1) && !isReconciled;
      if (!isReturn) continue;

      // Xác định thời gian nhận hoàn / tạo đơn
      var returnTimeRaw = row[recAtCol] || row[dtCol];
      if (!returnTimeRaw) continue;

      var returnDate = new Date(returnTimeRaw);
      if (isNaN(returnDate.getTime())) continue;

      var hoursPassed = (now.getTime() - returnDate.getTime()) / (1000 * 60 * 60);
      if (hoursPassed >= 72) {
        var orderId = String(row[idCol]);
        var orderCode = String(row[oCdCol] || orderId);
        
        // Tính giá vốn COGS
        var cogs = Number(row[cogsCol]) || Number(row[costTotCol]) || Math.round((Number(row[revCol]) || 0) * 0.5);
        if (cogs <= 0) cogs = 150000;

        // Cập nhật trạng thái đơn trên Sheet
        orderSheet.getRange(i + 1, stCol + 1).setValue('Hoàn Thành');
        if (recCol !== -1) orderSheet.getRange(i + 1, recCol + 1).setValue(true);
        if (recAtCol !== -1) orderSheet.getRange(i + 1, recAtCol + 1).setValue(timestamp);
        
        var oldNote = String(row[noteCol] || '');
        var newNote = '[XUẤT HUỶ - QUÁ HẠN 72H - TRỪ GIÁ VỐN HƯƠNG: -' + cogs.toLocaleString('vi-VN') + 'đ] ' + oldNote;
        if (noteCol !== -1) orderSheet.getRange(i + 1, noteCol + 1).setValue(newNote);

        overdueOrders.push({
          id: orderId,
          orderCode: orderCode,
          cogs: cogs,
          hoursPassed: Math.round(hoursPassed)
        });

        // Tạo bản ghi phạt BonusPenalty
        var bpId = 'BP_OVERDUE_72H_' + orderCode + '_' + todayStr;
        bpRowsToAppend.push([
          bpId,
          staffName,
          -Math.abs(cogs),
          'Phạt Vi Phạm',
          '[PHẠT SLA 72H] Quá hạn 72h không khiếu nại/xử lý đơn hoàn #' + orderCode + ' - Trừ 100% Giá Vốn (COGS)',
          todayStr,
          orderCode
        ]);

        // Tạo bản ghi xuất huỷ ImportExport
        var ieId = 'IE_SCRAP_72H_' + Date.now() + '_' + i;
        ieRowsToAppend.push([
          ieId,
          'Xuất Huỷ',
          'Xuất Huỷ Hàng Hoàn Quá 72H',
          cogs,
          timestamp,
          'Xuất huỷ do quá hạn khiếu nại 72h - Đơn #' + orderCode + ' - Trách nhiệm: Nguyễn Thị Diệu Hương',
          JSON.stringify([{ name: 'Hàng hoàn đơn ' + orderCode, qty: 1, price: cogs }])
        ]);

        // Ghi log Tracking_Log
        trackRowsToAppend.push([
          timestamp,
          staffName,
          'Tự động xuất huỷ & Phạt Giá Vốn quá hạn 72H (-' + cogs.toLocaleString('vi-VN') + 'đ)',
          'Đơn #' + orderCode + ' quá 72h chưa xử lý (đã trôi ' + Math.round(hoursPassed) + 'h). Tự động duyệt hoàn thành, xuất huỷ kho và phạt giá vốn Diệu Hương.',
          'Mã đơn: ' + orderCode + ' | COGS: ' + cogs
        ]);
      }
    }

    // Ghi hàng loạt (Batch append)
    if (bpRowsToAppend.length > 0) {
      var bpSheet = ss.getSheetByName('BonusPenalty');
      if (bpSheet) {
        var bpHeaders = bpSheet.getDataRange().getValues()[0];
        var mappedBpRows = bpRowsToAppend.map(function(r) {
          return bpHeaders.map(function(h) {
            if (h === 'id') return r[0];
            if (h === 'user') return r[1];
            if (h === 'amount') return r[2];
            if (h === 'type') return r[3];
            if (h === 'note') return r[4];
            if (h === 'date') return r[5];
            if (h === 'orderCode') return r[6];
            return '';
          });
        });
        bpSheet.getRange(bpSheet.getLastRow() + 1, 1, mappedBpRows.length, bpHeaders.length).setValues(mappedBpRows);
      }
    }

    if (ieRowsToAppend.length > 0) {
      var ieSheet = ss.getSheetByName('ImportExport');
      if (ieSheet) {
        var ieHeaders = ieSheet.getDataRange().getValues()[0];
        var mappedIeRows = ieRowsToAppend.map(function(r) {
          return ieHeaders.map(function(h) {
            if (h === 'id') return r[0];
            if (h === 'type') return r[1];
            if (h === 'target') return r[2];
            if (h === 'totalAmount') return r[3];
            if (h === 'date') return r[4];
            if (h === 'note') return r[5];
            if (h === 'itemsData') return r[6];
            return '';
          });
        });
        ieSheet.getRange(ieSheet.getLastRow() + 1, 1, mappedIeRows.length, ieHeaders.length).setValues(mappedIeRows);
      }
    }

    if (trackRowsToAppend.length > 0) {
      var trackSheet = ss.getSheetByName('Tracking_Log');
      if (trackSheet) {
        var trackHeaders = trackSheet.getDataRange().getValues()[0];
        var mappedTrackRows = trackRowsToAppend.map(function(r) {
          return trackHeaders.map(function(h) {
            if (h === 'Thời gian') return r[0];
            if (h === 'Tên nhân sự') return r[1];
            if (h === 'Hoàn thành') return r[2];
            if (h === 'Hỏi AI') return r[3];
            if (h === 'Ghi chú thêm') return r[4];
            return '';
          });
        });
        trackSheet.getRange(trackSheet.getLastRow() + 1, 1, mappedTrackRows.length, trackHeaders.length).setValues(mappedTrackRows);
      }
    }

    if (overdueOrders.length > 0) {
      try {
        var msg = '🚨 Đã tự động xử lý ' + overdueOrders.length + ' đơn hoàn quá hạn 72h khiếu nại sàn:\n' +
                  overdueOrders.map(function(o, idx) {
                    return (idx + 1) + '. Đơn ' + o.orderCode + ' (' + o.channel + ') - Giá vốn: ' + (Number(o.cogs) || 0).toLocaleString('vi-VN') + 'đ';
                  }).join('\n') + '\n👉 Đã xuất huỷ kho & ghi nhận trừ giá vốn nhân sự phụ trách.';
        sendSystemAlert('CẢNH BÁO HÀNG HOÀN 72H', msg);
      } catch (notifErr) { console.error('Lỗi bắn thông báo hoàn 72h:', notifErr); }
    }

    return {
      success: true,
      processedCount: overdueOrders.length,
      orders: overdueOrders,
      message: 'Đã tự động xử lý ' + overdueOrders.length + ' đơn hoàn quá hạn 72h!'
    };
  } catch (err) {
    return { success: false, message: 'Lỗi kiểm tra đơn hoàn 72h: ' + err.message };
  } finally {
    lock.releaseLock();
  }
}

// =========================================================================
// MODULE: ZALO GROUP NOTIFICATION WEBHOOK
// =========================================================================

function api_saveZaloWebhookConfig(cfg, pin) {
  var pinToAuth = pin || (cfg && cfg.pin);
  if (!pinToAuth) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để thực hiện thao tác!' };
  var auth = validatePin(pinToAuth);
  if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  if (!checkServerPermission(auth, 'SYSTEM_CONFIG')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Boss Tối Cao mới được sửa cấu hình Zalo Bot!' };
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var props = PropertiesService.getScriptProperties();
    if (cfg && cfg.botToken !== undefined) props.setProperty('ZALO_BOT_TOKEN', String(cfg.botToken).trim());
    if (cfg && cfg.chatId !== undefined) props.setProperty('ZALO_CHAT_ID', String(cfg.chatId).trim());
    if (cfg && cfg.webhookUrl !== undefined) props.setProperty('ZALO_WEBHOOK_URL', String(cfg.webhookUrl).trim());
    if (cfg && cfg.isEnabled !== undefined) props.setProperty('ZALO_NOTIF_ENABLED', String(cfg.isEnabled));
    if (cfg && cfg.groupName !== undefined) props.setProperty('ZALO_GROUP_NAME', String(cfg.groupName).trim());
    return { success: true, message: 'Đã lưu cấu hình Zalo Bot thành công!' };
  } catch (e) {
    return { success: false, message: 'Lỗi lưu cấu hình: ' + e.message };
  } finally {
    lock.releaseLock();
  }
}

function api_getZaloWebhookConfig() {
  try {
    var props = PropertiesService.getScriptProperties().getProperties();
    return {
      success: true,
      botToken: props['ZALO_BOT_TOKEN'] || '',
      chatId: props['ZALO_CHAT_ID'] || '',
      webhookUrl: props['ZALO_WEBHOOK_URL'] || '',
      isEnabled: props['ZALO_NOTIF_ENABLED'] !== 'false',
      groupName: props['ZALO_GROUP_NAME'] || 'Xưởng Rich Fish'
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function sendZaloNotification(title, message, customChatId) {
  try {
    var props = PropertiesService.getScriptProperties();
    var botToken = props.getProperty('ZALO_BOT_TOKEN') || '';
    var webhookUrl = props.getProperty('ZALO_WEBHOOK_URL') || '';
    var isEnabled = props.getProperty('ZALO_NOTIF_ENABLED');
    var defaultChatId = props.getProperty('ZALO_CHAT_ID') || props.getProperty('ZALO_GROUP_ID') || '';
    var chatId = customChatId || defaultChatId;
    
    if (isEnabled === 'false') {
      return { success: false, reason: 'Đang tắt thông báo Zalo' };
    }
    
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm dd/MM/yyyy");
    var fullContent = '🔔 【' + (title || 'RF WORKSPACE PRO') + '】\n' +
                      '⏰ ' + timeStr + '\n' +
                      '-------------------------\n' +
                      message;
    
    var finalUrl = webhookUrl.trim();
    if (botToken) {
      finalUrl = 'https://bot-api.zaloplatforms.com/bot' + botToken.trim() + '/sendMessage';
    } else if (finalUrl.indexOf('zaloplatforms.com') !== -1) {
      if (finalUrl.indexOf('/setWebhook') !== -1) {
        finalUrl = finalUrl.replace('/setWebhook', '/sendMessage');
      } else if (!finalUrl.endsWith('/sendMessage')) {
        finalUrl = finalUrl.replace(/\/+$/, '') + '/sendMessage';
      }
    }
    
    if (!finalUrl) {
      return { success: false, reason: 'Chưa cấu hình Zalo Bot Token hoặc Webhook URL' };
    }
    
    var payload = {
      chat_id: chatId,
      group_id: chatId,
      text: fullContent,
      message: fullContent
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var res = UrlFetchApp.fetch(finalUrl, options);
    var resText = res.getContentText();
    console.log('Zalo API Response:', resText);
    return { success: true, response: resText };
  } catch (e) {
    console.error('Lỗi sendZaloNotification:', e);
    return { success: false, error: e.toString() };
  }
}

function api_testZaloNotification() {
  return sendZaloNotification('TEST KẾT NỐI ZALO BOT', '✅ Kết nối thành công! Hệ điều hành RF_Workspace_Pro đã sẵn sàng bắn thông báo tự động vào nhóm Zalo xưởng.');
}

// =========================================================================
// MODULE: TELEGRAM BOT NOTIFICATION (MIỄN PHÍ 100% VĨNH VIỄN)
// =========================================================================

function api_saveTelegramConfig(cfg, pin) {
  var pinToAuth = pin || (cfg && cfg.pin);
  if (!pinToAuth) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để thực hiện thao tác!' };
  var auth = validatePin(pinToAuth);
  if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  if (!checkServerPermission(auth, 'SYSTEM_CONFIG')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Boss Tối Cao mới được sửa cấu hình Telegram Bot!' };
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var props = PropertiesService.getScriptProperties();
    if (cfg && cfg.botToken !== undefined) props.setProperty('TELEGRAM_BOT_TOKEN', String(cfg.botToken).trim());
    if (cfg && cfg.chatId !== undefined) props.setProperty('TELEGRAM_CHAT_ID', String(cfg.chatId).trim());
    if (cfg && cfg.isEnabled !== undefined) props.setProperty('TELEGRAM_NOTIF_ENABLED', String(cfg.isEnabled));
    return { success: true, message: 'Đã lưu cấu hình Telegram Bot thành công!' };
  } catch (e) {
    return { success: false, message: 'Lỗi lưu cấu hình Telegram: ' + e.message };
  } finally {
    lock.releaseLock();
  }
}

function api_getTelegramConfig() {
  try {
    var props = PropertiesService.getScriptProperties().getProperties();
    return {
      success: true,
      botToken: props['TELEGRAM_BOT_TOKEN'] || '',
      chatId: props['TELEGRAM_CHAT_ID'] || '',
      isEnabled: props['TELEGRAM_NOTIF_ENABLED'] !== 'false'
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function sendTelegramNotification(title, message, customChatId) {
  try {
    var props = PropertiesService.getScriptProperties();
    var botToken = props.getProperty('TELEGRAM_BOT_TOKEN') || '';
    var defaultChatId = props.getProperty('TELEGRAM_CHAT_ID') || '';
    var isEnabled = props.getProperty('TELEGRAM_NOTIF_ENABLED');
    var chatId = customChatId || defaultChatId;
    
    if (isEnabled === 'false') {
      return { success: false, reason: 'Đang tắt thông báo Telegram' };
    }
    
    if (!botToken || !chatId) {
      return { success: false, reason: 'Chưa cấu hình Telegram Bot Token hoặc Chat ID' };
    }
    
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm dd/MM/yyyy");
    var fullContent = '🔔 *' + (title || 'RF WORKSPACE PRO') + '*\n' +
                      '⏰ `' + timeStr + '`\n' +
                      '━━━━━━━━━━━━━━━━━━━\n' +
                      message;
    
    var url = 'https://api.telegram.org/bot' + botToken.trim() + '/sendMessage';
    var payload = {
      chat_id: chatId,
      text: fullContent,
      parse_mode: 'Markdown'
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var res = UrlFetchApp.fetch(url, options);
    var resText = res.getContentText();
    console.log('Telegram API Response:', resText);
    return { success: true, response: resText };
  } catch (e) {
    console.error('Lỗi sendTelegramNotification:', e);
    return { success: false, error: e.toString() };
  }
}

function api_testTelegramNotification() {
  return sendTelegramNotification('TEST KẾT NỐI TELEGRAM BOT', '✅ *Kết nối thành công!*\nHệ điều hành `RF_Workspace_Pro` đã sẵn sàng bắn thông báo tự động vào nhóm của bạn.');
}

// =========================================================================
// MODULE: GOOGLE CHAT SPACE WEBHOOK (MIỄN PHÍ 100% TRONG GMAIL/GOOGLE CHAT)
// =========================================================================

function api_saveGoogleChatConfig(cfg, pin) {
  var pinToAuth = pin || (cfg && cfg.pin);
  if (!pinToAuth) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để thực hiện thao tác!' };
  var auth = validatePin(pinToAuth);
  if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  if (!checkServerPermission(auth, 'SYSTEM_CONFIG')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Boss Tối Cao mới được sửa cấu hình Google Chat!' };
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var props = PropertiesService.getScriptProperties();
    if (cfg && cfg.webhookUrl !== undefined) props.setProperty('GOOGLE_CHAT_WEBHOOK_URL', String(cfg.webhookUrl).trim());
    if (cfg && cfg.isEnabled !== undefined) props.setProperty('GOOGLE_CHAT_NOTIF_ENABLED', String(cfg.isEnabled));
    return { success: true, message: 'Đã lưu cấu hình Google Chat Webhook thành công!' };
  } catch (e) {
    return { success: false, message: 'Lỗi lưu cấu hình Google Chat: ' + e.message };
  } finally {
    lock.releaseLock();
  }
}

function api_getGoogleChatConfig() {
  try {
    var props = PropertiesService.getScriptProperties().getProperties();
    return {
      success: true,
      webhookUrl: props['GOOGLE_CHAT_WEBHOOK_URL'] || '',
      isEnabled: props['GOOGLE_CHAT_NOTIF_ENABLED'] !== 'false'
    };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function sendGoogleChatNotification(title, message) {
  try {
    var props = PropertiesService.getScriptProperties();
    var webhookUrl = props.getProperty('GOOGLE_CHAT_WEBHOOK_URL') || '';
    var isEnabled = props.getProperty('GOOGLE_CHAT_NOTIF_ENABLED');
    
    if (isEnabled === 'false') {
      return { success: false, reason: 'Đang tắt thông báo Google Chat' };
    }
    
    if (!webhookUrl) {
      return { success: false, reason: 'Chưa cấu hình Google Chat Webhook URL' };
    }
    
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm dd/MM/yyyy");
    var fullContent = '🔔 *【' + (title || 'RF WORKSPACE PRO') + '】*\n' +
                      '⏰ `' + timeStr + '`\n' +
                      '━━━━━━━━━━━━━━━━━━━\n' +
                      message;
    
    var payload = {
      text: fullContent
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json; charset=UTF-8',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var res = UrlFetchApp.fetch(webhookUrl, options);
    var resText = res.getContentText();
    console.log('Google Chat API Response:', resText);
    return { success: true, response: resText };
  } catch (e) {
    console.error('Lỗi sendGoogleChatNotification:', e);
    return { success: false, error: e.toString() };
  }
}

function api_testGoogleChatNotification() {
  return sendGoogleChatNotification('TEST KẾT NỐI GOOGLE CHAT', '✅ *Kết nối thành công!*\nHệ điều hành `RF_Workspace_Pro` đã sẵn sàng bắn thông báo tự động vào Không Gian Google Chat của xưởng.');
}

// =========================================================================
// MODULE: NTFY.SH PUSH NOTIFICATION (MIỄN PHÍ 100%, KHÔNG CẦN TÀI KHOẢN)
// =========================================================================

// sendNtfyNotification được định nghĩa duy nhất và quản lý tại Code.js

function api_testNtfyNotification(topic) {
  return sendNtfyNotification('TEST THÔNG BÁO RF WORKSPACE', '✅ Kết nối thành công! Thiết bị của bạn đã sẵn sàng nhận thông báo đơn hàng và sản xuất tức thì.', topic);
}

/**
 * ⏰ LỊCH BÁO THỨC VÀO CA & LỜI CHÚC CHỦ NHẬT (CLOUD TIER)
 * - Thứ 2 đến Thứ 7 (07:45): Báo thức giục thợ vào ca kẻo trễ chấm công (Priority: 5)
 * - Chủ Nhật (08:30): Chúc ngày nghỉ ấm áp bên gia đình, anh Tiến túc trực xưởng (Priority: 3)
 * Cài đặt Time-driven Trigger chạy hàng ngày lúc 7:00 - 8:00 AM (hoặc 7:00 AM)
 */
function trigger_dailyMorningNotice() {
  var now = new Date();
  var dayOfWeek = now.getDay(); // 0: Chủ Nhật, 1-6: Thứ 2 đến Thứ 7

  var props = PropertiesService.getScriptProperties();
  var targetTopic = (props.getProperty('NTFY_TOPIC') || 'rfworkspace').trim();

  var title = "";
  var message = "";
  var priority = 3;
  var tags = [];

  if (dayOfWeek === 0) {
    // CHỦ NHẬT: Lời chúc ngày nghỉ
    title = "☕ CHÚC CUỐI TUẦN VUI VẺ - RICHFISH AQUARIUM";
    message = "🌿 Chúc toàn thể anh em có một ngày Chủ Nhật nghỉ ngơi thật vui vẻ, trọn vẹn và nạp đầy năng lượng bên gia đình! Cứ an tâm tận hưởng nhé, anh Tiến vẫn đang miệt mài làm việc tại xưởng để giữ nhịp cho cả tuần tới!";
    priority = 3;
    tags = ["sparkles", "coffee", "heart", "fish"];
  } else {
    // THỨ 2 ĐẾN THỨ 7: Báo thức vào ca 07:45
    title = "⏰ 07:45 RỒI ANH EM ƠI! VÀO CA SÁNG NGAY NÀO!";
    message = "🚨 Đã 07:45 sáng rồi! Dậy rửa mặt, kiểm tra đồ nghề và bấm chấm công ngay kẻo chạm mốc 08:15 là dính phạt chuyên cần đấy nhé. Đeo găng tay chống cắt, giữ an toàn và bắt tay vào việc thôi anh em!";
    priority = 5; // Cấp độ 5: Ghi đè chế độ im lặng, rung chuông to dồn dập
    tags = ["alarm_clock", "warning", "hammer_and_wrench"];
  }

  var payload = {
    topic: targetTopic,
    title: title,
    message: message,
    priority: priority,
    tags: tags,
    click: "https://webapp-script.vercel.app"
  };

  try {
    var res = UrlFetchApp.fetch("https://ntfy.sh", {
      method: "post",
      contentType: "application/json; charset=UTF-8",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    console.log("Daily morning notice response:", res.getContentText());
    return { success: true, topic: targetTopic, title: title, message: message };
  } catch (e) {
    console.error("Lỗi trigger_dailyMorningNotice:", e);
    return { success: false, error: e.toString() };
  }
}

// Giữ alias tương thích
function trigger_morningWakeUpCall() {
  return trigger_dailyMorningNotice();
}

function api_testMorningWakeUpCall() {
  return trigger_dailyMorningNotice();
}

// api_saveNtfyConfig và api_getNtfyConfig được quản lý duy nhất và bảo vệ phân quyền tại Code.js

// =========================================================================
// MODULE: DISCORD WEBHOOK (MIỄN PHÍ 100% TRỌN ĐỜI)
// =========================================================================

function sendDiscordNotification(title, message, customUrl) {
  try {
    var props = PropertiesService.getScriptProperties();
    var webhookUrl = customUrl || props.getProperty('DISCORD_WEBHOOK_URL') || '';
    
    if (!webhookUrl) {
      return { success: false, reason: 'Chưa cấu hình Discord Webhook URL' };
    }
    
    var timeStr = Utilities.formatDate(new Date(), "GMT+7", "HH:mm dd/MM/yyyy");
    var payload = {
      username: "Rich Fish Workspace",
      avatar_url: "https://i.postimg.cc/TYD5NncZ/icon.png",
      embeds: [
        {
          title: "🔔 " + (title || "RF WORKSPACE PRO"),
          description: message,
          color: 13938487, // Gold #d4af37
          footer: { text: "Rich Fish Aquarium • " + timeStr }
        }
      ]
    };
    
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var res = UrlFetchApp.fetch(webhookUrl, options);
    return { success: true, response: res.getContentText() };
  } catch (e) {
    console.error('Lỗi sendDiscordNotification:', e);
    return { success: false, error: e.toString() };
  }
}

function api_testDiscordNotification(webhookUrl) {
  return sendDiscordNotification('TEST KẾT NỐI DISCORD', '✅ **Kết nối thành công!**\nHệ điều hành `RF_Workspace_Pro` đã sẵn sàng bắn thông báo tự động vào Server Discord của xưởng.', webhookUrl);
}

/**
 * Hàm bắn thông báo tổng hợp (Đa kênh: ntfy, Discord, Google Chat, Telegram, Zalo)
 */
function sendSystemAlert(title, message) {
  var results = {};
  try { results.ntfy = sendNtfyNotification(title, message); } catch (e) { results.ntfy = { success: false, error: e.toString() }; }
  try { results.discord = sendDiscordNotification(title, message); } catch (e) { results.discord = { success: false, error: e.toString() }; }
  try { results.googleChat = sendGoogleChatNotification(title, message); } catch (e) { results.googleChat = { success: false, error: e.toString() }; }
  try { results.telegram = sendTelegramNotification(title, message); } catch (e) { results.telegram = { success: false, error: e.toString() }; }
  try { results.zalo = sendZaloNotification(title, message); } catch (e) { results.zalo = { success: false, error: e.toString() }; }
  return results;
}

// =========================================================================
// v2.11 DATA INTEGRITY HEALTH CHECK (Kiểm tra toàn vẹn dữ liệu)
// Quét toàn bộ CSDL, phát hiện anomalies: orphan records, duplicate IDs,
// schema drift, negative inventory, missing references
// =========================================================================
function api_runDataIntegrityCheck() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var issues = [];
    var stats = {};

    // ---------------------------------------------------------------
    // CHECK 1: Orphan Productions (orderId không tồn tại trong Orders)
    // ---------------------------------------------------------------
    var orderIds = {};
    var orderRows = readSheet('Orders', null, ss);
    stats.ordersCount = orderRows.length;
    orderRows.forEach(function (o) { if (o.id) orderIds[String(o.id).trim()] = true; });

    var prodRows = readSheet('Production', null, ss);
    stats.productionCount = prodRows.length;
    var orphanCount = 0;
    prodRows.forEach(function (p) {
      if (p.orderId) {
        var pRaw = String(p.orderId).trim();
        var multipleOrders = pRaw.split('|').map(function (s) { return s.trim(); });
        var matched = false;
        for (var mo = 0; mo < multipleOrders.length; mo++) {
          if (orderIds[multipleOrders[mo]] === true) { matched = true; break; }
        }
        if (!matched) {
          orphanCount++;
          if (orphanCount <= 10) { // Chỉ log 10 đầu tiên để tránh output quá lớn
            issues.push({
              severity: 'WARNING', table: 'Production', id: p.id,
              message: 'Lệnh sản xuất mồ côi — orderId "' + p.orderId + '" không tồn tại trong Orders'
            });
          }
        }
      }
    });
    if (orphanCount > 10) {
      issues.push({ severity: 'WARNING', table: 'Production', message: '... và ' + (orphanCount - 10) + ' lệnh mồ côi khác' });
    }
    stats.orphanProductions = orphanCount;

    // ---------------------------------------------------------------
    // CHECK 2: Duplicate IDs
    // ---------------------------------------------------------------
    ['Orders', 'Production', 'Packings', 'Products'].forEach(function (tableName) {
      var seen = {};
      var dupCount = 0;
      readSheet(tableName, null, ss).forEach(function (row) {
        if (row.id && seen[row.id]) {
          dupCount++;
          if (dupCount <= 3) {
            issues.push({ severity: 'ERROR', table: tableName, id: row.id, message: 'ID trùng lặp' });
          }
        }
        if (row.id) seen[row.id] = true;
      });
      if (dupCount > 3) {
        issues.push({ severity: 'ERROR', table: tableName, message: '... và ' + (dupCount - 3) + ' ID trùng khác' });
      }
      stats['dup_' + tableName] = dupCount;
    });

    // ---------------------------------------------------------------
    // CHECK 3: Schema drift (cột thực tế vs SCHEMA definition)
    // ---------------------------------------------------------------
    var allSchemas = {};
    if (typeof SCHEMA !== 'undefined') { Object.keys(SCHEMA).forEach(function (k) { allSchemas[k] = SCHEMA[k]; }); }
    if (typeof SCHEMA_ERP !== 'undefined') { Object.keys(SCHEMA_ERP).forEach(function (k) { allSchemas[k] = SCHEMA_ERP[k]; }); }

    var missingSheets = [];
    var missingCols = 0;
    Object.keys(allSchemas).forEach(function (sheetName) {
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        missingSheets.push(sheetName);
        issues.push({ severity: 'ERROR', table: sheetName, message: 'Sheet không tồn tại!' });
        return;
      }
      var lastCol = sheet.getLastColumn();
      if (lastCol === 0) return;
      var actualHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
        .map(function (h) { return String(h).trim(); })
        .filter(function (h) { return h.length > 0; });
      var expectedHeaders = allSchemas[sheetName];
      expectedHeaders.forEach(function (col) {
        if (actualHeaders.indexOf(col) === -1) {
          missingCols++;
          issues.push({
            severity: 'WARNING', table: sheetName,
            message: 'Thiếu cột "' + col + '" theo schema definition'
          });
        }
      });
    });
    stats.missingSheets = missingSheets.length;
    stats.missingColumns = missingCols;

    // ---------------------------------------------------------------
    // CHECK 4: Negative Product quantities (tồn kho âm)
    // ---------------------------------------------------------------
    var negativeSkus = [];
    readSheet('Products', null, ss).forEach(function (p) {
      var qty = Number(p.quantity);
      if (!isNaN(qty) && qty < 0) {
        negativeSkus.push(p.sku || p.id);
        issues.push({
          severity: 'ERROR', table: 'Products', id: p.id,
          message: 'SKU "' + (p.sku || 'N/A') + '" có tồn kho ÂM: ' + p.quantity
        });
      }
    });
    stats.negativeInventory = negativeSkus.length;

    // ---------------------------------------------------------------
    // CHECK 5: Kích thước bảng (cảnh báo khi cần Archive)
    // ---------------------------------------------------------------
    ['Orders', 'Production', 'Packings', 'Attendance', 'BonusPenalty', 'Transactions'].forEach(function (tableName) {
      var sheet = ss.getSheetByName(tableName);
      if (sheet) {
        var rowCount = sheet.getLastRow();
        stats['rows_' + tableName] = rowCount;
        if (rowCount > 5000) {
          issues.push({
            severity: 'WARNING', table: tableName,
            message: 'Bảng có ' + rowCount + ' dòng — nên chạy Archive để tối ưu hiệu năng'
          });
        }
      }
    });

    return {
      success: true,
      totalIssues: issues.length,
      errors: issues.filter(function (i) { return i.severity === 'ERROR'; }),
      warnings: issues.filter(function (i) { return i.severity === 'WARNING'; }),
      stats: stats,
      timestamp: Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss')
    };
  } catch (e) {
    return { success: false, message: 'Lỗi Health Check: ' + e.toString() };
  }
}

// =========================================================================
// v2.11 NIGHTLY AUTO-ARCHIVE TRIGGER
// Tự động chuyển đơn đã đối soát >60 ngày sang Orders_Archive lúc 2:00 AM
// =========================================================================
/**
 * Thiết lập Trigger tự động chạy hàng đêm.
 * Gọi 1 lần duy nhất để cài đặt, sau đó hệ thống tự chạy.
 */
function setupNightlyArchiveTrigger() {
  // Xóa trigger cũ nếu có (tránh duplicate)
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (t) {
    if (t.getHandlerFunction() === 'nightlyAutoArchive') {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger('nightlyAutoArchive')
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .inTimezone('Asia/Ho_Chi_Minh')
    .create();

  return { success: true, message: 'Đã cài đặt Trigger Auto-Archive hàng đêm lúc 2:00 AM (GMT+7).' };
}

/**
 * Hàm được gọi bởi Trigger tự động mỗi đêm (02:00 AM).
 * Thực hiện logic archive trực tiếp với quyền SYSTEM.
 */
function nightlyAutoArchive() {
  try {
    Logger.log('🚀 [Auto-Archive Engine] Bắt đầu quét lưu trữ đơn hàng cũ > 60 ngày...');
    var res = typeof archiveReconciledOrdersInternal_ === 'function' 
      ? archiveReconciledOrdersInternal_(60, 'SYSTEM_TRIGGER') 
      : archiveReconciledOrders(60, 'SYSTEM');
    Logger.log('🗄️ [Auto-Archive Engine] Kết quả: ' + JSON.stringify(res));

    if (res && res.success && res.movedCount > 0) {
      try {
        if (typeof sendSystemAlert === 'function') {
          sendSystemAlert(
            '🗄️ Auto-Archive Đêm Thành Công',
            'Đã tự động lưu trữ ' + res.movedCount + ' đơn hàng cũ (>60 ngày) vào Orders_Archive.\nOrders chính còn lại: ' + (res.remainingOrders || 'tối ưu') + ' dòng.'
          );
        }
      } catch (notifErr) {
        Logger.log('Auto-Archive: Lỗi gửi thông báo: ' + notifErr.toString());
      }
    }
    return res;
  } catch (e) {
    Logger.log('Auto-Archive Error: ' + e.toString());
    return { success: false, error: e.toString() };
  }
}

// =========================================================================
// MODULE: SKU STANDARDIZATION & WAREHOUSE RELATIONAL SYNC ENGINE
// Chuẩn hóa toàn bộ SKU theo Category & Sub-Category và đồng bộ liên kết CSDL
// =========================================================================

/**
 * Loại bỏ dấu tiếng Việt và chuẩn hóa Unicode NFC
 * @param {string} str
 * @returns {string}
 */
function _removeVietnameseTones(str) {
  if (!str) return '';
  var s = String(str).trim();
  s = s.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/gi, 'a');
  s = s.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/gi, 'e');
  s = s.replace(/ì|í|ị|ỉ|ĩ/gi, 'i');
  s = s.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/gi, 'o');
  s = s.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/gi, 'u');
  s = s.replace(/ỳ|ý|ỵ|ỷ|ỹ/gi, 'y');
  s = s.replace(/đ/gi, 'd');
  try {
    s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (e) {
    // Fallback nếu môi trường không hỗ trợ normalize
  }
  return s;
}

/**
 * Làm sạch chuỗi thành định dạng Slug SKU viết hoa, phân cách bằng dấu gạch ngang
 * @param {string} str
 * @returns {string}
 */
function _sanitizeSkuSlug(str) {
  if (!str) return '';
  var noTone = _removeVietnameseTones(str).toUpperCase();
  var cleaned = noTone.replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return cleaned;
}

/**
 * Bóc tách kích thước 3 chiều D x R x C từ tên sản phẩm hoặc SKU cũ
 * @param {string} str
 * @returns {string|null} Chuỗi 6 chữ số (VD: '302020') hoặc null
 */
function _extractSkuDimensions(str) {
  if (!str) return null;
  var s = String(str);
  // Match D x R x C (VD: 30x20x20, 30*20*20, 30×20×20, 30_20_20)
  var match3 = s.match(/(\d{2,3})\s*[xX*×_]\s*(\d{2,3})\s*[xX*×_]\s*(\d{2,3})/);
  if (match3) {
    return match3[1] + match3[2] + match3[3];
  }
  // Match chuỗi 6 chữ số liền kề biểu thị kích thước trong SKU cũ (VD: 151515, 302020)
  var matchDigits = s.match(/(?:BE|LAY|ND|BC|TERA|BETTA|STD|MINI)?[-_]?(\d{6})\b/i);
  if (matchDigits) {
    return matchDigits[1];
  }
  // Match kích thước 2 chiều (VD: 20x20 -> 202020 nếu hình vuông)
  var match2 = s.match(/(\d{2,3})\s*[xX*×_]\s*(\d{2,3})/);
  if (match2) {
    return match2[1] + match2[2] + (match2[1] === match2[2] ? match2[1] : '00');
  }
  return null;
}

/**
 * Bóc tách số phiên bản Layout (VD: ver 1 -> '001', ver 5 -> '005')
 * @param {string} str
 * @returns {string|null} Chuỗi 3 chữ số (VD: '001') hoặc null
 */
function _extractSkuVersion(str) {
  if (!str) return null;
  var s = String(str);
  var match = s.match(/ver\.?\s*(\d+)/i) || s.match(/\bv(\d+)\b/i) || s.match(/[A-Z]{3}(\d{3})/i);
  if (match) {
    var num = parseInt(match[1], 10);
    if (!isNaN(num)) {
      return ('000' + num).slice(-3);
    }
  }
  return null;
}

/**
 * Bóc tách mã định danh nguyên vật liệu / phụ kiện sau khi loại bỏ prefix danh mục
 * @param {string} name
 * @param {string} oldSku
 * @param {Array<string>} prefixesToRemove
 * @returns {string}
 */
function _extractMaterialSlug(name, oldSku, prefixesToRemove) {
  var candidate = (oldSku || '').trim();
  if (prefixesToRemove && Array.isArray(prefixesToRemove)) {
    for (var p = 0; p < prefixesToRemove.length; p++) {
      var pat = new RegExp('^' + prefixesToRemove[p] + '[-_]?', 'i');
      candidate = candidate.replace(pat, '');
    }
  }
  candidate = candidate.replace(/^(?:SP|PRD|SKU)[-_]?/i, '');
  candidate = _sanitizeSkuSlug(candidate);
  if (candidate && candidate.length >= 2) {
    return candidate;
  }
  return _sanitizeSkuSlug(name);
}

/**
 * Trích xuất các hậu tố biến thể đặc trưng (Độ dày, Siêu trong, Đúc, Giấu keo, Kích cỡ, Dung tích, Công suất...)
 * @param {string} str
 * @returns {string}
 */
function _extractVariantSuffix(str) {
  if (!str) return '';
  var raw = String(str);
  var norm = _removeVietnameseTones(raw).toUpperCase();
  var suffixes = [];

  // 1. Độ dày kính (VD: 4li, 5li, 8li, 10li, 12li, 5mm, 8mm...)
  var thickMatch = norm.match(/\b(\d{1,2})\s*(?:LI|LY|MM)\b/);
  if (thickMatch) {
    suffixes.push(thickMatch[1] + 'LI');
  }

  // 2. Đặc tính kính (Siêu trong, Đúc, Giấu keo, Mài vi tính)
  if (norm.indexOf('SIEU TRONG') > -1 || norm.indexOf('EXTRA CLEAR') > -1 || norm.indexOf('-ST') > -1) {
    suffixes.push('ST');
  } else if (norm.indexOf('DUC') > -1 || norm.indexOf('BE DUC') > -1) {
    suffixes.push('DUC');
  }
  if (norm.indexOf('GIAU KEO') > -1 || norm.indexOf('DAU KEO') > -1 || norm.indexOf('-GK') > -1) {
    suffixes.push('GK');
  }

  // 3. Khối lượng / Dung tích (VD: 500g, 1kg, 2kg, 100ml, 250ml, 500ml, 1L, 1 chai...)
  var weightMatch = norm.match(/\b(\d+(?:\.\d+)?)\s*(KG|G|GR|ML|LIT|L)\b/);
  if (weightMatch) {
    var unit = weightMatch[2] === 'GR' ? 'G' : (weightMatch[2] === 'LIT' ? 'L' : weightMatch[2]);
    suffixes.push(weightMatch[1] + unit);
  } else {
    var packMatch = norm.match(/\b(\d+)\s*(CHAI|VI|CUON|THUNG|GOI|CAN)\b/);
    if (packMatch) {
      suffixes.push(packMatch[1] + packMatch[2]);
    }
  }

  // 4. Kích cỡ Size đơn lẻ (Size S, Size M, Size L, Size XL)
  var sizeMatch = norm.match(/\b(?:SIZE|SZ|CO)\s*[-_]?\s*(XXL|XL|XS|S|M|L)\b/) || norm.match(/[-_\s](XXL|XL|XS|S|M|L)$/);
  if (sizeMatch && !thickMatch) {
    suffixes.push(sizeMatch[1]);
  }

  // 5. Công suất Watt (VD: 5W, 10W, 15W, 20W, 35W...)
  var wattMatch = norm.match(/\b(\d+)\s*W\b/);
  if (wattMatch) {
    suffixes.push(wattMatch[1] + 'W');
  }

  // Khử trùng lặp suffix
  var uniqueSuffixes = [];
  for (var i = 0; i < suffixes.length; i++) {
    if (uniqueSuffixes.indexOf(suffixes[i]) === -1) {
      uniqueSuffixes.push(suffixes[i]);
    }
  }

  return uniqueSuffixes.length > 0 ? '-' + uniqueSuffixes.join('-') : '';
}

/**
 * Sinh mã SKU chuẩn hóa theo quy tắc Cột F (category) và Cột G (sub_category) kèm hậu tố biến thể
 * @param {string} category
 * @param {string} subCategory
 * @param {string} name
 * @param {string} oldSku
 * @returns {string} Mã SKU chuẩn hóa
 */
function _generateStandardSKU(category, subCategory, name, oldSku) {
  var catNorm = _removeVietnameseTones(category || '').toUpperCase().trim();
  var subNorm = _removeVietnameseTones(subCategory || '').toUpperCase().trim();
  var nameNorm = _removeVietnameseTones(name || '').toUpperCase().trim();
  var rawText = ((category || '') + ' ' + (subCategory || '') + ' ' + (name || '') + ' ' + (oldSku || '')).toUpperCase();
  var suffix = _extractVariantSuffix(name + ' ' + oldSku);

  // 1. NHÓM BỂ KÍNH (Cột F = "BỂ KÍNH")
  if (catNorm.indexOf('BE KINH') > -1 || catNorm === 'BE') {
    var dims = _extractSkuDimensions(name) || _extractSkuDimensions(oldSku) || 'STD';
    var prefix = 'BE-STD';
    if (subNorm.indexOf('NANG DAY') > -1 || nameNorm.indexOf('NANG DAY') > -1 || rawText.indexOf('BE-ND') > -1 || rawText.indexOf('ND-') > -1) {
      prefix = 'BE-ND';
    } else if (subNorm.indexOf('BETTA') > -1 || nameNorm.indexOf('BETTA') > -1 || rawText.indexOf('BE-BETTA') > -1) {
      prefix = 'BE-BETTA';
    } else if (subNorm.indexOf('TERA') > -1 || subNorm.indexOf('TERRARIUM') > -1 || nameNorm.indexOf('TERA') > -1 || rawText.indexOf('BE-TERA') > -1) {
      prefix = 'BE-TERA';
    } else if (subNorm.indexOf('BAN CAN') > -1 || nameNorm.indexOf('BAN CAN') > -1 || rawText.indexOf('BE-BC') > -1) {
      prefix = 'BE-BC';
    } else if (subNorm.indexOf('DUC') > -1 || nameNorm.indexOf('BE DUC') > -1) {
      prefix = 'BE-DUC';
    } else if (subNorm.indexOf('MINI') > -1 || nameNorm.indexOf('MINI') > -1) {
      prefix = 'BE-MINI';
    } else {
      if (dims && dims.length === 6) {
        var d = parseInt(dims.substring(0, 2), 10);
        var r = parseInt(dims.substring(2, 4), 10);
        if (d <= 20 && r <= 20) prefix = 'BE-MINI';
        else prefix = 'BE-STD';
      } else {
        prefix = 'BE-MINI';
      }
    }
    return prefix + '-' + dims + suffix;
  }

  // 2. NHÓM THÀNH PHẨM LAYOUT (Cột F = "LAYOUT")
  if (catNorm.indexOf('LAYOUT') > -1) {
    var code = 'STD';
    if (subNorm.indexOf('COVER') > -1 || nameNorm.indexOf('COVER') > -1 || rawText.indexOf('LAY-CV') > -1) code = 'CV';
    else if (subNorm.indexOf('BONSAI') > -1 || nameNorm.indexOf('BONSAI') > -1 || rawText.indexOf('BON') > -1) code = 'BON';
    else if (subNorm.indexOf('RUNG') > -1 || nameNorm.indexOf('RUNG') > -1 || rawText.indexOf('RUN') > -1) code = 'RUN';
    else if (subNorm.indexOf('CAU VONG') > -1 || nameNorm.indexOf('CAU VONG') > -1 || rawText.indexOf('CAU') > -1) code = 'CAU';
    else if (subNorm.indexOf('HANG DONG') > -1 || nameNorm.indexOf('HANG DONG') > -1 || rawText.indexOf('HAN') > -1) code = 'HAN';
    else if (subNorm.indexOf('VACH SUOI') > -1 || nameNorm.indexOf('VACH SUOI') > -1 || rawText.indexOf('VAC') > -1) code = 'VAC';
    else if (subNorm.indexOf('DAO BAY') > -1 || nameNorm.indexOf('DAO BAY') > -1 || rawText.indexOf('DAO') > -1) code = 'DAO';
    else if (subNorm.indexOf('NATURE') > -1 || nameNorm.indexOf('NATURE') > -1 || rawText.indexOf('NAT') > -1) code = 'NAT';
    else if (subNorm.indexOf('NHAT TRU') > -1 || nameNorm.indexOf('NHAT TRU') > -1 || rawText.indexOf('TRU') > -1) code = 'TRU';
    else if (subNorm.indexOf('HEM NUI') > -1 || nameNorm.indexOf('HEM NUI') > -1 || rawText.indexOf('HEM') > -1) code = 'HEM';
    else if (subNorm.indexOf('CONG VOM') > -1 || nameNorm.indexOf('CONG VOM') > -1 || rawText.indexOf('VOM') > -1) code = 'VOM';

    var lDims = _extractSkuDimensions(name) || _extractSkuDimensions(oldSku) || 'STD';
    if (code === 'CV') {
      return 'LAY-CV-' + lDims + suffix;
    }
    var ver = _extractSkuVersion(name) || _extractSkuVersion(oldSku) || '001';
    return 'LAY-' + code + ver + '-' + lDims + suffix;
  }

  // 3. NHÓM NGUYÊN VẬT LIỆU SẢN XUẤT (Cột F = "DANH MỤC SẢN XUẤT")
  if (catNorm.indexOf('DANH MUC SAN XUAT') > -1 || catNorm.indexOf('SAN XUAT') > -1 || catNorm.indexOf('NGUYEN VAT LIEU') > -1) {
    if (subNorm.indexOf('LAYOUT') > -1) {
      var slug = _extractMaterialSlug(name, oldSku, ['NL-LAY', 'NLLAY', 'NL']);
      return 'NL-LAY-' + slug;
    } else if (subNorm.indexOf('BE KINH') > -1 || subNorm.indexOf('BE') > -1) {
      var slug = _extractMaterialSlug(name, oldSku, ['NL-BE', 'NLBE', 'NL']);
      return 'NL-BE-' + slug;
    } else if (subNorm.indexOf('DONG GOI') > -1) {
      var slug = _extractMaterialSlug(name, oldSku, ['NL-DG', 'NLDG', 'DG']);
      return 'DG-' + slug;
    } else {
      var slug = _extractMaterialSlug(name, oldSku, ['VT-SX', 'VTSX', 'VT']);
      return 'VT-' + slug;
    }
  }

  // 4. NHÓM PHỤ KIỆN BÁN LẺ (Cột F = "PHỤ KIỆN")
  if (catNorm.indexOf('PHU KIEN') > -1 || catNorm === 'PK') {
    if (subNorm.indexOf('VAT LIEU LOC') > -1 || subNorm === 'VLL' || nameNorm.indexOf('VAT LIEU LOC') > -1) {
      var slug = _extractMaterialSlug(name, oldSku, ['PK-VLL', 'PKVLL', 'VLL']);
      return 'PK-VLL-' + slug;
    } else if (subNorm.indexOf('BOM') > -1 || subNorm.indexOf('LOC') > -1 || nameNorm.indexOf('MAY LOC') > -1 || nameNorm.indexOf('BOM') > -1) {
      var slug = _extractMaterialSlug(name, oldSku, ['PK-LOC', 'PKLOC']);
      return 'PK-LOC-' + slug;
    } else if (subNorm.indexOf('NEN') > -1 || subNorm.indexOf('CAT') > -1 || subNorm.indexOf('PHAN NEN') > -1) {
      var slug = _extractMaterialSlug(name, oldSku, ['PK-NEN', 'PKNEN']);
      return 'PK-NEN-' + slug;
    } else if (subNorm.indexOf('XU LY NUOC') > -1 || subNorm.indexOf('XLN') > -1 || subNorm.indexOf('HOA CHAT') > -1 || subNorm.indexOf('VI SINH') > -1) {
      var slug = _extractMaterialSlug(name, oldSku, ['PK-XLN', 'PKXLN']);
      return 'PK-XLN-' + slug;
    } else if (subNorm.indexOf('THUC AN') > -1 || subNorm === 'AN' || subNorm === 'CAM' || nameNorm.indexOf('THUC AN') > -1 || nameNorm.indexOf('CAM CA') > -1) {
      var slug = _extractMaterialSlug(name, oldSku, ['PK-AN', 'PKAN']);
      return 'PK-AN-' + slug;
    } else {
      var slug = _extractMaterialSlug(name, oldSku, ['PK-KHAC', 'PKKHAC', 'PK']);
      return 'PK-KHAC-' + slug;
    }
  }

  // Fallback nếu không khớp danh mục nào
  return _sanitizeSkuSlug(oldSku || name);
}

/**
 * Chuẩn hóa toàn bộ cột SKU trong sheet Products và cập nhật đồng bộ các bảng liên kết
 * @param {Object} [options] - Tuỳ chọn { dryRun: false }
 * @returns {Object} Báo cáo kết quả chuẩn hóa
 */
function standardizeWarehouseSKU(options) {
  var opts = options || {};
  var isDryRun = opts.dryRun === true;
  var lock = LockService.getScriptLock();
  
  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var skuMap = {}; // oldSku -> newSku
    var report = {
      success: true,
      timestamp: Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss'),
      dryRun: isDryRun,
      totalProducts: 0,
      totalSkuChanged: 0,
      totalOrdersUpdated: 0,
      totalBomUpdated: 0,
      totalKpiUpdated: 0,
      skuMap: {}
    };

    // =========================================================================
    // BƯỚC 1: QUÉT VÀ CHUẨN HÓA SHEET PRODUCTS (KÈM CHỐNG TRÙNG LẶP COLLISION RESOLVER)
    // =========================================================================
    var prodSheet = ss.getSheetByName('Products');
    if (!prodSheet) {
      throw new Error('Không tìm thấy sheet Products trong hệ thống CSDL.');
    }

    var prodData = prodSheet.getDataRange().getValues();
    if (prodData.length <= 1) {
      return { success: true, message: 'Sheet Products không có dữ liệu để chuẩn hóa.', report: report };
    }

    var prodHeaders = prodData[0];
    var pSkuCol = prodHeaders.indexOf('sku');
    var pNameCol = prodHeaders.indexOf('name');
    var pCatCol = prodHeaders.indexOf('category');
    var pSubCatCol = prodHeaders.indexOf('sub_category');

    if (pSkuCol === -1 || pNameCol === -1 || pCatCol === -1 || pSubCatCol === -1) {
      throw new Error('Cấu trúc sheet Products thiếu một trong các cột: sku, name, category, sub_category.');
    }

    report.totalProducts = prodData.length - 1;
    var updatedSkuColumn = [];
    var seenSkus = {}; // newSku -> productName (để kiểm tra va chạm trùng mã)

    for (var i = 1; i < prodData.length; i++) {
      var row = prodData[i];
      var oldSku = String(row[pSkuCol] || '').trim();
      var name = String(row[pNameCol] || '').trim();
      var cat = String(row[pCatCol] || '').trim();
      var subCat = String(row[pSubCatCol] || '').trim();

      var baseSku = _generateStandardSKU(cat, subCat, name, oldSku);
      var finalSku = baseSku;

      // Cơ chế chống trùng lặp: Nếu trùng mã với sản phẩm khác tên, thêm hậu tố index
      if (seenSkus[finalSku] && seenSkus[finalSku] !== name) {
        var counter = 2;
        while (seenSkus[baseSku + '-' + ('0' + counter).slice(-2)]) {
          counter++;
        }
        finalSku = baseSku + '-' + ('0' + counter).slice(-2);
      }

      seenSkus[finalSku] = name;
      updatedSkuColumn.push([finalSku]);

      if (oldSku && oldSku !== finalSku) {
        skuMap[oldSku] = finalSku;
      }
    }

    report.totalSkuChanged = Object.keys(skuMap).length;
    report.skuMap = skuMap;

    // Ghi đè cột SKU mới vào Products
    if (!isDryRun && updatedSkuColumn.length > 0) {
      prodSheet.getRange(2, pSkuCol + 1, updatedSkuColumn.length, 1).setValues(updatedSkuColumn);
    }

    // =========================================================================
    // BƯỚC 2: CẬP NHẬT ĐỒNG BỘ SHEET ORDERS (Đơn chưa hoàn tất / chưa đối soát)
    // =========================================================================
    var oldSkuKeys = Object.keys(skuMap);
    if (oldSkuKeys.length > 0) {
      var orderSheet = ss.getSheetByName('Orders');
      if (orderSheet && orderSheet.getLastRow() > 1) {
        var orderData = orderSheet.getDataRange().getValues();
        var oHeaders = orderData[0];
        var oStatusCol = oHeaders.indexOf('status');
        var oAccCol = oHeaders.indexOf('accessories');
        var oReconCol = oHeaders.indexOf('isReconciled');

        if (oAccCol !== -1) {
          var orderUpdates = [];
          for (var oi = 1; oi < orderData.length; oi++) {
            var oRow = orderData[oi];
            var oStatus = String(oRow[oStatusCol] || '').trim();
            var oRecon = (oReconCol !== -1 && (String(oRow[oReconCol]).toUpperCase() === 'TRUE' || oRow[oReconCol] === true));

            // Chỉ cập nhật các đơn hàng chưa hoàn tất / chưa đối soát
            var isTerminal = (typeof isTerminalStatus === 'function' ? isTerminalStatus(oStatus) : false) || oRecon;
            if (isTerminal) continue;

            var accRaw = String(oRow[oAccCol] || '').trim();
            if (!accRaw) continue;

            var changed = false;
            var newAccStr = accRaw;

            // Thử parse cấu trúc JSON của accessories
            try {
              if (accRaw.startsWith('[') || accRaw.startsWith('{')) {
                var parsed = JSON.parse(accRaw);
                var items = Array.isArray(parsed) ? parsed : [parsed];
                for (var it = 0; it < items.length; it++) {
                  var item = items[it];
                  if (item && item.sku && skuMap[item.sku]) {
                    item.sku = skuMap[item.sku];
                    changed = true;
                  }
                }
                if (changed) {
                  newAccStr = JSON.stringify(Array.isArray(parsed) ? items : items[0]);
                }
              }
            } catch (jsonErr) {
              // Fallback text replacement nếu accessories là chuỗi thô
              for (var sk = 0; sk < oldSkuKeys.length; sk++) {
                var targetOld = oldSkuKeys[sk];
                if (newAccStr.indexOf(targetOld) > -1) {
                  newAccStr = newAccStr.split(targetOld).join(skuMap[targetOld]);
                  changed = true;
                }
              }
            }

            if (changed) {
              report.totalOrdersUpdated++;
              if (!isDryRun) {
                orderSheet.getRange(oi + 1, oAccCol + 1).setValue(newAccStr);
              }
            }
          }
        }
      }

      // =========================================================================
      // BƯỚC 3: CẬP NHẬT ĐỒNG BỘ SHEET BOM_Config (layoutCode & materialSku)
      // =========================================================================
      var bomSheet = ss.getSheetByName('BOM_Config');
      if (bomSheet && bomSheet.getLastRow() > 1) {
        var bomData = bomSheet.getDataRange().getValues();
        var bomHeaders = bomData[0];
        var bLayoutCol = bomHeaders.indexOf('layoutCode');
        var bMatSkuCol = bomHeaders.indexOf('materialSku');

        if (bLayoutCol !== -1 && bMatSkuCol !== -1) {
          var bomChangedCount = 0;
          for (var bi = 1; bi < bomData.length; bi++) {
            var bRow = bomData[bi];
            var bLayout = String(bRow[bLayoutCol] || '').trim();
            var bMat = String(bRow[bMatSkuCol] || '').trim();
            var rowModified = false;

            // 1. Khớp layoutCode theo skuMap hoặc theo danh mục tên sản phẩm Products
            if (bLayout) {
              if (skuMap[bLayout]) {
                bRow[bLayoutCol] = skuMap[bLayout];
                rowModified = true;
              } else {
                var foundLayoutSku = null;
                for (var p = 1; p < prodData.length; p++) {
                  var pNameStr = String(prodData[p][pNameCol] || '').trim();
                  var pSkuStr = String(prodData[p][pSkuCol] || '').trim();
                  if (_sanitizeSkuSlug(pNameStr) === _sanitizeSkuSlug(bLayout) || _sanitizeSkuSlug(pSkuStr) === _sanitizeSkuSlug(bLayout)) {
                    foundLayoutSku = pSkuStr;
                    break;
                  }
                }
                if (foundLayoutSku && foundLayoutSku !== bLayout) {
                  bRow[bLayoutCol] = foundLayoutSku;
                  rowModified = true;
                }
              }
            }

            // 2. Chuẩn hóa materialSku theo ALIAS_MAP và skuMap
            if (bMat) {
              var stdMatSku = typeof findMaterialSkuByAlias === 'function' ? findMaterialSkuByAlias(bMat) : bMat;
              if (skuMap[bMat]) {
                stdMatSku = skuMap[bMat];
              } else if (skuMap[stdMatSku]) {
                stdMatSku = skuMap[stdMatSku];
              }
              if (stdMatSku && stdMatSku !== bMat) {
                bRow[bMatSkuCol] = stdMatSku;
                rowModified = true;
              }
            }

            if (rowModified) {
              bomChangedCount++;
            }
          }

          report.totalBomUpdated = bomChangedCount;
          if (!isDryRun && bomChangedCount > 0) {
            bomSheet.getRange(2, 1, bomData.length - 1, bomData[0].length).setValues(bomData.slice(1));
          }
        }
      }

      // =========================================================================
      // BƯỚC 4: CẬP NHẬT ĐỒNG BỘ SHEET Config_KPI (Từ Khoá)
      // =========================================================================
      var kpiSheet = ss.getSheetByName('Config_KPI');
      if (kpiSheet && kpiSheet.getLastRow() > 1) {
        var kpiData = kpiSheet.getDataRange().getValues();
        var kpiHeaders = kpiData[0];
        var kpiKeyCol = kpiHeaders.indexOf('Từ Khoá');

        if (kpiKeyCol !== -1) {
          var kpiChangedCount = 0;
          for (var ki = 1; ki < kpiData.length; ki++) {
            var kRow = kpiData[ki];
            var kKey = String(kRow[kpiKeyCol] || '').trim();
            if (!kKey) continue;

            var kChanged = false;
            if (skuMap[kKey]) {
              kRow[kpiKeyCol] = skuMap[kKey];
              kChanged = true;
            } else {
              for (var sk = 0; sk < oldSkuKeys.length; sk++) {
                var oKey = oldSkuKeys[sk];
                if (kKey.indexOf(oKey) > -1) {
                  kRow[kpiKeyCol] = kKey.split(oKey).join(skuMap[oKey]);
                  kChanged = true;
                }
              }
            }

            if (kChanged) {
              kpiChangedCount++;
            }
          }

          report.totalKpiUpdated = kpiChangedCount;
          if (!isDryRun && kpiChangedCount > 0) {
            kpiSheet.getRange(2, 1, kpiData.length - 1, kpiData[0].length).setValues(kpiData.slice(1));
          }
        }
      }
    }

    SpreadsheetApp.flush();

    var msg = '✅ Chuẩn hóa SKU hoàn tất thành công!\n' +
      '• Tổng sản phẩm quét: ' + report.totalProducts + '\n' +
      '• Số mã SKU cập nhật mới: ' + report.totalSkuChanged + '\n' +
      '• Số đơn hàng đồng bộ (Orders): ' + report.totalOrdersUpdated + '\n' +
      '• Số định mức BOM đồng bộ (BOM_Config): ' + report.totalBomUpdated + '\n' +
      '• Số cấu hình KPI đồng bộ (Config_KPI): ' + report.totalKpiUpdated;

    Logger.log(msg);
    return {
      success: true,
      message: msg,
      report: report
    };

  } catch (err) {
    Logger.log('Lỗi standardizeWarehouseSKU: ' + err.toString());
    return {
      success: false,
      message: 'Lỗi trong quá trình chuẩn hóa SKU: ' + err.toString()
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * ⚡ ĐỒNG BỘ CHÍNH XÁC 100% SKU NGUYÊN LIỆU TỪ PRODUCTS SANG BOM_CONFIG & CÁC BẢNG LIÊN QUAN
 * - Quét toàn bộ danh mục Nguyên Liệu / Vật Tư trong bảng Products
 * - Đồng bộ hóa cột materialSku trong sheet BOM_Config khớp chuẩn 100% với Products.sku
 * - Chuẩn hóa mã ID của BOM_Config
 */
function syncBomMaterialSkusWithProducts(options) {
  var opts = options || {};
  var isDryRun = opts.dryRun === true;
  var lock = LockService.getScriptLock();

  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var prodSheet = ss.getSheetByName('Products');
    var bomSheet = ss.getSheetByName('BOM_Config');

    if (!prodSheet || !bomSheet) {
      throw new Error('Không tìm thấy sheet Products hoặc BOM_Config trong hệ thống CSDL.');
    }

    var prodData = prodSheet.getDataRange().getValues();
    var prodHeaders = prodData[0];
    var pSkuCol = prodHeaders.indexOf('sku');
    var pNameCol = prodHeaders.indexOf('name');
    var pCatCol = prodHeaders.indexOf('category');
    var pSubCatCol = prodHeaders.indexOf('sub_category');

    var productSkuMap = {}; // upperSku -> exactSku
    var productNameMap = {}; // cleanName -> exactSku

    for (var p = 1; p < prodData.length; p++) {
      var pSku = String(prodData[p][pSkuCol] || '').trim();
      var pName = String(prodData[p][pNameCol] || '').trim();
      if (pSku) {
        productSkuMap[pSku.toUpperCase()] = pSku;
        if (pName) {
          productNameMap[_sanitizeSkuSlug(pName)] = pSku;
        }
      }
    }

    var bomData = bomSheet.getDataRange().getValues();
    if (bomData.length <= 1) {
      return { success: true, message: 'Sheet BOM_Config không có dữ liệu để đồng bộ.' };
    }

    var bomHeaders = bomData[0];
    var bIdCol = bomHeaders.indexOf('id');
    var bLayoutCol = bomHeaders.indexOf('layoutCode');
    var bMatSkuCol = bomHeaders.indexOf('materialSku');
    var bQtyCol = bomHeaders.indexOf('defaultQty');
    var bUnitCol = bomHeaders.indexOf('unit');

    var updatedCount = 0;
    var changeDetails = [];

    for (var bi = 1; bi < bomData.length; bi++) {
      var row = bomData[bi];
      var oldMatSku = String(row[bMatSkuCol] || '').trim();
      if (!oldMatSku) continue;

      // 1. Ánh xạ thông minh qua findMaterialSkuByAlias
      var targetSku = typeof findMaterialSkuByAlias === 'function' ? findMaterialSkuByAlias(oldMatSku) : oldMatSku;

      // 2. Tra cứu trong bảng Products nếu findMaterialSkuByAlias chưa khớp
      if (!productSkuMap[targetSku.toUpperCase()]) {
        var slug = _sanitizeSkuSlug(oldMatSku);
        if (productNameMap[slug]) {
          targetSku = productNameMap[slug];
        }
      }

      // 3. Nếu tìm thấy SKU chính xác trong Products
      if (productSkuMap[targetSku.toUpperCase()]) {
        targetSku = productSkuMap[targetSku.toUpperCase()];
      }

      if (targetSku && targetSku !== oldMatSku) {
        row[bMatSkuCol] = targetSku;
        
        // Cập nhật id nếu chứa mã cũ
        if (bIdCol !== -1 && row[bIdCol]) {
          var currentId = String(row[bIdCol]);
          if (currentId.indexOf(oldMatSku) !== -1) {
            row[bIdCol] = currentId.replace(oldMatSku, targetSku);
          }
        }

        updatedCount++;
        changeDetails.push({
          row: bi + 1,
          layout: row[bLayoutCol],
          oldSku: oldMatSku,
          newSku: targetSku
        });
      }
    }

    if (!isDryRun && updatedCount > 0) {
      bomSheet.getRange(2, 1, bomData.length - 1, bomData[0].length).setValues(bomData.slice(1));
      SpreadsheetApp.flush();
    }

    var resultMsg = '✅ Đồng bộ SKU BOM_Config hoàn tất!\n' +
      '• Tổng số dòng kiểm tra: ' + (bomData.length - 1) + '\n' +
      '• Số định mức nguyên liệu đã đồng bộ: ' + updatedCount;

    Logger.log(resultMsg);
    if (changeDetails.length > 0) {
      Logger.log('Chi tiết thay đổi mẫu:\n' + JSON.stringify(changeDetails.slice(0, 10), null, 2));
    }

    return {
      success: true,
      message: resultMsg,
      totalUpdated: updatedCount,
      details: changeDetails
    };

  } catch (err) {
    Logger.log('Lỗi syncBomMaterialSkusWithProducts: ' + err.toString());
    return {
      success: false,
      message: 'Lỗi đồng bộ SKU BOM: ' + err.toString()
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * [REQUIREMENT 2] Tạo KPI tùy chỉnh theo chu kỳ Tuần (WEEK) hoặc Tháng (MONTH)
 * @param {Object} payload { user, kpiName, target, unit, reward, penalty, note, cycle, startTime, endTime }
 * @returns {Object}
 */
function api_createCustomKPI(payload, pin) {
  var pinToAuth = pin || (payload && payload.pin);
  if (!pinToAuth) return { success: false, error: 'AUTH_REQUIRED', message: 'Yêu cầu mã PIN để thực hiện thao tác!' };
  var auth = validatePin(pinToAuth);
  if (!auth || !auth.valid) return { success: false, error: 'AUTH_FAILED', message: 'Mã PIN không hợp lệ!' };
  if (!checkServerPermission(auth, 'HR_EDIT_KPI_TARGET')) {
    return { success: false, error: 'PERMISSION_DENIED', message: 'Từ chối quyền: Chỉ Boss Tối Cao mới có quyền tạo chỉ tiêu KPI tùy chỉnh!' };
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var kpiSheet = ss.getSheetByName('KPI_Progress');
    if (!kpiSheet) throw new Error('Không tìm thấy bảng KPI_Progress');

    var now = new Date();
    var cycle = String(payload.cycle || 'MONTH').toUpperCase();
    var sTime = payload.startTime;
    var eTime = payload.endTime;

    if (!sTime || !eTime) {
      if (cycle === 'WEEK') {
        // Thứ 2 đầu tuần (00:00:00) đến Chủ Nhật cuối tuần (23:59:59)
        var day = now.getDay();
        var diffToMon = now.getDate() - day + (day === 0 ? -6 : 1);
        var monday = new Date(now.getFullYear(), now.getMonth(), diffToMon, 0, 0, 0, 0);
        var sunday = new Date(now.getFullYear(), now.getMonth(), diffToMon + 6, 23, 59, 59, 999);
        
        var formatYMD = function(d) {
          return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        };
        sTime = formatYMD(monday);
        eTime = formatYMD(sunday);
      } else {
        // Ngày 1 đầu tháng đến ngày cuối tháng
        var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        var lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        var formatYMD = function(d) {
          return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        };
        sTime = formatYMD(firstDay);
        eTime = formatYMD(lastDay);
      }
    }

    var prefix = cycle === 'WEEK' ? 'KPI_W_' : 'KPI_M_';
    var kpiId = payload.id || (prefix + Date.now());

    var kpiHeaders = kpiSheet.getRange(1, 1, 1, kpiSheet.getLastColumn()).getValues()[0];
    
    var rowObj = {
      id: kpiId,
      user: payload.user || '',
      kpiName: payload.kpiName || '',
      current: Number(payload.current || 0),
      target: Number(payload.target || 100),
      unit: String(payload.unit || 'Lần').trim(),
      lastUpdated: new Date().toISOString(),
      startTime: sTime,
      endTime: eTime,
      reward: Number(payload.reward || 0),
      penalty: Number(payload.penalty || 0),
      isClaimed: Boolean(payload.isClaimed),
      guide: String(payload.note || payload.guide || '').trim()
    };

    var newRow = kpiHeaders.map(function(h) {
      var key = String(h).trim();
      return rowObj[key] !== undefined ? rowObj[key] : (key === 'Khoản Trừ Vi Phạm' ? rowObj.penalty : '');
    });

    kpiSheet.appendRow(newRow);
    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Tạo KPI ' + (cycle === 'WEEK' ? 'Hàng Tuần' : 'Hàng Tháng') + ' thành công!',
      kpi: rowObj
    };
  } catch (err) {
    Logger.log('Lỗi api_createCustomKPI: ' + err.toString());
    return { success: false, message: 'Lỗi tạo KPI: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * [REQUIREMENT 3] Tự Đánh Giá Tiến Độ KPI (Fast Self-Assessment)
 * @param {String} kpiId ID của KPI trong KPI_Progress
 * @param {Number} actualValue Số liệu tiến độ thực tế đạt được
 * @param {String} note Ghi chú / Giải trình tiến độ
 * @param {String} proofUrl Link hình ảnh / Bằng chứng nghiệm thu
 * @returns {Object}
 */
function api_submitKpiSelfAssessment(kpiId, actualValue, note, proofUrl) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var kpiSheet = ss.getSheetByName('KPI_Progress');
    if (!kpiSheet) throw new Error('Không tìm thấy bảng KPI_Progress');

    var data = kpiSheet.getDataRange().getValues();
    if (data.length <= 1) throw new Error('Dữ liệu bảng KPI_Progress rỗng');

    var headers = data[0];
    var idCol = headers.indexOf('id');
    var currentCol = headers.indexOf('current');
    var targetCol = headers.indexOf('target');
    var userCol = headers.indexOf('user');
    var kpiNameCol = headers.indexOf('kpiName');
    var rewardCol = headers.indexOf('reward');
    var isClaimedCol = headers.indexOf('isClaimed');
    var lastUpdatedCol = headers.indexOf('lastUpdated');
    var guideCol = headers.indexOf('guide') !== -1 ? headers.indexOf('guide') : headers.indexOf('Guide');
    var noteCol = headers.indexOf('note');
    var proofCol = headers.indexOf('proof') !== -1 ? headers.indexOf('proof') : headers.indexOf('proofUrl');

    if (idCol === -1 || currentCol === -1) throw new Error('Thiếu cột id hoặc current trong KPI_Progress');

    var targetRowIndex = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]).trim() === String(kpiId).trim()) {
        targetRowIndex = i + 1; // 1-based index in sheet
        break;
      }
    }

    if (targetRowIndex === -1) throw new Error('Không tìm thấy KPI với ID: ' + kpiId);

    var curRowData = data[targetRowIndex - 1];
    var numActual = Number(actualValue) || 0;
    var targetNum = targetCol !== -1 ? Number(curRowData[targetCol]) || 0 : 0;
    var userVal = userCol !== -1 ? curRowData[userCol] : '';
    var kpiNameVal = kpiNameCol !== -1 ? curRowData[kpiNameCol] : '';
    var rewardNum = rewardCol !== -1 ? Number(curRowData[rewardCol]) || 0 : 0;

    // 1. Cập nhật current
    kpiSheet.getRange(targetRowIndex, currentCol + 1).setValue(numActual);

    // 2. Cập nhật lastUpdated
    if (lastUpdatedCol !== -1) {
      kpiSheet.getRange(targetRowIndex, lastUpdatedCol + 1).setValue(new Date().toISOString());
    }

    // 3. Cập nhật note / guide
    var fullNote = String(note || '').trim();
    if (proofUrl) {
      fullNote = (fullNote ? fullNote + '\n' : '') + '🔗 Bằng chứng: ' + String(proofUrl).trim();
    }
    // Gắn nhãn [MANUAL_OVERRIDE] để bảo toàn dữ liệu đánh giá
    if (fullNote.indexOf('[MANUAL_OVERRIDE]') === -1) {
      fullNote = fullNote + ' [MANUAL_OVERRIDE]';
    }

    if (guideCol !== -1) {
      var oldGuide = String(curRowData[guideCol] || '');
      var updatedGuide = oldGuide ? oldGuide + '\n[ĐÁNH GIÁ]: ' + fullNote : fullNote;
      kpiSheet.getRange(targetRowIndex, guideCol + 1).setValue(updatedGuide);
    } else if (noteCol !== -1) {
      kpiSheet.getRange(targetRowIndex, noteCol + 1).setValue(fullNote);
    }

    if (proofCol !== -1 && proofUrl) {
      kpiSheet.getRange(targetRowIndex, proofCol + 1).setValue(proofUrl);
    }

    // 4. Tự động claim thưởng nếu đạt chỉ tiêu
    var isPassed = targetNum > 0 && numActual >= targetNum;
    if (isPassed && isClaimedCol !== -1) {
      var alreadyClaimed = String(curRowData[isClaimedCol]).toLowerCase() === 'true' || curRowData[isClaimedCol] === true;
      if (!alreadyClaimed) {
        kpiSheet.getRange(targetRowIndex, isClaimedCol + 1).setValue(true);

        // Ghi nhận thưởng vào BonusPenalty nếu có reward > 0
        if (rewardNum > 0) {
          var bpSheet = ss.getSheetByName('BonusPenalty');
          if (bpSheet) {
            var bpHeaders = bpSheet.getRange(1, 1, 1, bpSheet.getLastColumn()).getValues()[0];
            var bpId = 'BP_KPI_' + Date.now();
            var bpObj = {
              id: bpId,
              user: userVal,
              amount: rewardNum,
              type: 'Thưởng KPI',
              note: 'Tự đánh giá đạt KPI: ' + kpiNameVal + ' (' + numActual + '/' + targetNum + ')',
              date: new Date().toISOString().slice(0, 10),
              orderCode: 'SYS_KPI_AUTO'
            };
            var bpRow = bpHeaders.map(function(h) {
              return bpObj[String(h).trim()] !== undefined ? bpObj[String(h).trim()] : '';
            });
            bpSheet.appendRow(bpRow);
          }
        }
      }
    }

    SpreadsheetApp.flush();

    return {
      success: true,
      message: 'Đã cập nhật kết quả đánh giá KPI thành công!' + (isPassed ? ' (Đạt chỉ tiêu & Nhận thưởng)' : ''),
      current: numActual,
      isPassed: isPassed
    };
  } catch (err) {
    Logger.log('Lỗi api_submitKpiSelfAssessment: ' + err.toString());
    return { success: false, message: 'Lỗi đánh giá KPI: ' + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

