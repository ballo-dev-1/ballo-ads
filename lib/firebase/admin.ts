import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { normalizeTopicName } from "@/lib/firebase/topic";

function getFirebaseAdminConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) return null;

  return { projectId, clientEmail, privateKey };
}

export function getFirebaseMessagingAdmin() {
  const config = getFirebaseAdminConfig();
  if (!config) return null;

  if (getApps().length === 0) {
    initializeApp({
      credential: cert(config),
      projectId: config.projectId,
    });
  }

  return getMessaging();
}

export async function subscribeTokenToTopic(token: string, topic?: string | null) {
  const messaging = getFirebaseMessagingAdmin();
  if (!messaging) return { configured: false as const };

  const normalizedTopic = normalizeTopicName(topic);
  const response = await messaging.subscribeToTopic([token], normalizedTopic);
  return { configured: true as const, topic: normalizedTopic, response };
}

export async function unsubscribeTokenFromTopic(token: string, topic?: string | null) {
  const messaging = getFirebaseMessagingAdmin();
  if (!messaging) return { configured: false as const };

  const normalizedTopic = normalizeTopicName(topic);
  const response = await messaging.unsubscribeFromTopic([token], normalizedTopic);
  return { configured: true as const, topic: normalizedTopic, response };
}

export async function sendPushToTopic(
  payload: { title: string; body: string; link?: string | null },
  topic?: string | null,
) {
  const messaging = getFirebaseMessagingAdmin();
  if (!messaging) return { configured: false as const };

  const normalizedTopic = normalizeTopicName(topic);
  const messageId = await messaging.send({
    topic: normalizedTopic,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: payload.link ? { link: payload.link } : undefined,
    webpush: {
      fcmOptions: payload.link ? { link: payload.link } : undefined,
    },
  });

  return { configured: true as const, topic: normalizedTopic, messageId };
}
