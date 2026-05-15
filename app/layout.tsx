import type { Metadata } from "next";
import { ClerkProvider, SignInButton, UserButton } from "@clerk/nextjs";
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
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="absolute right-6 top-6 z-50 flex gap-3">
            <SignInButton mode="modal">
              <button className="rounded-xl bg-cyan-400 px-4 py-2 font-bold text-black">
                Login
              </button>
            </SignInButton>

            <UserButton />
          </div>

          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}