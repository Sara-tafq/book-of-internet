"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const FRAUNCES = "var(--font-fraunces)";
const SPACE = "var(--font-space)";
const INTER = "var(--font-inter)";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "queued" | "error">("loading");
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }

    const checkStatus = async () => {
      try {
        await new Promise((r) => setTimeout(r, 2000));
        const res = await fetch(`/api/messages/current`);
        const data = await res.json();
        if (data.queueCount > 0) {
          setQueuePosition(data.queueCount);
          setStatus("queued");
        } else {
          setStatus("success");
        }
      } catch {
        setStatus("success");
      }
    };

    checkStatus();
  }, [sessionId]);

  return (
    <>
      {status === "loading" && (
        <p className="italic animate-pulse text-lg" style={{ color: "#9A8F85", fontFamily: FRAUNCES }}>publishing your message...</p>
      )}
      {status === "success" && (
        <div className="text-center animate-fade-in">
          <p className="text-2xl mb-4">✨</p>
          <p className="text-lg mb-2" style={{ fontFamily: INTER, fontWeight: 500 }}>your message is live.</p>
          <p className="italic text-sm mb-8" style={{ color: "#9A8F85", fontFamily: FRAUNCES }}>until someone else pays. then it becomes part of the book.</p>
          <Link href="/" className="inline-block px-8 py-3 text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#1a1a1a", color: "#fff", fontFamily: SPACE, fontWeight: 500 }}>
            see the billboard
          </Link>
        </div>
      )}
      {status === "queued" && (
        <div className="text-center animate-fade-in">
          <p className="text-2xl mb-4">⏳</p>
          <p className="text-lg mb-2" style={{ fontFamily: INTER, fontWeight: 500 }}>your message is in the queue.</p>
          <p className="italic text-sm mb-2" style={{ color: "#9A8F85", fontFamily: FRAUNCES }}>
            there {queuePosition === 1 ? "is" : "are"} {queuePosition} message{queuePosition !== 1 ? "s" : ""} ahead.
          </p>
          <p className="italic text-sm mb-8" style={{ color: "#9A8F85", fontFamily: FRAUNCES }}>each message gets 30 seconds of fame. yours is coming up.</p>
          <Link href="/" className="inline-block px-8 py-3 text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#1a1a1a", color: "#fff", fontFamily: SPACE, fontWeight: 500 }}>
            watch the billboard
          </Link>
        </div>
      )}
      {status === "error" && (
        <div className="text-center animate-fade-in">
          <p className="text-sm mb-4" style={{ color: "#C17D3C" }}>something went wrong.</p>
          <Link href="/" className="inline-block px-8 py-3 text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#1a1a1a", color: "#fff", fontFamily: SPACE, fontWeight: 500 }}>
            go back
          </Link>
        </div>
      )}
    </>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="mb-10 italic" style={{ fontFamily: FRAUNCES, fontWeight: 300, fontSize: "1.5rem", letterSpacing: "0.15em" }}>
        The Book of Internet
      </h1>
      <Suspense fallback={<p className="italic animate-pulse text-sm" style={{ color: "#9A8F85" }}>loading...</p>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
