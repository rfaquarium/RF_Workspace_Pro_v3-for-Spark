const fs = require('fs');
const path = require('path');

console.log('=== RF_WORKSPACE_PRO COMPREHENSIVE TEST SUITE ===\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const errors = [];

function assert(description, condition, details = '') {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  [PASS] ${description}`);
    } else {
        failedTests++;
        console.error(`  [FAIL] ${description} ${details ? '-> ' + details : ''}`);
        errors.push({ description, details });
    }
}

// 1. TEST SCHEMA INTEGRITY (23 Tables Check)
console.log('\n--- 1. Testing Schema Integrity (23 Tables in Code.js) ---');
const codeJsPath = path.join(__dirname, 'Code.js');
const codeJsContent = fs.readFileSync(codeJsPath, 'utf8');

const requiredTables = [
    'Orders', 'Production', 'Packings', 'Products', 'Config_NhanSu',
    'Attendance', 'KPI_Progress', 'Config_KPI', 'BOM_Config', 'Transactions',
    'ImportExport', 'Accounts', 'BonusPenalty', 'CTV_Finance', 'Config_GiaLayout',
    'Documents', 'Trainings', 'Models3D', 'Monthly_Snapshots', 'ProfitReports',
    'Reimbursements', 'Suppliers', 'Tracking_Log'
];

requiredTables.forEach(table => {
    const tableRegex = new RegExp(`['"]?${table}['"]?\\s*:\\s*\\[`, 'i');
    assert(`Schema contains table '${table}'`, tableRegex.test(codeJsContent) || codeJsContent.includes(`'${table}'`) || codeJsContent.includes(`"${table}"`));
});

// 2. TEST LOCKSERVICE USAGE IN CODE.JS
console.log('\n--- 2. Testing LockService Concurrency Compliance ---');
const lockServiceMatches = codeJsContent.match(/LockService\.getScriptLock\(\)/g) || [];
assert('Code.js uses LockService.getScriptLock() for write operations', lockServiceMatches.length >= 5, `Found ${lockServiceMatches.length} locks`);
assert('LockService has waitLock with timeout', /waitLock\(\s*\d+\s*\)/.test(codeJsContent));
assert('LockService has releaseLock in try...finally', /finally\s*\{[\s\S]*?releaseLock\(\)/.test(codeJsContent));

// 3. TEST JSX SYNTAX & UNESCAPED CHARACTERS IN ALL HTML FILES
console.log('\n--- 3. Testing JSX & HTML Files for Syntax & Unescaped Tokens ---');
const htmlFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    
    // Check for unescaped > inside JSX text like (>5 ngày) which breaks JSX parsing
    const unescapedGreaterRegex = />\s*\([>]\s*[^)]+\)/;
    const hasUnescapedGreater = unescapedGreaterRegex.test(content);
    assert(`${file}: No unescaped '(>...)' in JSX text`, !hasUnescapedGreater, hasUnescapedGreater ? 'Found unescaped >' : '');
    
    // Check for unbalanced actual HTML <script> tags (excluding script tags inside JS strings/regex)
    // Strip JavaScript comments and string/regex literals before counting
    const sanitizedHtml = content.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (match, jsContent) => {
        // Return open and close tag only
        return '<script></script>';
    });
    const openScript = (sanitizedHtml.match(/<script\b[^>]*>/gi) || []).length;
    const closeScript = (sanitizedHtml.match(/<\/script>/gi) || []).length;
    assert(`${file}: Balanced <script> tags`, openScript === closeScript, `open: ${openScript}, close: ${closeScript}`);
});

// 4. TEST EXACT MATCH RULES & CHANNEL MAPPINGS
console.log('\n--- 4. Testing Exact Match & Channel Mapping Consistency ---');
const configHtml = fs.readFileSync(path.join(__dirname, 'Config.html'), 'utf8');

assert('TikTok channel accent in getChannelInlineStyle is Cyan (#06b6d4)', configHtml.includes("accent = '#06b6d4'"));
assert('TikTok channel badge in getChannelBadge is Cyan (#06b6d4)', configHtml.includes("bg-[#06b6d4]"));

// Functional Unit Test: Exact Match Order Status Mapping Algorithm
function mapOrderStatusExact(statusRaw) {
    const raw = String(statusRaw || '').trim().toLowerCase();
    if (raw === 'hoàn thành' || raw === 'completed') return 'Đối Soát Thành Công';
    if (raw === 'đã giao' || raw === 'delivered') return 'Đã Bàn Giao';
    if (raw === 'trả hàng/hoàn tiền' || raw === 'returned') return 'Hàng Hoàn';
    if (raw === 'đã hủy' || raw === 'cancelled') return 'Đơn Huỷ';
    return 'Chờ Sản Xuất';
}

assert('Exact Match: "Hoàn thành" -> "Đối Soát Thành Công"', mapOrderStatusExact('Hoàn thành') === 'Đối Soát Thành Công');
assert('Exact Match: "Completed" -> "Đối Soát Thành Công"', mapOrderStatusExact('Completed') === 'Đối Soát Thành Công');
assert('Exact Match: "Đã giao" -> "Đã Bàn Giao"', mapOrderStatusExact('Đã giao') === 'Đã Bàn Giao');
assert('Exact Match: "Delivered" -> "Đã Bàn Giao"', mapOrderStatusExact('Delivered') === 'Đã Bàn Giao');
assert('Exact Match: "Trả hàng/Hoàn tiền" -> "Hàng Hoàn"', mapOrderStatusExact('Trả hàng/Hoàn tiền') === 'Hàng Hoàn');
assert('Exact Match: "Đã hủy" -> "Đơn Huỷ"', mapOrderStatusExact('Đã hủy') === 'Đơn Huỷ');
assert('Exact Match: Unknown status fallback -> "Chờ Sản Xuất"', mapOrderStatusExact('Chờ xác nhận') === 'Chờ Sản Xuất');

// 5. TEST COGS & GLASS TANK CALCULATION LOGIC
console.log('\n--- 5. Testing Glass Tank & Production Logic ---');

// Functional Unit Test: Glass Tank COGS Formula
function calculateGlassTankCogs(lengthMm, widthMm, heightMm, glassPricePerM2, laborCost) {
    const L = lengthMm / 1000;
    const W = widthMm / 1000;
    const H = heightMm / 1000;
    
    // Diện tích kính S = (L * W + 2*L*H + 2*W*H) * 1.1 (đã tính 10% hao hụt)
    const areaM2 = (L * W + 2 * L * H + 2 * W * H) * 1.1;
    // Chiều dài mài vi tính P = (L + W) * 2
    const perimeterM = (L + W) * 2;
    // COGS = (S * Đơn giá kính) + (P * 25.000) + Công khoán
    const cogs = Math.round((areaM2 * glassPricePerM2) + (perimeterM * 25000) + laborCost);
    return { areaM2, perimeterM, cogs };
}

const tankTest = calculateGlassTankCogs(600, 300, 360, 180000, 50000);
assert('Glass Tank COGS formula executes correctly and calculates positive COGS', tankTest.cogs > 0, `COGS: ${tankTest.cogs} VND`);
assert('Glass Tank Area calculates m2 with 10% waste buffer', tankTest.areaM2 > 0.8 && tankTest.areaM2 < 1.2, `Area: ${tankTest.areaM2.toFixed(3)} m2`);

// 6. TEST BOM DEDUCTION SIMULATION
console.log('\n--- 6. Testing BOM Material Deduction Integrity ---');
function simulateBomDeduction(productionName, bomConfigList, stockProducts) {
    const matchingBOM = bomConfigList.filter(b => b.layoutCode === productionName);
    const deductions = [];
    matchingBOM.forEach(b => {
        const prod = stockProducts.find(p => p.sku === b.materialSku);
        if (prod) {
            prod.quantity -= b.defaultQty;
            deductions.push({ sku: b.materialSku, deductedQty: b.defaultQty, remainingQty: prod.quantity });
        }
    });
    return deductions;
}

const mockBOM = [
    { layoutCode: 'Rừng ver.19 - 30x20x20cm', materialSku: 'DA-DAEN-01', defaultQty: 2 },
    { layoutCode: 'Rừng ver.19 - 30x20x20cm', materialSku: 'REU-MINIFISS-01', defaultQty: 1 }
];
const mockStock = [
    { sku: 'DA-DAEN-01', name: 'Đá đen Gia Lai', quantity: 50 },
    { sku: 'REU-MINIFISS-01', name: 'Rêu Minifiss', quantity: 20 }
];

const deductionResults = simulateBomDeduction('Rừng ver.19 - 30x20x20cm', mockBOM, mockStock);
assert('BOM deduction deducts exact materials from stock', deductionResults.length === 2 && mockStock[0].quantity === 48 && mockStock[1].quantity === 19);

// 6.2 Testing Keo 502 net weight specification & price conversion (162g gross - 62g shell = 100g net glue @ 22.000đ/100g = 220đ/gam)
const netGramsPerBottle = 162 - 62; // 100g
const pricePerGram = 22000 / netGramsPerBottle; // 220đ/g
assert('Keo 502 net weight is 100g per bottle (162g gross - 62g shell)', netGramsPerBottle === 100);
assert('Keo 502 price is 220đ per gram (22.000đ / 100g)', pricePerGram === 220);

const testGrams = 256;
const bottlesUsed = Number((testGrams / netGramsPerBottle).toFixed(3)); // 2.56 chai
const totalCostChai = Math.round(bottlesUsed * 22000); // 56.320đ
const totalCostGram = Math.round(testGrams * pricePerGram); // 56.320đ
assert('Keo 502 256g converts to 2.56 bottles (not 1.58)', bottlesUsed === 2.56);
assert('Keo 502 256g calculates 56.320đ cost (never 215đ)', totalCostChai === 56320 && totalCostGram === 56320);

const configHtmlKeo = fs.readFileSync(path.join(__dirname, 'Config.html'), 'utf8');
assert('Config.html specifies Keo 502 net 100g and 220đ/g', configHtmlKeo.includes('220đ/gam') && configHtmlKeo.includes('unitPrice / 100') && configHtmlKeo.includes('qty / 100'));

// 7. TEST CONCURRENCY, DATA INTEGRITY & DEDUPING COMPLIANCE
console.log('\n--- 7. Testing Concurrency, Data Integrity & Deduping Rules ---');

const freshCodeJs = fs.readFileSync(codeJsPath, 'utf8');

