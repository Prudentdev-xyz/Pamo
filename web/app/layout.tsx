import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pamo",
  description: "Keep it safe. Your USDC savings earn while they sit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
