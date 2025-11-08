const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Filter = require("bad-words");

admin.initializeApp();
const db = admin.firestore();
const filter = new Filter();

// On message create: moderation, strikes, basic bot
exports.onMessageCreate = functions.firestore
  .document("rooms/{roomId}/messages/{msgId}")
  .onCreate(async (snap, ctx) => {
    const m = snap.data();
    const { roomId, msgId } = ctx.params;

    // Ignore staff/broadcast
    if (m.type === "broadcast") return;

    const userRef = db.collection("users").doc(m.uid);
    const userSnap = await userRef.get();
    let user = userSnap.exists ? userSnap.data() : { strikes: 0, canPost: true };

    // Profanity check
    let hidden = false;
    if (typeof m.text === "string" && filter.isProfane(m.text)) {
      hidden = true;
      user.strikes = (user.strikes || 0) + 1;
      if (user.strikes >= 3) user.canPost = false;
      await userRef.set({ ...user }, { merge: true });
    }

    // Update message hidden flag if needed
    if (hidden) {
      await snap.ref.set({ hidden: true, moderatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    }

    // Simple bot: product finder via keyword match in catalog
    const text = (m.text || "").toLowerCase();
    if (text.includes("where") || text.includes("find") || text.includes("aisle")) {
      const storeId = "demo-store";
      const itemsSnap = await db.collection("catalog").doc(storeId).collection("items").get();
      let match = null;
      itemsSnap.forEach(doc => {
        const d = doc.data();
        const keys = (d.keywords || []).map(x=>String(x).toLowerCase());
        if (!match && keys.some(k => text.includes(k))) match = d;
      });
      if (match) {
        await db.collection("rooms").doc(roomId).collection("messages").add({
          uid: "bot",
          handle: "HelperBot",
          type: "bot",
          text: `📍 ${match.name} → Aisle ${match.aisle}, shelf ${match.shelf}.`,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  });

// Scheduled cleanup of expired rooms (runs hourly)
exports.cleanupExpiredRooms = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const roomsSnap = await db.collection("rooms").get();
    const batch = db.batch();
    roomsSnap.forEach(r => {
      const d = r.data();
      if (d.expiresAt && d.expiresAt.toMillis && d.expiresAt.toMillis() < now.toMillis()) {
        batch.delete(r.ref);
      }
    });
    await batch.commit();
  });

// Aggregate analytics: simple message count per room (trigger)
exports.onMessageAggregate = functions.firestore
  .document("rooms/{roomId}/messages/{msgId}")
  .onCreate(async (snap, ctx) => {
    const { roomId } = ctx.params;
    const aggRef = db.collection("rooms").doc(roomId);
    await aggRef.set({
      messageCount: admin.firestore.FieldValue.increment(1),
      lastActivityAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });
