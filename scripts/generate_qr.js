const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const args = require("minimist")(process.argv.slice(2));
const room = args.room || "demo-aisle7";
const base = process.env.QR_BASE_URL || "https://localhost:3000";
const url = `${base}/join?room=${encodeURIComponent(room)}`;
const outDir = path.join(__dirname, "..", "qr");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${room}.png`);

QRCode.toFile(out, url, { width: 512 }, (err)=>{
  if (err) { console.error(err); process.exit(1); }
  console.log("QR saved to", out, "for URL:", url);
});
