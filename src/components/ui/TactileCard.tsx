"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode, useRef } from "react";

interface TactileCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const TactileCard = ({ children, className, delay = 0 }: TactileCardProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "1 0"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.01 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ scale, opacity }}
      className={cn("tactile-card p-8 overflow-hidden relative", className)}
    >
      <div className="relative z-10">{children}</div>
      <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/[0.02] blur-xl rounded-full pointer-events-none" />
    </motion.div>
  );
};
