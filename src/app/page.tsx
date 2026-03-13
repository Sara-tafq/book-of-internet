"use client";

import { useState, useEffect, useCallback } from "react";

interface MessageData {
  id: string;
  content: string;
  username: string | null;
  free: boolean;
  tier: number;
  likes: number;
  createdAt: string;
}

interface FreeSlotData {
  active: boolean;
  minutesLeft: number;
}

interface CurrentData {
  message: MessageData | null;
  totalCount: number;
  freeSlot: FreeSlotData | null;
  hallOfFame: MessageData[];
}

const FIRST_WRITER = {
  content: "This is the beginning. You don't know me. I don't know you. But we're both here, at the same strange place on the internet, at the same strange time. Write something. Make it count. Once upon a time, oops, too cheesy. I'll let you start the book.",
  username: "Sara",
};

const SARAS_PICK = {
  content: "The internet is just people pretending to be confident.",
};

const HIGHLIGHTS = [
  { content: "I was here before AI took over. Remember me." },
  { content: "Mom, I made it into a book." },
  { content: "Be kind to strangers. They might be writing about you." },
];

const SYNE = "var(--font-syne)";
const DM = "var(--font-dm)";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#F58F7C" : "none"} stroke={filled ? "#F58F7C" : "currentColor"} strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#F2C4CE" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TwitchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>;
}
function TikTokIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/></svg>;
}
function YouTubeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
}

function HomeIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
}
function HighlightsIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function FameIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center uppercase mb-4" style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#D6D6D6", fontFamily: SYNE, fontWeight: 700 }}>
      {children}
    </p>
  );
}

