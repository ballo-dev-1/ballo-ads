/* Firebase Cloud Messaging Service Worker */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

let isInitialized = false;

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "INIT_FIREBASE") return;
  if (isInitialized) return;

  try {
    firebase.initializeApp(event.data.config);
    const messaging = firebase.messaging();
    isInitialized = true;

    messaging.onBackgroundMessage((payload) => {
      const notification = payload.notification || {};
      const title = notification.title || "Notification";
      const options = {
        body: notification.body || "",
        icon: notification.icon,
        data: payload.data || {},
      };

      return self.registration.showNotification(title, options);
    });
  } catch (error) {
    console.error("[FCM SW] initialization failed", error);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destination = event.notification?.data?.link || "/admin/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(destination);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(destination);
    }),
  );
});
