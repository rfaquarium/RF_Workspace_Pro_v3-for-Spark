/**
 * RF_WORKSPACE_PRO — Build Integrity Verifier
 * Kiểm tra tính toàn vẹn của Bundle đã pre-compile.
 * Chặn triển khai hoặc báo lỗi nếu phát hiện file nguồn JSX bị sửa đổi mà chưa chạy precompile_jsx.js.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.resolve(__dirname, '..');
const manifestPath = path.join(rootDir, 'build_manifest.json');
const coreBundlePath = path.join(rootDir, 'Compiled_Core.html');
const deferredBundlePath = path.join(rootDir, 'Compiled_Deferred.html');

function verifyBuild() {
  console.log('🔍 KIỂM TRA TÍNH TOÀN VẸN CỦA BẢN BIÊN DỊCH PRE-COMPILE...');

  if (!fs.existsSync(manifestPath)) {
    console.error('❌ THẤT BẠI: Chưa có tệp build_manifest.json! Cần chạy "node tools/precompile_jsx.js" trước.');
    return false;
  }

  if (!fs.existsSync(coreBundlePath) || !fs.existsSync(deferredBundlePath)) {
    console.error('❌ THẤT BẠI: Thiếu Compiled_Core.html hoặc Compiled_Deferred.html!');
    return false;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.error('❌ THẤT BẠI: build_manifest.json bị hỏng cú pháp:', e.message);
    return false;
  }

  const hashes = manifest.hashes || {};
  let hasMismatch = false;

  for (const fileName of Object.keys(hashes)) {
    const filePath = path.join(rootDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File nguồn bị thiếu: ${fileName}`);
      hasMismatch = true;
      continue;
    }

    const currentContent = fs.readFileSync(filePath, 'utf8');
    const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');
    const recordedHash = hashes[fileName];

    if (currentHash !== recordedHash) {
      console.error(`⚠️ CẢNH BÁO LỆCH MÃ NGUỒN: ${fileName} đã bị sửa đổi sau lần build cuối!`);
      console.error(`   - Hash ghi nhận: ${recordedHash}`);
      console.error(`   - Hash hiện tại: ${currentHash}`);
      hasMismatch = true;
    }
  }

  if (hasMismatch) {
    console.error('\n❌ TÍNH TOÀN VẸN THẤT BẠI: Mã nguồn JSX không khớp với bản đã biên dịch!');
    console.error('👉 Vui lòng chạy lại: "node tools/precompile_jsx.js" để cập nhật bundle trước khi tiếp tục.');
    return false;
  }

  console.log('✅ TÍNH TOÀN VẸN ĐẠT 100%: Toàn bộ mã nguồn JSX khớp tuyệt đối với bundle đã biên dịch.');
  return true;
}

if (require.main === module) {
  const ok = verifyBuild();
  process.exit(ok ? 0 : 1);
}

module.exports = {
  verifyBuild
};
