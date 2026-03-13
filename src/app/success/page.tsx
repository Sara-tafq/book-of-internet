"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const FRAUNCES = "var(--font-fraunces)";
const SPACE = "var(--font-space)";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    const timer = setTimeout(() => setStatus("success"), 1500);
    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <>
      {status === "loading" && (
        <p
          className="italic animate-pulse text-lg"
          style={{ color: "#9A8F85", fontFamily: FRAUNCES, fontWeight: 300 }}
        >
          Publishing your message...
        </p>
      )}

      {status === "success" && (
        <div className="text-center animate-fade-in">
          <p className="text-2xl mb-4">✨</p>
          <p
            className="text-lg mb-2"
            style={{ fontFamily: FRAUNCES, fontWeight: 400 }}
          >
            Your message is live.
          </p>
          <p
            className="italic text-sm mb-8"
            style={{ color: "#9A8F85", fontFamily: FRAUNCES, fontWeight: 300 }}
          >
            Until someone else pays. Then it becomes part of the book.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 text-sm transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "#1a1a1a",
              color: "#fff",
              fontFamily: SPACE,
              fontWeight: 500,
            }}
          >
            See the billboard
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="text-center animate-fade-in">
          <p className="text-sm mb-4" style={{ color: "#c44" }}>Something went wrong.</p>
          <Link
            href="/"
            className="inline-block px-8 py-3 text-sm transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "#1a1a1a",
              color: "#fff",
              fontFamily: SPACE,
              fontWeight: 500,
            }}
          >
            Go back
          </Link>
        </div>
      )}
    </>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1
        className="italic mb-10"
        style={{
          fontFamily: FRAUNCES,
          fontWeight: 300,
          fontSize: "1.5rem",
          letterSpacing: "0.15em",
        }}
      >
        The Book of Internet
      </h1>
      <Suspense
        fallback={
          <p className="italic animate-pulse text-sm" style={{ color: "#9A8F85", fontFamily: FRAUNCES }}>
            Loading...
          </p>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