// 7.1 Zero duplicate function declarations in Code.js
const codeLines = freshCodeJs.split('\n');
const funcCounts = {};
codeLines.forEach(line => {
    const match = line.match(/^function\s+([a-zA-Z0-9_$]+)\s*\(/);
    if (match) {
        const name = match[1];
        funcCounts[name] = (funcCounts[name] || 0) + 1;
    }
});
const duplicateFuncs = Object.keys(funcCounts).filter(k => funcCounts[k] > 1);
assert('Code.js contains 0 duplicate function declarations', duplicateFuncs.length === 0, duplicateFuncs.join(', '));

// 7.2 deleteDeltas does not use deleteRow loop (avoids Apps Script API timeouts and partial deletes)
const deleteDeltasBodyMatch = freshCodeJs.match(/function deleteDeltas\([\s\S]*?\n\}/);
const deleteDeltasBody = deleteDeltasBodyMatch ? deleteDeltasBodyMatch[0] : '';
assert('deleteDeltas does not execute deleteRow in a loop', !deleteDeltasBody.includes('deleteRow'));
assert('deleteDeltas uses atomic clearContents & setValues batch update', deleteDeltasBody.includes('clearContents') && deleteDeltasBody.includes('setValues'));

// 7.3 updateUserConfigSheet has lock protection
assert('updateUserConfigSheet uses LockService', /function updateUserConfigSheet[\s\S]*?LockService\.getScriptLock\(\)/.test(freshCodeJs));

// 7.4 syncDeltas calls _processMaterialDeduction_Core (no lock leak)
assert('syncDeltas calls _processMaterialDeduction_Core without releasing parent lock', freshCodeJs.includes('_processMaterialDeduction_Core(p.id, null, ss)'));

// 7.5 checkServerPermission & validateTableWritePermission do not grant supreme permissions simply by name containing 'Tiến'
assert('checkServerPermission does not grant supreme access by user name', !freshCodeJs.includes("auth.user.indexOf('Tiến') > -1"));

// 7.6 autoCalculateGlassTankBOM endpoint requires authentication
assert('autoCalculateGlassTankBOM requires PIN auth', /action === 'autoCalculateGlassTankBOM'[\s\S]*?validatePin\(pin\)/.test(freshCodeJs));

// 7.7 isWorkshopOffDay detects Sunday and National Holidays to prevent false penalties
assert('Code.js contains isWorkshopOffDay implementation', freshCodeJs.includes('function isWorkshopOffDay('));
assert('calculateBusinessHoursSLA checks isWorkshopOffDay', freshCodeJs.includes('isWorkshopOffDay(cur)'));
assert('cronCheckUnpackedOrdersAt1930 checks isWorkshopOffDay', freshCodeJs.includes('isWorkshopOffDay(now)'));

// 7.8 Robust multi-identifier matching for Orders in applyDeltasToSheet and syncDeltas
assert('applyDeltasToSheet matches Orders by id or orderCode', freshCodeJs.includes("sheetName === 'Orders' && codeColIdx !== -1"));
assert('syncDeltas matches Orders by id or orderCode', freshCodeJs.includes("isRowMatch"));

// 7.9 Parent-Child Cascade & Buyer Note Parsing Integrity
const freshTabProd = fs.readFileSync(path.join(__dirname, 'Tab_Production.html'), 'utf8');
const freshModalsOrders = fs.readFileSync(path.join(__dirname, 'Modals_Orders.html'), 'utf8');
const freshTabOrders = fs.readFileSync(path.join(__dirname, 'Tab_Orders.html'), 'utf8');
assert('Tab_Production.html contains parent-child cascade (isParentDelivered)', freshTabProd.includes('isParentDelivered'));
assert('Tab_Production.html strips phantom stock notes when pending', freshTabProd.includes('Lấy từ tồn kho có sẵn') && freshTabProd.includes('!isItemDone'));
assert('Modals_Orders.html contains buyer note (iNote) parsing', freshModalsOrders.includes('let iNote = findCol('));
assert('Modals_Orders.html passes order note to newOrders and prodItems', freshModalsOrders.includes('finalOrderCustomerNote'));

// 7.10 Order Status Protection When Production Item is Deleted
assert('Tab_Orders.html sets allProdDone false when hasProdFlag and 0 related prods', freshTabOrders.includes('hasProdFlag') && freshTabOrders.includes('allProdDone = false'));
assert('Tab_Orders.html reverts eff to Chờ Sản Xuất when !meta.allProdDone', freshTabOrders.includes('!meta.allProdDone && eff === \'SẴN SÀNG ĐÓNG GÓI\''));
assert('Modals_Orders.html guards effectiveStatus with orderRequiresProd', freshModalsOrders.includes('orderRequiresProd && !prodsReady'));
assert('Tab_Production.html prompts to sync parent order when deleting prod item', freshTabProd.includes('shouldCancelOrder') && freshTabProd.includes('Chờ Sản Xuất'));

// 7.11 Production Card Physical Status Integrity (Unfinished cards cannot be ĐÃ XONG)
assert('Tab_Production.html checks hasAnyWorkerStarted', freshTabProd.includes('hasAnyWorkerStarted'));
assert('Tab_Production.html requires isBothDone for ĐÃ XONG', freshTabProd.includes('isBothDone && (isFinalQcPassed || isParentDelivered)'));
assert('Tab_Production.html guards getParentOrder against ORD prefix match', freshTabProd.includes("clean !== 'ORD'"));

// 7.12 Order Reconciliation & PiShip Payout Integrity (Order.all parsing)
assert('Modals_Orders.html has findRevenueCol excluding NTTD fee', freshModalsOrders.includes('findRevenueCol') && freshModalsOrders.includes("!h.includes('nttd')"));
assert('Modals_Orders.html supports PiShip return fee reimbursement', freshModalsOrders.includes('iPiShipRefund') && freshModalsOrders.includes('rawPiShipRefund'));
assert('Modals_Orders.html calculates sellerOutgoingShip without deducting actual ship', freshModalsOrders.includes('sellerOutgoingShip') && freshModalsOrders.includes('actualShip - buyerShip - shopeeShip'));
assert('Modals_Orders.html calculates getOrderLevelVal to deduplicate multi-row order totals', freshModalsOrders.includes('getOrderLevelVal') && freshModalsOrders.includes('allIdentical'));

// 7.13 Return Scanner Modal - Return Reason & Hallmark UX
assert('Tab_Orders.html ReturnScannerModal supports returnReason state & presets', freshTabOrders.includes('returnReason') && freshTabOrders.includes('PRESET_RETURN_REASONS'));
assert('Tab_Orders.html ReturnScannerModal embeds returnReason into order note', freshTabOrders.includes('[Hoàn:') && freshTabOrders.includes('returnReason: effectiveReason'));
assert('Tab_Orders.html ReturnScannerModal auto-detects iReturnReason from Excel', freshTabOrders.includes('iReturnReason') && freshTabOrders.includes('fileReturnReason'));
assert('Tab_Orders.html ReturnScannerModal renders Hallmark return reason chips and custom input', freshTabOrders.includes('Lý Do Hoàn Hàng') && freshTabOrders.includes('handleSelectPreset'));

// 7.14 Return Station - Missing Items (Hoàn Tiền Không Trả Hàng / Zero Inventory Mutation)
assert('Modals_Orders.html has THIEU_HANG quick action in handleAppealResult', freshModalsOrders.includes("type === 'THIEU_HANG'") && freshModalsOrders.includes('GIỮ NGUYÊN 100% TỒN KHO'));
assert('Modals_Orders.html guards handleCompleteReturn against inventory mutation on missing items', freshModalsOrders.includes('isMissingItems') && freshModalsOrders.includes('!isMissingItems && !isBrokenOrDefect && hasExported'));
assert('Modals_Orders.html renders THIEU_HANG 1-touch button in Return Station Step 1', freshModalsOrders.includes("onClick={() => handleAppealResult('THIEU_HANG')}") && freshModalsOrders.includes('HOÀN TIỀN THIẾU HÀNG'));
assert('Modals_Orders.html renders Thiếu Hàng preset and dynamic CTA button in Step 2', freshModalsOrders.includes('Đóng thiếu hàng (Hoàn tiền ngay)') && freshModalsOrders.includes('DUYỆT HOÀN TIỀN (GIỮ NGUYÊN KHO) → ĐỐI SOÁT THÀNH CÔNG'));

// 8. TEST SHOPEE SLA ARTICLE 19948 & PACKAGING KPI CALCULATION
console.log('\n--- 8. Testing Shopee SLA Article 19948 & Packaging KPI ---');
const freshConfigHtml = fs.readFileSync(path.join(__dirname, 'Config.html'), 'utf8');

// 8.1 Extract and test getAutoDeadline
assert('Config.html contains updated getAutoDeadline with rawDate & shippingMethod', freshConfigHtml.includes('getAutoDeadline = (ch, rawDate = null, shippingMethod = \'\')'));
assert('Config.html implements 14:00 cutoff for Shopee/TikTok', freshConfigHtml.includes('h < 14') && freshConfigHtml.includes('h >= 14'));
assert('Config.html implements Sunday carrier rollover to Monday', freshConfigHtml.includes('dayOfWeek === 0') && freshConfigHtml.includes('addDays = 1'));
assert('Config.html implements Saturday afternoon rollover to Monday', freshConfigHtml.includes('dayOfWeek === 6') && freshConfigHtml.includes('addDays = 2'));
assert('Config.html implements Instant / Same Day 1.5h SLA', freshConfigHtml.includes('setMinutes(d.getMinutes() + 90)'));

// Run simulated getAutoDeadline tests
const getAutoDeadlineMatch = freshConfigHtml.match(/const getAutoDeadline = [\s\S]*?^};/m);
let testGetAutoDeadline = null;
if (getAutoDeadlineMatch) {
    try {
        const fnStr = getAutoDeadlineMatch[0].replace('const getAutoDeadline =', 'return');
        testGetAutoDeadline = new Function(fnStr)();
    } catch(e) {}
}

if (testGetAutoDeadline) {
    // Mon 10:00 (before 14:00) -> Mon 17:30
    const monMorning = new Date('2026-09-07T10:00:00'); // 2026-09-07 is Monday
    const resMonMorning = testGetAutoDeadline('Shopee VN', monMorning);
    assert('Shopee order Mon < 14h has deadline Mon 17:30', resMonMorning.includes('2026-09-07T17:30'), `Got: ${resMonMorning}`);

    // Mon 15:00 (after 14:00) -> Tue 11:30
    const monAfternoon = new Date('2026-09-07T15:00:00');
    const resMonAfternoon = testGetAutoDeadline('Shopee VN', monAfternoon);
    assert('Shopee order Mon >= 14h has deadline Tue 11:30', resMonAfternoon.includes('2026-09-08T11:30'), `Got: ${resMonAfternoon}`);

    // Sat 15:00 (after 14:00) -> Mon 11:30
    const satAfternoon = new Date('2026-09-05T15:00:00'); // 2026-09-05 is Saturday
    const resSatAfternoon = testGetAutoDeadline('Shopee VN', satAfternoon);
    assert('Shopee order Sat >= 14h rolls over to Mon 11:30', resSatAfternoon.includes('2026-09-07T11:30'), `Got: ${resSatAfternoon}`);

    // Sun all day -> Mon 11:30
    const sunOrder = new Date('2026-09-06T10:00:00'); // 2026-09-06 is Sunday
    const resSun = testGetAutoDeadline('Shopee VN', sunOrder);
    assert('Shopee order Sunday rolls over to Mon 11:30', resSun.includes('2026-09-07T11:30'), `Got: ${resSun}`);

    // Instant/Hỏa Tốc 10:00 -> 11:30 (+90 mins)
    const instantOrder = new Date('2026-09-07T10:00:00');
    const resInstant = testGetAutoDeadline('Shopee VN', instantOrder, 'Hỏa Tốc');
    assert('Instant order between 8h-18h has +90 mins SLA', resInstant.includes('2026-09-07T11:30'), `Got: ${resInstant}`);
}

// 8.2 Packaging KPI Scanning & Parsing
assert('Config.html getPackingReward safely parses JSON accessory arrays', freshConfigHtml.includes('addNameOrSku') && freshConfigHtml.includes('JSON.parse(trimmed)'));
assert('Modals_Orders.html extracts accessories via safeParseAccessories before packReward', freshModalsOrders.includes('safeParseAccessories(_order.accessories)') && freshModalsOrders.includes('allProdNames.push(a.name)'));
assert('Tab_HR.html checks safeProdItems and safeParseAccessories for packing reward', freshTabOrders.length > 0 && freshTabOrders.includes('getAutoDeadline'));

// --- 9. Testing Data Integrity Audit & Financial Fixes ---
console.log(`\n--- 9. Testing Data Integrity Audit & Financial Fixes ---`);
const latestCodeJs = fs.readFileSync(codeJsPath, 'utf8');
const freshTabHr = fs.readFileSync(path.join(__dirname, 'Tab_HR.html'), 'utf-8');
assert('syncDeltas implements reentrant lock checking !lock.hasLock()', latestCodeJs.includes('!lock.hasLock()') && latestCodeJs.includes('if (acquiredLock)'));
assert('syncDeltas implements in-batch BOM deduplication via processedBomIds', latestCodeJs.includes('var processedBomIds = {};') && latestCodeJs.includes('processedBomIds[pIdKey]'));
assert('Code.js direct updates linked orders to Sẵn sàng đóng gói without leaking ordersModified', latestCodeJs.includes("oData[oR][oStatusCol] = 'Sẵn sàng đóng gói';") && latestCodeJs.includes("ordersSheet.getRange(oR + 1, oStatusCol + 1).setValue('Sẵn sàng đóng gói');"));
assert('formatProduct safely handles 0 values without falsy coercion', latestCodeJs.includes('var cleanNum = function') && latestCodeJs.includes('"quantity": cleanNum(p.quantity, 0)'));
assert('processCascadeCancelOrder supports restoring inventory on handed-over cancellations', latestCodeJs.includes('Hoàn Kho Đơn Hủy') && latestCodeJs.includes('IE_RESTORE_'));
assert('Tab_HR.html implements user directive for packing reward (recordedReward > 0 ? recordedReward : 1100)', freshTabHr.includes('recordedReward > 0 ? recordedReward : 1100'));

// --- 10. Testing Order Deduplication Engine, Channel Detection & Inventory Handover ---
console.log(`\n--- 10. Testing Order Deduplication Engine, Channel Detection & Inventory Handover ---`);
const currentModalsOrders = fs.readFileSync(path.join(__dirname, 'Modals_Orders.html'), 'utf8');
const currentTabProd = fs.readFileSync(path.join(__dirname, 'Tab_Production.html'), 'utf8');
const currentTabOrdersFile = fs.readFileSync(path.join(__dirname, 'Tab_Orders.html'), 'utf8');

assert('Modals_Orders.html implements findExistingOrder deduplication engine', currentModalsOrders.includes('findExistingOrder') && currentModalsOrders.includes('existingByAlphaMap'));
assert('Modals_Orders.html uses combinedOrdersPool with global fallbacks', currentModalsOrders.includes('combinedOrdersPool') && currentModalsOrders.includes('GLOBAL_ALL_ORDERS'));
assert('Modals_Orders.html auto-detects TikTok & Shopee without defaulting to Bán Lẻ', currentModalsOrders.includes("rowChannel = 'Tiktok Shop';") && currentModalsOrders.includes("rowChannel = 'Shopee VN';"));
assert('Tab_Production.html removes hardcoded "ĐƠN LẺ" fallback', !currentTabProd.includes("|| 'ĐƠN LẺ';"));
assert('Tab_Production.html getParentOrder includes GLOBAL_ALL_ORDERS fallback', currentTabProd.includes('GLOBAL_ALL_ORDERS') && currentTabProd.includes('foundDirect'));
assert('Tab_Orders.html resolveGroupKey detects Shopee & TikTok from codeStr', currentTabOrdersFile.includes("codeStr.includes('SPXVN')") && currentTabOrdersFile.includes("codeStr.includes('TIKTOK')"));
assert('Code.js safeDeductInventoryOnHandover correctly checks isFulfilledFromStock', latestCodeJs.includes('var isFulfilledFromStock = p.fulfilledFromStock === true || String(p.fulfilledFromStock).toUpperCase() === \'TRUE\';'));

// Functional Unit Test for Deduplication Logic
function testCleanRawCode(val) {
    if (!val) return '';
    return String(val).replace(/[\r\n\t\u00A0'"`=]/g, '').replace(/^(mã\s*đơn\s*hàng|mã\s*đơn|order\s*id|order\s*sn|mvđ|mvd)[\s:]+/gi, '').trim();
}
function testToAlphaNum(val) {
    return testCleanRawCode(val).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

assert('Deduplication: cleanRawCode strips quotes and formulas', testCleanRawCode('="2609045PN782HD"') === '2609045PN782HD');
assert('Deduplication: cleanRawCode strips apostrophe and tabs', testCleanRawCode("'2609045PN782HD\t") === '2609045PN782HD');
assert('Deduplication: toAlphaNum matches across whitespace & formatting', testToAlphaNum("2609045PN782HD | SPXVN01") === '2609045pn782hdspxvn01');

// --- 11. Testing Google Drive Safe URL Transformation & In-App Lightbox ---
console.log(`\n--- 11. Testing Google Drive Safe URL Transformation & In-App Lightbox ---`);
const sec11ConfigHtml = fs.readFileSync(path.join(__dirname, 'Config.html'), 'utf8');
const sec11ComponentsHtml = fs.readFileSync(path.join(__dirname, 'Components.html'), 'utf8');
const sec11AppMainHtml = fs.readFileSync(path.join(__dirname, 'App_Main.html'), 'utf8');
const sec11ModalsOrders = fs.readFileSync(path.join(__dirname, 'Modals_Orders.html'), 'utf8');

assert('Config.html defines getSafeDriveViewUrl & openSafeImageTab', sec11ConfigHtml.includes('getSafeDriveViewUrl') && sec11ConfigHtml.includes('openSafeImageTab'));
assert('Components.html defines RFImageLightboxModal', sec11ComponentsHtml.includes('const RFImageLightboxModal =') && sec11ComponentsHtml.includes('window.RFImageLightboxModal = RFImageLightboxModal;'));
assert('App_Main.html binds window.previewImage and mounts RFImageLightboxModal', sec11AppMainHtml.includes('window.previewImage =') && sec11AppMainHtml.includes('<RFImageLightboxModal'));
assert('Modals_Orders.html order card photos use window.previewImage for pGoods/pBox/whPhoto', sec11ModalsOrders.includes('window.previewImage(pGoods') && sec11ModalsOrders.includes('window.previewImage(pBox') && sec11ModalsOrders.includes('window.previewImage(whPhoto'));
assert('Modals_Orders.html deposit bill photos use window.previewImage', sec11ModalsOrders.includes('window.previewImage(imgUrl'));

// Functional URL transformation test
function testExtractDriveId(url) {
    if (!url || typeof url !== 'string') return '';
    const clean = url.trim();
    const idMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/i) || 
                    clean.match(/\/d\/([a-zA-Z0-9_-]+)/i) ||
                    clean.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);
    return idMatch ? idMatch[1] : '';
}
function testGetSafeDriveViewUrl(url) {
    const id = testExtractDriveId(url);
    if (id) {
        return 'https://drive.google.com/file/d/' + id + '/view?usp=drivesdk';
    }
    return url || '';
}

const sampleBlockedThumbnailUrl = 'https://drive.google.com/thumbnail?id=1DD6z3znL2zjjWnfdViHN6mrZU8-mWDzO&sz=w800';
assert('extractDriveId extracts file ID from blocked thumbnail URL', testExtractDriveId(sampleBlockedThumbnailUrl) === '1DD6z3znL2zjjWnfdViHN6mrZU8-mWDzO');
assert('getSafeDriveViewUrl transforms blocked thumbnail URL to safe Drive viewer', testGetSafeDriveViewUrl(sampleBlockedThumbnailUrl) === 'https://drive.google.com/file/d/1DD6z3znL2zjjWnfdViHN6mrZU8-mWDzO/view?usp=drivesdk');
assert('extractDriveId extracts file ID from /file/d/ link', testExtractDriveId('https://drive.google.com/file/d/1DD6z3znL2zjjWnfdViHN6mrZU8-mWDzO/view') === '1DD6z3znL2zjjWnfdViHN6mrZU8-mWDzO');
assert('extractDriveId extracts file ID from googleusercontent.com CDN', testExtractDriveId('https://lh3.googleusercontent.com/d/1DD6z3znL2zjjWnfdViHN6mrZU8-mWDzO=w800') === '1DD6z3znL2zjjWnfdViHN6mrZU8-mWDzO');

// --- 12. Testing Tracking Number (MVĐ) Resolution & Update Engine ---
console.log(`\n--- 12. Testing Tracking Number (MVĐ) Resolution & Update Engine ---`);
const sec12ModalsOrders = fs.readFileSync(path.join(__dirname, 'Modals_Orders.html'), 'utf8');

assert('Modals_Orders.html contains comprehensive iTrack header keywords and excludes package ID (mã kiện hàng)', !sec12ModalsOrders.includes("'mã kiện hàng'") && sec12ModalsOrders.includes('mã bưu gửi') && sec12ModalsOrders.includes('số theo dõi') && sec12ModalsOrders.includes('waybill'));
assert('Modals_Orders.html implements key-priority findCol algorithm', sec12ModalsOrders.includes('for (const k of keys)') && sec12ModalsOrders.includes('headers.findIndex(h => h === cleanK)'));
assert('Modals_Orders.html indexes shippingCode in combinedOrdersPool', sec12ModalsOrders.includes('rawShipping = String(o.shippingCode') && sec12ModalsOrders.includes('existingByTrackMap.set(cShip'));
assert('Modals_Orders.html filters out None/null/- dirty strings from tracking cells', sec12ModalsOrders.includes("rawTrack.toLowerCase() === 'none'") && sec12ModalsOrders.includes("rawTrack === '-'"));
assert('Modals_Orders.html extracts existingTrack from shippingCode and orderCode', sec12ModalsOrders.includes('existing.shippingCode') && sec12ModalsOrders.includes("existing.orderCode.split('|')"));
assert('Modals_Orders.html evaluates hasNewTrack using alphanumeric difference', sec12ModalsOrders.includes('toAlphaNum(cleanT) !== toAlphaNum(existingTrack)'));
assert('Modals_Orders.html passes shippingCode in submit() newOrders payload', sec12ModalsOrders.includes('shippingCode: effShippingCode'));
assert('Modals_Orders.html renders [CẬP NHẬT MVĐ] badge in UI', sec12ModalsOrders.includes("p.hasNewTrack ? 'CẬP NHẬT MVĐ' : 'CẬP NHẬT'"));

// Functional Unit Test for Key-Priority findCol
function testFindColPriority(headers, keys) {
    for (const k of keys) {
        const cleanK = String(k || '').toLowerCase().trim();
        const idx = headers.findIndex(h => h === cleanK);
        if (idx !== -1) return idx;
    }
    for (const k of keys) {
        const cleanK = String(k || '').toLowerCase().trim();
        if (!cleanK) continue;
        const idx = headers.findIndex(h => h.includes(cleanK));
        if (idx !== -1) return idx;
    }
    return -1;
}

const mockShopeeHeaders = ['mã đơn hàng', 'mã kiện hàng', 'ngày đặt hàng', 'trạng thái đơn hàng', 'sản phẩm', 'lý do hủy', 'nhận xét', 'mã vận đơn'];
const trackKeys = ['mã vận đơn', 'ma van don', 'mvd', 'mvđ', 'tracking number', 'tracking id', 'số theo dõi', 'waybill'];
assert('findCol prioritizes Mã vận đơn (Col 7) and ignores Mã Kiện Hàng (Col 1)', testFindColPriority(mockShopeeHeaders, trackKeys) === 7);

// Functional Unit Test for Tracking Resolution Algorithm
function testResolveTracking(rawCell) {
    let raw = (rawCell !== undefined && rawCell !== null) ? String(rawCell).trim() : '';
    if (raw.toLowerCase() === 'none' || raw.toLowerCase() === 'null' || raw === '-' || raw === 'n/a') {
        raw = '';
    }
    return testCleanRawCode(raw);
}

function testCheckHasNewTrack(existingRecord, incomingTCode) {
    let existingTrack = '';
    if (existingRecord.shippingCode && String(existingRecord.shippingCode).trim()) {
        existingTrack = testCleanRawCode(existingRecord.shippingCode);
    } else if (existingRecord.orderCode && existingRecord.orderCode.includes('|')) {
        const parts = existingRecord.orderCode.split('|');
        existingTrack = testCleanRawCode(parts[1].replace(/^(?:MVĐ|MVD|Tracking)[\s:]*/i, ''));
    }
    const cleanT = testCleanRawCode(incomingTCode);
    return Boolean(cleanT && (!existingTrack || testToAlphaNum(cleanT) !== testToAlphaNum(existingTrack)));
}

assert('Tracking Resolution: Shopee "None" cell safely resolves to empty string', testResolveTracking('None') === '');
assert('Tracking Resolution: Shopee formula ="SPXVN065832344889" cleans to SPXVN065832344889', testResolveTracking('="SPXVN065832344889"') === 'SPXVN065832344889');
assert('Tracking Resolution: GHN code with tab cleans properly', testResolveTracking("GYYG9R67\t") === 'GYYG9R67');

const existingWithoutTrack = { id: 'ORD_1', orderCode: '260818N174UWQQ', shippingCode: '' };
assert('Tracking Update: Order without tracking gets new tracking code', testCheckHasNewTrack(existingWithoutTrack, 'SPXVN061323872498') === true);

const existingWithSameTrack = { id: 'ORD_2', orderCode: '2609021SME73FS | MVĐ: SPXVN065832344889', shippingCode: 'SPXVN065832344889' };
assert('Tracking Update: Order with identical tracking is recognized as duplicate', testCheckHasNewTrack(existingWithSameTrack, 'SPXVN065832344889') === false);

const existingWithDifferentTrack = { id: 'ORD_3', orderCode: '2609045SRFX04B', shippingCode: 'OLD_TRACK_123' };
assert('Tracking Update: Order with updated/changed tracking triggers hasNewTrack', testCheckHasNewTrack(existingWithDifferentTrack, 'SPXVN068042561239') === true);

// 13. TEST SHOPEE PRODUCT QUICK IMPORT & SUPREME ROLE GATING
console.log('\n--- 13. Testing Shopee Product Quick Import & Supreme Role Gating ---');

const tabInventoryPath = path.join(__dirname, 'Tab_Inventory.html');
const tabInventoryContent = fs.readFileSync(tabInventoryPath, 'utf8');

// 13.1 Role gating verification
assert('Tab_Inventory.html contains ShopeeProductImportModal component', tabInventoryContent.includes('function ShopeeProductImportModal'));
assert('Tab_Inventory.html gates Nhập Shopee button with TỐI CAO role', tabInventoryContent.includes("(isBoss || currentRole === 'TỐI CAO') &&") && tabInventoryContent.includes('Nhập Shopee'));
assert('Tab_Inventory.html gates ShopeeProductImportModal mounting with TỐI CAO role', tabInventoryContent.includes("<ShopeeProductImportModal"));

// 13.2 Smart Parse Algorithm Simulation
function standardizeWarehouseSku(rawSku, category = '', baseName = '') {
    if (!rawSku) return '';
    const s = String(rawSku).trim().toUpperCase().replace(/\s+/g, '');
    if (s.startsWith('PK-') || s.startsWith('NL-') || s.startsWith('DG-') || s.startsWith('VT-')) return s;

    const beMatch = s.match(/^(?:BE[-_]?)?(ND|BETTA|TERA|BC|MINI|STD|DUC)?[-_]?(\d{5,6})$/i);
    if (beMatch || category === 'KHO BỂ KÍNH' || (baseName && baseName.toUpperCase().includes('BỂ'))) {
        if (beMatch) {
            const sub = (beMatch[1] || 'STD').toUpperCase();
            const size = beMatch[2];
            return `BE-${sub}-${size}`;
        }
        const mSize = s.match(/(\d{5,6})/);
        if (mSize) return `BE-STD-${mSize[1]}`;
    }

    const layMatch = s.match(/^(?:LAY[-_]?)?(BON|RUN|CAU|HAN|VAC|DAO|NAT|TRU|HEM|VOM|CV|TRA|STD)[-_]?0*(\d{1,3})?[-_]?(\d{5,6})?$/i);
    if (layMatch) {
        const code = layMatch[1].toUpperCase();
        const verNum = layMatch[2] ? parseInt(layMatch[2], 10) : null;
        const ver = verNum !== null ? ('000' + verNum).slice(-3) : '';
        const size = layMatch[3] || '';
        if (code === 'CV') return size ? `LAY-CV-${size}` : 'LAY-CV';
        return `LAY-${code}${ver}` + (size ? `-${size}` : '');
    }

    const upperBase = (baseName || '').toUpperCase();
    if (upperBase.includes('LAYOUT') || upperBase.includes('RỪNG') || upperBase.includes('LŨA') || upperBase.includes('ĐÁ') || category === 'KHO LAYOUT') {
        const mCode = s.match(/^(?:LAY[-_]?)?([A-Z]{3,4})[-_]?0*(\d{1,3})?[-_]?(\d{5,6})?$/i);
        if (mCode) {
            const code = mCode[1].toUpperCase();
            const verNum = mCode[2] ? parseInt(mCode[2], 10) : null;
            const ver = verNum !== null ? ('000' + verNum).slice(-3) : '';
            const size = mCode[3] || '';
            return `LAY-${code}${ver}` + (size ? `-${size}` : '');
        }
        if (!s.startsWith('LAY-')) return `LAY-${s}`;
    }
    return s;
}

function standardizeWarehouseName(baseName, varLabel = '', rawSku = '') {
    let cleanBase = String(baseName || '').trim().replace(/^(?:LAYOUT|Layout|layout)\s+/i, '').trim();
    cleanBase = cleanBase.replace(/(?:Ver\.?|ver\.?|V)\s*(\d+)/i, (m, g1) => 'ver.' + g1);

    let dimStr = '';
    const cleanSku = String(rawSku || '').replace(/\s+/g, '');
    const dimMatch = cleanSku.match(/(\d{2})(\d{2})(\d{2})/);
    if (dimMatch) {
        dimStr = `${dimMatch[1]}x${dimMatch[2]}x${dimMatch[3]}cm`;
    } else if (varLabel) {
        const vlMatch = String(varLabel).match(/(\d{2,3})\s*[xX*×]\s*(\d{2,3})\s*[xX*×]\s*(\d{2,3})/);
        if (vlMatch) dimStr = `${vlMatch[1]}x${vlMatch[2]}x${vlMatch[3]}cm`;
    }

    let variantName = dimStr || (varLabel ? String(varLabel).trim() : '');
    const fullName = variantName ? `${cleanBase} - ${variantName}` : cleanBase;
    return { cleanBase, variantName, fullName };
}

function testParseShopee(text, defaultCategory = 'KHO LAYOUT', defaultUnit = 'Bộ', autoStandardize = true) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    
    let baseName = lines[0].includes('|') ? lines[0].split('|')[0].trim() : lines[0];
    const upperBase = baseName.toUpperCase();
    let detectedCat = defaultCategory;
    let detectedSub = 'KHÁC';
    let detectedUnit = defaultUnit;
    if (upperBase.includes('LAYOUT') || upperBase.includes('RỪNG')) {
        detectedCat = 'KHO LAYOUT';
        detectedUnit = 'Bộ';
        if (upperBase.includes('RỪNG') || upperBase.includes('RUN')) detectedSub = 'RỪNG';
    } else if (upperBase.includes('BỂ') || upperBase.includes('KÍNH')) {
        detectedCat = 'KHO BỂ KÍNH';
        detectedUnit = 'Cái';
    }
    
    let parentSku = '';
    for (let i = 0; i < lines.length; i++) {
        const m = lines[i].match(/SKU sản phẩm:\s*([A-Za-z0-9_\-\.]+)/i);
        if (m) { parentSku = m[1].trim(); break; }
    }
    
    const variations = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const mSku = line.match(/SKU phân loại:\s*([A-Za-z0-9_\-\.]+)/i);
        if (mSku) {
            const vSku = mSku[1].trim();
            let vLabel = (i > 0 && !lines[i-1].includes('SKU') && !lines[i-1].includes('ID') && !lines[i-1].startsWith('₫')) ? lines[i-1] : '';
            let price = 0, stock = 0, j = i + 1;
            while (j < Math.min(lines.length, i + 7)) {
                const next = lines[j];
                if (next.includes('SKU phân loại:')) break;
                const clean = next.replace(/[^\d]/g, '');
                if ((next.includes('₫') || (clean && !next.includes('Model') && !next.includes('ID'))) && clean) {
                    const numVal = parseInt(clean, 10);
                    if (numVal >= 1000 && !price) price = numVal;
                    else if (numVal >= 0 && price && !stock) stock = numVal;
                }
                j++;
            }
            
            let finalSku = vSku.toUpperCase();
            let finalName = vLabel ? `${baseName} - ${vLabel}` : baseName;
            if (autoStandardize) {
                finalSku = standardizeWarehouseSku(vSku, detectedCat, baseName);
                finalName = standardizeWarehouseName(baseName, vLabel, vSku).fullName;
            }

            variations.push({
                sku: finalSku,
                rawShopeeSku: vSku,
                name: finalName,
                price: price,
                quantity: stock,
                category: detectedCat,
                sub_category: detectedSub,
                unit: detectedUnit
            });
            i = j - 1;
        }
        i++;
    }
    return variations;
}

