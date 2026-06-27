"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/shared/Header";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NoticeSchema } from "@/schemas/validation";
import { z } from "zod";
import { Plus, Pin, Megaphone, User, Calendar, Tag, Search, X, Loader2, Edit2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NoticeFormValues = z.infer<typeof NoticeSchema>;

const CATEGORIES = ["All", "Academic", "Exam", "Event", "Holiday", "Placement", "General"] as const;

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Admin Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(NoticeSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "General",
      isPinned: false,
    },
  });

  const fetchNotices = async () => {
    try {
      const categoryParam = selectedCategory !== "All" ? `&category=${selectedCategory}` : "";
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      
      const res = await fetch(`/api/notices?${categoryParam}${searchParam}`);
      if (res.ok) {
        const data = await res.json();
        setNotices(data.notices || []);
      }
    } catch (err) {
      console.error("Failed to fetch notices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory, search]);

  const openAddModal = () => {
    setEditingNotice(null);
    setSubmitError(null);
    reset({
      title: "",
      content: "",
      category: "General",
      isPinned: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (n: any) => {
    setEditingNotice(n);
    setSubmitError(null);
    reset({
      title: n.title,
      content: n.content,
      category: n.category,
      isPinned: n.isPinned,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: NoticeFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const url = editingNotice ? `/api/notices?id=${editingNotice._id}` : "/api/notices";
      const method = editingNotice ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchNotices();
      } else {
        setSubmitError(data.error || "Failed to save notice.");
      }
    } catch (err) {
      setSubmitError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`/api/notices?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchNotices();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete notice.");
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Notice Board" />

      <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Controls Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {isAdmin && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-md shadow-primary/10 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Post Announcement</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shrink-0 border transition-all ${
                selectedCategory === cat
                  ? "bg-primary/10 border-primary text-primary dark:text-teal-400 font-bold"
                  : "bg-white/20 dark:bg-black/10 border-border hover:bg-white/30 dark:hover:bg-white/5 text-foreground/70"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Notice items display grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : notices.length === 0 ? (
          <div className="py-16 text-center text-sm text-foreground/40 glass-card border border-border flex flex-col items-center justify-center gap-2">
            <Megaphone className="h-10 w-10 text-foreground/20" />
            <p>No notices matching filters found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {notices.map((n) => (
              <motion.div
                key={n._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-card p-6 border flex flex-col justify-between relative ${
                  n.isPinned
                    ? "border-primary/40 dark:border-teal-500/40 shadow-md shadow-primary/5"
                    : "border-border"
                }`}
              >
                {/* Pin Header */}
                {n.isPinned && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold text-primary dark:text-teal-400 bg-primary/15 px-2.5 py-0.5 rounded-full uppercase">
                    <Pin className="h-3 w-3 fill-current shrink-0" />
                    <span>Pinned</span>
                  </div>
                )}

                <div>
                  {/* Category Flag */}
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase bg-primary/20 text-primary dark:text-teal-400 px-2 py-0.5 rounded border border-primary/10">
                    <Tag className="h-3 w-3 shrink-0" />
                    <span>{n.category}</span>
                  </span>

                  {/* Title */}
                  <h4 className="font-heading font-bold text-lg text-foreground mt-3 leading-snug">
                    {n.title}
                  </h4>

                  {/* Content */}
                  <p className="text-sm text-foreground/80 mt-3 whitespace-pre-wrap leading-relaxed">
                    {n.content}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-6">
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-foreground/50">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span>{n.authorName}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>

                  {/* Admin Edit/Delete Options */}
                  {isAdmin && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => openEditModal(n)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-foreground/50 hover:text-primary transition-colors cursor-pointer"
                        title="Edit Notice"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(n._id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-foreground/50 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete Notice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal for Admins */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md glass-card shadow-2xl border border-border p-6 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <h3 className="font-heading font-bold text-lg text-foreground">
                  {editingNotice ? "Edit Announcement" : "Post New Announcement"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-foreground/50 hover:text-foreground cursor-pointer focus:outline-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {submitError && (
                <div className="p-3 my-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 overflow-y-auto flex-1">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                    Announcement Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Mid-Semester Examination Schedule"
                    {...register("title")}
                    className={`w-full px-3 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                      errors.title ? "border-red-500 ring-red-500/20" : ""
                    }`}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 font-medium mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Category Select */}
                <div>
                  <label htmlFor="category" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                    Notice Category
                  </label>
                  <select
                    id="category"
                    {...register("category")}
                    className="w-full px-3 py-2 glass-input text-foreground text-sm bg-transparent"
                  >
                    <option value="Academic" className="bg-slate-900 text-white">Academic</option>
                    <option value="Exam" className="bg-slate-900 text-white">Exam</option>
                    <option value="Event" className="bg-slate-900 text-white">Event</option>
                    <option value="Holiday" className="bg-slate-900 text-white">Holiday</option>
                    <option value="Placement" className="bg-slate-900 text-white">Placement</option>
                    <option value="General" className="bg-slate-900 text-white">General</option>
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                    Announcement Content
                  </label>
                  <textarea
                    id="content"
                    placeholder="Detailed notice text goes here. Make sure to list dates, times, and criteria."
                    rows={6}
                    {...register("content")}
                    className={`w-full px-3 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 resize-none ${
                      errors.content ? "border-red-500 ring-red-500/20" : ""
                    }`}
                  />
                  {errors.content && (
                    <p className="text-xs text-red-500 font-medium mt-1">{errors.content.message}</p>
                  )}
                </div>

                {/* Pin Option */}
                <div className="flex items-center">
                  <input
                    id="isPinned"
                    type="checkbox"
                    {...register("isPinned")}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 bg-transparent cursor-pointer"
                  />
                  <label htmlFor="isPinned" className="ml-2 text-xs text-foreground/70 select-none cursor-pointer flex items-center gap-1">
                    <Pin className="h-3 w-3 fill-current text-primary" />
                    <span>Pin this announcement at the top of the board</span>
                  </label>
                </div>

                {/* Submit panel */}
                <div className="flex gap-3 border-t border-border pt-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-lg border border-border hover:bg-white/10 text-foreground text-sm font-semibold transition-all cursor-pointer"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <span>Post Notice</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
