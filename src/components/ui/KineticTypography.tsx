"use client";

import { motion, Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface KineticTypographyProps extends React.HTMLAttributes<HTMLElement> {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  trigger?: "view" | "load";
}

export const KineticTypography = ({
  text,
  className,
  style,
  as: Component = "h1",
  delay = 0,
  trigger = "view",
  ...props
}: KineticTypographyProps) => {
  const segments = React.useMemo(() => {
    return Array.from(
      new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)
    ).map((s) => s.segment);
  }, [text]);

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 40,
      rotateX: 90,
    },
  };

  return (
    <Component
      className={cn("perspective-1000 w-full flex justify-center", className)}
      style={style}
      {...props}
    >
      <motion.span
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", width: "100%" }}
        variants={container}
        initial="hidden"
        animate={trigger === "load" ? "visible" : undefined}
        whileInView={trigger === "view" ? "visible" : undefined}
        viewport={trigger === "view" ? { once: true, amount: "some" } : undefined}
      >
        {segments.map((segment, index) => (
          <motion.span
            variants={child}
            key={index}
            className="inline-block whitespace-pre"
          >
            {segment === " " ? "\u00A0" : segment}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
};
