import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gold Sniper Control Portal",
  description: "XAUUSD AI control dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}