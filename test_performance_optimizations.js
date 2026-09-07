/**
 * ⚡ TEST SUITE CHUYÊN SÂU: KIỂM ĐỊNH HIỆU NĂNG & TÍNH TOÀN VẸN CƠ SỞ DỮ LIỆU
 * RF WORKSPACE PRO - PERFORMANCE & DATA INTEGRITY VERIFICATION
 * 
 * Kiểm tra các tính năng tối ưu:
 * 1. Bảo toàn công thức trên cả dòng đang sửa (Zero Formula Loss)
 * 2. In-flight indexing O(1), gom cụm contiguous range batch write, cộng dồn _diff nhiều lần
 * 3. SmartMerge ưu tiên Optimistic UI gần nhất (< 60s), loại bỏ stale server overwrite
 * 4. CacheService tách biệt display config & generation token authoritative auth
 * 5. Build manifest SHA-256 integrity
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

let totalTests = 0;
let passedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
  }
}

console.log('================================================================');
console.log('⚡ BẮT ĐẦU TEST BỘ TỐI ƯU HIỆU NĂNG & AN TOÀN DỮ LIỆU (RF WORKSPACE PRO)');
console.log('================================================================\n');

// Đọc mã nguồn Code.js
const codeJsPath = path.join(__dirname, 'Code.js');
const codeJsContent = fs.readFileSync(codeJsPath, 'utf8');

// ==============================================================================
// 1. KIỂM ĐỊNH BẢO TOÀN CÔNG THỨC & CONTIGUOUS CHUNKING (applyDeltasToSheet)
// ==============================================================================
console.log('--- 1. Kiểm định Bảo toàn Công thức & Contiguous Batch Range Write ---');

function createMockSpreadsheet(initialData, initialFormulas) {
  const sheetData = JSON.parse(JSON.stringify(initialData));
  const sheetFormulas = JSON.parse(JSON.stringify(initialFormulas || initialData.map(row => row.map(() => ''))));
  const writeOperations = [];

  const mockRange = (startRow, startCol, numRows, numCols) => ({
    getValues: () => {
      const res = [];
      for (let r = 0; r < numRows; r++) {
        const row = [];
        for (let c = 0; c < numCols; c++) {
          row.push(sheetData[startRow - 1 + r]?.[startCol - 1 + c] ?? '');
        }
        res.push(row);
      }
      return res;
    },
    getFormulas: () => {
      const res = [];
      for (let r = 0; r < numRows; r++) {
        const row = [];
        for (let c = 0; c < numCols; c++) {
          row.push(sheetFormulas[startRow - 1 + r]?.[startCol - 1 + c] ?? '');
        }
        res.push(row);
      }
      return res;
    },
    setValues: (newVals) => {
      writeOperations.push({
        startRow,
        startCol,
        numRows,
        numCols,
        values: JSON.parse(JSON.stringify(newVals))
      });
      for (let r = 0; r < newVals.length; r++) {
        const targetRowIdx = startRow - 1 + r;
        if (!sheetData[targetRowIdx]) sheetData[targetRowIdx] = [];
        if (!sheetFormulas[targetRowIdx]) sheetFormulas[targetRowIdx] = [];
        for (let c = 0; c < newVals[r].length; c++) {
          const val = newVals[r][c];
          sheetData[targetRowIdx][startCol - 1 + c] = val;
          if (typeof val === 'string' && val.startsWith('=')) {
            sheetFormulas[targetRowIdx][startCol - 1 + c] = val;
          } else {
            sheetFormulas[targetRowIdx][startCol - 1 + c] = '';
          }
        }
      }
    }
  });

  const mockSheet = {
    getDataRange: () => mockRange(1, 1, sheetData.length, sheetData[0]?.length || 0),
    getRange: (r, c, nr, nc) => mockRange(r, c, nr, nc),
    getLastRow: () => sheetData.length,
    getMaxRows: () => Math.max(sheetData.length, 500),
    getMaxColumns: () => Math.max(sheetData[0]?.length || 35, 35),
    insertRowsAfter: (afterRow, howMany) => {},
    insertColumnsAfter: (afterCol, howMany) => {},
    appendRow: (rowArr) => {
      sheetData.push([...rowArr]);
      sheetFormulas.push(rowArr.map(v => (typeof v === 'string' && v.startsWith('=') ? v : '')));
      writeOperations.push({ type: 'appendRow', values: [...rowArr] });
    },
    _getData: () => sheetData,
    _getFormulas: () => sheetFormulas,
    _getWrites: () => writeOperations
  };

  return {
    getSheetByName: (name) => mockSheet,
    _sheet: mockSheet
  };
}

// Trích xuất applyDeltasToSheet từ Code.js
const applyDeltasFnMatch = codeJsContent.match(/function applyDeltasToSheet\s*\([\s\S]*?\n\}/);
assert(applyDeltasFnMatch, 'Không tìm thấy hàm applyDeltasToSheet trong Code.js');

// Standard formatters return object matching sheet headers
const formatFnOrder = (item) => ({ ...item });
const formatFnProduct = (item) => ({ ...item });

function runApplyDeltas(sheetName, deltas, formatFn, mockSs) {
  const sandbox = {
    SpreadsheetApp: { getActiveSpreadsheet: () => mockSs },
    SCHEMA: {
      Orders: ['id', 'orderCode', 'channel', 'customer', 'createdAt', 'deadline', 'date', 'status', 'accessories', 'hasProduction', 'isCarriedToWH', 'updatedBy', 'revenue', 'phone', 'address', 'note', 'prePaid', 'cod', 'costTotal', 'responsibleUser', 'discount', 'shippingMethod', 'sizeCoefficient', 'cogs', 'feeFixed', 'feeService', 'feePayment', 'feeAffiliate', 'shopVoucher', 'tax', 'reconciledAt', 'isReconciled'],
      Production: ['id', 'orderId', 'type', 'name', 'note', 'status', 'deadline', 'fulfilledFromStock', 'p1_name', 'p1_status', 'p1_user', 'p1_start', 'p1_endTime', 'p1_photo', 'p1_reward_vnd', 'p2_name', 'p2_status', 'p2_user', 'p2_start', 'p2_endTime', 'p2_photo', 'p2_reward_vnd', 'qc_front_photo', 'qc_side_photo', 'qc_status', 'qc_note'],
      Attendance: ['id', 'user', 'date', 'morningIn', 'morningOut', 'afternoonIn', 'afternoonOut', 'leaveType', 'leaveReportAt', 'shift', 'timeIn', 'timeOut', 'totalHours', 'status', 'penalty', 'isEdited', 'leaveStart', 'leaveEnd', 'note']
    },
    SCHEMA_ERP: {
      Products: ['id', 'sku', 'name', 'unit', 'image', 'category', 'sub_category', 'costPrice', 'price', 'quantity', 'minStock', 'maxStock', 'realImage', 'importUnit', 'conversionRate', 'model3D'],
      Accounts: ['id', 'accountName', 'balance', 'type', 'accountNumber', 'accountOwner']
    },
    Logger: { log: () => {} },
    console: { log: () => {}, warn: () => {}, error: () => {} }
  };
  vm.createContext(sandbox);
  vm.runInContext(applyDeltasFnMatch[0], sandbox);
  return sandbox.applyDeltasToSheet(sheetName, deltas, formatFn, mockSs);
}

runTest('Bảo toàn công thức cả trên dòng đang sửa (Zero Formula Loss)', () => {
  const headers = ['id', 'orderCode', 'channel', 'customer', 'createdAt', 'deadline', 'date', 'status', 'accessories', 'hasProduction', 'isCarriedToWH', 'updatedBy', 'revenue', 'phone', 'address', 'note', 'prePaid', 'cod', 'costTotal', 'responsibleUser', 'discount', 'shippingMethod', 'sizeCoefficient', 'cogs', 'feeFixed', 'feeService', 'feePayment', 'feeAffiliate', 'shopVoucher', 'tax', 'reconciledAt', 'isReconciled'];
  
  // Dòng 2: Cột 23 (cogs) là một công thức Google Sheets: =SUM(U2:W2)
  const initialValues = [
    headers,
    ['ORD_001', 'RF101', 'Shopee', 'Khách VIP', '2026-09-01', '2026-09-02', '2026-09-01', 'Chờ Sản Xuất', 'Bể 60x40', 'TRUE', 'FALSE', 'Admin', 500000, '0901234567', 'Hà Nội', 'Ghi chú', 0, 500000, 300000, 'Diệu Hương', 0, 'GHN', 1, 300000, 10000, 5000, 5000, 0, 0, 0, '', false]
  ];

  const initialFormulas = [
    headers.map(() => ''),
    headers.map((h, idx) => (idx === 23 ? '=SUM(U2:W2)' : (idx === 15 ? '=CONCATENATE(D2, " - ", B2)' : '')))
  ];

  const mockSs = createMockSpreadsheet(initialValues, initialFormulas);

  // Gửi delta chỉ sửa status thành "Đã Bàn Giao", KHÔNG gửi cogs hay note
  const deltas = [
    { id: 'ORD_001', status: 'Đã Bàn Giao' }
  ];

  runApplyDeltas('Orders', deltas, formatFnOrder, mockSs);

  const finalWrites = mockSs._sheet._getWrites();
  assert(finalWrites.length > 0, 'Phải có ghi dữ liệu xuống sheet');

  const finalRow = finalWrites[0].values[0];
  // Kiểm tra status đã cập nhật
  assert.strictEqual(finalRow[7], 'Đã Bàn Giao', 'Status phải được cập nhật thành Đã Bàn Giao');
  // KIỂM TRA THEN CHỐT: Cột cogs (index 23) và note (index 15) phải giữ nguyên vẹn chuỗi công thức!
  assert.strictEqual(finalRow[23], '=SUM(U2:W2)', 'Công thức tại cột cogs phải được bảo toàn nguyên vẹn chuỗi =SUM(U2:W2)');
  assert.strictEqual(finalRow[15], '=CONCATENATE(D2, " - ", B2)', 'Công thức tại cột note phải được bảo toàn nguyên vẹn');
});

runTest('Gửi nhiều cập nhật cho cùng 1 ID trong cùng lô: In-flight map cập nhật đúng, chỉ ghi 1 lần', () => {
  const headers = ['id', 'orderCode', 'channel', 'customer', 'createdAt', 'deadline', 'date', 'status', 'accessories', 'hasProduction', 'isCarriedToWH', 'updatedBy', 'revenue', 'phone', 'address', 'note', 'prePaid', 'cod', 'costTotal', 'responsibleUser', 'discount', 'shippingMethod', 'sizeCoefficient', 'cogs', 'feeFixed', 'feeService', 'feePayment', 'feeAffiliate', 'shopVoucher', 'tax', 'reconciledAt', 'isReconciled'];
  
  const initialValues = [
    headers,
    ['ORD_002', 'RF102', 'Lazada', 'Anh Nam', '2026-09-01', '', '', 'Chờ Sản Xuất', '', '', '', '', 200000, '', '', 'Lưu ý ban đầu', 0, 0, 0, '', 0, '', 1, 0, 0, 0, 0, 0, 0, 0, '', false]
  ];

  const mockSs = createMockSpreadsheet(initialValues);

  // Gửi 2 updates liên tiếp cho cùng ORD_002 trong cùng 1 batch
  const deltas = [
    { id: 'ORD_002', status: 'Sẵn Sàng Đóng Gói' },
    { id: 'ORD_002', note: 'Ghi chú đã cập nhật lần 2' }
  ];

  runApplyDeltas('Orders', deltas, formatFnOrder, mockSs);

  const writes = mockSs._sheet._getWrites();
  // Sửa trên cùng 1 dòng -> chỉ có 1 batch write range
  assert.strictEqual(writes.length, 1, 'Chỉ thực hiện 1 đợt ghi duy nhất cho dòng được sửa');
  const writtenRow = writes[0].values[0];
  assert.strictEqual(writtenRow[7], 'Sẵn Sàng Đóng Gói', 'Trạng thái từ update 1 phải được giữ');
  assert.strictEqual(writtenRow[15], 'Ghi chú đã cập nhật lần 2', 'Ghi chú từ update 2 phải được giữ');
});

runTest('Thêm bản ghi mới rồi cập nhật ngay trong cùng một yêu cầu: Không tạo 2 dòng thừa', () => {
  const headers = ['id', 'orderCode', 'channel', 'customer', 'createdAt', 'deadline', 'date', 'status', 'accessories', 'hasProduction', 'isCarriedToWH', 'updatedBy', 'revenue', 'phone', 'address', 'note', 'prePaid', 'cod', 'costTotal', 'responsibleUser', 'discount', 'shippingMethod', 'sizeCoefficient', 'cogs', 'feeFixed', 'feeService', 'feePayment', 'feeAffiliate', 'shopVoucher', 'tax', 'reconciledAt', 'isReconciled'];
  const initialValues = [headers];

  const mockSs = createMockSpreadsheet(initialValues);

  // Delta 1: Thêm mới ORD_NEW
  // Delta 2: Cập nhật ngay ORD_NEW trong cùng request
  const deltas = [
    { id: 'ORD_NEW', orderCode: 'RF999', customer: 'Khách Mới', status: 'Chờ Sản Xuất' },
    { id: 'ORD_NEW', status: 'Đã Bàn Giao', revenue: 750000 }
  ];

  runApplyDeltas('Orders', deltas, formatFnOrder, mockSs);

  const writes = mockSs._sheet._getWrites();
  // Tổng số dòng thêm mới vào sheet phải chính xác là 1 dòng
  assert.strictEqual(writes.length, 1, 'Chỉ ghi đúng 1 lần append duy nhất');
  assert.strictEqual(writes[0].numRows, 1, 'Số dòng append phải là 1, không được sinh 2 dòng thừa');
  const insertedRow = writes[0].values[0];
  assert.strictEqual(insertedRow[0], 'ORD_NEW');
  assert.strictEqual(insertedRow[7], 'Đã Bàn Giao', 'Trạng thái từ delta 2 phải ghi nhận');
  assert.strictEqual(insertedRow[12], 750000, 'Doanh thu từ delta 2 phải ghi nhận');
});

runTest('Cộng dồn _diff nhiều lần trong cùng một lô kho: +3 rồi +2 -> thành +5', () => {
  const headers = ['id', 'sku', 'name', 'unit', 'image', 'category', 'sub_category', 'costPrice', 'price', 'quantity', 'minStock', 'maxStock', 'realImage', 'importUnit', 'conversionRate', 'model3D'];
  const initialValues = [
    headers,
    ['PROD_KEO', 'KEO-502', 'Keo dán kính', 'Chai', '', 'Vật tư', '', 20000, 30000, 10, 5, 50, '', '', 1, '']
  ];

  const mockSs = createMockSpreadsheet(initialValues);

  // Gửi 2 lần _diff cho cùng PROD_KEO: +3 và +2
  const deltas = [
    { id: 'PROD_KEO', _diff: 3 },
    { id: 'PROD_KEO', _diff: 2 }
  ];

  runApplyDeltas('Products', deltas, formatFnProduct, mockSs);

  const writes = mockSs._sheet._getWrites();
  assert.strictEqual(writes.length, 1, 'Chỉ 1 đợt ghi');
  const updatedRow = writes[0].values[0];
  // Số lượng ban đầu 10 + 3 + 2 = 15
  assert.strictEqual(updatedRow[9], 15, 'Số lượng tồn kho sau 2 lần _diff liên tiếp phải là 15 (10 + 3 + 2)');
});

runTest('Exact Match orderCode: RF100 và RF1001 độc lập, không bị đè lên nhau', () => {
  const headers = ['id', 'orderCode', 'channel', 'customer', 'createdAt', 'deadline', 'date', 'status', 'accessories', 'hasProduction', 'isCarriedToWH', 'updatedBy', 'revenue', 'phone', 'address', 'note', 'prePaid', 'cod', 'costTotal', 'responsibleUser', 'discount', 'shippingMethod', 'sizeCoefficient', 'cogs', 'feeFixed', 'feeService', 'feePayment', 'feeAffiliate', 'shopVoucher', 'tax', 'reconciledAt', 'isReconciled'];
  
  const initialValues = [
    headers,
    ['ID_A', 'RF100', 'Shopee', 'Khách A', '', '', '', 'Chờ Sản Xuất', '', '', '', '', 100, '', '', '', 0, 0, 0, '', 0, '', 1, 0, 0, 0, 0, 0, 0, 0, '', false],
    ['ID_B', 'RF1001', 'TikTok', 'Khách B', '', '', '', 'Chờ Sản Xuất', '', '', '', '', 200, '', '', '', 0, 0, 0, '', 0, '', 1, 0, 0, 0, 0, 0, 0, 0, '', false]
  ];

  const mockSs = createMockSpreadsheet(initialValues);

  // Sửa đơn theo orderCode 'RF100'
  const deltas = [
    { orderCode: 'RF100', status: 'Hoàn Thành' }
  ];

  runApplyDeltas('Orders', deltas, formatFnOrder, mockSs);

  const writes = mockSs._sheet._getWrites();
  assert.strictEqual(writes.length, 1);
  // Chỉ dòng 2 (startRow = 2) bị sửa, dòng 3 không bị đụng tới
  assert.strictEqual(writes[0].startRow, 2, 'Dòng được sửa phải là dòng 2 của RF100');
  assert.strictEqual(writes[0].values[0][1], 'RF100');
  assert.strictEqual(writes[0].values[0][7], 'Hoàn Thành');
});

runTest('Contiguous range batching: Gom các dòng liền kề và tách rời các dòng cách xa', () => {
  const headers = ['id', 'orderCode', 'channel', 'customer', 'createdAt', 'deadline', 'date', 'status', 'accessories', 'hasProduction', 'isCarriedToWH', 'updatedBy', 'revenue', 'phone', 'address', 'note', 'prePaid', 'cod', 'costTotal', 'responsibleUser', 'discount', 'shippingMethod', 'sizeCoefficient', 'cogs', 'feeFixed', 'feeService', 'feePayment', 'feeAffiliate', 'shopVoucher', 'tax', 'reconciledAt', 'isReconciled'];
  
  // Tạo 10 dòng (từ row 2 đến row 11)
  const initialValues = [headers];
  for (let i = 1; i <= 10; i++) {
    initialValues.push([`ID_${i}`, `RF_${i}`, 'Shopee', `Khách ${i}`, '', '', '', 'Pending', '', '', '', '', 100, '', '', '', 0, 0, 0, '', 0, '', 1, 0, 0, 0, 0, 0, 0, 0, '', false]);
  }

  const mockSs = createMockSpreadsheet(initialValues);

  // Sửa dòng 2, 3 (liền kề) và dòng 7, 8 (liền kề nhưng cách xa 2,3)
  const deltas = [
    { id: 'ID_1', status: 'Done' }, // row 2
    { id: 'ID_2', status: 'Done' }, // row 3
    { id: 'ID_6', status: 'Done' }, // row 7
    { id: 'ID_7', status: 'Done' }  // row 8
  ];

  runApplyDeltas('Orders', deltas, formatFnOrder, mockSs);

  const writes = mockSs._sheet._getWrites();
  // Phải gom thành đúng 2 chunks độc lập
  assert.strictEqual(writes.length, 2, 'Hệ thống phải chia thành 2 contiguous chunks');
  assert.strictEqual(writes[0].startRow, 2, 'Chunk 1 bắt đầu từ row 2');
  assert.strictEqual(writes[0].numRows, 2, 'Chunk 1 gồm 2 dòng (row 2 và row 3)');
  assert.strictEqual(writes[1].startRow, 7, 'Chunk 2 bắt đầu từ row 7');
  assert.strictEqual(writes[1].numRows, 2, 'Chunk 2 gồm 2 dòng (row 7 và row 8)');
});

// ==============================================================================
// 2. KIỂM ĐỊNH SMARTMERGE & CONCURRENCY TRÊN FRONTEND (App_Main.html)
// ==============================================================================
console.log('\n--- 2. Kiểm định SmartMerge & Concurrency Guards ---');

const appMainPath = path.join(__dirname, 'App_Main.html');
const appMainContent = fs.readFileSync(appMainPath, 'utf8');

runTest('App_Main.html chứa đầy đủ concurrency refs và time threshold', () => {
  assert(appMainContent.includes('lastStateMutationTimestampRef'), 'Phải có lastStateMutationTimestampRef');
  assert(appMainContent.includes('activeSessionIdRef'), 'Phải có activeSessionIdRef');
  assert(appMainContent.includes('fetchSeqRef'), 'Phải có fetchSeqRef');
  assert(appMainContent.includes('isFetchingRef'), 'Phải có isFetchingRef');
  assert(appMainContent.includes('refetchQueuedRef'), 'Phải có refetchQueuedRef');
});

// Trích xuất callback function của smartMerge và smartMergeOrders từ App_Main.html
function extractSmartMergeHelpers() {
  const smartMergeMatch = appMainContent.match(/const smartMerge = React\.useCallback\(([\s\S]*?)\n\s*\}, \[\]\);/);
  assert(smartMergeMatch, 'Không tìm thấy smartMerge useCallback trong App_Main.html');

  const smartMergeOrdersMatch = appMainContent.match(/const smartMergeOrders = React\.useCallback\(([\s\S]*?)\n\s*\}, \[\]\);/);
  assert(smartMergeOrdersMatch, 'Không tìm thấy smartMergeOrders useCallback trong App_Main.html');

  const sandbox = {
    Date: { now: () => 1000000 },
    Map: Map,
    Array: Array
  };
  vm.createContext(sandbox);
  // Thực thi trực tiếp biểu thức callback trong closure sandbox
  const smartMerge = vm.runInContext('(' + smartMergeMatch[1] + '\n})', sandbox);
  const smartMergeOrders = vm.runInContext('(' + smartMergeOrdersMatch[1] + '\n})', sandbox);

  return { smartMerge, smartMergeOrders };
}

runTest('smartMerge: Bảo vệ thao tác Optimistic vừa lưu (< 60s) trước server response chậm', () => {
  const { smartMerge } = extractSmartMergeHelpers();

  const localList = [
    {
      id: 'ORD_101',
      status: 'Đã Bàn Giao',
      note: 'Vừa bàn giao lúc 10h',
      _optimisticTime: 980000 // Cách đây 20s (< 60s)
    }
  ];

  // Server trả lời muộn với trạng thái cũ
  const serverList = [
    {
      id: 'ORD_101',
      status: 'Chờ Sản Xuất', // Trạng thái cũ trên server
      note: 'Ghi chú cũ trên server'
    }
  ];

  const merged = smartMerge(localList, serverList);
  assert.strictEqual(merged.length, 1);
  // Do _optimisticTime < 60s, localItem phải ghi đè serverItem
  assert.strictEqual(merged[0].status, 'Đã Bàn Giao', 'Trạng thái local vừa thao tác phải được bảo toàn');
  assert.strictEqual(merged[0].note, 'Vừa bàn giao lúc 10h', 'Ghi chú local vừa thao tác phải được bảo toàn');
});

runTest('smartMerge: Chấp nhận server update nếu thao tác local đã quá 60s (hết hạn optimistic)', () => {
  const { smartMerge } = extractSmartMergeHelpers();

  const localList = [
    {
      id: 'ORD_102',
      status: 'Chờ Sản Xuất',
      _optimisticTime: 900000 // Cách đây 100s (> 60s)
    }
  ];

  const serverList = [
    {
      id: 'ORD_102',
      status: 'Sẵn Sàng Đóng Gói' // Server cập nhật mới hơn từ người khác
    }
  ];

  const merged = smartMerge(localList, serverList);
  assert.strictEqual(merged.length, 1);
  // Sau 60s, server updates được phép đồng bộ vào
  assert.strictEqual(merged[0].status, 'Sẵn Sàng Đóng Gói', 'Server update được chấp nhận sau 60s');
});

runTest('smartMergeOrders: Bảo tồn Optimistic UI cho bảng Orders tương tự', () => {
  const { smartMergeOrders } = extractSmartMergeHelpers();

  const localOrders = [
    { id: 'O_1', orderCode: 'RF01', status: 'Hoàn Kho Đạt', _optimisticTime: 990000 }
  ];
  const serverOrders = [
    { id: 'O_1', orderCode: 'RF01', status: 'Chờ Sản Xuất' }
  ];

  const res = smartMergeOrders(localOrders, serverOrders);
  assert.strictEqual(res[0].status, 'Hoàn Kho Đạt', 'Local status giữ nguyên do còn hạn optimistic');
});

// ==============================================================================
// 3. KIỂM ĐỊNH CACHE, AUTH AUTHORITY & INVALIDATION (Code.js)
// ==============================================================================
console.log('\n--- 3. Kiểm định Cache, Auth Authority & Invalidation ---');

runTest('invalidateUserConfigCache: Xoá cache display và tăng CONFIG_GENERATION token', () => {
  let cacheRemoved = [];
  let propsSet = {};

  const sandbox = {
    CacheService: {
      getScriptCache: () => ({
        remove: (key) => cacheRemoved.push(key)
      })
    },
    PropertiesService: {
      getScriptProperties: () => ({
        setProperty: (k, v) => { propsSet[k] = v; }
      })
    },
    console: { warn: () => {} }
  };

  const invMatch = codeJsContent.match(/function invalidateUserConfigCache\s*\([\s\S]*?\n\}/);
  assert(invMatch, 'Không tìm thấy invalidateUserConfigCache');

  vm.createContext(sandbox);
  vm.runInContext(invMatch[0], sandbox);

  const res = sandbox.invalidateUserConfigCache();
  assert.strictEqual(res.success, true);
  assert(cacheRemoved.includes('USER_DISPLAY_CONFIG'), 'Phải xóa cache USER_DISPLAY_CONFIG');
  assert(cacheRemoved.includes('USER_CONFIG'), 'Phải xóa cache USER_CONFIG cũ');
  assert(propsSet['CONFIG_GENERATION'], 'Phải sinh CONFIG_GENERATION token mới');
});

runTest('handleApiRequest: Action invalidateUserConfig bảo vệ bằng quyền Boss/Admin', () => {
  const handleApiMatch = codeJsContent.match(/function handleApiRequest\s*\([\s\S]*?\n\}/);
  assert(handleApiMatch, 'Không tìm thấy handleApiRequest');

  let invalidated = false;
  const sandbox = {
    validatePin: (pin) => {
      if (pin === 'BOSS_PIN') return { valid: true, user: 'Rich Fish', role: 'TỐI CAO', isBoss: true, isAdmin: true };
      if (pin === 'STAFF_PIN') return { valid: true, user: 'Thợ Tâm', role: 'THỢ', isBoss: false, isAdmin: false };
      return { valid: false };
    },
    invalidateUserConfigCache: () => {
      invalidated = true;
      return { success: true, generation: '12345' };
    },
    ContentService: {
      MimeType: { JSON: 'JSON' },
      createTextOutput: (str) => {
        const parsed = JSON.parse(str);
        parsed.setMimeType = () => parsed;
        return parsed;
      }
    },
    console: { log: () => {} },
    Logger: { log: () => {} }
  };

  vm.createContext(sandbox);
  vm.runInContext(handleApiMatch[0], sandbox);

  // 1. Thợ bình thường gọi -> Bị từ chối
  const staffRes = sandbox.handleApiRequest({ action: 'invalidateUserConfig', pin: 'STAFF_PIN' });
  assert.strictEqual(staffRes.success, false);
  assert.strictEqual(staffRes.error, 'PERMISSION_DENIED');
  assert.strictEqual(invalidated, false, 'Không được gọi invalidate khi thiếu quyền');

  // 2. Boss gọi -> Chấp nhận
  const bossRes = sandbox.handleApiRequest({ action: 'invalidateUserConfig', pin: 'BOSS_PIN' });
  assert.strictEqual(bossRes.success, true);
  assert.strictEqual(invalidated, true, 'Hàm invalidate phải được gọi khi Boss yêu cầu');
});

// ==============================================================================
// 4. KIỂM ĐỊNH TÍNH TOÀN VẸN BẢN DỊCH PRECOMPILE & HASH MANIFEST
// ==============================================================================
console.log('\n--- 4. Kiểm định Tính Toàn Vẹn Bản Dịch Precompile ---');

runTest('build_manifest.json tồn tại và có đủ danh sách files đã hash', () => {
  const manifestPath = path.join(__dirname, 'build_manifest.json');
  assert(fs.existsSync(manifestPath), 'build_manifest.json phải tồn tại');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.hashes && Object.keys(manifest.hashes).length >= 20, 'Manifest phải chứa tối thiểu 20 fragments');
  assert(fs.existsSync(path.join(__dirname, 'Compiled_Core.html')), 'Compiled_Core.html phải tồn tại');
  assert(fs.existsSync(path.join(__dirname, 'Compiled_Deferred.html')), 'Compiled_Deferred.html phải tồn tại');
});

runTest('Index.html: Trang bị Boot Splash Screen và Crash Catcher chống màn đen', () => {
  const indexPath = path.join(__dirname, 'Index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  assert(indexContent.includes('rf-splash-screen'), 'Index.html phải có Boot Splash Screen');
  assert(indexContent.includes('rf-crash-container'), 'Index.html phải có hộp thoại báo lỗi Crash Catcher');
  assert(indexContent.includes('__rfReportBootError'), 'Index.html phải có hàm báo cáo sự cố khởi động');
});

runTest('Index.html: Cơ chế 2-Phase Boot với Local Instant Cache & Multi-CDN Fallback', () => {
  const indexPath = path.join(__dirname, 'Index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  assert(indexContent.includes('jsx-container'), 'Index.html phải có jsx-container chứa các modules an toàn');
  assert(indexContent.includes('rf_core_v3_'), 'Index.html phải hỗ trợ bộ nhớ đệm Core Instant Cache');
  assert(indexContent.includes('rf_defer_v3_'), 'Index.html phải hỗ trợ Deferred Tabs Idle Cache');
  assert(indexContent.includes('cdnjs.cloudflare.com/ajax/libs/react/'), 'Index.html phải có fallback CDN cho React');
  assert(indexContent.includes('cdnjs.cloudflare.com/ajax/libs/react-dom/'), 'Index.html phải có fallback CDN cho ReactDOM');
});

// ==============================================================================
// TỔNG KẾT
// ==============================================================================
console.log('\n================================================================');
console.log(`KẾT QUẢ KIỂM THỬ HIỆU NĂNG & DỮ LIỆU: ${passedTests}/${totalTests} ĐẠT (${totalTests - passedTests} THẤT BẠI)`);
console.log('================================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
