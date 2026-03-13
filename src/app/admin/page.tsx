"use client";

import { useState, useEffect } from "react";

interface AdminMessage {
  id: string;
  content: string;
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
      const res = await fetch("/api/admin", {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setAuthenticated(true);
        setError("");
      } else {
        setError("Wrong password");
      }
    } catch {
      setError("Connection error");
    }
  };

  const exportCSV = () => {
    if (!data) return;
    const header = "id,content,type,tier,likes,date\n";
    const rows = data.messages
      .map(
        (m) =>
          `"${m.id}","${m.content.replace(/"/g, '""')}","${m.free ? "free" : "paid"}","${m.tier}","${m.likes}","${m.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "book-of-internet.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (authenticated) {
      const interval = setInterval(async () => {
        const res = await fetch("/api/admin", {
          headers: { "x-admin-password": password },
        });
        if (res.ok) setData(await res.json());
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [authenticated, password]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-4">
          <h1
            className="text-sm tracking-[0.3em] uppercase text-center mb-8"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Admin
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Password"
            className="w-full px-4 py-3 text-sm focus:outline-none"
            style={{
              border: "1px solid #E5E5E0",
              backgroundColor: "transparent",
              borderRadius: 0,
            }}
          />
          {error && (
            <p className="text-xs text-center" style={{ color: "#c44" }}>
              {error}
            </p>
          )}
          <button
            onClick={login}
            className="w-full py-3 text-sm font-medium"
            style={{
              backgroundColor: "#1a1a1a",
              color: "#fff",
              border: "none",
              borderRadius: 0,
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h1
          className="text-sm tracking-[0.3em] uppercase"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Admin
        </h1>
        <button
          onClick={exportCSV}
          className="px-5 py-2 text-xs font-medium transition-opacity hover:opacity-80"
          style={{
            backgroundColor: "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: 0,
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total messages", value: data?.messages.length ?? 0 },
          { label: "Revenue", value: `$${data?.totalRevenue ?? 0}`, color: "#2a7" },
          { label: "Free messages", value: data?.totalFree ?? 0, color: "#B8860B" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 text-center"
            style={{ backgroundColor: "#F5F5F2" }}
          >
            <p className="text-2xl font-medium" style={{ color: stat.color || "#1a1a1a" }}>
              {stat.value}
            </p>
            <p className="text-xs mt-1" style={{ color: "#888880" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: "1px solid #E5E5E0" }}>
        <table className="w-full text-left text-sm">
          <thead style={{ borderBottom: "1px solid #E5E5E0" }}>
            <tr>
              <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#888880" }}>ID</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#888880" }}>Content</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#888880" }}>Type</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#888880" }}>Status</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#888880" }}>Likes</th>
              <th className="px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#888880" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.messages.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #F5F5F2" }}>
                <td className="px-4 py-3 text-xs font-mono" style={{ color: "#888880" }}>
                  {m.id.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-xs max-w-[200px] truncate">{m.content}</td>
                <td className="px-4 py-3 text-xs">
                  {m.free ? (
                    <span style={{ color: "#B8860B" }}>Free</span>
                  ) : (
                    <span>Tier {m.tier}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  {m.active ? (
                    <span style={{ color: "#2a7" }}>Active</span>
                  ) : (
                    <span style={{ color: "#888880" }}>Archived</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">{m.likes}</td>
                <td className="px-4 py-3 text-xs" style={{ color: "#888880" }}>
                  {new Date(m.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
