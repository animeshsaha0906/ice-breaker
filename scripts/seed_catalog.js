// Usage: node scripts/seed_catalog.js
// Requires GOOGLE_APPLICATION_CREDENTIALS for admin SDK, or run in Cloud Functions shell
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

if (!admin.apps.length) {
  admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID });
}
const db = admin.firestore();

async function run() {
  const dir = path.join(__dirname, "..", "catalog", "demo-store", "items");
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
    const id = f.replace(".json","");
    await db.collection("catalog").doc("demo-store").collection("items").doc(id).set(data);
    console.log("Seeded", id);
  }
  console.log("Done.");
}

run().catch(e=>{ console.error(e); process.exit(1); });