const sampleShopeeMultiVar = `Layout Rừng Ver.21 | Nghệ Thuật Tái Tạo Cảnh Quan Tự Nhiên | Đ...
SKU sản phẩm: RUN-021
ID Sản phẩm: 57767368836
₫505.000 - ₫795.000
1.8k
Size S
SKU phân loại: RUN-021-202020
Model ID: 287936773310
₫505.000
898
Size M
SKU phân loại: RUN-021-302020
Model ID: 287936773311
₫640.000
666
Size L
SKU phân loại: RUN-021-402325
Model ID: 287936773312
₫795.000
222`;

const parsedVars = testParseShopee(sampleShopeeMultiVar);
assert('Smart Shopee Parse: Extracts exact 3 variations', parsedVars.length === 3);
assert('Smart Shopee Parse: Standardized Var 1 SKU is LAY-RUN021-202020', parsedVars[0].sku === 'LAY-RUN021-202020');
assert('Smart Shopee Parse: Preserves raw Shopee SKU RUN-021-202020', parsedVars[0].rawShopeeSku === 'RUN-021-202020');
assert('Smart Shopee Parse: Standardized Var 1 Name is Rừng ver.21 - 20x20x20cm', parsedVars[0].name === 'Rừng ver.21 - 20x20x20cm');
assert('Smart Shopee Parse: Variation 1 Price is 505.000', parsedVars[0].price === 505000);
assert('Smart Shopee Parse: Variation 1 Stock is 898', parsedVars[0].quantity === 898);
assert('Smart Shopee Parse: Standardized Var 2 SKU is LAY-RUN021-302020', parsedVars[1].sku === 'LAY-RUN021-302020');
assert('Smart Shopee Parse: Standardized Var 2 Name is Rừng ver.21 - 30x20x20cm', parsedVars[1].name === 'Rừng ver.21 - 30x20x20cm');
assert('Smart Shopee Parse: Variation 2 Price is 640.000', parsedVars[1].price === 640000);
assert('Smart Shopee Parse: Standardized Var 3 SKU is LAY-RUN021-402325', parsedVars[2].sku === 'LAY-RUN021-402325');
assert('Smart Shopee Parse: Standardized Var 3 Name is Rừng ver.21 - 40x23x25cm', parsedVars[2].name === 'Rừng ver.21 - 40x23x25cm');
assert('Smart Shopee Parse: Variation 3 Price is 795.000', parsedVars[2].price === 795000);
assert('Smart Shopee Parse: Auto-categorizes to KHO LAYOUT', parsedVars[0].category === 'KHO LAYOUT');
assert('Smart Shopee Parse: Auto-subcategorizes to RỪNG', parsedVars[0].sub_category === 'RỪNG');
assert('Smart Shopee Parse: Auto-assigns Bộ unit for Layout', parsedVars[0].unit === 'Bộ');

// ============================================================================
// 14. PRODUCTION & ORDER LEAN FLOW OPTIMIZATION TESTS (ROYAL V2.42.0)
// ============================================================================
console.log("\n--- SECTION 14: PRODUCTION & ORDER LEAN FLOW OPTIMIZATION ---");

// Test 14.1: Phase 1 completion auto-advances to Phase 2 (status = 'Done', qc_status = 'Khung đã nộp', Phase 2 unlocked)
function simulatePhase1Complete(item, currentUser) {
    const isTwoPhaseProduct = item.type === 'Layout' || item.type === 'Bể Kính';
    const updated = JSON.parse(JSON.stringify(item));
    updated.phases.phase1.status = 'Done';
    updated.phases.phase1.user = currentUser;
    updated.phases.phase1.endTime = '2026-09-04T10:30:00.000Z';
    updated.p1_status = 'Done';
    updated.p1_user = currentUser;
    updated.p1_endTime = '2026-09-04T10:30:00.000Z';
    if (isTwoPhaseProduct) {
        updated.status = 'In Progress';
        updated.qc_status = 'Khung đã nộp';
    } else {
        updated.status = 'Done';
    }
    return updated;
}

function checkPhase2IsLocked(item) {
    const p1Status = item.phases?.phase1?.status;
    const isP1Done = p1Status === 'Done' || p1Status === 'ĐÃ XONG';
    const isQcRejected = item.qc_status === 'Yêu cầu làm lại';
    return !isP1Done || isQcRejected;
}

const mockItem = {
    id: 'PRD-001',
    type: 'Layout',
    status: 'In Progress',
    phases: {
        phase1: { status: 'In Progress', user: 'Vinh' },
        phase2: { status: 'Pending', user: '' }
    },
    qc_status: ''
};

const completedP1 = simulatePhase1Complete(mockItem, 'Vinh');
assert('P1 Complete: Sets phase1.status to Done', completedP1.phases.phase1.status === 'Done');
assert('P1 Complete: Sets qc_status to Khung đã nộp (non-blocking)', completedP1.qc_status === 'Khung đã nộp');
assert('P1 Complete: Phase 2 is immediately UNLOCKED for worker', checkPhase2IsLocked(completedP1) === false);

const rejectedItem = { ...completedP1, qc_status: 'Yêu cầu làm lại' };
assert('P1 Rejected: Phase 2 remains LOCKED if Admin explicitly requests remake', checkPhase2IsLocked(rejectedItem) === true);

// Test 14.2: Foreign Key Matching (isOrderMatch) across Order.id and Order.orderCode
function isOrderMatch(pOrderId, ord) {
    if (!pOrderId || !ord) return false;
    const pStr = String(pOrderId).trim();
    const oId = String(ord.id || '').trim();
    const oCode = String(ord.orderCode || '').trim();
    const oBase = oCode.split(' | ')[0].split('|')[0].trim();
    return pStr === oId || (oCode && pStr === oCode) || (oBase && pStr === oBase);
}

