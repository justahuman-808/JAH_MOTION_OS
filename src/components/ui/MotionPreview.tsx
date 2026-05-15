"use client";

import { motion, AnimatePresence, TargetAndTransition, Easing } from "framer-motion";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MotionPreviewProps {
  type: "bounce" | "perspective" | "stagger" | "scale";
  className?: string;
}

export const MotionPreview = ({ type, className }: MotionPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [key, setKey] = useState(0);

  const reset = () => {
    setIsPlaying(false);
    setKey(prev => prev + 1);
    setTimeout(() => setIsPlaying(true), 50);
  };

  const getAnimation = (): TargetAndTransition | undefined => {
    switch (type) {
      case "bounce":
        return {
          y: [0, -40, 0, -20, 0],
          transition: {
            duration: 2,
            times: [0, 0.4, 0.7, 0.9, 1],
            ease: "easeOut" as Easing,
            repeat: Infinity,
            repeatDelay: 1
          }
        };
      case "perspective":
        return {
          rotateY: [0, 180, 0],
          z: [0, 100, 0],
          transition: {
            duration: 3,
            ease: "easeInOut" as Easing,
            repeat: Infinity,
            repeatDelay: 1
          }
        };
      case "scale":
        return {
          scale: [0, 1.2, 1],
          transition: {
            duration: 1,
            times: [0, 0.7, 1],
            ease: "easeOut" as Easing,
            repeat: Infinity,
            repeatDelay: 2
          }
        };
      default:
        return undefined;
    }
  };

  const anim = getAnimation();

  return (
    <div className={cn("relative bg-black/60 rounded-xl aspect-video flex items-center justify-center overflow-hidden group border border-white/5", className)}>
      <div className="absolute top-3 right-3 flex gap-2 z-20">
        <button onClick={reset} className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
          <RotateCcw size={14} />
        </button>
      </div>

      <div className="absolute top-3 left-3 text-[10px] font-mono text-gray-600 uppercase tracking-widest pointer-events-none">
        AE Render Preview // {type}
      </div>

      <AnimatePresence mode="wait">
        {isPlaying && (
          <motion.div
            key={key}
            className="w-full h-full flex items-center justify-center p-8"
          >
            {type === "stagger" ? (
              <motion.div className="flex gap-2" animate={{ transition: { staggerChildren: 0.2, repeatDelay: 2, repeat: Infinity } }}>
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-8 h-24 bg-accent/40 rounded-full border border-accent/20"
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                animate={anim}
                className={cn(
                  "w-24 h-24 rounded-2xl",
                  type === "bounce" && "bg-accent shadow-2xl shadow-accent/20",
                  type === "perspective" && "bg-accent-vibrant shadow-2xl shadow-accent-vibrant/20",
                  type === "scale" && "bg-white shadow-2xl shadow-white/20"
                )}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
};
