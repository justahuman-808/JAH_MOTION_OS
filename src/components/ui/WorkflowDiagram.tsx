"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Brain, Hand, Eye, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const nodes = [
  {
    id: "brain",
    label: "Brain",
    icon: Brain,
    color: "#00ffaa",
    description: "The Design DNA Storage. Motion formulas, UI structures, and Burmese typography templates.",
    details: [
      "JSON/JSX Snippet Database",
      "CLI Parameter Substitution",
      "Motion System Engine"
    ]
  },
  {
    id: "hand",
    label: "Hand",
    icon: Hand,
    color: "#ff00ea",
    description: "The Human Execution Layer. Taking technical DNA and crafting artistic final motion in AE.",
    details: [
      "Manual 3D UI Crafting",
      "Artistic Aesthetic Choice",
      "Workflow Acceleration"
    ]
  },
  {
    id: "eye",
    label: "Eye",
    icon: Eye,
    color: "#ffffff",
    description: "The Quality Feedback Loop. Auditing work against brand standards and craft quality.",
    details: [
      "Aesthetic Validation",
      "Brand DNA Compliance",
      "Human-in-the-loop Final Check"
    ]
  }
];

export const WorkflowDiagram = () => {
  const [activeNode, setActiveNode] = useState<string | null>("brain");

  const selectedNode = nodes.find(n => n.id === activeNode);

  return (
    <div className="space-y-12 py-8">
      {/* Node Visualization */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative max-w-4xl mx-auto px-4">
        {/* Connecting Lines (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-white/10 -translate-y-1/2 z-0" />

        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isActive = activeNode === node.id;

          return (
            <div key={node.id} className="relative z-10 flex flex-col items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveNode(node.id)}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 relative",
                  isActive
                    ? "bg-neutral-mid border-2 shadow-2xl"
                    : "bg-neutral-dark border border-white/10 grayscale hover:grayscale-0"
                )}
                style={{
                  borderColor: isActive ? node.color : "rgba(255,255,255,0.1)",
                  boxShadow: isActive ? `0 0 30px ${node.color}33` : "none"
                }}
              >
                <Icon size={32} style={{ color: isActive ? node.color : "#666" }} />

                {isActive && (
                  <motion.div
                    layoutId="glow"
                    className="absolute inset-0 rounded-full blur-xl -z-10"
                    style={{ backgroundColor: node.color, opacity: 0.2 }}
                  />
                )}
              </motion.button>

              <span className={cn(
                "font-bold tracking-widest uppercase text-xs transition-colors duration-500",
                isActive ? "text-white" : "text-gray-500"
              )}>
                {node.label}
              </span>

              {index < nodes.length - 1 && (
                <div className="md:hidden">
                   <ArrowRight className="text-white/10 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Node Content */}
      <div className="min-h-[300px] max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-neutral-dark/50 border border-white/5 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <selectedNode.icon size={160} />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                   <h3 className="text-2xl font-bold flex items-center gap-3">
                     <span className="p-2 rounded-lg bg-white/5" style={{ color: selectedNode.color }}>
                       <selectedNode.icon size={20} />
                     </span>
                     {selectedNode.label} System
                   </h3>
                   <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
                     {selectedNode.description}
                   </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedNode.details.map((detail, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                      <CheckCircle2 size={16} style={{ color: selectedNode.color }} className="shrink-0" />
                      <span className="text-sm font-medium text-gray-300">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
