"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  CheckSquare,
  Megaphone,
  FileText,
  User as UserIcon,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Timetable", href: "/timetable", icon: Calendar },
    { name: "Assignments", href: "/assignments", icon: ClipboardList },
    { name: "Attendance", href: "/attendance", icon: CheckSquare },
    { name: "Notices", href: "/notices", icon: Megaphone },
    { name: "Notes", href: "/notes", icon: FileText },
    { name: "Profile", href: "/profile", icon: UserIcon },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen border-r border-border bg-white/40 dark:bg-black/20 backdrop-blur-xl shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-border/80 flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-primary text-white flex items-center justify-center">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-base leading-none text-foreground">Smart Campus</h1>
          <span className="text-[10px] text-foreground/50 tracking-wider uppercase font-semibold">Utility App</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                isActive
                  ? "text-primary dark:text-teal-400 font-semibold"
                  : "text-foreground/70 hover:text-foreground hover:bg-white/30 dark:hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/20 dark:border-primary/40 -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon className={`h-5 w-5 ${isActive ? "text-primary dark:text-teal-400" : "text-foreground/60 group-hover:text-foreground"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer Panel */}
      {user && (
        <div className="p-4 border-t border-border/80 bg-white/20 dark:bg-black/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary dark:text-teal-400 font-heading font-bold uppercase shrink-0 overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-foreground leading-tight">{user.name}</p>
              <p className="text-[10px] text-foreground/50 truncate capitalize">{user.role}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs font-semibold transition-all duration-200 cursor-pointer focus:outline-none"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
}
