"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface InfiniteMarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number; // duration in seconds
  className?: string;
  gap?: string;
}

export const InfiniteMarquee = ({
  children,
  direction = "left",
  speed = 40,
  className,
  gap = "3rem",
}: InfiniteMarqueeProps) => {
  const [repeatCount, setRepeatCount] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const cssVars = {
    "--duration": `${speed}s`,
    "--repeat": String(repeatCount),
  } as React.CSSProperties;

  // Robust duplication logic to ensure no gaps on any screen size
  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const contentWidth = contentRef.current.offsetWidth;
      if (contentWidth > 0) {
        const needed = Math.ceil((containerWidth * 2) / contentWidth) + 1;
        setRepeatCount(Math.max(2, needed));
      }
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden flex select-none", className)}
      style={{
        maskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)",
        ...cssVars,
      }}
    >
      <div
        className={cn(
          "flex whitespace-nowrap will-change-transform shrink-0",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right"
        )}
        style={{
          // No gap here to keep math simple
        }}
      >
        {/* Original Content */}
        <div ref={contentRef} className="flex shrink-0" style={{ paddingRight: gap }}>
          {children}
        </div>

        {/* Clones - Hidden from screen readers */}
        {Array.from({ length: repeatCount - 1 }).map((_, i) => (
          <div key={i} className="flex shrink-0" style={{ paddingRight: gap }} aria-hidden="true">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
};