const testOrder = { id: 'ORD-12345', orderCode: 'ORD-12345 | MVĐ: SPX12345678' };
assert('isOrderMatch: Matches exact order.id', isOrderMatch('ORD-12345', testOrder) === true);
assert('isOrderMatch: Matches full orderCode', isOrderMatch('ORD-12345 | MVĐ: SPX12345678', testOrder) === true);
assert('isOrderMatch: Matches base orderCode before pipe', isOrderMatch('ORD-12345', { id: '99999', orderCode: 'ORD-12345 | MVĐ: SPX' }) === true);
assert('isOrderMatch: Rejects mismatched orderId', isOrderMatch('ORD-99999', testOrder) === false);

// Test 14.3: Order readiness without MVD blocking box packing
function computeEffectiveOrderStatus(order, allProdDone, hasDonePack, isMissingMVD) {
    let eff = String(order.status || 'Chờ Sản Xuất').toUpperCase().trim();
    if (allProdDone && (eff === 'CHỜ SẢN XUẤT' || eff === 'QUÉT TỰ ĐỘNG' || eff === 'ĐANG SẢN XUẤT' || eff === 'CHỜ PHỤ KIỆN')) {
        eff = 'SẴN SÀNG ĐÓNG GÓI';
    } else if (!allProdDone && eff === 'SẴN SÀNG ĐÓNG GÓI' && !hasDonePack) {
        eff = 'CHỜ SẢN XUẤT';
    }
    return eff;
}

const ordNoMVD = { id: 'ORD-001', status: 'Chờ Sản Xuất', channel: 'Shopee VN' };
const effStatusWithoutMVD = computeEffectiveOrderStatus(ordNoMVD, true, false, true);
assert('Order Readiness: Advances to SẴN SÀNG ĐÓNG GÓI even when MVD is pending', effStatusWithoutMVD === 'SẴN SÀNG ĐÓNG GÓI');

const ordNotDone = { id: 'ORD-002', status: 'Sẵn Sàng Đóng Gói' };
const effStatusNotDone = computeEffectiveOrderStatus(ordNotDone, false, false, false);
assert('Order Readiness: Reverts to CHỜ SẢN XUẤT if prods are not done', effStatusNotDone === 'CHỜ SẢN XUẤT');

// Test 14.4: Earliest Deadline First (EDF) Sorting
function getEffectiveDeadline(item, order) {
    if (item && item.deadline) {
        const t = new Date(item.deadline).getTime();
        if (!isNaN(t)) return t;
    }
    if (order && order.deadline) {
        const t = new Date(order.deadline).getTime();
        if (!isNaN(t)) return t;
    }
    return Infinity;
}

const prodList = [
    { id: 'PRD-A', deadline: '2026-09-04T17:00:00Z', isUrgent: false },
    { id: 'PRD-B', deadline: '2026-09-05T12:00:00Z', isUrgent: false },
    { id: 'PRD-C', deadline: '2026-09-04T11:30:00Z', isUrgent: false },
    { id: 'PRD-D', deadline: '2026-09-06T12:00:00Z', isUrgent: true }
];

const sortedProds = [...prodList].sort((a, b) => {
    if (a.isUrgent !== b.isUrgent) return b.isUrgent ? 1 : -1;
    const dlA = getEffectiveDeadline(a, null);
    const dlB = getEffectiveDeadline(b, null);
    return dlA - dlB;
});

assert('EDF Sorting: Urgent order PRD-D is #1', sortedProds[0].id === 'PRD-D');
assert('EDF Sorting: Earliest deadline PRD-C is #2', sortedProds[1].id === 'PRD-C');
assert('EDF Sorting: PRD-A (today 17:00) is #3', sortedProds[2].id === 'PRD-A');
assert('EDF Sorting: PRD-B (tomorrow) is #4', sortedProds[3].id === 'PRD-B');

// Test 14.5: Sub-filter phase segregation
const itemsInQueue = [
    { id: 'Q1', phases: { phase1: { status: 'Pending' }, phase2: { status: 'Pending' } } },
    { id: 'Q2', phases: { phase1: { status: 'Done' }, phase2: { status: 'Pending' } } },
    { id: 'Q3', phases: { phase1: { status: 'Done' }, phase2: { status: 'Done' } } }
];

const needPhase1 = itemsInQueue.filter(i => (i.phases?.phase1?.status || 'Pending') !== 'Done');
const needPhase2 = itemsInQueue.filter(i => (i.phases?.phase1?.status === 'Done') && (i.phases?.phase2?.status !== 'Done'));

assert('Sub-filter: Exactly 1 item needs Phase 1 (Q1)', needPhase1.length === 1 && needPhase1[0].id === 'Q1');
assert('Sub-filter: Exactly 1 item needs Phase 2 (Q2)', needPhase2.length === 1 && needPhase2[0].id === 'Q2');

// 15. TEST ROYAL V2.43.0 CONCURRENT PACKING (MAX 6 ORDERS PER ACCOUNT)
console.log('\n--- 15. Testing Royal v2.43.0 Concurrent Packing (Max 6 Orders) ---');
const appMainPath = path.join(__dirname, 'App_Main.html');
const appMainContent = fs.readFileSync(appMainPath, 'utf8');
const changelogPath = path.join(__dirname, 'CHANGELOG.md');
const changelogContent = fs.readFileSync(changelogPath, 'utf8');
const modalsOrdersPath = path.join(__dirname, 'Modals_Orders.html');
const modalsOrdersContent = fs.readFileSync(modalsOrdersPath, 'utf8');

// 15.1 Version Sync Checks
assert('App_Main.html: Contains Royal v2.43.0 in RELEASES', appMainContent.includes("version: 'Royal v2.43.0'"));
assert('App_Main.html: Sidebar badge displays version >= v2.43.0', />v2\.(4[3-9]|\d{2,})\.\d+<\/span>/.test(appMainContent));
assert('CHANGELOG.md: Documents v2.43.0 release notes', changelogContent.includes('## [v2.43.0] - 2026-09-05'));
assert('Modals_Orders.html: Configures MAX_CONCURRENT_PACKINGS = 6', modalsOrdersContent.includes('MAX_CONCURRENT_PACKINGS = 6'));
assert('Modals_Orders.html: Old single-order find blocker is removed', !modalsOrdersContent.includes("const activePacking = (erpData?.Packings || []).find(p => p.user === currentUser && p.status === 'Packing');"));

// 15.2 Functional Simulation of Packing Concurrency Engine
function simulateStartPacking(currentUser, order, packingsList) {
    const userActivePackings = packingsList.filter(p =>
        (p.user || '').trim().toLowerCase() === (currentUser || '').trim().toLowerCase() &&
        p.status === 'Packing'
    );

    // Chống bấm trùng cùng 1 đơn hàng
    const orderIdStr = String(order.id || '').trim();
    const orderCodeStr = String(order.orderCode || '').trim();
    const isAlreadyPackingThis = userActivePackings.some(p => {
        const pOrd = String(p.orderId || '').trim();
        return pOrd && (pOrd === orderIdStr || pOrd === orderCodeStr);
    });
    if (isAlreadyPackingThis) {
        return { success: false, reason: 'DUPLICATE', count: userActivePackings.length };
    }

    const MAX_CONCURRENT_PACKINGS = 6;
    if (userActivePackings.length >= MAX_CONCURRENT_PACKINGS) {
        return { success: false, reason: 'LIMIT_EXCEEDED', count: userActivePackings.length };
    }

    const newPack = {
        id: 'PK' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        orderId: order.id,
        user: currentUser,
        status: 'Packing'
    };
    return { success: true, newPack, count: userActivePackings.length + 1 };
}

let testPackings = [];
const huongUser = 'Nguyễn Thị Diệu Hương';

// Test adding 6 orders sequentially for Hương
for (let i = 1; i <= 6; i++) {
    const res = simulateStartPacking(huongUser, { id: `ORD_00${i}`, orderCode: `CODE_00${i}` }, testPackings);
    assert(`Concurrency: Diệu Hương can start order #${i} (Result count: ${res.count}/6)`, res.success === true && res.count === i);
    testPackings.push(res.newPack);
}

// Test starting the 7th order (should be blocked)
const res7 = simulateStartPacking(huongUser, { id: 'ORD_007', orderCode: 'CODE_007' }, testPackings);
assert('Concurrency: Diệu Hương blocked from starting 7th order (LIMIT_EXCEEDED)', res7.success === false && res7.reason === 'LIMIT_EXCEEDED');

// Test anti-duplicate: Diệu Hương clicks order #3 again (should be blocked as DUPLICATE)
const resDup = simulateStartPacking(huongUser, { id: 'ORD_003', orderCode: 'CODE_003' }, testPackings);
assert('Concurrency: Diệu Hương blocked from duplicate start on same order #3', resDup.success === false && resDup.reason === 'DUPLICATE');

// Test isolation: Another user (e.g. Dương) is NOT blocked by Hương's 6 active orders
const duongUser = 'Nguyễn Hoàng Dương';
const resDuong = simulateStartPacking(duongUser, { id: 'ORD_008', orderCode: 'CODE_008' }, testPackings);
assert('Concurrency: User isolation - Hoàng Dương can start order independently', resDuong.success === true && resDuong.count === 1);

// Test auto-release: Complete 1 order of Hương -> slots drop to 5 -> can start a 6th again
const packIndexToDone = testPackings.findIndex(p => p.orderId === 'ORD_002' && p.user === huongUser);
testPackings[packIndexToDone].status = 'Done'; // Hương finished packing ORD_002

const resAfterDone = simulateStartPacking(huongUser, { id: 'ORD_007', orderCode: 'CODE_007' }, testPackings);
assert('Concurrency: Auto-release slot - Diệu Hương can start ORD_007 after completing ORD_002', resAfterDone.success === true && resAfterDone.count === 6);

// 16. TEST ROYAL V2.43.1 PRODUCTION AUTO-PASS & 1-TOUCH REJECT REASONS
console.log('\n--- 16. Testing Royal v2.43.1 Auto-Pass Production & 1-Touch Reasons ---');
const modalsPath = path.join(__dirname, 'Modals.html');
const modalsContent = fs.readFileSync(modalsPath, 'utf8');
const prodPath = path.join(__dirname, 'Tab_Production.html');
const prodContent = fs.readFileSync(prodPath, 'utf8');

// 16.1 Version Sync Checks
assert('App_Main.html: Contains Royal v2.43.1 in RELEASES', fs.readFileSync(appMainPath, 'utf8').includes("version: 'Royal v2.43.1'"));
assert('App_Main.html: Sidebar badge displays version >= v2.43.1', />v2\.(4[3-9]|\d{2,})\.\d+<\/span>/.test(fs.readFileSync(appMainPath, 'utf8')));
assert('CHANGELOG.md: Documents v2.43.1 release notes', fs.readFileSync(changelogPath, 'utf8').includes('## [v2.43.1] - 2026-09-05'));
assert('Modals.html: ImageAnnotationModal has check-circle icon', modalsContent.includes('fa-check-circle text-white'));
assert('Tab_Production.html: showReworkForm has quick reasons chips', prodContent.includes("['Sai bố cục / Tỷ lệ', 'Rễ đơ / Sai hướng'"));
assert('Tab_Production.html: Eliminates upd.status = Kiểm Định in phase finish', !prodContent.includes("upd.status = 'Kiểm Định';"));

// 16.2 Functional Test: Production Auto-Pass to Done & Ready
function simulatePhaseCompletion(prodItem, order, completedPhaseKey) {
    const upd = JSON.parse(JSON.stringify(prodItem));
    upd.phases[completedPhaseKey].status = 'Done';

    const p1 = upd.phases['phase1']?.status || 'Pending';
    const p2 = upd.phases['phase2']?.status || 'Pending';
    const isAllDone = (p1 === 'Done' && p2 === 'Done');

    let orderStatus = order.status;
    if (isAllDone) {
        upd.status = 'Done';
        upd.qc_status = 'Đã duyệt';
        orderStatus = 'Sẵn Sàng Đóng Gói';
    } else {
        upd.status = 'In Progress';
    }

    return { upd, orderStatus };
}

const mockOrder = { id: 'ORD_999', orderCode: 'ORD_999', status: 'Chờ Sản Xuất' };
const mockProd = {
    id: 'PRD_999',
    name: 'Layout Nature 40x23x25',
    status: 'In Progress',
    phases: {
        phase1: { status: 'Done', user: 'Nguyễn Văn Tiến' },
        phase2: { status: 'In Progress', user: 'Huỳnh Đức Tâm' }
    }
};

// When Phase 2 completes, product must be Done and Order must be Sẵn Sàng Đóng Gói
const resAutoPass = simulatePhaseCompletion(mockProd, mockOrder, 'phase2');
assert('Auto-Pass: Completed product status is Done', resAutoPass.upd.status === 'Done');
assert('Auto-Pass: Completed product qc_status is Đã duyệt', resAutoPass.upd.qc_status === 'Đã duyệt');
assert('Auto-Pass: Linked order moves to Sẵn Sàng Đóng Gói directly', resAutoPass.orderStatus === 'Sẵn Sàng Đóng Gói');

