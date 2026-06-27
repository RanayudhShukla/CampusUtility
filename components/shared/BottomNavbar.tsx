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
} from "lucide-react";

export default function BottomNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const menuItems = [
    { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
    { name: "Schedule", href: "/timetable", icon: Calendar },
    { name: "Tasks", href: "/assignments", icon: ClipboardList },
    { name: "Attendance", href: "/attendance", icon: CheckSquare },
    { name: "Notices", href: "/notices", icon: Megaphone },
    { name: "Notes", href: "/notes", icon: FileText },
  ];

  return (
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 h-16 glass-card shadow-2xl z-40 border border-border/80 flex items-center justify-around px-2">
      {menuItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-center cursor-pointer transition-colors ${
              isActive
                ? "text-primary dark:text-teal-400"
                : "text-foreground/50 hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium mt-0.5">{item.name}</span>
          </Link>
        );
      })}
      <Link
        href="/profile"
        className={`flex flex-col items-center justify-center flex-1 py-1 text-center cursor-pointer transition-colors ${
          pathname === "/profile"
            ? "text-primary dark:text-teal-400"
            : "text-foreground/50 hover:text-foreground"
        }`}
      >
        <UserIcon className="h-5 w-5" />
        <span className="text-[10px] font-medium mt-0.5">Profile</span>
      </Link>
    </nav>
  );
}
