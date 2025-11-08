import Link from "next/link";
export default function Home() {
  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">ShopChat</h1>
      <p className="text-gray-300">Scan a QR to join a temporary in-store chat — no app, no signup.</p>
      <div className="card p-4 space-y-3">
        <p>For the demo, try:</p>
        <ul className="list-disc list-inside text-sm text-gray-300">
          <li><Link href="/join?room=demo-aisle7">Join Demo Room (Aisle 7)</Link></li>
          <li><Link href="/dashboard">Store Dashboard</Link></li>
        </ul>
      </div>
    </main>
  );
}