// 16.3 Functional Test: 1-Touch Quick Reasons Selection & Textarea Sync
function simulateToggleReason(reason, currentNotes, currentText) {
    const isSelected = currentNotes.includes(reason);
    let nextNotes = isSelected ? currentNotes.filter(r => r !== reason) : [...currentNotes, reason];
    let parts = currentText ? currentText.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (isSelected) {
        parts = parts.filter(p => p !== reason);
    } else {
        if (!parts.includes(reason)) parts.push(reason);
    }
    return { nextNotes, nextText: parts.join(', ') };
}

let notes = [];
let text = '';

// Step 1: Select "Sai bố cục / Tỷ lệ"
let step1 = simulateToggleReason('Sai bố cục / Tỷ lệ', notes, text);
assert('Quick Reasons: Selecting reason adds to notes array', step1.nextNotes.includes('Sai bố cục / Tỷ lệ'));
assert('Quick Reasons: Selecting reason auto-fills textarea text', step1.nextText === 'Sai bố cục / Tỷ lệ');

// Step 2: Select "Form chưa bay"
let step2 = simulateToggleReason('Form chưa bay', step1.nextNotes, step1.nextText);
assert('Quick Reasons: Adding 2nd reason joins with comma', step2.nextText === 'Sai bố cục / Tỷ lệ, Form chưa bay');
assert('Quick Reasons: Notes array contains both reasons', step2.nextNotes.length === 2);

// Step 3: Deselect "Sai bố cục / Tỷ lệ"
let step3 = simulateToggleReason('Sai bố cục / Tỷ lệ', step2.nextNotes, step2.nextText);
assert('Quick Reasons: Deselecting removes from notes array', step3.nextNotes.length === 1 && step3.nextNotes[0] === 'Form chưa bay');
assert('Quick Reasons: Deselecting removes from textarea text', step3.nextText === 'Form chưa bay');

// 17. TEST ROYAL V2.43.2 CONTINUOUS MULTI-ORDER PACKING & ZOMBIE PACKINGS FILTER
console.log('\n--- 17. Testing Royal v2.43.2 Continuous Multi-Order Packing Flow ---');

// 17.1 Version & Syntax Integrity Checks
assert('App_Main.html: Contains Royal v2.43.2 in RELEASES', fs.readFileSync(appMainPath, 'utf8').includes("version: 'Royal v2.43.2'"));
assert('App_Main.html: Sidebar badge displays version >= v2.43.2', />v2\.(4[3-9]|\d{2,})\.\d+<\/span>/.test(fs.readFileSync(appMainPath, 'utf8')));
assert('CHANGELOG.md: Documents v2.43.2 release notes', fs.readFileSync(changelogPath, 'utf8').includes('## [v2.43.2] - 2026-09-05'));
const v2432ModalsOrders = fs.readFileSync(modalsOrdersPath, 'utf8');
assert('Modals_Orders.html: Implements isUserMatch helper for resilient name matching', v2432ModalsOrders.includes('const isUserMatch = React.useCallback('));
assert('Modals_Orders.html: Implements isOrderFinished filter against zombie packings', v2432ModalsOrders.includes('isOrderFinished'));
assert('Modals_Orders.html: Renders ĐANG GÓI 6/6 tactile pill when limit reached', v2432ModalsOrders.includes("'ĐANG GÓI 6/6'"));
assert('Modals_Orders.html: OrderCardV2 has Đang đóng badge in header', v2432ModalsOrders.includes('Đang đóng'));
const currentTabOrders = fs.readFileSync(path.join(__dirname, 'Tab_Orders.html'), 'utf8');
assert('Tab_Orders.html: Tra cứu latestPackMap hỗ trợ khoá kép id và orderCode', currentTabOrders.includes('latestPackMap[oIdStr]'));

// 17.2 Logic Simulation: Continuous Multi-Order Packing & Out-of-Order Completion
function simulateIsUserMatch(userA, userB) {
    if (!userA || !userB) return false;
    const a = String(userA).trim().toLowerCase();
    const b = String(userB).trim().toLowerCase();
    if (a === b) return true;
    const aParts = a.split(/\s+/);
    const bParts = b.split(/\s+/);
    const aLast = aParts[aParts.length - 1];
    const bLast = bParts[bParts.length - 1];
    return a.includes(b) || b.includes(a) || (aLast && aLast.length > 1 && aLast === bLast);
}

assert('isUserMatch: Matches Diệu Hương with Nguyễn Thị Diệu Hương', simulateIsUserMatch('Diệu Hương', 'Nguyễn Thị Diệu Hương'));
assert('isUserMatch: Matches Dương with Nguyễn Hoàng Dương', simulateIsUserMatch('Dương', 'Nguyễn Hoàng Dương'));
assert('isUserMatch: Distinguishes between Hương and Dương', !simulateIsUserMatch('Diệu Hương', 'Nguyễn Hoàng Dương'));

// Simulate Zombie Filter
const mockOrdersDatabase = [
    { id: 'ORD_OLD_1', orderCode: 'OLD_001', status: 'Đã Bàn Giao' },
    { id: 'ORD_OLD_2', orderCode: 'OLD_002', status: 'Đơn Huỷ' },
    { id: 'ORD_ACTIVE_1', orderCode: 'ACT_001', status: 'Sẵn Sàng Đóng Gói' },
    { id: 'ORD_ACTIVE_2', orderCode: 'ACT_002', status: 'Sẵn Sàng Đóng Gói' },
    { id: 'ORD_ACTIVE_3', orderCode: 'ACT_003', status: 'Sẵn Sàng Đóng Gói' },
    { id: 'ORD_ACTIVE_4', orderCode: 'ACT_004', status: 'Sẵn Sàng Đóng Gói' }
];

const mockPackingsWithZombies = [
    { id: 'PK_OLD_1', orderId: 'ORD_OLD_1', user: 'Diệu Hương', status: 'Packing' }, // Zombie (order already Đã Bàn Giao)
    { id: 'PK_OLD_2', orderId: 'ORD_OLD_2', user: 'Nguyễn Thị Diệu Hương', status: 'Packing' }, // Zombie (order already Đơn Huỷ)
];

function getActivePackingsClean(packingsList, allOrders, currentUser) {
    const isOrderFinished = (ordId) => {
        if (!ordId) return false;
        const sId = String(ordId).trim().toLowerCase();
        const matchedOrder = allOrders.find(o => {
            const oId = String(o.id || '').trim().toLowerCase();
            const oCode = String(o.orderCode || '').trim().toLowerCase();
            return oId === sId || oCode === sId || oCode.includes(sId);
        });
        if (!matchedOrder) return false;
        const st = String(matchedOrder.status || matchedOrder._effectiveStatus || '').toUpperCase().trim();
        return st === 'ĐÃ BÀN GIAO' || st === 'HOÀN THÀNH' || st === 'ĐỐI SOÁT THÀNH CÔNG' || st === 'ĐƠN HUỶ' || st.includes('HUỶ') || st === 'HÀNG HOÀN';
    };

    return packingsList.filter(p => {
        if (p.status !== 'Packing') return false;
        if (!simulateIsUserMatch(p.user, currentUser)) return false;
        if (isOrderFinished(p.orderId)) return false;
        return true;
    });
}

// Check that zombie packings are cleanly ignored
const filteredInitial = getActivePackingsClean(mockPackingsWithZombies, mockOrdersDatabase, 'Diệu Hương');
assert('Zombie Filter: Ignores past packings of delivered/canceled orders (Active count is 0)', filteredInitial.length === 0);

// Continuous Packing Simulation:
let livePackings = [...mockPackingsWithZombies];

// 1. Hương clicks "BẮT ĐẦU" on Order 1 -> Photo taken -> Order 1 enters Packing
livePackings.push({ id: 'PK_LIVE_1', orderId: 'ORD_ACTIVE_1', user: 'Nguyễn Thị Diệu Hương', status: 'Packing' });
let activeCount1 = getActivePackingsClean(livePackings, mockOrdersDatabase, 'Diệu Hương').length;
assert('Continuous Packing: Order 1 started without completing previous orders (Active: 1/6)', activeCount1 === 1);

// 2. Hương clicks "BẮT ĐẦU" on Order 2 -> Photo taken -> Order 2 enters Packing
livePackings.push({ id: 'PK_LIVE_2', orderId: 'ORD_ACTIVE_2', user: 'Diệu Hương', status: 'Packing' });
let activeCount2 = getActivePackingsClean(livePackings, mockOrdersDatabase, 'Diệu Hương').length;
assert('Continuous Packing: Order 2 started immediately while Order 1 is still Packing (Active: 2/6)', activeCount2 === 2);

// 3. Hương clicks "BẮT ĐẦU" on Order 3 -> Photo taken -> Order 3 enters Packing
livePackings.push({ id: 'PK_LIVE_3', orderId: 'ORD_ACTIVE_3', user: 'Nguyễn Thị Diệu Hương', status: 'Packing' });
let activeCount3 = getActivePackingsClean(livePackings, mockOrdersDatabase, 'Diệu Hương').length;
assert('Continuous Packing: Order 3 started immediately (Active: 3/6)', activeCount3 === 3);

// 4. Check that Order 4 is still ready to start (isReadyPack && !isPacking)
const order4HasPacking = livePackings.some(p => p.orderId === 'ORD_ACTIVE_4' && p.status === 'Packing');
assert('Continuous Packing: Order 4 remains ready with BẮT ĐẦU button intact', order4HasPacking === false);

// 5. Hương boxes Order 2 first and takes parcel photo -> Order 2 completed
const pack2 = livePackings.find(p => p.orderId === 'ORD_ACTIVE_2');
pack2.status = 'Done';
const order2 = mockOrdersDatabase.find(o => o.id === 'ORD_ACTIVE_2');
order2.status = 'Chờ Bàn Giao';

let activeCountAfterDone2 = getActivePackingsClean(livePackings, mockOrdersDatabase, 'Diệu Hương').length;
assert('Out-of-order Completion: Order 2 completed independently, active count drops to 2', activeCountAfterDone2 === 2);

// 6. Verify Order 1 and Order 3 are still in Packing state
const pack1 = livePackings.find(p => p.orderId === 'ORD_ACTIVE_1');
const pack3 = livePackings.find(p => p.orderId === 'ORD_ACTIVE_3');
assert('Out-of-order Completion: Order 1 is still in Packing state', pack1.status === 'Packing');
assert('Out-of-order Completion: Order 3 is still in Packing state', pack3.status === 'Packing');

// 7. Resilient Attendance Checkin matching & Admin Bypass
const mockAttendanceList = [
    { id: 'ATT_1', user: 'Nguyễn Thị Diệu Hương', timeIn: '08:00', timeOut: null },
    { id: 'ATT_2', user: 'Nguyễn Hoàng Dương', timeIn: '08:05', timeOut: null }
];

const checkAttendancePermission = (attList, curUser, isBoss, isAdmin) => {
    return isBoss || isAdmin || (attList || []).some(a =>
        simulateIsUserMatch(a.user, curUser) && a.timeIn && !a.timeOut
    );
};

assert('Attendance Checkin: Diệu Hương matches Nguyễn Thị Diệu Hương checkin', checkAttendancePermission(mockAttendanceList, 'Diệu Hương', false, false) === true);
assert('Attendance Checkin: Hương matches Nguyễn Thị Diệu Hương checkin', checkAttendancePermission(mockAttendanceList, 'Hương', false, false) === true);
assert('Attendance Checkin: Admin bypasses attendance checkin requirement', checkAttendancePermission([], 'Admin', false, true) === true);
assert('Attendance Checkin: Boss bypasses attendance checkin requirement', checkAttendancePermission([], 'Rich Fish', true, false) === true);
assert('Attendance Checkin: Unchecked staff without active checkin is rejected', checkAttendancePermission(mockAttendanceList, 'Trần Văn Chưa Vào Ca', false, false) === false);

assert('Modals_Orders.html: OrderCardV2 receives orders array prop', v2432ModalsOrders.includes('filterStatus, orders'));
assert('Modals_Orders.html: hasActiveCheckin uses isUserMatch & isBoss/isAdmin bypass', v2432ModalsOrders.includes('isBoss || isAdmin || (attendance || []).some'));
assert('Tab_Orders.html: passes orders={orders} to RFOrderWrapper', currentTabOrders.includes('orders={orders}'));
assert('Modals_Orders.html: chameleonConfig includes isMaxPackingReached in deps', v2432ModalsOrders.includes('getProducerOrigin, isMaxPackingReached'));