export default function Home() {
  const [data, setData] = useState<CurrentData | null>(null);
  const [content, setContent] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [prevMessageId, setPrevMessageId] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [tier, setTier] = useState<1 | 2>(1);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [bouncingId, setBouncingId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"main" | "highlights" | "fame">("main");

  const maxChars = tier === 1 ? 110 : 500;
  const price = tier === 1 ? 1 : 5;

  useEffect(() => {
    try {
      const stored = localStorage.getItem("boi-liked");
      if (stored) setLikedIds(new Set(JSON.parse(stored)));
    } catch {}
  }, []);

  const fetchCurrent = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/current");
      const json: CurrentData = await res.json();
      setData(json);
      if (json.message && json.message.id !== prevMessageId) {
        setPrevMessageId(json.message.id);
        setAnimKey((k) => k + 1);
      }
    } catch (err) { console.error("Failed to fetch:", err); }
  }, [prevMessageId]);

  useEffect(() => {
    fetchCurrent();
    const interval = setInterval(fetchCurrent, 3000);
    return () => clearInterval(interval);
  }, [fetchCurrent]);

  const handlePaidSubmit = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), tier, username: username.trim() || null }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } catch (err) { console.error("Payment error:", err); }
    finally { setLoading(false); }
  };

  const handleFreeSubmit = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/messages/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), username: username.trim() || null }),
      });
      const json = await res.json();
      if (json.success) { setContent(""); fetchCurrent(); }
    } catch (err) { console.error("Free post error:", err); }
    finally { setLoading(false); }
  };

  const handleLike = async (id: string) => {
    if (likedIds.has(id)) return;
    setBouncingId(id);
    setTimeout(() => setBouncingId(null), 400);
    try {
      await fetch("/api/messages/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const newLiked = new Set(likedIds);
      newLiked.add(id);
      setLikedIds(newLiked);
      localStorage.setItem("boi-liked", JSON.stringify([...newLiked]));
      fetchCurrent();
    } catch (err) { console.error("Like error:", err); }
  };

  const hasFreeSlot = data?.freeSlot?.active ?? false;

  const leftCol = (
    <div className="flex flex-col gap-5 h-full animate-col-left">
      <div>
        <Label>sara picked this one</Label>
        <div className="p-5 card-hover" style={{ backgroundColor: "#3A3A3D", borderLeft: "4px solid #F58F7C", borderRadius: 16 }}>
          <p className="text-sm leading-relaxed italic" style={{ fontFamily: DM, color: "#FFFFFF" }}>
            &ldquo;{SARAS_PICK.content}&rdquo;
          </p>
        </div>
      </div>

      <div>
        <Label>pages from the book</Label>
        <div className="flex flex-col gap-3">
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="p-4 card-hover" style={{ backgroundColor: "#3A3A3D", borderRadius: 16 }}>
              <p className="text-xs leading-relaxed italic" style={{ fontFamily: DM, color: "#D6D6D6" }}>
                &ldquo;{h.content}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div className="p-5" style={{ backgroundColor: "#3A3A3D", borderRadius: 16 }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 flex items-center justify-center text-xs" style={{ borderRadius: "50%", backgroundColor: "#F58F7C", color: "#2C2B30", fontFamily: SYNE, fontWeight: 700 }}>S</div>
            <span className="text-sm" style={{ fontFamily: SYNE, fontWeight: 700 }}>Sara</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ fontFamily: DM }}>
            Hi, I&apos;m Sara.<br />Having fun on the internet.
          </p>
          <p className="text-xs leading-relaxed mt-2" style={{ fontFamily: DM, color: "#D6D6D6" }}>
            I run this place. You&apos;ll find me live on Twitch, TikTok and YouTube from time to time. You&apos;ll never know when tho.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="https://twitch.tv" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity" style={{ color: "#F58F7C" }}><TwitchIcon /></a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity" style={{ color: "#F58F7C" }}><TikTokIcon /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity" style={{ color: "#F58F7C" }}><YouTubeIcon /></a>
          </div>
        </div>
        <p className="text-center mt-4 italic" style={{ fontSize: "0.65rem", color: "#6B6B6E", fontFamily: DM }}>
          &ldquo;my daily struggle: proving to people I am not AI&rdquo;
        </p>
      </div>
    </div>
  );

  const rightCol = (
    <div className="animate-col-right">
      <Label>the ones that hit different</Label>

      <div className="p-4 mb-3 card-hover" style={{ backgroundColor: "#3A3A3D", borderRadius: 16, border: "1px solid #F2C4CE" }}>
        <div className="flex items-center gap-1.5 mb-2">
          <StarIcon />
          <span className="uppercase" style={{ fontSize: "0.6rem", letterSpacing: "0.1em", color: "#F2C4CE", fontFamily: SYNE, fontWeight: 700 }}>First Writer</span>
        </div>
        <p className="text-xs leading-relaxed italic" style={{ fontFamily: DM, color: "#D6D6D6" }}>
          &ldquo;{FIRST_WRITER.content}&rdquo;
        </p>
        <p className="mt-2" style={{ fontSize: "0.65rem", color: "#F2C4CE", fontFamily: DM }}>— {FIRST_WRITER.username}</p>
      </div>

      <div className="flex flex-col gap-3">
        {data?.hallOfFame && data.hallOfFame.length > 0 ? (
          data.hallOfFame.map((msg) => {
            const isLiked = likedIds.has(msg.id);
            return (
              <div key={msg.id} className="p-4 flex flex-col card-hover" style={{ backgroundColor: "#3A3A3D", borderRadius: 16 }}>
                <p className="text-sm leading-relaxed italic mb-1" style={{ fontFamily: DM }}>
                  &ldquo;{msg.content}&rdquo;
                </p>
                <p className="mb-3" style={{ fontSize: "0.65rem", color: "#D6D6D6", fontFamily: DM }}>— {msg.username || "anonymous"}</p>
                <button
                  onClick={() => handleLike(msg.id)}
                  className={`self-start text-xs flex items-center gap-1.5 transition-colors ${bouncingId === msg.id ? "animate-like-bounce" : ""}`}
                  style={{ color: isLiked ? "#F58F7C" : "#D6D6D6", cursor: isLiked ? "default" : "pointer", fontFamily: SYNE, fontWeight: 700 }}
                >
                  <HeartIcon filled={isLiked} />
                  {msg.likes}
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-center" style={{ color: "#6B6B6E", fontFamily: DM }}>No messages yet.</p>
        )}
      </div>
    </div>
  );

  const centerCol = (
    <div className="flex flex-col min-h-full animate-col-center">
      <header className="pt-10 pb-2 text-center">
        <h1 style={{ fontFamily: SYNE, fontWeight: 800, fontSize: "1.8rem", color: "#F2C4CE" }}>
          The Book of Internet
        </h1>
      </header>

      <p className="text-center text-xs italic leading-relaxed px-4 mt-2 mb-6" style={{ color: "#D6D6D6", fontFamily: DM, fontWeight: 400 }}>
        you pay $1. your message lives here. someone pays after you, you&apos;re gone.<br />
        but we keep everything. one day it becomes a book.<br />
        no pressure tho.
      </p>

      <p className="text-center text-xs mb-6" style={{ color: "#D6D6D6", fontFamily: SYNE, fontWeight: 700 }}>
        {data?.totalCount ?? 0} message{(data?.totalCount ?? 0) !== 1 ? "s" : ""} in the book
      </p>

      <div style={{ borderTop: "1px solid #4F4F51" }} />

      {hasFreeSlot && (
        <div className="animate-pulse-banner py-3 px-6 text-center text-sm" style={{ backgroundColor: "rgba(245,143,124,0.15)", color: "#F58F7C", fontFamily: SYNE, fontWeight: 700, borderRadius: 12, margin: "12px 0" }}>
          free real estate — post for free, {data!.freeSlot!.minutesLeft} minute{data!.freeSlot!.minutesLeft !== 1 ? "s" : ""} left
        </div>
      )}

      <div className="py-12 px-6 text-center min-h-[200px] flex flex-col items-center justify-center flex-1">
        {data?.message ? (
          <div key={animKey} className="animate-msg-in">
            <p style={{ fontFamily: DM, fontWeight: data.message.tier === 2 ? 700 : 500, fontSize: "1.8rem", lineHeight: 1.7 }}>
              {data.message.content}
            </p>
            <p className="mt-4" style={{ fontSize: "0.8rem", color: "#D6D6D6", fontFamily: DM }}>
              — {data.message.username || "anonymous"}
            </p>
          </div>
        ) : (
          <p className="italic" style={{ fontFamily: DM, fontSize: "1.2rem", color: "#6B6B6E" }}>
            No message yet. Be the first.
          </p>
        )}
      </div>

      <div style={{ borderTop: "1px solid #4F4F51" }} className="mb-8" />

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value.slice(0, 30))}
        placeholder="your name (optional, anonymous by default)"
        className="w-full px-4 py-3 text-sm mb-4 focus:outline-none transition"
        style={{ backgroundColor: "#2C2B30", border: "1px solid #4F4F51", borderRadius: 12, color: "#FFFFFF", fontFamily: DM }}
      />

      {!hasFreeSlot && (
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => { setTier(1); setContent((c) => c.slice(0, 110)); }}
            className="px-5 py-2 text-sm transition-all"
            style={{ borderRadius: 999, backgroundColor: tier === 1 ? "#F58F7C" : "transparent", color: tier === 1 ? "#2C2B30" : "#FFFFFF", border: tier === 1 ? "1px solid #F58F7C" : "1px solid #4F4F51", fontFamily: SYNE, fontWeight: 700 }}
          >
            $1 · 110 chars
          </button>
          <button
            onClick={() => setTier(2)}
            className="px-5 py-2 text-sm transition-all"
            style={{ borderRadius: 999, backgroundColor: tier === 2 ? "#F58F7C" : "transparent", color: tier === 2 ? "#2C2B30" : "#FFFFFF", border: tier === 2 ? "1px solid #F58F7C" : "1px solid #4F4F51", fontFamily: SYNE, fontWeight: 700 }}
          >
            $5 · 500 chars
          </button>
        </div>
      )}

      <div className="relative mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
          placeholder="Write your message..."
          rows={4}
          className="w-full px-4 py-4 text-sm resize-none focus:outline-none transition"
          style={{ backgroundColor: "#2C2B30", border: "1px solid #4F4F51", borderRadius: 12, color: "#FFFFFF", fontFamily: DM }}
        />
        <span className="absolute bottom-3 right-4 text-xs" style={{ color: "#6B6B6E", fontFamily: SYNE, fontWeight: 700 }}>
          {content.length}/{maxChars}
        </span>
      </div>

      {hasFreeSlot ? (
        <button onClick={handleFreeSubmit} disabled={!content.trim() || loading}
          className="w-full py-3.5 text-sm btn-post disabled:opacity-30"
          style={{ backgroundColor: "#F58F7C", color: "#2C2B30", borderRadius: 12, border: "none", fontFamily: SYNE, fontWeight: 700 }}>
          {loading ? "posting..." : "post for free \u2192"}
        </button>
      ) : (
        <button onClick={handlePaidSubmit} disabled={!content.trim() || loading}
          className="w-full py-3.5 text-sm btn-post disabled:opacity-30"
          style={{ backgroundColor: "#F58F7C", color: "#2C2B30", borderRadius: 12, border: "none", fontFamily: SYNE, fontWeight: 700 }}>
          {loading ? "redirecting..." : `post it \u00b7 $${price} \u2192`}
        </button>
      )}

      <div style={{ borderTop: "1px solid #4F4F51" }} className="mt-10" />
      <footer className="py-8 text-center text-xs italic" style={{ color: "#6B6B6E", fontFamily: DM }}>
        every message stays forever. the book is being written rn.
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 hidden md:grid mx-auto w-full" style={{ gridTemplateColumns: "1fr 2fr 1fr", maxWidth: 1200 }}>
        <aside className="p-6" style={{ backgroundColor: "#3A3A3D" }}>{leftCol}</aside>
        <main className="px-10" style={{ backgroundColor: "#4F4F51", boxShadow: "0 0 60px rgba(0,0,0,0.15)" }}>{centerCol}</main>
        <aside className="p-6" style={{ backgroundColor: "#3A3A3D" }}>{rightCol}</aside>
      </div>

      <div className="flex-1 md:hidden flex flex-col pb-16">
        <div className="flex-1">
          {mobileTab === "main" && <div className="min-h-full px-5" style={{ backgroundColor: "#4F4F51" }}>{centerCol}</div>}
          {mobileTab === "highlights" && <div className="p-5" style={{ backgroundColor: "#3A3A3D" }}>{leftCol}</div>}
          {mobileTab === "fame" && <div className="p-5" style={{ backgroundColor: "#3A3A3D" }}>{rightCol}</div>}
        </div>
        <nav className="fixed bottom-0 left-0 right-0 flex z-50" style={{ backgroundColor: "#2C2B30", borderTop: "1px solid #4F4F51" }}>
          {([
            { key: "main" as const, icon: <HomeIcon />, label: "Main" },
            { key: "highlights" as const, icon: <HighlightsIcon />, label: "Highlights" },
            { key: "fame" as const, icon: <FameIcon />, label: "Fame" },
          ]).map((tab) => (
            <button key={tab.key} onClick={() => setMobileTab(tab.key)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
              style={{ color: mobileTab === tab.key ? "#F58F7C" : "#6B6B6E", fontFamily: SYNE, fontWeight: 700 }}>
              {tab.icon}
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
