import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "inter-cative v2 — Waitlist",
  description: "Join the waitlist for inter-cative v2. Private Local AI, No Browser Sandboxes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#fafafa] text-neutral-900">
        {children}
      </body>
    </html>
  );
}
