importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB5hMTyY6I6Z_Ij4VYdVsvaWAaiLt9SRA",
  authDomain: "al-hassan-b39d6.firebaseapp.com",
  projectId: "al-hassan-b39d6",
  storageBucket: "al-hassan-b39d6.firebasestorage.app",
  messagingSenderId: "239416840375",
  appId: "1:239416840375:web:804d0308ce3d7afee97d32",
  measurementId: "G-6C86NGWQCS"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle =
    payload.notification?.title || "AL HASSAN";

  const notificationOptions = {
    body: payload.notification?.body || "لديك طلب جديد",
    icon: "/AL-HASSAN-APP/icon.png",
    data: payload.data || {}
  };

  self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(
      "https://hadoolana2001-jpg.github.io/AL-HASSAN-APP/"
    )
  );
});
