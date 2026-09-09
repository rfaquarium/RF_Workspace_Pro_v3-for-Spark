/**
 * RF_WORKSPACE_PRO - UNIFIED SINGLE DEPLOYMENT ENGINE
 * Đảm bảo 100% mọi lần deploy đều cập nhật đè vào ĐÚNG 1 DEPLOYMENT ID DUY NHẤT.
 * Tuyệt đối không tạo thêm bản deployment mới gây rác hệ thống.
 */
const { execSync } = require('child_process');

const PRODUCTION_DEPLOYMENT_ID = 'AKfycbxEbdN-PPiRz5CZnSOLZ8vLqrIoN3PId-lZZpMflU2fsVR6VdOoOz4GbagZIWJ4Kht0pQ';
const description = process.argv[2] || 'RF Workspace Pro v3.0 Production Update';

console.log('🚀 Bắt đầu quy trình triển khai vào 1 bản duy nhất...');
console.log(`📌 Deployment ID cố định: ${PRODUCTION_DEPLOYMENT_ID}`);
console.log(`📝 Mô tả: "${description}"`);

try {
  // 1. Precompile JSX
  console.log('\n--- 1. Pre-compiling JSX ---');
  execSync('node tools/precompile_jsx.js', { stdio: 'inherit' });

  // 2. Verify build
  console.log('\n--- 2. Verifying Build Integrity ---');
  execSync('node tools/verify_build.js', { stdio: 'inherit' });

  // 3. Push code
  console.log('\n--- 3. Pushing code via Clasp ---');
  execSync('npx clasp push -f', { stdio: 'inherit' });

  // 4. Deploy đè vào đúng ID duy nhất
  console.log('\n--- 4. Deploying to Unified Single Deployment ID ---');
  execSync(`npx clasp deploy -i ${PRODUCTION_DEPLOYMENT_ID} -d "${description}"`, { stdio: 'inherit' });

  console.log('\n🎉 HOÀN TẤT TRIỂN KHAI VÀO 1 BẢN DUY NHẤT THÀNH CÔNG!');
  console.log(`🔗 Web App URL: https://script.google.com/macros/s/${PRODUCTION_DEPLOYMENT_ID}/exec`);
} catch (error) {
  console.error('\n❌ Lỗi trong quá trình triển khai:', error.message);
  process.exit(1);
}
