"use client";

import { useScroll, useSpring, motion } from "motion/react";

export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={`fixed left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 origin-left z-50 ${className}`}
      style={{ scaleX }}
    />
  );
}
