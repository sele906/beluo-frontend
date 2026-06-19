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

// 알림 수신
messaging.onBackgroundMessage((payload) => {
  console.log('백그라운드 알림 수신:', payload);

  const { title, body, sessionId } = payload.data ?? {};

  self.registration.showNotification(
    title ?? 'Beluo 알림',
    {
      body: body ?? '',
      requireInteraction: false,
      tag: sessionId,
      data: { sessionId: sessionId },
    }
  );
});

// 클릭 핸들러 — 최상위 레벨에 독립적으로
self.addEventListener('notificationclick', (event) => {

  console.log('알림 클릭:', event.notification.data);

  event.notification.close();

  const sessionId = event.notification.data?.sessionId;
  if (!sessionId) {
    console.error('sessionId가 없습니다.');
    return;
  }

  const targetPath = `/chat/${sessionId}`;
  const targetUrl = new URL(targetPath, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {

        // 이미 정확한 채팅방이 열려 있으면 포커스
        for (const client of clientList) {
          if (client.url.includes(`${sessionId}`) && "focus" in client) {
            return client.focus();
          }
        }

        // 해당 페이지가 없으면 새 창/탭 열기
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});