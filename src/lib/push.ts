import webpush from "web-push";

if (
  process.env.VAPID_PRIVATE_KEY &&
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_SUBJECT
) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendPushNotification({
  endpoint,
  p256dhKey,
  authKey,
  title,
  body,
  url,
}: {
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  title: string;
  body: string;
  url?: string;
}) {
  try {
    await webpush.sendNotification(
      {
        endpoint,
        keys: {
          p256dh: p256dhKey,
          auth: authKey,
        },
      },
      JSON.stringify({
        title,
        body,
        url: url || "/",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
      })
    );
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired – should be deleted from DB
      throw new Error("SUBSCRIPTION_EXPIRED");
    }
    console.error("Push notification error:", error);
    throw error;
  }
}
