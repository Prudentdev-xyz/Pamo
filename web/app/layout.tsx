import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "@/components/Providers";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "600", "700"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pamo",
  description: "Keep it safe. Your USDC savings earn while they sit.",
};

// The page paints under the notch and pads itself back out; the browser bar matches the white page.
export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={beVietnamPro.variable}>
      <body className="min-h-screen bg-white text-black antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