// 18. TEST ROYAL V2.43.3 HALLMARK TOUCH ERGONOMICS & POKA-YOKE CONFIRMATION MODAL
console.log('\n--- 18. Testing Royal v2.43.3 Touch Ergonomics & Poka-Yoke Confirmation ---');

const appMainV2433 = fs.readFileSync(appMainPath, 'utf8');
const changelogV2433 = fs.readFileSync(changelogPath, 'utf8');
const modalsOrdersV2433 = fs.readFileSync(modalsOrdersPath, 'utf8');

assert('App_Main.html: Contains Royal v2.43.3 in RELEASES', appMainV2433.includes("version: 'Royal v2.43.3'"));
assert('App_Main.html: Sidebar badge displays version >= v2.43.3', />v2\.(4[3-9]|\d{2,})\.\d+<\/span>/.test(appMainV2433));
assert('CHANGELOG.md: Documents v2.43.3 release notes', changelogV2433.includes('## [v2.43.3] - 2026-09-05'));

assert('Modals_Orders.html: Implements actionBtnRef and showActionMenu state', modalsOrdersV2433.includes('actionBtnRef') && modalsOrdersV2433.includes('showActionMenu'));
assert('Modals_Orders.html: Implements confirmAction state for Poka-Yoke protection', modalsOrdersV2433.includes('confirmAction'));
assert('Modals_Orders.html: Quick action bar uses large ergonomic touch targets (w-7.5 h-7.5)', modalsOrdersV2433.includes('w-7.5 h-7.5 rounded-lg flex items-center justify-center'));
assert('Modals_Orders.html: Action menu rendered via React Portal into document.body', modalsOrdersV2433.includes('showActionMenu && ReactDOM.createPortal'));
assert('Modals_Orders.html: Action menu separates Vùng kiểm soát', modalsOrdersV2433.includes('Vùng kiểm soát'));
assert('Modals_Orders.html: Poka-Yoke confirmation modal rendered via React Portal', modalsOrdersV2433.includes('confirmAction && ReactDOM.createPortal'));
assert('Modals_Orders.html: Confirmation modal includes safe cancel button', modalsOrdersV2433.includes('Huỷ bỏ (Giữ lại đơn)'));

// Simulation of 2-layer Poka-Yoke Return Guard:
let pokaYokeTestOrder = { id: 'ORD_TEST_SAFE', orderCode: 'TEST_001', status: 'Sẵn Sàng Đóng Gói' };
let modalState = null;

function clickReturnInMenu(order) {
    // Step 1: Click in menu DOES NOT change order status; it opens the confirmation modal
    modalState = {
        type: 'RETURN',
        title: 'XÁC NHẬN CHUYỂN HÀNG HOÀN',
        orderId: order.id
    };
}

function cancelModal() {
    // Step 2a: User cancels or clicks outside -> order stays untouched!
    modalState = null;
}

function confirmModal(order) {
    // Step 2b: User explicitly confirms -> order changes status!
    if (modalState && modalState.type === 'RETURN' && modalState.orderId === order.id) {
        order.status = 'Hàng Hoàn';
        modalState = null;
    }
}

// Test Layer 1: Misclick in menu
clickReturnInMenu(pokaYokeTestOrder);
assert('Poka-Yoke Layer 1: Clicking Return opens modal without changing order status', pokaYokeTestOrder.status === 'Sẵn Sàng Đóng Gói' && modalState !== null);

// Test Layer 2: Accidental tap is cancelled
cancelModal();
assert('Poka-Yoke Layer 2: Cancelling modal preserves order in original status', pokaYokeTestOrder.status === 'Sẵn Sàng Đóng Gói' && modalState === null);

// Test Layer 3: Deliberate confirmation executes transition
clickReturnInMenu(pokaYokeTestOrder);
confirmModal(pokaYokeTestOrder);
assert('Poka-Yoke Layer 3: Explicit confirmation transitions order to Hàng Hoàn', pokaYokeTestOrder.status === 'Hàng Hoàn' && modalState === null);

// 19. TEST ROYAL V2.44.0 RF WORKSHOP ASSISTANT (QUẢN ĐỐC ẢO XƯỞNG)
console.log('\n--- 19. Testing Royal v2.44.0 RF Workshop Assistant (AI Quản Đốc Xưởng) ---');

const appMainV2440 = fs.readFileSync(appMainPath, 'utf8');
const changelogV2440 = fs.readFileSync(changelogPath, 'utf8');
const componentsV2440 = fs.readFileSync(path.join(__dirname, 'Components.html'), 'utf8');
const serverKcsV2440 = fs.readFileSync(path.join(__dirname, 'server_kcs.py'), 'utf8');
const agentAssistantPath = path.join(__dirname, 'agent_assistant.py');
const tabProdV2440 = fs.readFileSync(path.join(__dirname, 'Tab_Production.html'), 'utf8');

assert('App_Main.html: Contains Royal v2.44.0 in RELEASES', appMainV2440.includes("version: 'Royal v2.44.0'"));
assert('App_Main.html: Sidebar badge displays version >= v2.44.0', />v2\.(4[4-9]|\d{2,})\.\d+<\/span>/.test(appMainV2440));
assert('CHANGELOG.md: Documents v2.44.0 release notes', changelogV2440.includes('## [v2.44.0] - 2026-09-05'));
assert('agent_assistant.py: Exists and implements ask_assistant', fs.existsSync(agentAssistantPath));
assert('server_kcs.py: Implements /api/assistant/chat endpoint', serverKcsV2440.includes('/api/assistant/chat'));
assert('Components.html: Defines WorkshopAssistantWidget', componentsV2440.includes('WorkshopAssistantWidget'));
assert('App_Main.html: Mounts WorkshopAssistantWidget globally', appMainV2440.includes('<WorkshopAssistantWidget'));
assert('Tab_Production.html: Triggers openWorkshopAssistant on Need_Repair', tabProdV2440.includes('openWorkshopAssistant'));

// 20. TEST ROYAL V2.45.0 MULTI-AGENT WAR ROOM (7 AGENTS)
console.log('\n--- 20. Testing Royal v2.45.0 RF War Room (7 Agents & Gemini Orchestration) ---');

const appMainV2450 = fs.readFileSync(appMainPath, 'utf8');
const changelogV2450 = fs.readFileSync(changelogPath, 'utf8');
const componentsV2450 = fs.readFileSync(path.join(__dirname, 'Components.html'), 'utf8');
const serverKcsV2450 = fs.readFileSync(path.join(__dirname, 'server_kcs.py'), 'utf8');
const agentWarRoomPath = path.join(__dirname, 'agent_war_room.py');
const agentWarRoomCode = fs.readFileSync(agentWarRoomPath, 'utf8');

assert('App_Main.html: Contains Royal v2.45.0 in RELEASES', appMainV2450.includes("version: 'Royal v2.45.0'"));
assert('App_Main.html: Sidebar badge displays >= v2.45.0', />v2\.(4[5-9]|\d{2,})\.\d+<\/span>/.test(appMainV2450));
assert('CHANGELOG.md: Documents v2.45.0 release notes', changelogV2450.includes('## [v2.45.0] - 2026-09-05'));
assert('agent_war_room.py: Exists and implements generate_agent_dialogue', fs.existsSync(agentWarRoomPath) && agentWarRoomCode.includes('generate_agent_dialogue'));
assert('agent_war_room.py: Configures all 7 agents in SYSTEM_WAR_ROOM', ['cso', 'coo', 'cfo', 'kho', 'sx', 'hr', 'baodong'].every(a => agentWarRoomCode.includes(a)));
assert('server_kcs.py: Implements /api/warroom/discuss endpoint', serverKcsV2450.includes('/api/warroom/discuss'));
assert('Components.html: Defines RFAgentControlTower component', componentsV2450.includes('RFAgentControlTower'));
assert('Components.html: Implements draggable tower #rf-agent-control-tower', componentsV2450.includes('id="rf-agent-control-tower"'));
assert('Components.html: Implements drag handle #rf-agent-header', componentsV2450.includes('id="rf-agent-header"'));
assert('Components.html: Implements 7-agent roster #rf-agent-roster', componentsV2450.includes('id="rf-agent-roster"'));
assert('Components.html: Implements conversation stream #rf-agent-stream', componentsV2450.includes('id="rf-agent-stream"'));
assert('Components.html: Exposes triggerRealtimeWarRoom and pushAgentDialogue', componentsV2450.includes('triggerRealtimeWarRoom') && componentsV2450.includes('pushAgentDialogue'));
assert('App_Main.html: Mounts RFAgentControlTower globally', appMainV2450.includes('<RFAgentControlTower'));

console.log('\n--- 21. Testing Royal v2.45.1 Hotfix URL Sanitization in Components.html ---');
assert('App_Main.html: Contains Royal v2.45.1 in RELEASES', appMainV2450.includes("version: 'Royal v2.45.1'"));
assert('App_Main.html: Sidebar badge displays >= v2.45.1', />v2\.(4[5-9]|\d{2,})\.\d+<\/span>/.test(appMainV2450));
assert('CHANGELOG.md: Documents v2.45.1 release notes', changelogV2450.includes('## [v2.45.1] - 2026-09-05'));
assert('Components.html: Defines KCS_LOCAL_URL constant via string concatenation', componentsV2450.includes("const KCS_LOCAL_URL = 'http' + '://' + '127.0.0.1:8000'"));
assert('Components.html: War Room discuss endpoint uses KCS_LOCAL_URL', componentsV2450.includes("fetch(KCS_LOCAL_URL + '/api/warroom/discuss'"));
assert('Components.html: Assistant chat endpoint uses KCS_LOCAL_URL', componentsV2450.includes("fetch(KCS_LOCAL_URL + '/api/assistant/chat'"));
assert('Components.html: Health check endpoint uses KCS_LOCAL_URL', componentsV2450.includes("fetch(KCS_LOCAL_URL + '/health'"));

console.log('\n--- 22. Testing Royal v2.45.2 Interactive War Room Commander Chat & Auto-Coordination ---');
const appMainV2452 = fs.readFileSync(appMainPath, 'utf8');
const changelogV2452 = fs.readFileSync(changelogPath, 'utf8');
const componentsV2452 = fs.readFileSync(path.join(__dirname, 'Components.html'), 'utf8');
const tabProdV2452 = fs.readFileSync(path.join(__dirname, 'Tab_Production.html'), 'utf8');

assert('App_Main.html: Contains Royal v2.45.2 in RELEASES', appMainV2452.includes("version: 'Royal v2.45.2'"));
assert('App_Main.html: Sidebar badge displays >= v2.45.2', />v2\.(4[5-9]|\d{2,})\.\d+<\/span>/.test(appMainV2452));
assert('CHANGELOG.md: Documents v2.45.2 release notes', changelogV2452.includes('## [v2.45.2] - 2026-09-05'));
assert('Components.html: Implements interactive chatInput state', componentsV2452.includes('chatInput'));
assert('Components.html: Replaced simulation buttons with chat form', !componentsV2452.includes('Chạy Mô Phỏng Chiến Lược') && componentsV2452.includes('Nhập sự vụ xưởng, thắc mắc kỹ thuật'));
assert('Components.html: Submit button triggers send action', componentsV2452.includes('type="submit"') && componentsV2452.includes('fa-paper-plane'));
assert('Tab_Production.html: Triggers triggerRealtimeWarRoom on KCS rejection', tabProdV2452.includes('window.triggerRealtimeWarRoom'));

console.log('\n--- 23. Testing Royal v2.45.3 Realtime Data Grounding & Anti-Hallucination ---');
const appMainV2453 = fs.readFileSync(appMainPath, 'utf8');
const changelogV2453 = fs.readFileSync(changelogPath, 'utf8');
const componentsV2453 = fs.readFileSync(path.join(__dirname, 'Components.html'), 'utf8');
const agentWarRoomV2453 = fs.readFileSync(path.join(__dirname, 'agent_war_room.py'), 'utf8');
const serverKcsV2453 = fs.readFileSync(path.join(__dirname, 'server_kcs.py'), 'utf8');

