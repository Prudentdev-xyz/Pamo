"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { page } from "@/motion/variants";

/** A block that arrives with the route: a fade and a short rise, as the /app routes do. */
export function PageRise({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div variants={page} initial="hidden" animate="visible" className={className}>
      {children}
    </motion.div>
  );
}
