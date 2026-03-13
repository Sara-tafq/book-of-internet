"use client";

import { useState, useEffect } from "react";

const SYNE = "var(--font-syne)";
const DM = "var(--font-dm)";

interface AdminMessage {
  id: string;
  content: string;
  username: string | null;
  paid: boolean;
  free: boolean;
  active: boolean;
  tier: number;
  likes: number;
  createdAt: string;
}

interface AdminData {
  messages: AdminMessage[];
  totalRevenue: number;
  totalFree: number;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
      if (res.ok) { setData(await res.json()); setAuthenticated(true); setError(""); }
      else setError("Wrong password");
    } catch { setError("Connection error"); }
  };

  const exportCSV = () => {
    if (!data) return;
    const header = "id,content,username,tier,type,likes,date\n";
    const rows = data.messages.map((m) =>
      `"${m.id}","${m.content.replace(/"/g, '""')}","${m.username || "anonymous"}","${m.tier}","${m.free ? "free" : "paid"}","${m.likes}","${m.createdAt}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "book-of-internet.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (authenticated) {
      const interval = setInterval(async () => {
        const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
        if (res.ok) setData(await res.json());
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [authenticated, password]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-center mb-8" style={{ fontFamily: SYNE, fontWeight: 800, color: "#F2C4CE" }}>Admin</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Password" className="w-full px-4 py-3 text-sm focus:outline-none"
            style={{ backgroundColor: "#2C2B30", border: "1px solid #4F4F51", borderRadius: 12, color: "#FFFFFF", fontFamily: DM }} />
          {error && <p className="text-xs text-center" style={{ color: "#F58F7C" }}>{error}</p>}
          <button onClick={login} className="w-full py-3 text-sm"
            style={{ backgroundColor: "#F58F7C", color: "#2C2B30", borderRadius: 12, fontFamily: SYNE, fontWeight: 700 }}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-[960px] mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h1 style={{ fontFamily: SYNE, fontWeight: 800, color: "#F2C4CE" }}>Admin</h1>
        <button onClick={exportCSV} className="px-5 py-2 text-xs hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "#F58F7C", color: "#2C2B30", borderRadius: 12, fontFamily: SYNE, fontWeight: 700 }}>Export CSV</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total messages", value: data?.messages.length ?? 0 },
          { label: "Revenue", value: `$${data?.totalRevenue ?? 0}`, color: "#F58F7C" },
          { label: "Free messages", value: data?.totalFree ?? 0, color: "#F2C4CE" },
        ].map((s) => (
          <div key={s.label} className="p-5 text-center" style={{ backgroundColor: "#3A3A3D", borderRadius: 16 }}>
            <p className="text-2xl" style={{ fontFamily: SYNE, fontWeight: 800, color: s.color || "#FFFFFF" }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "#D6D6D6", fontFamily: DM }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #4F4F51" }}>
        <table className="w-full text-left text-sm">
          <thead style={{ borderBottom: "1px solid #4F4F51", backgroundColor: "#3A3A3D" }}>
            <tr>
              {["ID", "Content", "User", "Tier", "Type", "Likes", "Date"].map((h) => (
                <th key={h} className="px-4 py-3" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#D6D6D6", fontFamily: SYNE, fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.messages.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #3A3A3D" }} className="hover:bg-[#3A3A3D]/50">
                <td className="px-4 py-3 text-xs font-mono" style={{ color: "#6B6B6E" }}>{m.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-xs max-w-[200px] truncate">{m.content}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "#D6D6D6" }}>{m.username || "anon"}</td>
                <td className="px-4 py-3 text-xs">{m.tier}</td>
                <td className="px-4 py-3 text-xs">
                  {m.free ? <span style={{ color: "#F2C4CE" }}>Free</span> : <span style={{ color: "#F58F7C" }}>Paid</span>}
                </td>
                <td className="px-4 py-3 text-xs">{m.likes}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "#6B6B6E" }}>{new Date(m.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
