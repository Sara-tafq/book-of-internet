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

interface PickData {
  id: string;
  content: string;
  username: string | null;
}

interface CurrentData {
  message: MessageData | null;
  totalCount: number;
  freeSlot: FreeSlotData | null;
  hallOfFame: MessageData[];
  queueCount: number;
  secondsLeft: number | null;
  saraPick: PickData | null;
  highlights: PickData[];
}

const FRAUNCES = "var(--font-fraunces)";
const SPACE = "var(--font-space)";
const INTER = "var(--font-inter)";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#C17D3C" : "none"} stroke={filled ? "#C17D3C" : "currentColor"} strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
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

function TwitchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>;
}
function TikTokIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/></svg>;
}
function YouTubeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center uppercase mb-5" style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "var(--text-muted)", fontFamily: SPACE, fontWeight: 500 }}>
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
  const [elapsed, setElapsed] = useState(0);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("boi-dark");
    if (stored === "true") { setDark(true); document.documentElement.classList.add("dark"); }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("boi-dark", String(next));
  };

  const maxChars = tier === 1 ? 200 : 1200;
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

  useEffect(() => {
    if (!data?.message?.createdAt) { setElapsed(0); return; }
    const created = new Date(data.message.createdAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - created) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [data?.message?.createdAt]);

  const formatElapsed = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

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

  const handleContact = async () => {
    if (!contactMsg.trim() || contactLoading) return;
    setContactLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: contactName.trim() || null, email: contactEmail.trim() || null, message: contactMsg.trim() }),
      });
      if (res.ok) { setContactSent(true); setContactName(""); setContactEmail(""); setContactMsg(""); }
    } catch (err) { console.error("Contact error:", err); }
    finally { setContactLoading(false); }
  };

  const hasFreeSlot = data?.freeSlot?.active ?? false;

  const leftCol = (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <SectionLabel>
          <span className="inline-flex items-center gap-1.5"><StarIcon /> Sara&apos;s Choice</span>
        </SectionLabel>
        {data?.saraPick ? (
          <div className="p-5" style={{ backgroundColor: "var(--bg-card-pick)", borderLeft: "4px solid var(--accent)" }}>
            <p className="italic text-sm leading-relaxed" style={{ fontFamily: FRAUNCES, fontWeight: 400 }}>
              &ldquo;{data.saraPick.content}&rdquo;
            </p>
          </div>
        ) : (
          <div className="p-5" style={{ backgroundColor: "var(--bg-card)" }}>
            <p className="italic text-xs" style={{ color: "var(--text-muted)", fontFamily: FRAUNCES }}>no pick yet.</p>
          </div>
        )}
      </div>

      <div>
        <SectionLabel>Highlights</SectionLabel>
        <div className="flex flex-col gap-3">
          {data?.highlights && data.highlights.length > 0 ? (
            data.highlights.map((h) => (
              <div key={h.id} className="p-4" style={{ backgroundColor: "var(--bg-card)" }}>
                <p className="italic text-xs leading-relaxed" style={{ fontFamily: FRAUNCES, fontWeight: 400, color: "var(--text-primary)" }}>
                  &ldquo;{h.content}&rdquo;
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs" style={{ color: "var(--text-muted)", fontFamily: INTER }}>no highlights yet.</p>
          )}
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="p-5" style={{ backgroundColor: "var(--bg-card)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 flex items-center justify-center text-xs" style={{ borderRadius: "50%", backgroundColor: "var(--accent)", color: "#fff", fontFamily: SPACE, fontWeight: 500 }}>S</div>
            <span className="text-sm" style={{ fontFamily: SPACE, fontWeight: 500 }}>Sara</span>
          </div>
          <p className="text-xs leading-relaxed" style={{ fontFamily: INTER, color: "var(--text-primary)" }}>
            Hi, I&apos;m Sara.<br />Having fun on the internet.
          </p>
          <p className="text-xs italic leading-relaxed mt-2" style={{ fontFamily: FRAUNCES, color: "var(--accent)" }}>
            &ldquo;My daily struggle is proving I am not AI&rdquo;
          </p>
          <p className="text-xs leading-relaxed mt-2" style={{ fontFamily: INTER, color: "var(--text-muted)" }}>
            I run this place. You&apos;ll find me live on Twitch, TikTok and YouTube from time to time. You&apos;ll never know when tho.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="https://twitch.tv" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity" style={{ color: "var(--text-primary)" }}><TwitchIcon /></a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity" style={{ color: "var(--text-primary)" }}><TikTokIcon /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity" style={{ color: "var(--text-primary)" }}><YouTubeIcon /></a>
          </div>
        </div>
      </div>

      <div>
        <SectionLabel>Contact Sara</SectionLabel>
        <div className="p-5" style={{ backgroundColor: "var(--bg-card)" }}>
          {contactSent ? (
            <p className="text-xs text-center" style={{ fontFamily: INTER, color: "var(--accent)" }}>sent! i&apos;ll read it, promise.</p>
          ) : (
            <div className="flex flex-col gap-3">
              <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value.slice(0, 50))} placeholder="name (optional)"
                className="w-full px-3 py-2 text-xs focus:outline-none"
                style={{ border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text-primary)", fontFamily: INTER }} />
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value.slice(0, 100))} placeholder="email (optional)"
                className="w-full px-3 py-2 text-xs focus:outline-none"
                style={{ border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text-primary)", fontFamily: INTER }} />
              <textarea value={contactMsg} onChange={(e) => setContactMsg(e.target.value.slice(0, 1000))} placeholder="your message..."
                rows={3} className="w-full px-3 py-2 text-xs resize-none focus:outline-none"
                style={{ border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text-primary)", fontFamily: INTER }} />
              <button onClick={handleContact} disabled={!contactMsg.trim() || contactLoading}
                className="w-full py-2 text-xs disabled:opacity-30 transition-opacity hover:opacity-80"
                style={{ backgroundColor: "var(--accent)", color: "#fff", border: "none", fontFamily: SPACE, fontWeight: 500 }}>
                {contactLoading ? "sending..." : "send"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const rightCol = (
    <div>
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5"><TrophyIcon /> Hall of Fame</span>
      </SectionLabel>

      <div className="p-4 mb-3" style={{ backgroundColor: "var(--bg-card-warm)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-1.5 mb-2">
          <StarIcon />
          <span className="uppercase" style={{ fontSize: "0.6rem", letterSpacing: "0.1em", color: "var(--accent)", fontFamily: SPACE, fontWeight: 500 }}>First Writer</span>
        </div>
        <p className="text-xs leading-relaxed italic" style={{ fontFamily: FRAUNCES, color: "var(--text-primary)" }}>
          &ldquo;This is the beginning. You don&apos;t know me. I don&apos;t know you. But we&apos;re both here, at the same strange place on the internet, at the same strange time. Write something. Make it count. Once upon a time, oops, too cheesy. I&apos;ll let you start the book.&rdquo;
        </p>
        <p className="mt-2" style={{ fontSize: "0.65rem", color: "var(--accent)", fontFamily: INTER }}>— Sara</p>
      </div>

      <div className="flex flex-col gap-3">
        {data?.hallOfFame && data.hallOfFame.length > 0 ? (
          data.hallOfFame.map((msg) => {
            const isLiked = likedIds.has(msg.id);
            return (
              <div key={msg.id} className="p-4 flex flex-col" style={{ backgroundColor: "var(--bg-card-warm)" }}>
                <p className="italic text-sm leading-relaxed mb-1" style={{ fontFamily: FRAUNCES, fontWeight: 400 }}>
                  &ldquo;{msg.content}&rdquo;
                </p>
                <p className="mb-3" style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: INTER }}>— {msg.username || "anonymous"}</p>
                <button
                  onClick={() => handleLike(msg.id)}
                  className={`self-start text-xs flex items-center gap-1.5 transition-colors ${bouncingId === msg.id ? "animate-like-bounce" : ""}`}
                  style={{ color: isLiked ? "#C17D3C" : "#9A8F85", cursor: isLiked ? "default" : "pointer", fontFamily: SPACE, fontWeight: 500 }}
                >
                  <HeartIcon filled={isLiked} />
                  {msg.likes}
                </button>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-center" style={{ color: "var(--text-muted)", fontFamily: INTER }}>No messages yet.</p>
        )}
      </div>
    </div>
  );

  const centerCol = (
    <div className="flex flex-col min-h-full">
      <header className="pt-10 pb-3 text-center relative">
        <button onClick={toggleDark} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)", fontSize: "1rem" }}
          aria-label="Toggle dark mode">
          {dark ? "\u2600\uFE0F" : "\u{1F319}"}
        </button>
        <h1 className="italic" style={{ fontFamily: FRAUNCES, fontWeight: 400, fontSize: "2.5rem", letterSpacing: "0.1em", color: "var(--text-primary)" }}>
          The Book of Internet
        </h1>
      </header>

      <p className="text-center italic px-4 mt-3 mb-6" style={{ color: "var(--text-meta)", fontFamily: FRAUNCES, fontWeight: 300, fontSize: "0.95rem" }}>
        you pay $1. your message lives here. someone pays after you, you&apos;re gone. but we keep everything. one day it becomes a book. no pressure tho.
      </p>

      <p className="text-center text-sm mb-2" style={{ color: "var(--text-secondary)", fontFamily: SPACE, fontWeight: 500 }}>
        {data?.totalCount ?? 0} message{(data?.totalCount ?? 0) !== 1 ? "s" : ""} in the book
      </p>

      {data?.message && data.secondsLeft !== null && data.secondsLeft > 0 && (
        <p className="text-center text-xs mb-1" style={{ color: "var(--accent)", fontFamily: SPACE, fontWeight: 500 }}>
          live for {data.secondsLeft}s more
        </p>
      )}

      {(data?.queueCount ?? 0) > 0 && (
        <p className="text-center text-sm mb-2" style={{ color: "var(--text-secondary)", fontFamily: INTER, fontStyle: "italic" }}>
          {data!.queueCount} message{data!.queueCount !== 1 ? "s" : ""} waiting in queue
        </p>
      )}

      <div className="border-t mt-2" style={{ borderColor: "var(--border)" }} />

      {hasFreeSlot && (
        <div className="animate-pulse-gold py-3 px-6 text-center text-sm" style={{ backgroundColor: "var(--bg-card-pick)", color: "var(--accent-gold)", fontFamily: SPACE, fontWeight: 500 }}>
          free slot unlocked — post for free, {data!.freeSlot!.minutesLeft} minute{data!.freeSlot!.minutesLeft !== 1 ? "s" : ""} left
        </div>
      )}

      <div className="py-14 px-6 text-center min-h-[200px] flex flex-col items-center justify-center flex-1">
        {data?.message ? (
          <div key={animKey} className="animate-fade-in p-8" style={{ border: "2px solid var(--accent)", backgroundColor: "var(--bg-msg)" }}>
            <p className="italic" style={{ fontFamily: FRAUNCES, fontWeight: 400, fontSize: data.message.tier === 2 ? "2rem" : "1.8rem", lineHeight: 1.7, color: "var(--text-primary)" }}>
              &ldquo;{data.message.content}&rdquo;
            </p>
            <p className="mt-4" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontFamily: INTER }}>
              — {data.message.username || "anonymous"}
            </p>
            <p className="mt-3" style={{ fontSize: "0.75rem", color: "var(--accent)", fontFamily: SPACE, fontWeight: 500 }}>
              this message has been here for {formatElapsed(elapsed)}
            </p>
          </div>
        ) : (
          <p className="italic" style={{ fontFamily: FRAUNCES, fontWeight: 300, fontSize: "1.3rem", color: "var(--text-secondary)" }}>
            This is the beginning. You don&apos;t know me. I don&apos;t know you. But we&apos;re both here, at the same strange place on the internet, at the same strange time. Write something. Make it count. Once upon a time, oops, too cheesy. I&apos;ll let you start the book.
          </p>
        )}
      </div>

      <div className="border-t mb-8" style={{ borderColor: "var(--border)" }} />

      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value.slice(0, 30))}
        placeholder="your name (optional, anonymous by default)"
        className="w-full px-4 py-3 text-sm mb-4 focus:outline-none transition"
        style={{ border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text-primary)", fontFamily: INTER }}
      />

      {!hasFreeSlot && (
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => { setTier(1); setContent((c) => c.slice(0, 200)); }}
            className="px-5 py-2 text-sm transition-all"
            style={{ borderRadius: 999, backgroundColor: tier === 1 ? "var(--accent)" : "transparent", color: tier === 1 ? "#fff" : "var(--text-primary)", border: tier === 1 ? "1px solid var(--accent)" : "1px solid var(--text-primary)", fontFamily: SPACE, fontWeight: 500 }}
          >
            $1 · 200 chars
          </button>
          <button
            onClick={() => setTier(2)}
            className="px-5 py-2 text-sm transition-all"
            style={{ borderRadius: 999, backgroundColor: tier === 2 ? "var(--accent)" : "transparent", color: tier === 2 ? "#fff" : "var(--text-primary)", border: tier === 2 ? "1px solid var(--accent)" : "1px solid var(--text-primary)", fontFamily: SPACE, fontWeight: 500 }}
          >
            $5 · 1200 chars
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
          style={{ border: "1px solid var(--border)", backgroundColor: "transparent", color: "var(--text-primary)", fontFamily: INTER }}
        />
        <span className="absolute bottom-3 right-4 text-xs" style={{ color: "var(--text-muted)", fontFamily: SPACE, fontWeight: 500 }}>
          {content.length}/{maxChars}
        </span>
      </div>

      {hasFreeSlot ? (
        <button onClick={handleFreeSubmit} disabled={!content.trim() || loading}
          className="w-full py-3.5 text-sm transition-opacity disabled:opacity-30"
          style={{ backgroundColor: "var(--accent-gold)", color: "#fff", border: "none", fontFamily: SPACE, fontWeight: 500 }}>
          {loading ? "Posting..." : "Post for free \u2192"}
        </button>
      ) : (
        <button onClick={handlePaidSubmit} disabled={!content.trim() || loading}
          className="w-full py-3.5 text-sm transition-opacity disabled:opacity-30"
          style={{ backgroundColor: "var(--btn-bg)", color: "#fff", border: "none", fontFamily: SPACE, fontWeight: 500 }}>
          {loading ? "Redirecting..." : `Pay & Post \u00b7 $${price} \u2192`}
        </button>
      )}

      <div className="border-t mt-10" style={{ borderColor: "var(--border)" }} />
      <footer className="py-8 text-center text-xs italic" style={{ color: "var(--text-muted)", fontFamily: FRAUNCES, fontWeight: 300 }}>
        Every message is saved forever. One day, they&apos;ll all be in a book.
      </footer>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 hidden md:grid w-full" style={{ gridTemplateColumns: "1fr 2.5fr 1fr" }}>
        <aside className="p-8" style={{ backgroundColor: "var(--bg-side)" }}>{leftCol}</aside>
        <main className="px-14" style={{ backgroundColor: "var(--bg-main)", boxShadow: "0 0 40px rgba(0,0,0,0.04)" }}>{centerCol}</main>
        <aside className="p-8" style={{ backgroundColor: "var(--bg-side)" }}>{rightCol}</aside>
      </div>

      <div className="flex-1 md:hidden flex flex-col pb-16">
        <div className="flex-1">
          {mobileTab === "main" && <div className="min-h-full px-5" style={{ backgroundColor: "var(--bg-main)" }}>{centerCol}</div>}
          {mobileTab === "highlights" && <div className="p-5" style={{ backgroundColor: "var(--bg-side)" }}>{leftCol}</div>}
          {mobileTab === "fame" && <div className="p-5" style={{ backgroundColor: "var(--bg-side)" }}>{rightCol}</div>}
        </div>
        <nav className="fixed bottom-0 left-0 right-0 flex z-50" style={{ backgroundColor: "var(--bg-main)", borderTop: "1px solid var(--border)" }}>
          {([
            { key: "main" as const, icon: <HomeIcon />, label: "Main" },
            { key: "highlights" as const, icon: <HighlightsIcon />, label: "Highlights" },
            { key: "fame" as const, icon: <FameIcon />, label: "Fame" },
          ]).map((tab) => (
            <button key={tab.key} onClick={() => setMobileTab(tab.key)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
              style={{ color: mobileTab === tab.key ? "#C17D3C" : "#9A8F85", fontFamily: SPACE, fontWeight: 500 }}>
              {tab.icon}
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
