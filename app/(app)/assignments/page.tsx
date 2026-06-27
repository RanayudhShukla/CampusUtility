"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/shared/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssignmentSchema } from "@/schemas/validation";
import { z } from "zod";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  Paperclip,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Search,
  Upload,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AssignmentFormValues = z.infer<typeof AssignmentSchema>;

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"dueDate" | "priority">("dueDate");

  // Modal & Upload states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [attachmentsList, setAttachmentsList] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(AssignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
      priority: "Medium",
      status: "Todo",
    },
  });

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/assignments");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const openAddModal = () => {
    setEditingAssignment(null);
    setAttachmentsList([]);
    setSubmitError(null);
    reset({
      title: "",
      description: "",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0], // default 3 days out
      priority: "Medium",
      status: "Todo",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (a: any) => {
    setEditingAssignment(a);
    setAttachmentsList(a.attachments || []);
    setSubmitError(null);
    reset({
      title: a.title,
      description: a.description,
      dueDate: new Date(a.dueDate).toISOString().split("T")[0],
      priority: a.priority,
      status: a.status,
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        const newAttachment = {
          name: data.name,
          url: data.url,
          size: data.size,
        };
        setAttachmentsList((prev) => [...prev, newAttachment]);
      } else {
        alert(data.error || "File upload failed.");
      }
    } catch (err) {
      alert("Failed to upload file due to network error.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (idx: number) => {
    setAttachmentsList((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (values: AssignmentFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...values,
        attachments: attachmentsList,
      };

      const url = editingAssignment ? `/api/assignments?id=${editingAssignment._id}` : "/api/assignments";
      const method = editingAssignment ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchAssignments();
      } else {
        setSubmitError(data.error || "Failed to save assignment.");
      }
    } catch (err) {
      setSubmitError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    try {
      const res = await fetch(`/api/assignments?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAssignments();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete.");
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    }
  };

  const changeStatus = async (item: any, newStatus: "Todo" | "In Progress" | "Completed") => {
    try {
      const res = await fetch(`/api/assignments?id=${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          description: item.description,
          dueDate: item.dueDate,
          priority: item.priority,
          status: newStatus,
          attachments: item.attachments,
        }),
      });

      if (res.ok) {
        fetchAssignments();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update status.");
      }
    } catch (err) {
      alert("Network error updating status.");
    }
  };

  // Filters & Sorting
  const processedAssignments = assignments
    .filter((a) => {
      const matchSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase());
      const matchPriority = priorityFilter === "All" || a.priority === priorityFilter;
      return matchSearch && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        return PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] - PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER];
      }
    });

  // Split into columns
  const todoItems = processedAssignments.filter((a) => a.status === "Todo");
  const inProgressItems = processedAssignments.filter((a) => a.status === "In Progress");
  const completedItems = processedAssignments.filter((a) => a.status === "Completed");

  // Statistics calculation for progress bar
  const totalCount = assignments.length;
  const completedCount = assignments.filter((a) => a.status === "Completed").length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Assignment Tracker" />

      <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Statistics Progress Bar */}
        <div className="glass-card p-5 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-primary dark:text-teal-400" />
            <div>
              <h3 className="font-heading font-bold text-base text-foreground">Completion Progress</h3>
              <p className="text-xs text-foreground/50 mt-0.5">
                {completedCount} of {totalCount} assignments completed ({progressPercent}%)
              </p>
            </div>
          </div>
          <div className="w-full sm:w-64 bg-white/20 dark:bg-black/20 h-3 rounded-full overflow-hidden border border-border/50 shrink-0">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-primary dark:bg-teal-400 h-full rounded-full"
            />
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30"
              />
            </div>

            {/* Filter Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-white/20 dark:bg-black/20 text-foreground text-xs font-semibold cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-border bg-white/20 dark:bg-black/20 text-foreground text-xs font-semibold cursor-pointer"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
            </select>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-md shadow-primary/10 cursor-pointer self-end sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create Assignment</span>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          /* Kanban Board layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {[
              { title: "Todo", items: todoItems, status: "Todo" },
              { title: "In Progress", items: inProgressItems, status: "In Progress" },
              { title: "Completed", items: completedItems, status: "Completed" },
            ].map((col) => (
              <div key={col.title} className="glass-card p-4 border border-border/80 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <h4 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                    <span>{col.title}</span>
                    <span className="bg-white/30 dark:bg-white/5 border border-border text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {col.items.length}
                    </span>
                  </h4>
                </div>

                <div className="space-y-3 min-h-[300px]">
                  {col.items.length === 0 ? (
                    <div className="py-12 text-center text-xs text-foreground/30 border border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center gap-1">
                      <Clock className="h-6 w-6 text-foreground/15" />
                      <span>Column empty</span>
                    </div>
                  ) : (
                    col.items.map((item) => (
                      <motion.div
                        key={item._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl border border-border bg-white/40 dark:bg-black/15 flex flex-col gap-3 shadow-sm hover:border-primary/20 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                            {item.title}
                          </h5>
                          <div className="flex gap-0.5 shrink-0">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1 rounded hover:bg-primary/10 text-foreground/50 hover:text-primary transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteAssignment(item._id)}
                              className="p-1 rounded hover:bg-red-500/10 text-foreground/50 hover:text-red-500 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between border-t border-border/40 pt-3">
                          <div className="flex items-center gap-1.5 text-[10px] text-foreground/50">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                item.priority === "High"
                                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                                  : item.priority === "Medium"
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                  : "bg-green-500/10 text-green-500 border-green-500/20"
                              }`}
                            >
                              {item.priority}
                            </span>
                          </div>
                        </div>

                        {/* Attachments List */}
                        {item.attachments && item.attachments.length > 0 && (
                          <div className="border-t border-border/30 pt-2 flex flex-col gap-1">
                            {item.attachments.map((att: any, attIdx: number) => (
                              <a
                                key={attIdx}
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-[10px] text-primary dark:text-teal-400 hover:underline truncate"
                              >
                                <Paperclip className="h-3 w-3 shrink-0" />
                                <span className="truncate">{att.name}</span>
                                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Status Toggle triggers (No Drag, simple buttons) */}
                        <div className="flex gap-1.5 border-t border-border/30 pt-2.5 mt-0.5">
                          {col.status !== "Todo" && (
                            <button
                              onClick={() => changeStatus(item, "Todo")}
                              className="flex items-center gap-1 text-[9px] font-bold text-foreground/60 hover:text-foreground border border-border bg-white/20 dark:bg-black/10 px-2 py-1 rounded transition-colors cursor-pointer shrink-0"
                            >
                              <ArrowLeft className="h-2.5 w-2.5" />
                              <span>To Todo</span>
                            </button>
                          )}
                          {col.status !== "In Progress" && (
                            <button
                              onClick={() => changeStatus(item, "In Progress")}
                              className="flex-1 flex items-center justify-center gap-1 text-[9px] font-bold text-primary dark:text-teal-400 border border-primary/20 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              <span>Work On</span>
                            </button>
                          )}
                          {col.status !== "Completed" && (
                            <button
                              onClick={() => changeStatus(item, "Completed")}
                              className="flex items-center gap-1 text-[9px] font-bold text-white bg-accent hover:bg-green-600 px-2 py-1 rounded transition-colors cursor-pointer shrink-0"
                            >
                              <span>Done</span>
                              <ArrowRight className="h-2.5 w-2.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal Overlay */}
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
                  {editingAssignment ? "Edit Assignment" : "New Assignment"}
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
                    Assignment Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Database Midterm Project"
                    {...register("title")}
                    className={`w-full px-3 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                      errors.title ? "border-red-500 ring-red-500/20" : ""
                    }`}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 font-medium mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                    Description / Instructions
                  </label>
                  <textarea
                    id="description"
                    placeholder="Implement user schema validations, CRUD routes..."
                    rows={3}
                    {...register("description")}
                    className="w-full px-3 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 resize-none"
                  />
                </div>

                {/* Due Date & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dueDate" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                      Due Date
                    </label>
                    <input
                      id="dueDate"
                      type="date"
                      {...register("dueDate")}
                      className="w-full px-3 py-2 glass-input text-foreground text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                      Priority
                    </label>
                    <select
                      id="priority"
                      {...register("priority")}
                      className="w-full px-3 py-2 glass-input text-foreground text-sm bg-transparent"
                    >
                      <option value="High" className="bg-slate-900 text-white">High</option>
                      <option value="Medium" className="bg-slate-900 text-white">Medium</option>
                      <option value="Low" className="bg-slate-900 text-white">Low</option>
                    </select>
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label htmlFor="status" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                    Progress State
                  </label>
                  <select
                    id="status"
                    {...register("status")}
                    className="w-full px-3 py-2 glass-input text-foreground text-sm bg-transparent"
                  >
                    <option value="Todo" className="bg-slate-900 text-white">Todo</option>
                    <option value="In Progress" className="bg-slate-900 text-white">In Progress</option>
                    <option value="Completed" className="bg-slate-900 text-white">Completed</option>
                  </select>
                </div>

                {/* Attachments Upload */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                    Attachments
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center gap-1.5 px-3 py-2 border border-border border-dashed rounded-lg bg-white/10 dark:bg-black/10 hover:bg-white/20 text-xs text-foreground/60 hover:text-foreground cursor-pointer transition-all duration-150">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          <span>Attach File</span>
                        </>
                      )}
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="sr-only"
                        disabled={isUploading || isSubmitting}
                      />
                    </label>
                  </div>

                  {attachmentsList.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {attachmentsList.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/20 dark:bg-black/20 border border-border text-xs text-foreground"
                        >
                          <span className="truncate pr-4 flex items-center gap-1">
                            <Paperclip className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
                            <span className="truncate">{att.name}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="p-1 text-foreground/40 hover:text-red-500 cursor-pointer shrink-0"
                            disabled={isSubmitting}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Task</span>
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
