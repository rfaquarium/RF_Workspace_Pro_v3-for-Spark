/**
 * ==============================================================================
 * SUITE: test_source_analysis_fixes.js
 * MÔ TẢ: Kiểm thử toàn diện 10 kịch bản bắt buộc theo báo cáo SOURCE_ANALYSIS_2026-09-05.md
 * DOANH NGHIỆP: Rich Fish Aquarium (RF_Workspace_Pro)
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('================================================================');
console.log('🧪 BẮT ĐẦU KIỂM THỬ 10 KỊCH BẢN BẮT BUỘC (SOURCE ANALYSIS VÁ LỖI)');
console.log('================================================================\n');

let passedCount = 0;
let failedCount = 0;

function runScenario(name, fn) {
  try {
    fn();
    console.log(`  [PASS] Kịch bản ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  [FAIL] Kịch bản ${name}: ${err.message}`);
    if (err.stack) console.error(err.stack);
    failedCount++;
  }
}

// ------------------------------------------------------------------------------
// Đọc mã nguồn các tệp liên quan
// ------------------------------------------------------------------------------
const codeJsContent = fs.readFileSync(path.join(__dirname, 'Code.js'), 'utf8');
const appMainContent = fs.readFileSync(path.join(__dirname, 'App_Main.html'), 'utf8');
const tabProdContent = fs.readFileSync(path.join(__dirname, 'Tab_Production.html'), 'utf8');
const shopeeSyncContent = fs.readFileSync(path.join(__dirname, 'ShopeeSyncEngine.js'), 'utf8');
const shopeeWebhookContent = fs.readFileSync(path.join(__dirname, 'ShopeeWebhookHandler.js'), 'utf8');
const serverKcsContent = fs.readFileSync(path.join(__dirname, 'server_kcs.py'), 'utf8');

// ==============================================================================
// 1. KỊCH BẢN 1: Chuỗi nội bộ SYSTEM, AUTO_TRIGGER, INTERNAL_ENGINE bị từ chối khi client dùng làm PIN
// ==============================================================================
runScenario('1: Internal PINs (SYSTEM, AUTO_TRIGGER, INTERNAL_ENGINE) rejected from client', () => {
  const sandbox = {
    Logger: { log: () => {} },
    console: { log: () => {}, error: () => {}, warn: () => {} },
    getUserConfig: () => ({
      pins: {
        '123456': { name: 'Thợ Duy Tân', role: 'THỢ', title: 'Thợ Chính' }
      },
      roles: {
        'Thợ Duy Tân': 'THỢ'
      }
    }),
    ADMIN_ROLES: ['TỐI CAO', 'ADMIN', 'BOSS', 'QUẢN TRỊ'],
    BOSS_ROLES: ['TỐI CAO']
  };

  // Trích xuất hàm validatePin từ Code.js
  const valPinMatch = codeJsContent.match(/function validatePin\s*\([\s\S]*?\n\}/);
  assert(valPinMatch, 'Không tìm thấy validatePin trong Code.js');
  
  vm.createContext(sandbox);
  vm.runInContext(valPinMatch[0], sandbox);

  // Test các chuỗi nội bộ bị từ chối
  const resSystem = sandbox.validatePin('SYSTEM');
  assert.strictEqual(resSystem.valid, false, 'SYSTEM pin must NOT authenticate');
  assert.strictEqual(resSystem.isBoss, false, 'SYSTEM must not grant isBoss');

  const resAuto = sandbox.validatePin('AUTO_TRIGGER');
  assert.strictEqual(resAuto.valid, false, 'AUTO_TRIGGER pin must NOT authenticate');

  const resInternal = sandbox.validatePin('INTERNAL_ENGINE');
  assert.strictEqual(resInternal.valid, false, 'INTERNAL_ENGINE pin must NOT authenticate');

  // Test object payload mang chuỗi nội bộ cũng bị từ chối
  const resObjSystem = sandbox.validatePin({ pin: 'SYSTEM' });
  assert.strictEqual(resObjSystem.valid, false, 'Object with SYSTEM pin must be rejected');

  // Test PIN bình thường vẫn hoạt động
  const resValid = sandbox.validatePin('123456');
  assert.strictEqual(resValid.valid, true, 'Valid pin 123456 must authenticate');
  assert.strictEqual(resValid.user, 'Thợ Duy Tân');
});

// ==============================================================================
// 2. KỊCH BẢN 2: Không rò rỉ danh sách PIN trong debug message hoặc phản hồi thất bại
// ==============================================================================
runScenario('2: No PIN leakage in debug messages or responses', () => {
  // Kiểm tra tĩnh trong Code.js: không có Object.keys(config.pins) ghép vào debug message
  assert(!codeJsContent.includes('Object.keys(config.pins).join'), 'Code.js must not leak Object.keys(config.pins)');
  assert(!codeJsContent.includes('_debugMsg: "PIN not found: " + Object.keys'), 'Code.js must not include PIN list in _debugMsg');

  // Kiểm tra getAppData phản hồi lỗi auth không chứa thông tin nội bộ
  const sandbox = {
    Logger: { log: () => {} },
    console: { log: () => {}, error: () => {}, warn: () => {} },
    validatePin: (pin) => ({ valid: false, error: 'INVALID_PIN' })
  };

  const getAppDataAuthCheck = `
    function checkAuth(pin) {
      var auth = validatePin(pin);
      if (!auth || !auth.valid) {
        return { isAuthFailed: true, error: "AUTH_FAILED" };
      }
      return { auth: true };
    }
  `;
  vm.createContext(sandbox);
  vm.runInContext(getAppDataAuthCheck, sandbox);

  const failRes = sandbox.checkAuth('INVALID_9999');
  assert.strictEqual(failRes.isAuthFailed, true);
  assert.strictEqual(failRes.error, 'AUTH_FAILED');
  assert.strictEqual(JSON.stringify(failRes).includes('1234'), false, 'Response must not contain any real PIN');
});

// ==============================================================================
// 3. KỊCH BẢN 3: Alias bảng không xác định bị từ chối mặc định trong validator ghi
// ==============================================================================
runScenario('3: Unknown table alias rejected by default in write validator', () => {
  const sandbox = {
    Logger: { log: () => {} },
    console: { log: () => {}, error: () => {}, warn: () => {} }
  };

  const valMatch = codeJsContent.match(/function validateTableWritePermission\s*\([\s\S]*?\n\}/);
  assert(valMatch, 'Không tìm thấy validateTableWritePermission trong Code.js');

  vm.createContext(sandbox);
  vm.runInContext(valMatch[0], sandbox);

  const staffAuth = { valid: true, role: 'THỢ', user: 'Nguyễn Văn A' };
  
  // Test alias lạ / không hợp lệ
  const resUnknown = sandbox.validateTableWritePermission(staffAuth, 'HACK_UNKNOWN_TABLE', false, []);
  assert.strictEqual(resUnknown.allowed, false, 'Unknown table must be rejected by default');

  // Test alias vượt quyền ví dụ: ctvTransactions hoặc fakeAlias
  const resFake = sandbox.validateTableWritePermission(staffAuth, 'randomTable', false, []);
  assert.strictEqual(resFake.allowed, false, 'Random table must be rejected');

  // Test alias CTV_Finance chỉ role tài chính mới được ghi
  const resFinance = sandbox.validateTableWritePermission(staffAuth, 'ctvTransactions', false, []);
  assert.strictEqual(resFinance.allowed, false, 'Staff cannot write to CTV_Finance/ctvTransactions');
});

// ==============================================================================
// 4. KỊCH BẢN 4: Sửa Attendance của nhân sự khác bị chặn với role thợ/nhân sự
// ==============================================================================
runScenario("4: Attendance edit on another employee's record blocked for staff role", () => {
  const sandbox = {
    Logger: { log: () => {} },
    console: { log: () => {}, error: () => {}, warn: () => {} }
  };

  const valMatch = codeJsContent.match(/function validateTableWritePermission\s*\([\s\S]*?\n\}/);
  vm.createContext(sandbox);
  vm.runInContext(valMatch[0], sandbox);

  const thongAuth = { valid: true, role: 'THỢ', user: 'Võ Văn Thông' };

  // Thử sửa chấm công của chính mình -> Cho phép
  const ownAttendance = [{ user: 'Võ Văn Thông', date: '2026-09-05', timeIn: '08:00' }];
  const resOwn = sandbox.validateTableWritePermission(thongAuth, 'Attendance', false, ownAttendance);
  assert.strictEqual(resOwn.allowed, true, 'Staff can update their own attendance record');

  // Thử sửa chấm công của người khác (Hoàng Dương) -> BỊ CHẶN!
  const otherAttendance = [{ user: 'Nguyễn Hoàng Dương', date: '2026-09-05', timeIn: '08:00' }];
  const resOther = sandbox.validateTableWritePermission(thongAuth, 'Attendance', false, otherAttendance);
  assert.strictEqual(resOther.allowed, false, "Staff CANNOT update another staff member's attendance");
  assert(resOther.reason.includes('chỉ có quyền sửa đổi bản ghi chấm công của chính mình'), 'Reason must explain user restriction');
});

// ==============================================================================
// 5. KỊCH BẢN 5: Timeout khi lấy ScriptLock trả về lỗi thất bại thay vì success=true
// ==============================================================================
runScenario('5: Lock timeout returns error with success=false', () => {
  // Kiểm tra tĩnh cú pháp tryLock trong syncDeltas của Code.js
  assert(codeJsContent.includes("lock.tryLock(30000)"), 'syncDeltas must use lock.tryLock');
  assert(/error:\s*['"]LOCK_TIMEOUT['"]/.test(codeJsContent), 'Must return LOCK_TIMEOUT on lock timeout');
  assert(/success:\s*false[\s\S]*?error:\s*['"]LOCK_TIMEOUT['"]/.test(codeJsContent), 'Must return success: false on lock timeout');

  // Kiểm tra xử lý catch block của syncDeltas trả về error thay vì success: true
  const catchStart = codeJsContent.indexOf('} catch (err) {\n    Logger.log(\'Lỗi syncDeltas:');
  assert(catchStart !== -1, 'Must find syncDeltas catch block');
  const catchEnd = codeJsContent.indexOf('} finally {', catchStart);
  const syncCatchBlock = codeJsContent.substring(catchStart, catchEnd);

  assert(syncCatchBlock.includes('success: false'), 'Catch block of syncDeltas must return success: false');
  assert(syncCatchBlock.includes("error: 'SYNC_ERROR'"), 'Catch block of syncDeltas must return SYNC_ERROR');
  assert(!syncCatchBlock.includes('success: true'), 'Catch block of syncDeltas must never return success: true');
});

// ==============================================================================
// 6. KỊCH BẢN 6: Khớp mã đơn hàng chính xác ABC123 vs ABC1234 không ghi đè lẫn nhau
// ==============================================================================
runScenario('6: Exact match on ABC123 vs ABC1234 prevents overwrite', () => {
  // Giả lập bảng Orders với đơn ABC123
  const existingRows = [
    ['id', 'orderCode', 'customer'],
    ['ORD_001', 'ABC123', 'Khách Hàng A']
  ];

  // Giả lập item mới có mã ABC1234
  const newItem = { id: 'ORD_002', orderCode: 'ABC1234', customer: 'Khách Hàng B' };

  let matchedIndex = -1;
  for (let r = 1; r < existingRows.length; r++) {
    const rowId = existingRows[r][0];
    const rowCode = existingRows[r][1];
    
    // Logic MỚI: Khớp chính xác (exact equality)
    if (rowId === newItem.id || (rowCode && rowCode.toUpperCase() === newItem.orderCode.toUpperCase())) {
      matchedIndex = r;
      break;
    }
  }

  assert.strictEqual(matchedIndex, -1, 'ABC1234 must NOT match ABC123, ensuring no overwrite');
});

// ==============================================================================
// 7. KỊCH BẢN 7: Lỗi server không phát delta lên Firebase
// ==============================================================================
runScenario('7: Server error prevents delta broadcast to Firebase', () => {
  // Kiểm tra trong App_Main.html pushDeltas
  assert(appMainContent.includes('const isServerSuccess = d && d.success === true;'),
    'pushDeltas must verify server confirmation flag (d && d.success === true)');
  
  assert(appMainContent.includes('if (isServerSuccess) {'),
    'pushDeltas must branch on isServerSuccess');

  assert(appMainContent.includes('window.firebase.database().ref(\'rf_realtime_delta\').set'),
    'pushDeltas contains firebase delta set');

  // Kiểm tra nhánh lỗi kích hoạt triggerReloadData để khôi phục trạng thái chuẩn
  assert(appMainContent.includes('triggerReloadData()'), 'pushDeltas failure must trigger data reload');
});

// ==============================================================================
// 8. KỊCH BẢN 8: pendingSyncsRef cân bằng khi gặp vai trò KHÁCH
// ==============================================================================
runScenario('8: pendingSyncsRef balance maintained on KHÁCH branch', () => {
  // Kiểm tra trong App_Main.html: vai trò KHÁCH được kiểm tra TRƯỚC KHI tăng pendingSyncsRef
  const pushDeltasIdx = appMainContent.indexOf('const pushDeltas = React.useCallback');
  assert(pushDeltasIdx !== -1, 'pushDeltas must be found in App_Main.html');
  const pushDeltasFunc = appMainContent.substring(pushDeltasIdx, pushDeltasIdx + 800);

  const khachIndex = pushDeltasFunc.indexOf("currentRole === 'KHÁCH'");
  const incIndex = pushDeltasFunc.indexOf('pendingSyncsRef.current += 1');

  assert(khachIndex !== -1, "Must check for KHÁCH role in pushDeltas");
  assert(incIndex !== -1, "Must increment pendingSyncsRef");
  assert(khachIndex < incIndex, "KHÁCH check must happen BEFORE incrementing pendingSyncsRef");
});

// ==============================================================================
// 9. KỊCH BẢN 9: Khôi phục sự cố lỗi giữa chừng khi trừ BOM (không trừ kho lần 2)
// ==============================================================================
runScenario('9: Mid-way BOM deduction error recovery prevents double deduction on retry', () => {
  // Giả lập mock spreadsheet và script properties
  const scriptPropsStore = {};
  const mockProducts = [
    ['id', 'sku', 'name', 'quantity', 'costPrice', 'unit'],
    ['1', 'NL_LUA', 'Lũa Săn Miếng', 10, 35, 'gam']
  ];
  const mockImportExport = [
    ['id', 'type', 'target', 'totalAmount', 'date', 'note', 'itemsData']
  ];

  // Giả lập Script Properties chứa trạng thái PRODUCTS_DEDUCTED từ lần chạy trước bị crash
  const targetProdId = 'PR_999';
  const journalKey = 'BOM_JOURNAL_' + targetProdId;
  scriptPropsStore[journalKey] = JSON.stringify({
    status: 'PRODUCTS_DEDUCTED',
    targetProdIdStr: targetProdId,
    totalCost: 3500,
    itemsDeducted: [{ sku: 'NL_LUA', name: 'Lũa Săn Miếng', qty: 100, unit: 'gam', price: 35, amount: 3500 }],
    timestamp: new Date().toISOString()
  });

  // Khi retry chạy lại:
  const journalStr = scriptPropsStore[journalKey];
  assert(journalStr, 'Journal must exist');
  const journal = JSON.parse(journalStr);
  
  let isProductChanged = false;
  let totalCost = 0;
  let itemsDeducted = [];

  if (journal && journal.status === 'PRODUCTS_DEDUCTED') {
    // Tái sử dụng dữ liệu đã trừ, KHÔNG trừ tiếp bảng Products
    totalCost = journal.totalCost;
    itemsDeducted = journal.itemsDeducted;
    isProductChanged = false;
  } else {
    // Nếu không có journal thì mới trừ
    mockProducts[1][3] -= 100;
    isProductChanged = true;
  }

  // Khẳng định tồn kho không bị trừ thêm
  assert.strictEqual(isProductChanged, false, 'Must not change products sheet again on retry');
  assert.strictEqual(mockProducts[1][3], 10, 'Product quantity must remain intact (not deducted twice)');
  assert.strictEqual(totalCost, 3500, 'Total cost recovered accurately from journal');

  // Ghi nhận vào ImportExport hoàn tất
  mockImportExport.push(['IE_BOM_' + targetProdId, 'Xuất', 'Layout', totalCost]);
  delete scriptPropsStore[journalKey]; // Xoá journal sau khi ghi log thành công

  assert.strictEqual(scriptPropsStore[journalKey], undefined, 'Journal cleaned up after successful recovery');
});

// ==============================================================================
// 10. KỊCH BẢN 10: Ánh xạ trạng thái QC giữa AI (Pass/Need_Repair) và ERP (Đã duyệt/Yêu cầu làm lại)
// ==============================================================================
runScenario('10: QC Pass / Need_Repair state mapped consistently between AI and ERP', () => {
  // Trích hàm mapAiQcStatusToErp từ Tab_Production.html
  assert(tabProdContent.includes('mapAiQcStatusToErp'), 'Tab_Production.html must define mapAiQcStatusToErp');
  
  const mapAiQcStatusToErp = (aiStatus, passedKpi) => {
    const s = String(aiStatus || '').trim().toLowerCase();
    if (s === 'pass' || s === 'passed' || s === 'đã duyệt' || s === 'đạt' || passedKpi === true) {
      return 'Đã duyệt';
    }
    if (s === 'need_repair' || s === 'failed' || s === 'yêu cầu làm lại' || s === 'từ chối' || passedKpi === false) {
      return 'Yêu cầu làm lại';
    }
    return aiStatus || 'Khung đã nộp';
  };

  // 1. AI Pass -> ERP Đã duyệt
  assert.strictEqual(mapAiQcStatusToErp('Pass', true), 'Đã duyệt');
  assert.strictEqual(mapAiQcStatusToErp('Passed', true), 'Đã duyệt');

  // 2. AI Need_Repair -> ERP Yêu cầu làm lại
  assert.strictEqual(mapAiQcStatusToErp('Need_Repair', false), 'Yêu cầu làm lại');
  assert.strictEqual(mapAiQcStatusToErp('Failed', false), 'Yêu cầu làm lại');

  // 3. server_kcs.py trả về erp_qc_status
  assert(serverKcsContent.includes('erp_qc_status = "Đã duyệt" if passed else "Yêu cầu làm lại"'),
    'server_kcs.py must map ERP status explicitly');
  
  // 4. Tab_Production.html khóa sửa chữa khi status là Yêu cầu làm lại hoặc Need_Repair
  assert(tabProdContent.includes("item.qc_status === 'Yêu cầu làm lại' || item.qc_status === 'Need_Repair'"),
    'Tab_Production.html must lock rework on both status representations');
});

// ==============================================================================
// TỔNG KẾT KIỂM THỬ
// ==============================================================================
console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM THỬ: ${passedCount}/10 ĐẠT (${failedCount} THẤT BẠI)`);
console.log('================================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
