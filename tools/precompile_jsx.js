/**
 * RF_WORKSPACE_PRO — JSX Pre-compilation Engine
 * Biên dịch toàn bộ JSX sang JavaScript thuần (React.createElement) trước khi triển khai.
 * Loại bỏ hoàn toàn chi phí tải Babel CDN 2.8 MB và 4.5s CPU compile trên trình duyệt.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Nạp Babel từ temp_babel.js độc lập
const babelPath = path.resolve(__dirname, '..', 'temp_babel.js');
if (!fs.existsSync(babelPath)) {
  console.error('❌ Không tìm thấy Babel tại:', babelPath);
  process.exit(1);
}
const Babel = require(babelPath);

const rootDir = path.resolve(__dirname, '..');

const CORE_FILES = [
  'Config',
  'Components',
  'Modals',
  'Modals_Orders',
  'Tab_Dashboard',
  'Tab_Orders',
  'App_Main'
];

const DEFERRED_FILES = [
  'Tab_Production',
  'Tab_Inventory',
  'Tab_ImportExport',
  'Tab_Suppliers',
  'Tab_Finance',
  'Tab_BusinessReport',
  'Tab_HR',
  'Tab_Documents',
  'Tab_Viewer3D',
  'Tab_Affiliate',
  'Tab_Analytics',
  'Tab_Workspaces',
  'ShopeeGlobalTab'
];

function cleanCode(raw) {
  if (!raw) return '';
  return raw
    .replace(/\0/g, '')
    .replace(/[\uFEFF\uFFFE]/g, '')
    .replace(/^\s*<script[^>]*>/i, '')
    .replace(/<\/script>\s*$/i, '');
}

function computeFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function buildBundle(fileIds, bundleName) {
  console.log(`\n📦 Đang đóng gói & biên dịch ${bundleName}...`);
  let combinedJsx = '';
  const manifestHashes = {};

  fileIds.forEach(id => {
    const filePath = path.join(rootDir, `${id}.html`);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Không tìm thấy file: ${filePath}`);
      process.exit(1);
    }
    const rawContent = fs.readFileSync(filePath, 'utf8');
    manifestHashes[`${id}.html`] = crypto.createHash('sha256').update(rawContent).digest('hex');
    const cleaned = cleanCode(rawContent);
    combinedJsx += `\n/* ═══ MODULE: ${id} ═══ */\n${cleaned}\n`;
    console.log(`  + Đã nạp: ${id}.html (${(rawContent.length / 1024).toFixed(1)} KB)`);
  });

  const t0 = Date.now();
  const transformResult = Babel.transform(combinedJsx, {
    presets: ['react'],
    compact: false,
    comments: true
  });
  const dt = Date.now() - t0;
  const compiledJs = transformResult.code;

  console.log(`  ⚡ Biên dịch JSX thành công trong ${dt}ms!`);
  console.log(`  📊 Kích thước JSX thô: ${(combinedJsx.length / 1024).toFixed(1)} KB -> JS thuần: ${(compiledJs.length / 1024).toFixed(1)} KB`);

  return {
    js: compiledJs,
    hashes: manifestHashes
  };
}

function run() {
  console.log('🚀 BẮT ĐẦU QUY TRÌNH PRE-COMPILE JSX CHO RF WORKSPACE PRO');
  const startTotal = Date.now();

  const coreResult = buildBundle(CORE_FILES, 'Compiled_Core (App Shell & Core Tabs)');
  const deferredResult = buildBundle(DEFERRED_FILES, 'Compiled_Deferred (Extended Tabs)');

  // Tạo file HTML chứa thẻ <script> để tương thích với <?!= include('Compiled_Core'); ?> trong Apps Script
  const coreHtmlContent = `<script>\n/* RF_WORKSPACE_PRO — COMPILED CORE BUNDLE (AUTO-GENERATED) */\n${coreResult.js}\n</script>`;
  const deferredHtmlContent = `<script>\n/* RF_WORKSPACE_PRO — COMPILED DEFERRED BUNDLE (AUTO-GENERATED) */\n${deferredResult.js}\n</script>`;

  const coreOutputPath = path.join(rootDir, 'Compiled_Core.html');
  const deferredOutputPath = path.join(rootDir, 'Compiled_Deferred.html');

  fs.writeFileSync(coreOutputPath, coreHtmlContent, 'utf8');
  fs.writeFileSync(deferredOutputPath, deferredHtmlContent, 'utf8');
  console.log(`\n💾 Đã lưu: Compiled_Core.html (${(coreHtmlContent.length / 1024).toFixed(1)} KB)`);
  console.log(`💾 Đã lưu: Compiled_Deferred.html (${(deferredHtmlContent.length / 1024).toFixed(1)} KB)`);

  // Lưu manifest hash để kiểm tra tính toàn vẹn
  const manifest = {
    generatedAt: new Date().toISOString(),
    coreFiles: CORE_FILES.map(f => `${f}.html`),
    deferredFiles: DEFERRED_FILES.map(f => `${f}.html`),
    hashes: {
      ...coreResult.hashes,
      ...deferredResult.hashes
    },
    bundleHashes: {
      'Compiled_Core.html': crypto.createHash('sha256').update(coreHtmlContent).digest('hex'),
      'Compiled_Deferred.html': crypto.createHash('sha256').update(deferredHtmlContent).digest('hex')
    }
  };

  const manifestPath = path.join(rootDir, 'build_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`📑 Đã lưu: build_manifest.json (${Object.keys(manifest.hashes).length} files được theo dõi)`);

  const totalDt = Date.now() - startTotal;
  console.log(`\n🎉 HOÀN TẤT PRE-COMPILE TRONG ${totalDt}ms! Sẵn sàng cho triển khai sạch 100% không Babel client-side.`);
}

if (require.main === module) {
  run();
}

module.exports = {
  run,
  CORE_FILES,
  DEFERRED_FILES
};
