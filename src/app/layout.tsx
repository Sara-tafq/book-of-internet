import type { Metadata } from "next";
import { Inter, Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "The Book of Internet",
  description:
    "This is the beginning. You don't know me. I don't know you. But we're both here, at the same strange place on the internet, at the same strange time. Write something. Make it count. Once upon a time, oops, too cheesy. I'll let you start the book.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" style={{ colorScheme: "light" }}>
      <body
        className={`${inter.variable} ${fraunces.variable} ${spaceGrotesk.variable} antialiased min-h-screen`}
        style={{
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          backgroundColor: "#F7F3EE",
          color: "#1a1a1a",
        }}
      >
        {children}
      </body>
    </html>
  );
}
