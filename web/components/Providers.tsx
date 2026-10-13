"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { useState, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { duration, ease } from "@/motion/tokens";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {/* reducedMotion="user": with reduced motion on, nothing moves and only opacity changes. */}
        <MotionConfig reducedMotion="user" transition={{ duration: duration.base, ease }}>
          {children}
        </MotionConfig>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
