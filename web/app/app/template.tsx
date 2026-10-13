"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { page } from "@/motion/variants";

// A template remounts on every navigation, so each /app route fades in with a short rise.
export default function AppTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={page} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}
