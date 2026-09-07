/**
 * ==============================================================================
 * MODULE: RFEnterpriseCore.js
 * MÔ TẢ: Hệ sinh thái lõi điều phối 3 Agent chuyên trách:
 *        1. Production Dispatch Agent (Quản lý tiến độ sản xuất, trừ kho)
 *        2. HR & Payroll Agent (Rà soát chấm công, tự động cập nhật KPI)
 *        3. Warehouse Optimizer Agent (Cảnh báo tồn kho vật lý)
 * 
 * KIẾN TRÚC: Adapter Pattern, gọi các Engine gốc từ Code.js để tránh lặp code.
 * ĐẢM BẢO AN TOÀN: Bọc LockService, tuân thủ Schema, Single Source of Truth.
 * ==============================================================================
 */

const RFEnterpriseCore = {
  
  /**
   * Kích hoạt toàn bộ các Agent tuần tự
   * Được gọi định kỳ bởi Master Cron (vd: mỗi 30 phút)
   */
  runHeartbeat: function() {
    const lock = LockService.getScriptLock();
    // Wait for up to 15 seconds for other processes to finish.
    try {
      lock.waitLock(15000);
    } catch (e) {
      Logger.log('⏳ [RFEnterpriseCore] Hệ thống đang bận, bỏ qua nhịp Heartbeat này.');
      return;
    }

    try {
      Logger.log('🚀 [RFEnterpriseCore] Bắt đầu nhịp tim điều phối...');
      const ss = SpreadsheetApp.getActiveSpreadsheet();

      // 1. Warehouse Optimizer - Quét tồn kho
      this.WarehouseOptimizerAgent.scanInventoryLevels(ss);

      // 2. HR Agent - Quét chấm công & KPI
      this.HrPayrollAgent.auditDailyAttendance(ss);
      this.HrPayrollAgent.updateKpiProgressData(ss);

      // 3. Production Dispatch - Rà soát SLA
      this.ProductionDispatchAgent.monitorProductionSLAs(ss);

      Logger.log('✅ [RFEnterpriseCore] Hoàn thành nhịp tim điều phối.');
    } catch (err) {
      Logger.log(`❌ [RFEnterpriseCore] Lỗi Heartbeat: ${err.message}`);
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Quy hoạch Trigger: Gộp chung thành 1 Master Cron chạy mỗi 30 phút.
   * Chạy thủ công 1 lần để cài đặt Trigger
   */
  setupMasterCron: function() {
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      const handlerName = trigger.getHandlerFunction();
      // Xóa các trigger cũ gây tràn quota
      if (handlerName === 'updateKpiProgressData' || 
          handlerName === 'updateKpiProgressData_Duong' || 
          handlerName === 'updateKpiProgressData_Tam' || 
          handlerName === 'updateKpiProgressData_Trang' ||
          handlerName === 'rfEnterpriseHeartbeatHandler') {
        ScriptApp.deleteTrigger(trigger);
      }
    });

    // Tạo Master Trigger chạy hàm rfEnterpriseHeartbeatHandler mỗi 30 phút
    ScriptApp.newTrigger('rfEnterpriseHeartbeatHandler')
      .timeBased()
      .everyMinutes(30)
      .create();
    
    Logger.log('✅ Đã thiết lập thành công Master Cron (rfEnterpriseHeartbeatHandler) mỗi 30 phút.');
  },

  // ==============================================================================
  // 1. PRODUCTION DISPATCH AGENT
  // ==============================================================================
  ProductionDispatchAgent: {
    
    /**
     * Bóc tách các đơn hàng hoặc lệnh sản xuất chuyển trạng thái Done để trừ kho (BOM).
     * Hàm này có thể được nhúng vào onEdit khi thợ check hoàn thành, hoặc gọi thủ công qua ID.
     */
    checkAndAutoForwardOrder: function(prodId) {
      // Vì Code.js đã có processMaterialDeduction(prodId), ta chỉ gọi sang,
      // không viết lại logic để tránh trừ kho kép (Double Deduction).
      if (typeof processMaterialDeduction === 'function') {
        try {
          processMaterialDeduction(prodId);
          Logger.log(`✅ [ProductionAgent] Đã gọi trừ kho BOM cho lệnh sản xuất: ${prodId}`);
        } catch (e) {
          Logger.log(`❌ [ProductionAgent] Lỗi khi gọi trừ kho BOM: ${e.message}`);
        }
      } else {
        Logger.log('⚠️ [ProductionAgent] Không tìm thấy hàm processMaterialDeduction trong Code.js');
      }
    },

    /**
     * Rà soát bảng Production để tìm các lệnh đang thi công (In Progress) 
     * sắp trễ hạn hoặc đã trễ hạn SLA.
     */
    monitorProductionSLAs: function(ss) {
      if (typeof readSheet !== 'function') return;
      const productions = readSheet('Production', null, ss) || [];
      const now = new Date().getTime();
      let alerts = [];

      productions.forEach(prod => {
        const rawStatus = String(prod.status || '').trim();
        const statusUpper = rawStatus.toUpperCase();
        // Chuẩn hóa nhận diện trạng thái đang thi công: IN_PROGRESS, IN PROGRESS, PENDING, ĐANG LÀM, ĐANG SẢN XUẤT
        const isInProgress = statusUpper === 'IN_PROGRESS' || 
                             statusUpper === 'IN PROGRESS' || 
                             statusUpper === 'PENDING' ||
                             statusUpper === 'ĐANG LÀM' || 
                             statusUpper === 'ĐANG SẢN XUẤT';
        if (isInProgress) {
          const deadlineStr = prod.deadline;
          if (deadlineStr) {
            const deadlineTime = new Date(deadlineStr).getTime();
            if (!isNaN(deadlineTime)) {
              const hoursDiff = (deadlineTime - now) / (3600 * 1000);
              
              if (hoursDiff < 0) {
                alerts.push(`Trễ hạn: Lệnh ${prod.id} (${prod.name}) quá hạn ${Math.abs(Math.round(hoursDiff))} giờ.`);
              } else if (hoursDiff <= 2) {
                alerts.push(`Cảnh báo: Lệnh ${prod.id} (${prod.name}) chỉ còn ${Math.round(hoursDiff)} giờ tới deadline.`);
              }
            }
          }
        }
      });

      if (alerts.length > 0 && typeof sendNtfyNotification === 'function') {
        const message = alerts.join('\n');
        sendNtfyNotification('Cảnh Báo Tiến Độ Sản Xuất', message, 'rf_production_alerts');
      }
    }
  },

  // ==============================================================================
  // 2. HR & PAYROLL AGENT
  // ==============================================================================
  HrPayrollAgent: {
    
    /**
     * Rà soát bảng Attendance tìm ca làm việc chưa checkout hoặc đi trễ.
     */
    auditDailyAttendance: function(ss) {
      if (typeof readSheet !== 'function') return;
      const attendances = readSheet('Attendance', null, ss) || [];
      const todayStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
      let lateAlerts = [];
      let missingCheckoutAlerts = [];

      attendances.forEach(att => {
        if (att.date && String(att.date).includes(todayStr)) {
          // Bắt các vi phạm đơn giản dựa trên cột morningIn, afternoonIn
          // (Logic thực tế có thể cần dựa vào cài đặt ca làm việc chi tiết)
          if (att.morningIn && att.morningIn > '08:15') {
            lateAlerts.push(`${att.user} đi trễ ca sáng (${att.morningIn}).`);
          }
          if (att.afternoonIn && att.afternoonIn > '13:45') {
            lateAlerts.push(`${att.user} đi trễ ca chiều (${att.afternoonIn}).`);
          }
          
          // Cuối ngày chưa checkout
          const nowHour = new Date().getHours();
          if (nowHour >= 18 && !att.afternoonOut && att.afternoonIn) {
            missingCheckoutAlerts.push(`${att.user} chưa check-out ca chiều.`);
          }
        }
      });

      if (typeof sendNtfyNotification === 'function') {
        if (lateAlerts.length > 0) {
          sendNtfyNotification('Báo Cáo Đi Trễ', lateAlerts.join('\n'), 'rf_hr_alerts');
        }
        if (missingCheckoutAlerts.length > 0) {
          sendNtfyNotification('Quên Chấm Công', missingCheckoutAlerts.join('\n'), 'rf_hr_alerts');
        }
      }
    },

    /**
     * Tự động quét sản lượng từ Production/Orders để cập nhật KPI_Progress.
     * Tái sử dụng logic lấy KPI từ hệ thống.
     */
    updateKpiProgressData: function(ss) {
      Logger.log('🔄 [HrPayrollAgent] Đang cập nhật KPI_Progress...');
      
      // 1. Ưu tiên gọi các engine cập nhật KPI chuyên sâu đã có sẵn trong Code.js
      let calledCodeJs = false;
      if (typeof updateKpiProgressData === 'function') {
        try { updateKpiProgressData(); calledCodeJs = true; } catch (e) { Logger.log('Lỗi gọi updateKpiProgressData: ' + e); }
      }
      if (typeof updateKpiProgressData_Duong === 'function') {
        try { updateKpiProgressData_Duong(); calledCodeJs = true; } catch (e) { Logger.log('Lỗi gọi updateKpiProgressData_Duong: ' + e); }
      }
      if (typeof updateKpiProgressData_Tam === 'function') {
        try { updateKpiProgressData_Tam(); calledCodeJs = true; } catch (e) { Logger.log('Lỗi gọi updateKpiProgressData_Tam: ' + e); }
      }
      if (typeof updateKpiProgressData_Trang === 'function') {
        try { updateKpiProgressData_Trang(); calledCodeJs = true; } catch (e) { Logger.log('Lỗi gọi updateKpiProgressData_Trang: ' + e); }
      }

      if (calledCodeJs) {
        Logger.log('✅ [HrPayrollAgent] Đã cập nhật KPI qua các hàm chuyên trách trong Code.js');
        return;
      }

      // 2. Logic fallback nếu chạy môi trường tách biệt
      if (typeof readSheet !== 'function') return;
      const productions = readSheet('Production', null, ss) || [];
      const todayStr = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
      let hdGlassCount = 0;
      let dtLayoutCount = 0;
      
      productions.forEach(prod => {
        // Khớp 100% tên cột p1_user, p1_status, p1_endTime, p2_user, p2_status, p2_endTime
        if (prod.p1_user === 'Nguyễn Hoàng Dương' && String(prod.p1_status).toUpperCase() === 'DONE') {
          if (prod.p1_endTime && String(prod.p1_endTime).includes(todayStr)) {
            hdGlassCount++;
          }
        }
        if (prod.p2_user === 'Trần Duy Tân' && String(prod.p2_status).toUpperCase() === 'DONE') {
          if (prod.p2_endTime && String(prod.p2_endTime).includes(todayStr)) {
            dtLayoutCount++;
          }
        }
      });

      Logger.log(`[HR] Nguyễn Hoàng Dương hôm nay: ${hdGlassCount} bể. Trần Duy Tân: ${dtLayoutCount} layout.`);
    }
  },

  // ==============================================================================
  // 3. WAREHOUSE OPTIMIZER AGENT
  // ==============================================================================
  WarehouseOptimizerAgent: {
    
    /**
     * Quét danh sách Products (Vật tư), tìm SKU dưới định mức.
     */
    scanInventoryLevels: function(ss) {
      if (typeof readSheet !== 'function') return;
      const products = readSheet('Products', null, ss) || [];
      let outOfStockAlerts = [];

      products.forEach(p => {
        // Chỉ quét các mặt hàng thuộc nhóm cần sản xuất / nguyên liệu
        const cat = String(p.category || '').toUpperCase().trim();
        if (cat === 'DANH MỤC SẢN XUẤT' || cat === 'NGUYÊN VẬT LIỆU' || cat === 'VẬT TƯ SẢN XUẤT') {
          const qty = Number(p.quantity || 0);
          const minStock = Number(p.minStock || 0);

          if (qty <= minStock) {
            outOfStockAlerts.push(`- ${p.sku} (${p.name}): Tồn ${qty} ${p.unit} (Dưới định mức ${minStock})`);
          }
        }
      });

      if (outOfStockAlerts.length > 0 && typeof sendNtfyNotification === 'function') {
        const message = 'Cần nhập/bổ sung vật tư gấp:\n' + outOfStockAlerts.join('\n');
        sendNtfyNotification('Cảnh Báo Đứt Gãy Chuỗi Cung Ứng', message, 'rf_warehouse_alerts');
      }
    }
  }

};

/**
 * Trình kích hoạt toàn cục cho Google Apps Script Trigger
 */
function rfEnterpriseHeartbeatHandler() {
  RFEnterpriseCore.runHeartbeat();
}

/**
 * HÀM CÀI ĐẶT: Chọn hàm này trên thanh công cụ của Apps Script và nhấn "Run" (Chạy)
 */
function INIT_SETUP_MASTER_CRON() {
  RFEnterpriseCore.setupMasterCron();
}
