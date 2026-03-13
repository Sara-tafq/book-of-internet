"use client";

import { useState, useEffect } from "react";

const SPACE = "var(--font-space)";
const INTER = "var(--font-inter)";

interface AdminMessage {
  id: string;
  content: string;
  username: string | null;
  paid: boolean;
  free: boolean;
  active: boolean;
  tier: number;
  likes: number;
  saraPick: boolean;
  hallOfFame: boolean;
  createdAt: string;
}

interface ContactMsg {
  id: string;
  name: string | null;
  email: string | null;
  message: string;
  createdAt: string;
}

interface AdminData {
  messages: AdminMessage[];
  totalRevenue: number;
  totalFree: number;
  contactMessages: ContactMsg[];
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const login = async () => {
    try {
      const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
      if (res.ok) { setData(await res.json()); setAuthenticated(true); setError(""); }
      else setError("Wrong password");
    } catch { setError("Connection error"); }
  };

  const toggle = async (id: string, field: "saraPick" | "hallOfFame") => {
    setToggling(true);
    try {
      await fetch("/api/admin", {
        method: "PATCH",
        headers: { "x-admin-password": password, "Content-Type": "application/json" },
        body: JSON.stringify({ id, field }),
      });
      const res = await fetch("/api/admin", { headers: { "x-admin-password": password } });
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
    setToggling(false);
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
          <h1 className="text-center mb-8" style={{ fontFamily: SPACE, fontWeight: 500 }}>Admin</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Password" className="w-full px-4 py-3 text-sm focus:outline-none"
            style={{ border: "1px solid #E8E0D5", backgroundColor: "transparent", color: "#1a1a1a", fontFamily: INTER }} />
          {error && <p className="text-xs text-center" style={{ color: "#C17D3C" }}>{error}</p>}
          <button onClick={login} className="w-full py-3 text-sm"
            style={{ backgroundColor: "#1a1a1a", color: "#fff", fontFamily: SPACE, fontWeight: 500 }}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-[960px] mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h1 style={{ fontFamily: SPACE, fontWeight: 500 }}>Admin</h1>
        <button onClick={exportCSV} className="px-5 py-2 text-xs hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "#1a1a1a", color: "#fff", fontFamily: SPACE, fontWeight: 500 }}>Export CSV</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total messages", value: data?.messages.length ?? 0 },
          { label: "Revenue", value: `$${data?.totalRevenue ?? 0}`, color: "#C17D3C" },
          { label: "Free messages", value: data?.totalFree ?? 0, color: "#9A8F85" },
        ].map((s) => (
          <div key={s.label} className="p-5 text-center" style={{ backgroundColor: "#FAF6F1" }}>
            <p className="text-2xl" style={{ fontFamily: SPACE, fontWeight: 500, color: s.color || "#1a1a1a" }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "#9A8F85", fontFamily: INTER }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ overflow: "hidden", border: "1px solid #E8E0D5" }}>
        <table className="w-full text-left text-sm">
          <thead style={{ borderBottom: "1px solid #E8E0D5", backgroundColor: "#FAF6F1" }}>
            <tr>
              {["ID", "Content", "User", "Tier", "Type", "Likes", "Tags", "Date"].map((h) => (
                <th key={h} className="px-4 py-3" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#9A8F85", fontFamily: SPACE, fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.messages.map((m) => (
              <tr key={m.id}
                onClick={() => setSelectedId(selectedId === m.id ? null : m.id)}
                style={{ borderBottom: "1px solid #F0EBE3", cursor: "pointer" }}
                className="hover:bg-[#FAF6F1]">
                <td className="px-4 py-3 text-xs font-mono" style={{ color: "#9A8F85" }}>{m.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-xs max-w-[200px] truncate">{m.content}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "#9A8F85" }}>{m.username || "anon"}</td>
                <td className="px-4 py-3 text-xs">{m.tier}</td>
                <td className="px-4 py-3 text-xs">
                  {m.free ? <span style={{ color: "#B8860B" }}>Free</span> : <span style={{ color: "#C17D3C" }}>Paid</span>}
                </td>
                <td className="px-4 py-3 text-xs">{m.likes}</td>
                <td className="px-4 py-3 text-xs space-x-1">
                  {m.saraPick && <span className="inline-block px-1.5 py-0.5 text-[0.6rem]" style={{ backgroundColor: "#C17D3C", color: "#fff", borderRadius: 4 }}>Pick</span>}
                  {m.hallOfFame && <span className="inline-block px-1.5 py-0.5 text-[0.6rem]" style={{ backgroundColor: "#B8860B", color: "#fff", borderRadius: 4 }}>HoF</span>}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "#9A8F85" }}>{new Date(m.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <div className="mt-4 p-4 flex items-center gap-3" style={{ backgroundColor: "#FAF6F1", border: "1px solid #E8E0D5" }}>
          <span className="text-xs" style={{ color: "#9A8F85", fontFamily: INTER }}>
            {data?.messages.find((m) => m.id === selectedId)?.content.substring(0, 40)}...
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              disabled={toggling}
              onClick={() => toggle(selectedId, "saraPick")}
              className="px-4 py-2 text-xs transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: data?.messages.find((m) => m.id === selectedId)?.saraPick ? "#C17D3C" : "transparent",
                color: data?.messages.find((m) => m.id === selectedId)?.saraPick ? "#fff" : "#C17D3C",
                border: "1px solid #C17D3C",
                fontFamily: SPACE,
                fontWeight: 500,
              }}>
              {data?.messages.find((m) => m.id === selectedId)?.saraPick ? "Remove Sara's Pick" : "Add Sara's Pick"}
            </button>
            <button
              disabled={toggling}
              onClick={() => toggle(selectedId, "hallOfFame")}
              className="px-4 py-2 text-xs transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: data?.messages.find((m) => m.id === selectedId)?.hallOfFame ? "#B8860B" : "transparent",
                color: data?.messages.find((m) => m.id === selectedId)?.hallOfFame ? "#fff" : "#B8860B",
                border: "1px solid #B8860B",
                fontFamily: SPACE,
                fontWeight: 500,
              }}>
              {data?.messages.find((m) => m.id === selectedId)?.hallOfFame ? "Remove Hall of Fame" : "Add Hall of Fame"}
            </button>
          </div>
        </div>
      )}

      {data?.contactMessages && data.contactMessages.length > 0 && (
        <>
          <h2 className="mt-12 mb-6" style={{ fontFamily: SPACE, fontWeight: 500, color: "#C17D3C" }}>Contact Messages</h2>
          <div style={{ overflow: "hidden", border: "1px solid #E8E0D5" }}>
            <table className="w-full text-left text-sm">
              <thead style={{ borderBottom: "1px solid #E8E0D5", backgroundColor: "#FAF6F1" }}>
                <tr>
                  {["Name", "Email", "Message", "Date"].map((h) => (
                    <th key={h} className="px-4 py-3" style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#9A8F85", fontFamily: SPACE, fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.contactMessages.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #F0EBE3" }} className="hover:bg-[#FAF6F1]">
                    <td className="px-4 py-3 text-xs" style={{ color: "#9A8F85" }}>{c.name || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#9A8F85" }}>{c.email || "—"}</td>
                    <td className="px-4 py-3 text-xs max-w-[300px]">{c.message}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#9A8F85" }}>{new Date(c.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
