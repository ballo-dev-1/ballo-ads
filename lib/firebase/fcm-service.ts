import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { getFirebaseMessagingClient, firebaseConfig } from "@/lib/firebase/client";
import { DEFAULT_BACKOFFICE_TOPIC } from "@/lib/firebase/topic";

const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
const SUBSCRIBE_PATH = "/api/admin/notifications/subscribe";
const UNSUBSCRIBE_PATH = "/api/admin/notifications/unsubscribe";
const STORED_TOKEN_KEY = "admin_fcm_web_token";

async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  await navigator.serviceWorker.ready;
  registration.active?.postMessage({
    type: "INIT_FIREBASE",
    config: firebaseConfig,
  });
  return registration;
}

async function ensurePermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission === "default") return Notification.requestPermission();
  return Notification.permission;
}

export async function subscribeAdminPush(topic = DEFAULT_BACKOFFICE_TOPIC): Promise<{ error?: string }> {
  if (!VAPID_KEY) return { error: "Missing NEXT_PUBLIC_FCM_VAPID_KEY" };

  const permission = await ensurePermission();
  if (permission !== "granted") return { error: "Notification permission not granted" };

  const messaging = await getFirebaseMessagingClient();
  if (!messaging) return { error: "Firebase messaging is not supported" };

  const registration = await ensureServiceWorker();
  if (!registration) return { error: "Service worker unavailable" };

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });
  if (!token) return { error: "Unable to acquire FCM token" };

  const response = await fetch(SUBSCRIBE_PATH, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, topic }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    return { error: payload?.error ?? "Failed to subscribe to push topic" };
  }

  localStorage.setItem(STORED_TOKEN_KEY, token);
  return {};
}

export async function unsubscribeAdminPush(topic = DEFAULT_BACKOFFICE_TOPIC): Promise<void> {
  const token = localStorage.getItem(STORED_TOKEN_KEY);
  if (!token) return;

  await fetch(UNSUBSCRIBE_PATH, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, topic }),
  }).catch(() => undefined);
  localStorage.removeItem(STORED_TOKEN_KEY);
}

export async function listenForAdminForegroundPush(
  handler: (payload: MessagePayload) => void,
): Promise<() => void> {
  const messaging = await getFirebaseMessagingClient();
  if (!messaging) return () => undefined;
  return onMessage(messaging, handler);
}
