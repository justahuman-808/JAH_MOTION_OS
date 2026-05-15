"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Brain, Hand, Eye, Home, Code, Info, Menu, X, LayoutDashboard } from "lucide-react";
import { useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Overview", href: "/handbook", icon: Info },
  { name: "Brain: DNA", href: "/handbook/brain", icon: Brain },
  { name: "Hand: Craft", href: "/handbook/hand", icon: Hand },
  { name: "Eye: Quality", href: "/handbook/eye", icon: Eye },
  { name: "Snippet Library", href: "/handbook/snippets", icon: Code },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-[60] p-2 bg-neutral-dark/80 backdrop-blur-md rounded-md border border-white/10 text-white"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "w-64 border-r border-white/10 flex flex-col fixed inset-y-0 z-50 bg-neutral-dark/95 md:bg-neutral-dark/80 backdrop-blur-md transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-white/5 pt-16 md:pt-6">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <img 
              src="/logo.jpg" 
              alt="JAH STUDIO Logo" 
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform mix-blend-screen" 
            />
            <span className="font-bold tracking-tighter text-lg text-white">JAH_STUDIO</span>
          </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "hover:bg-white/5 text-gray-400 hover:text-white"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-accent" : "group-hover:text-accent transition-colors")} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
        Version 1.0.4 // Alpha
      </div>
    </aside>
    </>
  );
}
