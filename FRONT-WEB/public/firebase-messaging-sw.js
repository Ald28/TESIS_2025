importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC5xbjcZx6KJhAodLMyiI1151W",
  authDomain: "notificaciones-9605c.firebaseapp.com",
  projectId: "notificaciones-9605c",
  messagingSenderId: "1024686886650",
  appId: "1:1024686886650:web:74f1b57df7c98a13e50343",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
  });
});
