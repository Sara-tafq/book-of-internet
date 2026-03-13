"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const SYNE = "var(--font-syne)";
const DM = "var(--font-dm)";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) { setStatus("error"); return; }
    const timer = setTimeout(() => setStatus("success"), 1500);
    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <>
      {status === "loading" && (
        <p className="italic animate-pulse text-lg" style={{ color: "#D6D6D6", fontFamily: DM }}>publishing your message...</p>
      )}
      {status === "success" && (
        <div className="text-center animate-fade-in">
          <p className="text-2xl mb-4">✨</p>
          <p className="text-lg mb-2" style={{ fontFamily: DM, fontWeight: 500 }}>your message is live.</p>
          <p className="italic text-sm mb-8" style={{ color: "#D6D6D6", fontFamily: DM }}>until someone else pays. then it becomes part of the book.</p>
          <Link href="/" className="inline-block px-8 py-3 text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#F58F7C", color: "#2C2B30", borderRadius: 12, fontFamily: SYNE, fontWeight: 700 }}>
            see the billboard
          </Link>
        </div>
      )}
      {status === "error" && (
        <div className="text-center animate-fade-in">
          <p className="text-sm mb-4" style={{ color: "#F58F7C" }}>something went wrong.</p>
          <Link href="/" className="inline-block px-8 py-3 text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#F58F7C", color: "#2C2B30", borderRadius: 12, fontFamily: SYNE, fontWeight: 700 }}>
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
      <h1 className="mb-10" style={{ fontFamily: SYNE, fontWeight: 800, fontSize: "1.5rem", color: "#F2C4CE" }}>
        The Book of Internet
      </h1>
      <Suspense fallback={<p className="italic animate-pulse text-sm" style={{ color: "#6B6B6E" }}>loading...</p>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
