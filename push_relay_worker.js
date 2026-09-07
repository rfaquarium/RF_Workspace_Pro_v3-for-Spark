// ============================================================================
// RF_WORKSPACE_PRO - CLOUDFLARE WORKER WEB PUSH RELAY GATEWAY
// Rich Fish Aquarium - High Performance Push Notification Engine
// ============================================================================

import webpush from 'web-push';

const VAPID_PUBLIC_KEY = 'BE28tc0C-AHuGSmjcuTFRwIZpyz_bVAqq-SgMltz7zLF8gpa8B0fewHHw2oRDbcr8mHNqDF_r3Hpm_cqpHdMwZo';
const VAPID_PRIVATE_KEY = 'JlSHHaq_SYuds_H-hq8WOIkoO8W4irTimRYCSnOn_zk';
const CONTACT_EMAIL = 'mailto:richfishaquarium@gmail.com';
const AUTH_SECRET = 'RF_WORK_PRO_SECURE_TOKEN_2026';

webpush.setVapidDetails(
  CONTACT_EMAIL,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export default {
  async fetch(request, env, ctx) {
    // Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Chỉ chấp nhận phương thức POST' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Bảo mật kiểm tra Token từ Google Apps Script
    const authHeader = request.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token !== (env?.AUTH_SECRET || AUTH_SECRET)) {
      return new Response(JSON.stringify({ error: 'Unauthorized - Sai mã bí mật AUTH_SECRET' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    try {
      const body = await request.json();
      const { subscription, payload } = body;

      if (!subscription || !subscription.endpoint) {
        return new Response(JSON.stringify({ error: 'Thiếu subscription hoặc endpoint' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const pushPayload = typeof payload === 'string' ? payload : JSON.stringify(payload || {
        title: '🔔 Rich Fish Aquarium',
        body: 'Bạn có thông báo mới từ xưởng!'
      });

      // Bắn Web Push Notification tới Google FCM / Apple APNs / Mozilla Autopush
      const pushResult = await webpush.sendNotification(subscription, pushPayload, {
        TTL: 86400, // Lưu thông báo tối đa 24h nếu thiết bị đang offline
        urgency: 'high'
      });

      return new Response(JSON.stringify({
        success: true,
        statusCode: pushResult.statusCode,
        message: 'Đã bắn thông báo đẩy thành công tới thiết bị!'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (err) {
      console.error('Lỗi gửi Web Push:', err);
      return new Response(JSON.stringify({
        success: false,
        error: err.message,
        statusCode: err.statusCode || 500
      }), {
        status: 200, // Trả 200 kèm error object để Apps Script không bị ngắt quãng fetch
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
