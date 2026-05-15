"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface TactileButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export const TactileButton = ({
  children,
  variant = "primary",
  className,
  ...props
}: TactileButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative px-8 py-3 rounded-full font-bold uppercase tracking-wider transition-all duration-200 overflow-hidden group",
        variant === "primary"
          ? "bg-accent text-background hover:bg-white"
          : "bg-neutral-mid text-foreground border border-white/20 hover:border-accent",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};
