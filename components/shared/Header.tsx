"use client";

import React from "react";
import ThemeToggle from "./ThemeToggle";
import NotificationsDropdown from "./NotificationsDropdown";
import { useAuth } from "@/hooks/useAuth";
import { GraduationCap, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-border/80 bg-white/30 dark:bg-black/10 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Page Title or Mobile Logo */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden p-1.5 rounded-lg bg-primary text-white flex items-center justify-center">
          <GraduationCap className="h-5 w-5" />
        </div>
        {title ? (
          <h2 className="font-heading font-bold text-lg sm:text-xl text-foreground truncate">{title}</h2>
        ) : (
          <h2 className="font-heading font-bold text-lg sm:text-xl text-foreground lg:hidden">Smart Campus</h2>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationsDropdown />
        
        {/* Mobile Quick Logout */}
        {user && (
          <button
            onClick={logout}
            className="lg:hidden p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </header>
  );
}
