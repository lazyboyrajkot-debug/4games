import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils.ts";
import { motion } from "motion/react";

const NAV_ITEMS = [
  { to: "/wingo", label: "Wingo", icon: "🎯" },
  { to: "/k3", label: "K3", icon: "🎲" },
  { to: "/5d", label: "5D", icon: "🔢" },
];

export default function GameLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-black text-sm">4G</span>
          </div>
          <span className="font-bold text-lg tracking-tight">4Games</span>
        </div>
        <nav className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )
              }
            >
              <span className="hidden sm:inline">{item.icon} </span>{item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <motion.div
          key={typeof window !== "undefined" ? window.location.pathname : ""}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
