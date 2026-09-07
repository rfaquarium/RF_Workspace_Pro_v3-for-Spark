// ============================================================================
// RF_WORKSPACE_PRO - ENHANCED SERVICE WORKER (sw.js)
// High Reliability Web Push + Multi-Pattern Haptic Engine for iOS & Android
// ============================================================================

const CACHE_NAME = 'rf-shell-v3';
const ICON_URL = 'https://i.postimg.cc/TYD5NncZ/icon.png';
const BADGE_URL = 'https://i.postimg.cc/TYD5NncZ/icon.png';

// Dynamic Vibration & Haptic Patterns for Mobile (Android/Chrome/PWA)
const VIBRATION_PATTERNS = {
  sos: [400, 100, 400, 100, 400, 100, 600, 200, 600], // Cực mạnh, dồn dập
  urgent: [150, 80, 150, 80, 300, 100, 300],          // Đơn gấp SLA < 2h, Hỏa tốc
  warning: [120, 60, 120],                             // Cảnh báo tiến độ / KCS
  success: [40, 50, 60],                               // Hoàn thành tác vụ
  info: [80, 40, 80]                                   // Thông báo thường
};

// Các tài nguyên cần cache ngay khi install → mở app = tải từ disk (0ms)
const SHELL_ASSETS = [
  '/',
  '/vercel_index.html',
  '/manifest.json'
];

// === INSTALL: Cache App Shell ngay lập tức ===
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(SHELL_ASSETS);
    }).then(function () {
      return self.skipWaiting(); // Kích hoạt ngay lập tức
    })
  );
});

// === ACTIVATE: Dọn dẹp cache cũ & claim clients ===
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names.filter(function (n) { return n !== CACHE_NAME; })
          .map(function (n) { return caches.delete(n); })
      );
    }).then(function () {
      return self.clients.claim(); // Chiếm quyền điều khiển tất cả tab đang mở
    })
  );
});

// === FETCH: Stale-While-Revalidate cho App Shell ===
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);

  // Chỉ xử lý request tới cùng domain Vercel, không can thiệp vào GAS hay Firebase
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request).then(function (cached) {
        var networkFetch = fetch(event.request).then(function (networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(function () {
          return cached;
        });

        return cached || networkFetch;
      });
    })
  );
});

// === PUSH NOTIFICATION: Xử lý thông báo đẩy đa tầng cho iOS & Android ===
self.addEventListener('push', function (event) {
  var data = {
    title: '🔔 Rich Fish Aquarium',
    body: 'Bạn có thông báo mới từ xưởng sản xuất!',
    url: '/',
    tag: 'rf-general-notification',
    type: 'info', // 'sos' | 'urgent' | 'warning' | 'info'
    targetTab: 'orders',
    orderId: '',
    timestamp: Date.now()
  };

  if (event.data) {
    try {
      var parsed = event.data.json();
      data = Object.assign(data, parsed);
    } catch (e) {
      data.body = event.data.text();
    }
  }

  var isSOS = data.type === 'sos' || (data.title && data.title.includes('SOS')) || (data.body && data.body.includes('SOS'));
  var isUrgent = data.type === 'urgent' || (data.title && data.title.includes('GẤP')) || (data.body && data.body.includes('Gấp'));

  var vibratePattern = VIBRATION_PATTERNS.info;
  if (isSOS) vibratePattern = VIBRATION_PATTERNS.sos;
  else if (isUrgent) vibratePattern = VIBRATION_PATTERNS.urgent;
  else if (data.type === 'warning') vibratePattern = VIBRATION_PATTERNS.warning;
  else if (data.type === 'success') vibratePattern = VIBRATION_PATTERNS.success;

  // Cấu hình Action Buttons tương thích iOS & Android PWA
  var actions = [
    { action: 'open_app', title: '🔍 Xem Chi Tiết' },
    { action: 'dismiss', title: '✕ Đóng' }
  ];

  if (isSOS) {
    actions = [
      { action: 'open_sos', title: '🚨 Xử Lý SOS Ngay' },
      { action: 'dismiss', title: '✕ Đóng' }
    ];
  } else if (isUrgent) {
    actions = [
      { action: 'open_urgent', title: '⚡ Xử Lý Đơn Gấp' },
      { action: 'dismiss', title: '✕ Đóng' }
    ];
  }

  var notificationOptions = {
    body: data.body,
    icon: ICON_URL,
    badge: BADGE_URL,
    tag: data.tag || (isSOS ? 'rf-sos-' : isUrgent ? 'rf-urgent-' : 'rf-notice-') + Date.now(),
    renotify: true,
    silent: false,
    vibrate: vibratePattern,
    requireInteraction: isSOS || isUrgent, // Giữ thông báo trên màn hình cho đến khi người dùng tương tác
    timestamp: data.timestamp || Date.now(),
    data: {
      url: data.url || '/',
      type: data.type || (isSOS ? 'sos' : isUrgent ? 'urgent' : 'info'),
      targetTab: data.targetTab || (isSOS ? 'production' : isUrgent ? 'orders' : 'dashboard'),
      orderId: data.orderId || '',
      actionTriggeredAt: Date.now()
    },
    actions: actions
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// === NOTIFICATION CLICK: Điều hướng thông minh & Deep-Linking ===
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'dismiss' || event.action === 'close') return;

  var notifData = event.notification.data || {};
  var targetUrl = notifData.url || '/';
  var targetTab = notifData.targetTab || (event.action === 'open_sos' ? 'production' : event.action === 'open_urgent' ? 'orders' : 'dashboard');
  var orderId = notifData.orderId || '';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // 1. Nếu đã có tab ứng dụng đang mở -> Focus và gửi PostMessage chuyển tab
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        var isRFApp = client.url.includes(self.location.origin) || client.url.includes('script.google.com');
        if (isRFApp && 'focus' in client) {
          client.postMessage({
            type: 'NAVIGATE_DEEP_LINK',
            tab: targetTab,
            orderId: orderId,
            action: event.action,
            notifType: notifData.type
          });
          return client.focus();
        }
      }

      // 2. Nếu chưa có tab nào mở -> Mở cửa sổ mới
      if (clients.openWindow) {
        var destination = targetUrl;
        if (destination.indexOf('?') === -1) {
          destination += '?tab=' + encodeURIComponent(targetTab);
        } else {
          destination += '&tab=' + encodeURIComponent(targetTab);
        }
        if (orderId) destination += '&orderId=' + encodeURIComponent(orderId);
        return clients.openWindow(destination);
      }
    })
  );
});

// === PUSH SUBSCRIPTION CHANGE: Tự động phục hồi Push Token khi iOS/Android xoay token ===
self.addEventListener('pushsubscriptionchange', function (event) {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription ? event.oldSubscription.options : {
      userVisibleOnly: true,
      applicationServerKey: 'BE28tc0C-AHuGSmjcuTFRwIZpyz_bVAqq-SgMltz7zLF8gpa8B0fewHHw2oRDbcr8mHNqDF_r3Hpm_cqpHdMwZo'
    }).then(function (newSubscription) {
      // Gửi token mới về tất cả active clients để lưu lên database
      return clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
        clientList.forEach(function (client) {
          client.postMessage({
            type: 'PUSH_SUBSCRIPTION_REFRESHED',
            subscription: newSubscription.toJSON()
          });
        });
      });
    }).catch(function (err) {
      console.warn('[ServiceWorker] Lỗi refresh push subscription:', err);
    })
  );
});
