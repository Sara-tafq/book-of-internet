import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "The Book of Internet",
  description:
    "One dollar. One message. One second of fame. Then you're gone — but never forgotten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${dmSans.variable} antialiased min-h-screen`}
        style={{
          fontFamily: "var(--font-dm), system-ui, sans-serif",
          backgroundColor: "#2C2B30",
          color: "#FFFFFF",
        }}
      >
        {children}
      </body>
    </html>
  );
}
