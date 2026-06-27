"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, Check, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead, dismissNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-white/10 dark:bg-white/5 border border-border text-foreground hover:bg-white/20 dark:hover:bg-white/10 transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 glass-card shadow-xl z-50 overflow-hidden max-h-[480px] flex flex-col"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-heading font-semibold text-lg text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-primary/20 text-primary dark:text-teal-400 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-border/40">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-foreground/50 flex flex-col items-center justify-center gap-2">
                  <Info className="h-8 w-8 text-foreground/30" />
                  <p>All caught up!</p>
                  <p className="text-xs">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 flex items-start gap-3 transition-colors duration-150 ${
                      n.status === "unread" ? "bg-primary/5 dark:bg-primary/10" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-semibold truncate ${n.status === "unread" ? "text-primary dark:text-teal-400" : "text-foreground"}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-foreground/40 shrink-0">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/75 mt-1 leading-relaxed break-words">
                        {n.message}
                      </p>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => {
                            setIsOpen(false);
                            markAsRead(n._id);
                          }}
                          className="inline-block text-xs font-semibold text-primary dark:text-teal-400 hover:underline mt-2"
                        >
                          View Details
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      {n.status === "unread" && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          className="p-1 rounded-full hover:bg-primary/20 text-primary dark:text-teal-400 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => dismissNotification(n._id)}
                        className="p-1 rounded-full hover:bg-red-500/20 text-red-500 transition-colors"
                        title="Dismiss"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
