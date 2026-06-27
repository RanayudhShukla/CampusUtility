"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/shared/Sidebar";
import BottomNavbar from "@/components/shared/BottomNavbar";
import { Loader2 } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center h-screen bg-slate-50 dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-sm font-medium text-foreground/60">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If loading is done but no user, middleware will redirect. 
  // We can render a fallback if not redirected yet.
  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 min-h-screen flex bg-slate-50 dark:bg-[#0B0F19] text-foreground">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Children content wrapper */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Navigation bar */}
      <BottomNavbar />
    </div>
  );
}
