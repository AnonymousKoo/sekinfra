"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./premium-home.module.css";

export function ServiceCard({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.article
      className={styles.serviceCard}
      initial={false}
      whileHover={reducedMotion === false ? { y: -4 } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.article>
  );
}
