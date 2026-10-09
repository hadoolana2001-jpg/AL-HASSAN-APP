const admin = require("firebase-admin");

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!raw) {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT secret");
}

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(raw)),
  projectId: "al-hassan-b39d6"
});

const db = admin.firestore();
const messaging = admin.messaging();

async function main() {
  const cutoff = Date.now() - 15 * 60 * 1000;

  const [ordersSnap, tokensSnap] = await Promise.all([
    db.collection("orders").get(),
    db.collection("notificationTokens")
      .where("role", "==", "driver")
      .where("active", "==", true)
      .get()
  ]);

  const tokens = [];

  tokensSnap.forEach(doc => {
    const data = doc.data();
    if (data.token) tokens.push(data.token);
  });

  if (!tokens.length) {
    console.log("No active driver notification tokens found.");
    return;
  }

  for (const doc of ordersSnap.docs) {
    const order = doc.data();

    if (
      order.status !== "new" ||
      order.driverId ||
      order.driver ||
      order.notificationSent === true
    ) continue;

    const createdAt = order.createdAt;

    if (
      !createdAt ||
      typeof createdAt.toMillis !== "function" ||
      createdAt.toMillis() < cutoff
    ) continue;

    const title = "🛵 AL HASSAN - طلب جديد";
    const body = String(order.item || "وصلك طلب جديد").slice(0, 150);

    let sent = 0;

    for (const token of tokens) {
      try {
        await messaging.send({
          token,
          notification: { title, body },
          webpush: {
            notification: { title, body },
            fcmOptions: {
              link: "https://hadoolana2001-jpg.github.io/AL-HASSAN-APP/driver.html"
            }
          }
        });
        sent++;
      } catch (error) {
        console.error("Send failed:", error.code || error.message);
      }
    }

    if (sent > 0) {
      await doc.ref.update({
        notificationSent: true,
        notificationSentAt:
          admin.firestore.FieldValue.serverTimestamp()
      });
      console.log("Notification sent for order:", doc.id);
    }
  }

  console.log("Notification check finished.");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Notification check failed:", error.message);
    process.exit(1);
  });
