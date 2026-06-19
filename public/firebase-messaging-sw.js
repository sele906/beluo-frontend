importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBzd55BVGhIHsW57TEntX9LmkumFQPDjho",
  authDomain: "beluo-notification.firebaseapp.com",
  projectId: "beluo-notification",
  storageBucket: "beluo-notification.firebasestorage.app",
  messagingSenderId: "801165623218",
  appId: "1:801165623218:web:1a08c76aa1db7ab15a2eab"
});

const messaging = firebase.messaging();

// 알림 수신 tag로 중복방지
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 알림 수신:', payload);

  const title = payload.notification?.title || payload.data?.title || 'Beluo 알림';
  const body = payload.notification?.body || payload.data?.body || '';
  const sessionId = payload.data?.sessionId;

  self.registration.showNotification(title, {
    body: body,
    tag: sessionId,  
    renotify: false,
    data: { sessionId: sessionId },
  });
});

// 클릭 핸들러 — 최상위 레벨에 독립적으로
self.addEventListener('notificationclick', (event) => {

  console.log('알림 클릭:', event.notification.data);

  event.notification.close();

  const sessionId = event.notification.data?.sessionId || event.notification.data?.FCM_MSG?.data?.sessionId;

  if (!sessionId) {
    console.error('sessionId가 없습니다.');
    return;
  }

  const targetUrl = new URL(`/chat/${sessionId}`, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {

        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});