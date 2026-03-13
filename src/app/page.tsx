"use client";

import { useState, useEffect, useCallback } from "react";

interface MessageData {
  id: string;
  content: string;
  free: boolean;
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

// Hardcoded content for now
const SARAS_CHOICE = {
  content: "The internet is just people pretending to be confident.",
};

const HIGHLIGHTS = [
  { content: "I was here before AI took over. Remember me." },
  { content: "Mom, I made it into a book." },
  { content: "Be kind to strangers. They might be writing about you." },
];

// Font shortcuts
const FRAUNCES = "var(--font-fraunces)";
const SPACE = "var(--font-space)";
const INTER = "var(--font-inter)";

// ─── Icons ───────────────────────────────────────────────

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

// ─── Mobile nav icons ────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function HighlightsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function FameIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

// ─── Social icons ────────────────────────────────────────

function TwitchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// ─── Column label ────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-center uppercase mb-5"
      style={{
        fontSize: "0.7rem",
        letterSpacing: "0.15em",
        color: "#9A8F85",
        fontFamily: SPACE,
        fontWeight: 500,
      }}
    >
      {children}
    </p>
  );
}

// ─── Main component ─────────────────────────────────────

export default function Home() {
  const [data, setData] = useState<CurrentData | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [prevMessageId, setPrevMessageId] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState(0);
  const [tier, setTier] = useState<1 | 2>(1);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [mobileTab, setMobileTab] = useState<"main" | "highlights" | "fame">("main");

  const maxChars = tier === 1 ? 110 : 500;
  const price = tier === 1 ? 1 : 5;
  const isTestMode = process.env.NEXT_PUBLIC_STRIPE_TEST_MODE === "true";

  // Load liked IDs from localStorage
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
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
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
        body: JSON.stringify({ content: content.trim(), tier }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeSubmit = async () => {
    if (!content.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/messages/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setContent("");
        fetchCurrent();
      }
    } catch (err) {
      console.error("Free post error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    if (likedIds.has(id)) return;
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
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const hasFreeSlot = data?.freeSlot?.active ?? false;

  // ─── Left column content ───────────────────────────────

  const leftColumnContent = (
    <div className="flex flex-col gap-6 h-full">
      {/* Sara's Choice */}
      <div>
        <SectionLabel>
          <span className="inline-flex items-center gap-1.5">
            <StarIcon /> Sara&apos;s Choice
          </span>
        </SectionLabel>
        <div
          className="p-5"
          style={{
            backgroundColor: "#FFF3E0",
            borderLeft: "4px solid #C17D3C",
          }}
        >
          <p
            className="italic text-sm leading-relaxed"
            style={{ fontFamily: FRAUNCES, fontWeight: 400 }}
          >
            &ldquo;{SARAS_CHOICE.content}&rdquo;
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div>
        <SectionLabel>Highlights</SectionLabel>
        <div className="flex flex-col gap-3">
          {HIGHLIGHTS.map((h, i) => (
            <div
              key={i}
              className="p-4"
              style={{ backgroundColor: "#FAF6F1" }}
            >
              <p
                className="italic text-xs leading-relaxed"
                style={{ fontFamily: FRAUNCES, fontWeight: 400, color: "#1a1a1a" }}
              >
                &ldquo;{h.content}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* About Sara — pushed to bottom */}
      <div className="mt-auto pt-6">
        <div className="p-5" style={{ backgroundColor: "#FAF6F1" }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 flex items-center justify-center text-xs"
              style={{
                borderRadius: "50%",
                backgroundColor: "#C17D3C",
                color: "#fff",
                fontFamily: SPACE,
                fontWeight: 500,
              }}
            >
              S
            </div>
            <span
              className="text-sm"
              style={{ fontFamily: SPACE, fontWeight: 500 }}
            >
              Sara
            </span>
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ fontFamily: INTER, color: "#1a1a1a" }}
          >
            Hi, I&apos;m Sara.
            <br />
            Having fun on the internet.
          </p>
          <p
            className="text-xs leading-relaxed mt-2"
            style={{ fontFamily: INTER, color: "#9A8F85" }}
          >
            I run this place. You&apos;ll find me live on Twitch, TikTok and
            YouTube from time to time. You&apos;ll never know when tho.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="https://twitch.tv" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity" style={{ color: "#1a1a1a" }}>
              <TwitchIcon />
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity" style={{ color: "#1a1a1a" }}>
              <TikTokIcon />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-60 transition-opacity" style={{ color: "#1a1a1a" }}>
              <YouTubeIcon />
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Right column content ──────────────────────────────

  const rightColumnContent = (
    <div>
      <SectionLabel>
        <span className="inline-flex items-center gap-1.5">
          <TrophyIcon /> Hall of Fame
        </span>
      </SectionLabel>
      <div className="flex flex-col gap-3">
        {data?.hallOfFame && data.hallOfFame.length > 0 ? (
          data.hallOfFame.map((msg) => {
            const isLiked = likedIds.has(msg.id);
            return (
              <div
                key={msg.id}
                className="p-4 flex flex-col"
                style={{ backgroundColor: "#FFF8F0" }}
              >
                <p
                  className="italic text-sm leading-relaxed mb-3"
                  style={{ fontFamily: FRAUNCES, fontWeight: 400 }}
                >
                  &ldquo;{msg.content}&rdquo;
                </p>
                <button
                  onClick={() => handleLike(msg.id)}
                  className="self-start text-xs flex items-center gap-1.5 transition-colors"
                  style={{
                    color: isLiked ? "#C17D3C" : "#9A8F85",
                    cursor: isLiked ? "default" : "pointer",
                    fontFamily: SPACE,
                    fontWeight: 500,
                  }}
                >
                  <HeartIcon filled={isLiked} />
                  {msg.likes}
                </button>
              </div>
            );
          })
        ) : (
          <p
            className="text-xs text-center"
            style={{ color: "#9A8F85", fontFamily: INTER }}
          >
            No messages yet.
          </p>
        )}
      </div>
    </div>
  );

  // ─── Center column content ─────────────────────────────

  const centerColumnContent = (
    <div className="flex flex-col min-h-full">
      {/* Title */}
      <header className="pt-10 pb-3 text-center">
        <h1
          className="italic"
          style={{
            fontFamily: FRAUNCES,
            fontWeight: 300,
            fontSize: "1.5rem",
            letterSpacing: "0.15em",
          }}
        >
          The Book of Internet
        </h1>
      </header>

      {/* Counter */}
      <p
        className="text-center text-xs mb-6"
        style={{ color: "#9A8F85", fontFamily: SPACE, fontWeight: 500 }}
      >
        {data?.totalCount ?? 0} message{(data?.totalCount ?? 0) !== 1 ? "s" : ""} in the book
      </p>

      {/* Divider */}
      <div className="border-t" style={{ borderColor: "#E8E0D5" }} />

      {/* Free slot banner */}
      {hasFreeSlot && (
        <div
          className="animate-pulse-gold py-3 px-6 text-center text-sm"
          style={{
            backgroundColor: "#FFF3CD",
            color: "#B8860B",
            fontFamily: SPACE,
            fontWeight: 500,
          }}
        >
          🎁 Free slot unlocked! Post for free — {data!.freeSlot!.minutesLeft}{" "}
          minute{data!.freeSlot!.minutesLeft !== 1 ? "s" : ""} left
        </div>
      )}

      {/* Current message */}
      <div className="py-14 px-6 text-center min-h-[200px] flex items-center justify-center flex-1">
        {data?.message ? (
          <p
            key={animKey}
            className="animate-fade-in italic"
            style={{
              fontFamily: FRAUNCES,
              fontWeight: 400,
              fontSize: "2rem",
              lineHeight: 1.7,
            }}
          >
            {data.message.content}
          </p>
        ) : (
          <p
            className="italic"
            style={{
              fontFamily: FRAUNCES,
              fontWeight: 300,
              fontSize: "1.3rem",
              color: "#9A8F85",
            }}
          >
            No message yet. Be the first.
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="border-t mb-8" style={{ borderColor: "#E8E0D5" }} />

      {/* Tier selector */}
      {!hasFreeSlot && (
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={() => {
              setTier(1);
              setContent((c) => c.slice(0, 110));
            }}
            className="px-5 py-2 text-sm transition-all"
            style={{
              borderRadius: "999px",
              backgroundColor: tier === 1 ? "#C17D3C" : "transparent",
              color: tier === 1 ? "#fff" : "#1a1a1a",
              border: tier === 1 ? "1px solid #C17D3C" : "1px solid #1a1a1a",
              fontFamily: SPACE,
              fontWeight: 500,
            }}
          >
            $1 · 110 chars
          </button>
          <button
            onClick={() => setTier(2)}
            className="px-5 py-2 text-sm transition-all"
            style={{
              borderRadius: "999px",
              backgroundColor: tier === 2 ? "#C17D3C" : "transparent",
              color: tier === 2 ? "#fff" : "#1a1a1a",
              border: tier === 2 ? "1px solid #C17D3C" : "1px solid #1a1a1a",
              fontFamily: SPACE,
              fontWeight: 500,
            }}
          >
            $5 · 500 chars
          </button>
        </div>
      )}

      {/* Textarea */}
      <div className="relative mb-4 px-0">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
          placeholder="Write your message..."
          rows={4}
          className="w-full px-4 py-4 text-sm resize-none focus:outline-none transition"
          style={{
            border: "1px solid #E8E0D5",
            backgroundColor: "transparent",
            color: "#1a1a1a",
            borderRadius: 0,
            fontFamily: INTER,
          }}
        />
        <span
          className="absolute bottom-3 right-4 text-xs"
          style={{ color: "#9A8F85", fontFamily: SPACE, fontWeight: 500 }}
        >
          {content.length}/{maxChars}
        </span>
      </div>

      {/* Submit */}
      {hasFreeSlot ? (
        <button
          onClick={handleFreeSubmit}
          disabled={!content.trim() || loading}
          className="w-full py-3.5 text-sm transition-opacity disabled:opacity-30"
          style={{
            backgroundColor: "#B8860B",
            color: "#fff",
            borderRadius: 0,
            border: "none",
            fontFamily: SPACE,
            fontWeight: 500,
          }}
        >
          {loading ? "Posting..." : "Post for free 🎁"}
        </button>
      ) : (
        <button
          onClick={handlePaidSubmit}
          disabled={!content.trim() || loading}
          className="w-full py-3.5 text-sm transition-opacity disabled:opacity-30"
          style={{
            backgroundColor: "#1a1a1a",
            color: "#fff",
            borderRadius: 0,
            border: "none",
            fontFamily: SPACE,
            fontWeight: 500,
          }}
        >
          {loading ? "Redirecting..." : `Pay & Post \u00b7 $${price} \u2192`}
        </button>
      )}

      {/* Footer */}
      <div className="border-t mt-10" style={{ borderColor: "#E8E0D5" }} />
      <footer
        className="py-8 text-center text-xs italic"
        style={{ color: "#9A8F85", fontFamily: FRAUNCES, fontWeight: 300 }}
      >
        Every message is saved forever. One day, they&apos;ll all be in a book.
      </footer>
    </div>
  );

  // ─── Render ────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      {/* Test mode banner */}
      {isTestMode && (
        <div
          className="text-center py-2 text-xs"
          style={{
            backgroundColor: "#FFF3CD",
            color: "#856404",
            fontFamily: SPACE,
            fontWeight: 500,
          }}
        >
          Stripe test mode active — use card 4242 4242 4242 4242, any date, any CVC
        </div>
      )}

      {/* ─── Desktop: 3-column layout ─── */}
      <div
        className="flex-1 hidden md:grid mx-auto w-full"
        style={{
          gridTemplateColumns: "1fr 2fr 1fr",
          maxWidth: "1200px",
        }}
      >
        {/* Left column */}
        <aside className="p-6" style={{ backgroundColor: "#F0EBE3" }}>
          {leftColumnContent}
        </aside>

        {/* Center column */}
        <main
          className="px-10"
          style={{
            backgroundColor: "#FFFFFF",
            boxShadow: "0 0 40px rgba(0,0,0,0.04)",
          }}
        >
          {centerColumnContent}
        </main>

        {/* Right column */}
        <aside className="p-6" style={{ backgroundColor: "#F0EBE3" }}>
          {rightColumnContent}
        </aside>
      </div>

      {/* ─── Mobile: single column + bottom nav ─── */}
      <div className="flex-1 md:hidden flex flex-col pb-16">
        {/* Content area */}
        <div className="flex-1">
          {mobileTab === "main" && (
            <div
              className="min-h-full px-5"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              {centerColumnContent}
            </div>
          )}
          {mobileTab === "highlights" && (
            <div className="p-5" style={{ backgroundColor: "#F0EBE3" }}>
              {leftColumnContent}
            </div>
          )}
          {mobileTab === "fame" && (
            <div className="p-5" style={{ backgroundColor: "#F0EBE3" }}>
              {rightColumnContent}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <nav
          className="fixed bottom-0 left-0 right-0 flex z-50"
          style={{
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid #E8E0D5",
          }}
        >
          {([
            { key: "main" as const, icon: <HomeIcon />, label: "Main" },
            { key: "highlights" as const, icon: <HighlightsIcon />, label: "Highlights" },
            { key: "fame" as const, icon: <FameIcon />, label: "Fame" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMobileTab(tab.key)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
              style={{
                color: mobileTab === tab.key ? "#C17D3C" : "#9A8F85",
                fontFamily: SPACE,
                fontWeight: 500,
              }}
            >
              {tab.icon}
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
