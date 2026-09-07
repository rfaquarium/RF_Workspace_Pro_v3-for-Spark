/**
 * ==============================================================================
 * MODULE: MasterGovernanceAgent.js
 * MÔ TẢ: Master Governance AI Agent (Virtual COO) - Giám đốc vận hành ảo
 *        quản trị và giám sát toàn bộ hệ sinh thái Shopee Global & RF Workspace Pro.
 * 
 * TÍNH NĂNG CHÍNH:
 * 1. runHealthCheck(): Bắt lỗi vận hành (Anomaly Detection), đơn kẹt RTS >24h, lệch tiền đối soát, lỗi ghi nhật ký.
 * 2. generateExecutiveBrief(): Tổng hợp số liệu KPI và dùng Gemini để trích xuất bản tin điều hành 3 điểm nóng.
 * 3. queryAssistant(userQuestion): Trả lời câu hỏi bất kỳ bằng ngôn ngữ tự nhiên từ số liệu CSDL thời gian thực.
 * 
 * DOANH NGHIỆP: Rich Fish Aquarium
 * TƯƠNG THÍCH: Google Apps Script V8 Engine
 * ==============================================================================
 */

const MasterGovernanceAgent = {
  name: 'MasterGovernanceAgent',

  /**
   * Lấy API Key của Gemini từ Script Properties
   * @returns {string}
   */
  getGeminiApiKey: function() {
    const props = PropertiesService.getScriptProperties();
    const apiKey = props.getProperty('GEMINI_API_KEY') || props.getProperty('GEMINI_KEY') || props.getProperty('GOOGLE_AI_KEY');
    return apiKey || '';
  },

  /**
   * 1. Quét sức khỏe toàn bộ hệ thống & Bắt lỗi vận hành (Anomaly Detection)
   * @returns {Object} Kết quả kiểm tra sức khỏe hệ thống
   */
  runHealthCheck: function() {
    try {
      const orders = ShopeeDbService.getAll('DB_ORDERS') || [];
      const recons = ShopeeDbService.getAll('DB_ESCROW_RECON') || [];
      const logs = ShopeeDbService.getAll('DB_AGENT_AUDIT_LOGS') || [];

      const now = new Date().getTime();
      const anomalies = [];
      let delayedRtsCount = 0;
      let undeductedCount = 0;

      // 1. Kiểm tra đơn hàng kẹt chưa trừ kho / quá hạn SLA 24h
      orders.forEach(order => {
        const orderSn = order.order_sn || order.id || 'N/A';
        const market = order.market_code || 'GLOBAL';
        const status = String(order.order_status || '').toUpperCase().trim();
        const isDeducted = order.inventory_deducted === true || String(order.inventory_deducted).toUpperCase() === 'TRUE';

        if (status === 'READY_TO_SHIP' && !isDeducted) {
          undeductedCount++;
          anomalies.push(`[Cảnh báo Kho] Đơn ${orderSn} (${market}) trạng thái READY_TO_SHIP nhưng chưa trừ tồn kho vật lý.`);
        }

        const createdTimeStr = order.order_created_time || order.updated_at;
        if (createdTimeStr && status === 'READY_TO_SHIP') {
          const createdTime = new Date(createdTimeStr).getTime();
          if (!isNaN(createdTime) && (now - createdTime > 24 * 3600 * 1000)) {
            delayedRtsCount++;
            const hoursPassed = Math.round((now - createdTime) / (3600 * 1000));
            anomalies.push(`[Cảnh báo SLA] Đơn ${orderSn} (${market}) đã chờ giao ${hoursPassed}h (> 24h) chưa bàn giao đơn vị vận chuyển.`);
          }
        }
      });

      // 2. Kiểm tra sai lệch đối soát (Discrepancy)
      let discrepancyCount = 0;
      recons.forEach(rec => {
        const recStatus = String(rec.recon_status || '').toUpperCase().trim();
        if (recStatus === 'DISCREPANCY' || recStatus === 'MISMATCH') {
          discrepancyCount++;
          anomalies.push(`[Cảnh báo Tài chính] Sai lệch số liệu đối soát Escrow tại mã đơn ${rec.order_sn}.`);
        }
      });

      // 3. Kiểm tra các lỗi hệ thống trong 12 giờ qua
      const recentErrors = logs.filter(l => {
        if (l.status !== 'FAILED') return false;
        const logTime = new Date(l.timestamp).getTime();
        return !isNaN(logTime) && (now - logTime < 12 * 3600 * 1000);
      });

      const isHealthy = anomalies.length === 0 && recentErrors.length === 0;

      return {
        healthy: isHealthy,
        anomalies: anomalies,
        stats: {
          totalOrders: orders.length,
          delayedRtsCount: delayedRtsCount,
          undeductedCount: undeductedCount,
          discrepancyCount: discrepancyCount,
          recentErrorsCount: recentErrors.length
        },
        checkedAt: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss')
      };
    } catch (err) {
      Logger.log(`❌ [MasterGovernanceAgent.runHealthCheck] Lỗi: ${err.message}`);
      return {
        healthy: false,
        anomalies: [`Lỗi khi chạy Health Check: ${err.message}`],
        stats: { totalOrders: 0, delayedRtsCount: 0, undeductedCount: 0, discrepancyCount: 0, recentErrorsCount: 0 },
        checkedAt: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss')
      };
    }
  },

  /**
   * 2. Tổng hợp báo cáo điều hành quản trị thông minh qua Gemini
   * @returns {Object} Báo cáo tóm tắt điều hành
   */
  generateExecutiveBrief: function() {
    const apiKey = this.getGeminiApiKey();
    const health = this.runHealthCheck();
    const dashboardData = typeof getShopeeGlobalDashboardData === 'function'
      ? getShopeeGlobalDashboardData()
      : { kpi: {}, orders: [] };

    const kpi = dashboardData.kpi || {};
    const totalRev = Number(kpi.totalRevenueVnd || 0);
    const rtsCount = Number(kpi.readyToShipCount || 0);
    const completedCount = Number(kpi.completedCount || 0);
    const escrowPayout = Number(kpi.totalEscrowPayoutVnd || 0);

    // Nếu chưa cấu hình API Key, trả về bản tin mặc định từ hệ chuyên gia (Rule-based)
    if (!apiKey) {
      const fallbackReport = `🎯 **Điểm Nóng Kinh Doanh & Dòng Tiền**:
- Doanh thu quy đổi: ${totalRev.toLocaleString('vi-VN')} đ (${kpi.totalOrdersCount || 0} đơn).
- Tiền thực nhận về ví Escrow sau phí sàn: ${escrowPayout.toLocaleString('vi-VN')} đ.

⚠️ **Rủi Ro & Cảnh Báo Vận Hành**:
- Đang có ${rtsCount} đơn chờ đóng gói/giao hàng (RTS).
- ${health.stats.delayedRtsCount > 0 ? `Phát hiện ${health.stats.delayedRtsCount} đơn vượt SLA 24h.` : 'Toàn bộ đơn đang trong chuẩn SLA.'}
- ${health.stats.undeductedCount > 0 ? `Có ${health.stats.undeductedCount} đơn chưa trừ tồn kho xưởng.` : 'Kho xưởng đã đồng bộ khớp 100%.'}

💡 **Khuyến Nghị Điều Hành**:
- Ưu tiên thợ đóng gói xuất kho các đơn RTS trong buổi sáng.
- Cấu hình thêm GEMINI_API_KEY trong Script Properties để kích hoạt phân tích sâu bằng AI.`;

      return {
        success: true,
        report: fallbackReport,
        health: health,
        aiGenerated: false
      };
    }

    const prompt = `
Bạn là Trợ Lý Quản Trị Cấp Cao (Virtual COO) của doanh nghiệp Rich Fish Aquarium.
Dưới đây là bức tranh vận hành CSDL Shopee Global thời gian thực:
- Tổng doanh thu quy đổi: ${totalRev.toLocaleString('vi-VN')} VND (${kpi.totalOrdersCount || 0} đơn hàng).
- Đơn chờ đóng gói (READY_TO_SHIP): ${rtsCount} đơn.
- Đơn hoàn thành (COMPLETED): ${completedCount} đơn.
- Số tiền thực nhận về ví sau phí sàn (Escrow): ${escrowPayout.toLocaleString('vi-VN')} VND.
- Các cảnh báo bất thường: ${JSON.stringify(health.anomalies)}
- Thống kê lỗi gần nhất: ${health.stats.recentErrorsCount} lỗi hệ thống trong 12h.

YÊU CẦU:
Viết bản tóm tắt điều hành ngắn gọn, súc tích (khoảng 120-150 từ), gồm đúng 3 mục theo format sau:
🎯 **1. Điểm nóng kinh doanh & dòng tiền:** (Nêu rõ doanh thu, tiền về ví, hiệu suất bán hàng)
⚠️ **2. Rủi ro / Đơn hàng cần xử lý ngay:** (Chỉ rõ đơn vượt SLA, đơn chưa trừ kho, rủi ro lệch phí sàn nếu có)
💡 **3. Khuyến nghị hành động:** (Chỉ thị cụ thể cho bộ phận đóng gói/kế toán/kho để xử lý triệt để)

Giọng văn quyết đoán, chuyên nghiệp, đi thẳng vào số liệu hành động cụ thể.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 500
      }
    };

    try {
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });

      const data = JSON.parse(response.getContentText());
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return {
          success: true,
          report: data.candidates[0].content.parts[0].text,
          health: health,
          aiGenerated: true
        };
      } else {
        throw new Error(data.error?.message || 'Phản hồi từ Gemini không có nội dung');
      }
    } catch (e) {
      Logger.log(`⚠️ [MasterGovernanceAgent] Lỗi gọi Gemini: ${e.message}`);
      return {
        success: true,
        report: `🎯 **Tổng quan**: Doanh thu ${totalRev.toLocaleString('vi-VN')} đ | Ví Escrow ${escrowPayout.toLocaleString('vi-VN')} đ.\n⚠️ **Cảnh báo**: ${health.anomalies.join('\n') || 'Không có cảnh báo nghiêm trọng.'}\n💡 **Hành động**: Đóng gói ngay ${rtsCount} đơn RTS.`,
        health: health,
        aiGenerated: false,
        error: e.message
      };
    }
  },

  /**
   * 3. Trợ lý AI trả lời câu hỏi điều hành trực tiếp từ người dùng bằng ngôn ngữ tự nhiên
   * @param {string} userQuestion - Câu hỏi của người dùng
   * @returns {Object} Câu trả lời thông minh
   */
  queryAssistant: function(userQuestion) {
    if (!userQuestion || typeof userQuestion !== 'string') {
      return { answer: 'Vui lòng cung cấp câu hỏi cụ thể.' };
    }

    const apiKey = this.getGeminiApiKey();
    const orders = ShopeeDbService.getAll('DB_ORDERS') || [];
    const recons = ShopeeDbService.getAll('DB_ESCROW_RECON') || [];
    const health = this.runHealthCheck();

    // Chuẩn bị ngữ cảnh tóm lược O(N)
    const marketBreakdown = {};
    orders.forEach(o => {
      const m = o.market_code || 'OTHER';
      if (!marketBreakdown[m]) marketBreakdown[m] = { count: 0, revenueVnd: 0 };
      marketBreakdown[m].count++;
      marketBreakdown[m].revenueVnd += Number(o.total_amount_vnd || 0);
    });

    const contextData = {
      totalOrdersCount: orders.length,
      marketBreakdown: marketBreakdown,
      healthAnomalies: health.anomalies,
      recentOrdersSample: orders.slice(0, 15).map(o => ({
        sn: o.order_sn,
        market: o.market_code,
        status: o.order_status,
        amountVnd: o.total_amount_vnd,
        created: o.order_created_time,
        inventoryDeducted: o.inventory_deducted
      })),
      recentReconciliations: recons.slice(0, 10).map(r => ({
        sn: r.order_sn,
        payoutVnd: r.actual_payout_vnd,
        status: r.recon_status
      }))
    };

    if (!apiKey) {
      // Fallback rule-based answering
      const q = userQuestion.toLowerCase();
      if (q.includes('thị trường') || q.includes('bán tốt')) {
        let bestMarket = 'N/A';
        let maxRev = 0;
        Object.keys(marketBreakdown).forEach(m => {
          if (marketBreakdown[m].revenueVnd > maxRev) {
            maxRev = marketBreakdown[m].revenueVnd;
            bestMarket = m;
          }
        });
        return {
          answer: `Thị trường có doanh thu cao nhất hiện tại là **${bestMarket}** với tổng doanh thu **${maxRev.toLocaleString('vi-VN')} VNĐ** (${marketBreakdown[bestMarket]?.count || 0} đơn).`
        };
      }
      if (q.includes('kẹt') || q.includes('cảnh báo') || q.includes('lỗi')) {
        return {
          answer: health.anomalies.length > 0
            ? `Phát hiện các điểm cần chú ý:\n- ${health.anomalies.join('\n- ')}`
            : 'Hệ thống hiện tại đang hoạt động bình thường, không có đơn hàng nào bị kẹt hay quá hạn SLA!'
        };
      }

      return {
        answer: `Hiện có tổng cộng ${orders.length} đơn hàng trong CSDL Shopee Global. Để đặt câu hỏi tự do mở rộng, vui lòng cấu hình GEMINI_API_KEY trong Script Properties.`
      };
    }

    const systemPrompt = `
Bạn là AI Quản Trị Cấp Cao (Virtual COO) của Rich Fish Aquarium. Bạn có quyền truy cập toàn bộ dữ liệu CSDL Shopee Global thực tế.
DỮ LIỆU THỜI GIAN THỰC ĐƯỢC CẤP:
${JSON.stringify(contextData)}

YÊU CẦU:
1. Trả lời câu hỏi của chủ doanh nghiệp bằng tiếng Việt chính xác, súc tích, dựa trên các con số cụ thể ở trên.
2. Nếu câu hỏi liên quan đến doanh thu/thị trường/đơn kẹt, trích dẫn chính xác mã đơn, số tiền VNĐ.
3. Không bịa đặt số liệu nằm ngoài ngữ cảnh được cung cấp.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nCâu hỏi của tôi: ${userQuestion}` }] }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 600
      }
    };

    try {
      const response = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      const res = JSON.parse(response.getContentText());
      if (res.candidates && res.candidates[0] && res.candidates[0].content) {
        return {
          answer: res.candidates[0].content.parts[0].text
        };
      } else {
        return { answer: 'AI không thể đưa ra câu trả lời cho câu hỏi này.' };
      }
    } catch (err) {
      return { answer: 'Không thể kết nối với bộ não Gemini AI: ' + err.message };
    }
  }
};

/**
 * Backend Endpoints phục vụ kết nối giao diện Web App qua google.script.run
 */
function apiGetExecutiveBrief() {
  return MasterGovernanceAgent.generateExecutiveBrief();
}

function apiAskMasterAI(question) {
  return MasterGovernanceAgent.queryAssistant(question);
}

function apiRunGovernanceHealthCheck() {
  return MasterGovernanceAgent.runHealthCheck();
}