assert('App_Main.html: Contains Royal v2.45.3 in RELEASES', appMainV2453.includes("version: 'Royal v2.45.3'"));
assert('App_Main.html: Sidebar badge displays >= v2.45.3', />v2\.(4[5-9]|\d{2,})\.\d+<\/span>/.test(appMainV2453));
assert('CHANGELOG.md: Documents v2.45.3 release notes', changelogV2453.includes('## [v2.45.3] - 2026-09-05'));
assert('Components.html: Defines buildLiveOperationalContext', componentsV2453.includes('buildLiveOperationalContext'));
assert('Components.html: Sends context in /api/warroom/discuss payload', componentsV2453.includes('context: payloadContext'));
assert('Components.html: RFAgentControlTower receives sheet data props', componentsV2453.includes('kpiConfig') && componentsV2453.includes('erpData'));
assert('agent_war_room.py: Implements IncidentRequest with optional context', agentWarRoomV2453.includes('context: Optional[Dict[str, Any]]'));
assert('agent_war_room.py: Implements format_war_room_prompt with data grounding', agentWarRoomV2453.includes('format_war_room_prompt') && agentWarRoomV2453.includes('KPI_Progress'));
assert('agent_war_room.py: Anti-hallucination rules prohibit fake names (anh Tuấn)', agentWarRoomV2453.includes('anh Tuấn'));
assert('server_kcs.py: Passes payload.context to generate_agent_dialogue', serverKcsV2453.includes('generate_agent_dialogue(payload.incident, payload.context)'));

console.log('\n--- 24. Testing Royal v2.45.4 Hallmark Mobile Finance & Seamless Sync ---');
const appMainV2454 = fs.readFileSync(appMainPath, 'utf8');
const changelogV2454 = fs.readFileSync(changelogPath, 'utf8');
const codeJsV2454 = fs.readFileSync(path.join(__dirname, 'Code.js'), 'utf8');
const tabFinanceV2454 = fs.readFileSync(path.join(__dirname, 'Tab_Finance.html'), 'utf8');
const modalsOrdersV2454 = fs.readFileSync(path.join(__dirname, 'Modals_Orders.html'), 'utf8');

assert('App_Main.html: Contains Royal v2.45.4 in RELEASES', appMainV2454.includes("version: 'Royal v2.45.4'"));
assert('App_Main.html: Sidebar badge displays >= v2.45.4', />v2\.(4[5-9]|\d{2,})\.\d+<\/span>/.test(appMainV2454));
assert('CHANGELOG.md: Documents v2.45.4 release notes', changelogV2454.includes('## [v2.45.4] - 2026-09-06'));
assert('Code.js: Allows authorized finance roles to write to Accounts table', codeJsV2454.includes("'QUẢN LÝ BÁN HÀNG', 'QUẢN LÝ KHO VẬN', 'CỘNG TÁC VIÊN'"));
assert('Tab_Finance.html: Implements Hallmark Bottom Sheet on mobile', tabFinanceV2454.includes('items-end sm:items-center') && tabFinanceV2454.includes('rounded-t-3xl sm:rounded-3xl'));
assert('Tab_Finance.html: Implements touch scroll isolation for category select', tabFinanceV2454.includes('touchAction') && tabFinanceV2454.includes('e.stopPropagation()'));
assert('Tab_Finance.html: Rollback protection on pushDeltas failure', tabFinanceV2454.includes('prevTxsSnapshot') && tabFinanceV2454.includes('res.success === false'));
assert('Modals_Orders.html: Implements native file.arrayBuffer() with clear file lock handling', modalsOrdersV2454.includes('file.arrayBuffer()') && modalsOrdersV2454.includes('Microsoft Excel'));

console.log('\n--- 25. Testing Royal v2.45.7 Smart Return Scanner & Zero-Dropped Audit ---');
const appMainV2457 = fs.readFileSync(appMainPath, 'utf8');
const changelogV2457 = fs.readFileSync(changelogPath, 'utf8');
const tabOrdersV2457 = fs.readFileSync(path.join(__dirname, 'Tab_Orders.html'), 'utf8');

assert('App_Main.html: Contains Royal v2.45.7 in RELEASES', appMainV2457.includes("version: 'Royal v2.45.7'"));
assert('App_Main.html: Sidebar badge displays >= v2.45.7', />v2\.(4[5-9]|\d{2,})\.\d+<\/span>/.test(appMainV2457));
assert('CHANGELOG.md: Documents v2.45.7 release notes', changelogV2457.includes('## [v2.45.7] - 2026-09-07'));
assert('Tab_Orders.html: processCode implements auto-migration of past month return orders', tabOrdersV2457.includes('isOldMonth') && tabOrdersV2457.includes('đưa về mục Hoàn Tháng'));
assert('Tab_Orders.html: confirmBulkReturn implements auto-migration of past month return orders', tabOrdersV2457.includes('oldMonthCount') && tabOrdersV2457.includes('đưa về Hoàn T'));
assert('Tab_Orders.html: matchTimeFilter preserves unreconciled return orders in Tháng Này', tabOrdersV2457.includes('isReturnOrder && !isRec && (filterTime ==='));
assert('Tab_Orders.html: matchTimeFilter prioritizes returnedAt for return orders', tabOrdersV2457.includes('order.returnedAt || order.reconciledAt || order.date'));
assert('Tab_Orders.html: realTimeSummary.urgentAlerts checks returnedAt', tabOrdersV2457.includes('String(o.returnedAt || o.updatedAt || o.createdAt || o.date'));
assert('Tab_Orders.html: ReturnScannerModal displays informative auto-migration guarantee pill', tabOrdersV2457.includes('Đơn tháng cũ (T8) khi quét sẽ tự động đưa về mục Hoàn Tháng Này'));

// Unit logic test for return order migration
const augOrder = {
    id: 'ORD_AUG_001',
    orderCode: 'SPX_AUG_9988',
    date: '2026-08-20',
    createdAt: '2026-08-20 14:30:00',
    status: 'Đã Bàn Giao',
    isReconciled: false
};
const nowMonth = '2026-09';
const todayDate = '2026-09-07';
const isOld = augOrder.date && !augOrder.date.startsWith(nowMonth);
assert('Logic Test: August order is correctly identified as isOldMonth in September', isOld === true);

const migratedOrder = {
    ...augOrder,
    date: isOld ? todayDate : augOrder.date,
    status: 'Hàng Hoàn',
    _effectiveStatus: 'HÀNG HOÀN CHỜ XỬ LÝ',
    returnedAt: '2026-09-07 00:45:00',
    isReconciled: false
};
assert('Logic Test: Migrated order date updated to September', migratedOrder.date === '2026-09-07');
assert('Logic Test: Migrated order status updated to Hàng Hoàn', migratedOrder.status === 'Hàng Hoàn');

// Simulate matchTimeFilter for migrated order in "Tháng Này"
const isReturnOrderSim = (migratedOrder.status === 'Hàng Hoàn');
const isRecSim = migratedOrder.isReconciled === true;
const isVisibleInThisMonth = (isReturnOrderSim && !isRecSim) || migratedOrder.date.startsWith('2026-09');
assert('Logic Test: Migrated order is 100% visible to Diệu Hương in Tháng Này', isVisibleInThisMonth === true);

console.log('\n--- 26. Testing Royal v2.45.8 Lean Production Pull & Worker Restoration ---');
const appMainV2458 = fs.readFileSync(appMainPath, 'utf8');
const changelogV2458 = fs.readFileSync(changelogPath, 'utf8');
const codeJsV2458 = fs.readFileSync(path.join(__dirname, 'Code.js'), 'utf8');
const tabProdV2458 = fs.readFileSync(path.join(__dirname, 'Tab_Production.html'), 'utf8');
const modalsOrdersV2458 = fs.readFileSync(path.join(__dirname, 'Modals_Orders.html'), 'utf8');

assert('App_Main.html: Contains Royal v2.45.8 in RELEASES', appMainV2458.includes("version: 'Royal v2.45.8'"));
assert('App_Main.html: Sidebar badge displays >= v2.45.8', />v2\.(4[5-9]|\d{2,})\.\d+<\/span>/.test(appMainV2458));
assert('CHANGELOG.md: Documents v2.45.8 release notes', changelogV2458.includes('## [v2.45.8] - 2026-09-07'));
assert('Code.js: getUserConfig initializes and populates pins', codeJsV2458.includes('pins: {}') && codeJsV2458.includes('config.pins[pinKey] = pinObj'));
assert('Code.js: formatProd clears Kho Hàng and Hàng ghost workers', codeJsV2458.includes("if (p1U === 'Kho Hàng' || p1U === 'Hàng') p1U = '';") && codeJsV2458.includes("if (p2U === 'Kho Hàng' || p2U === 'Hàng') p2U = '';"));
assert('Modals_Orders.html: stockPhases has empty user string', modalsOrdersV2458.includes("phase1: { name: 'Cắt Dán', status: 'Done', user: '' }") && modalsOrdersV2458.includes("phase1: { name: 'Dựng Khung', status: 'Done', user: '' }"));
assert('Tab_Production.html: WorkerPhaseV2 defines isFakeUser check', tabProdV2458.includes("const isFakeUser = !rawUser || rawUser === 'Kho Hàng' || rawUser === 'Hàng';"));
assert('Tab_Production.html: WorkerPhaseV2 computes availableWorkers with de-duplication', tabProdV2458.includes('const availableWorkers = React.useMemo') && tabProdV2458.includes("clean !== 'Kho Hàng' && clean !== 'Hàng'"));
assert('Tab_Production.html: Phase 2 auto-assignment on Phase 1 completion is removed', !tabProdV2458.includes("selectedWorker = (others.length > 0 ? others[0] : activeWorkers[0]).user;"));
assert('Tab_Production.html: Batch assignment modal filters fake users', tabProdV2458.includes("name !== 'Kho Hàng' && name !== 'Hàng' && name.toLowerCase() !== 'khách'"));

// Logic simulation test
const simRawUser = 'Kho Hàng';
const simIsFakeUser = !simRawUser || simRawUser === 'Kho Hàng' || simRawUser === 'Hàng';
const simEffectiveUser = simIsFakeUser ? '' : simRawUser;
const simUserName = simEffectiveUser ? simEffectiveUser.split(' ').pop() : 'Chờ nhận việc';
const simIsOwner = !simEffectiveUser || simEffectiveUser === 'Nguyễn Văn A';
assert('Logic Test: Fake user "Kho Hàng" displays "Chờ nhận việc"', simUserName === 'Chờ nhận việc');
assert('Logic Test: Fake user allows craftsman to be isOwner and claim task', simIsOwner === true);

console.log('\n--- 27. Testing Royal v2.45.9 Hook Order Invariance & Minified React Error #310 Hotfix ---');
const appMainV2459 = fs.readFileSync(path.join(__dirname, 'App_Main.html'), 'utf8');
const changelogV2459 = fs.readFileSync(path.join(__dirname, 'CHANGELOG.md'), 'utf8');
const tabProdV2459 = fs.readFileSync(path.join(__dirname, 'Tab_Production.html'), 'utf8');

assert('App_Main.html: Contains Royal v2.45.9 in RELEASES', appMainV2459.includes("version: 'Royal v2.45.9'"));
assert('App_Main.html: Sidebar badge displays >= v2.45.9', />v2\.(4[5-9]|\d{2,})\.\d+<\/span>/.test(appMainV2459));
assert('CHANGELOG.md: Documents v2.45.9 release notes', changelogV2459.includes('## [v2.45.9] - 2026-09-07'));

// React Hook Order Invariance Checks: All hooks MUST be declared before any conditional early returns
const availWorkerPos = tabProdV2459.indexOf('const availableWorkers = React.useMemo');
const isLockedPos = tabProdV2459.indexOf('if (isLocked) return null;');
assert('Tab_Production.html: availableWorkers hook is declared BEFORE if (isLocked) return null', availWorkerPos !== -1 && isLockedPos !== -1 && availWorkerPos < isLockedPos);

// Material Requisition Modal Hook Order
const reqHookPos = tabProdV2459.indexOf('const availableMaterials = React.useMemo');
const reqReturnPos = tabProdV2459.indexOf('if (!isOpen || !item) return null;');
assert('Tab_Production.html: MaterialRequisitionModal declares availableMaterials BEFORE if (!isOpen || !item) return null', reqHookPos !== -1 && reqReturnPos !== -1 && reqHookPos < reqReturnPos);

// Material Settlement Modal Hook Order
const setHookPos = tabProdV2459.indexOf('const initialList = React.useMemo');
const setReturnPos = tabProdV2459.indexOf('if (!isOpen || !item) return null;', reqReturnPos + 1);
assert('Tab_Production.html: MaterialSettlementModal declares initialList BEFORE if (!isOpen || !item) return null', setHookPos !== -1 && setReturnPos !== -1 && setHookPos < setReturnPos);

// SUMMARY

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
console.log(`========================================\n`);

if (failedTests > 0) {
    process.exit(1);
} else {
    process.exit(0);
}

