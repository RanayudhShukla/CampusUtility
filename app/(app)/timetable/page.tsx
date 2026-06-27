"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/shared/Header";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimetableSchema } from "@/schemas/validation";
import { z } from "zod";
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, User, Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TimetableFormValues = z.infer<typeof TimetableSchema>;

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const COLOR_PRESETS = [
  "#0F766E", // Teal
  "#14B8A6", // Turquoise
  "#22C55E", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Orange
  "#EF4444", // Red
];

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDayTab, setSelectedDayTab] = useState<string>("Monday");
  const [activeView, setActiveView] = useState<"daily" | "weekly">("daily");

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<TimetableFormValues>({
    resolver: zodResolver(TimetableSchema),
    defaultValues: {
      subject: "",
      teacher: "",
      room: "",
      day: "Monday",
      startTime: "09:00",
      endTime: "10:00",
      color: "#0F766E",
    },
  });

  const selectedColor = watch("color");

  const fetchTimetable = async () => {
    try {
      const res = await fetch("/api/timetable");
      if (res.ok) {
        const data = await res.json();
        setTimetable(data.timetable || []);
      }
    } catch (err) {
      console.error("Failed to load timetable:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setSubmitError(null);
    reset({
      subject: "",
      teacher: "",
      room: "",
      day: selectedDayTab as any,
      startTime: "09:00",
      endTime: "10:00",
      color: COLOR_PRESETS[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setSubmitError(null);
    reset({
      subject: item.subject,
      teacher: item.teacher,
      room: item.room,
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      color: item.color,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values: TimetableFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const url = editingItem ? `/api/timetable?id=${editingItem._id}` : "/api/timetable";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        fetchTimetable();
      } else {
        setSubmitError(data.error || "Failed to save timetable entry.");
      }
    } catch (err) {
      setSubmitError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule entry?")) return;
    try {
      const res = await fetch(`/api/timetable?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTimetable();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete.");
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    }
  };

  // Filter items based on search query
  const filteredTimetable = timetable.filter((item) => {
    const matchSearch =
      item.subject.toLowerCase().includes(search.toLowerCase()) ||
      item.teacher.toLowerCase().includes(search.toLowerCase()) ||
      item.room.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const getSortedDayItems = (day: string) => {
    return filteredTimetable
      .filter((item) => item.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Timetable Scheduler" />

      <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <input
                type="text"
                placeholder="Search subject, room, teacher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* View Toggle */}
            <div className="bg-white/20 dark:bg-black/20 p-1 rounded-lg border border-border flex">
              <button
                onClick={() => setActiveView("daily")}
                className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                  activeView === "daily" ? "bg-primary text-white" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                Daily Tabs
              </button>
              <button
                onClick={() => setActiveView("weekly")}
                className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-all ${
                  activeView === "weekly" ? "bg-primary text-white" : "text-foreground/60 hover:text-foreground"
                }`}
              >
                Weekly Grid
              </button>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shadow-md shadow-primary/10 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Class</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : activeView === "daily" ? (
          /* Daily tabs view */
          <div className="space-y-6">
            {/* Day Selectors */}
            <div className="flex overflow-x-auto pb-1 gap-2 scrollbar-none">
              {DAYS_OF_WEEK.map((day) => {
                const count = timetable.filter((item) => item.day === day).length;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDayTab(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shrink-0 border transition-all ${
                      selectedDayTab === day
                        ? "bg-primary/10 border-primary text-primary dark:text-teal-400 font-bold"
                        : "bg-white/20 dark:bg-black/10 border-border hover:bg-white/30 dark:hover:bg-white/5 text-foreground/70"
                    }`}
                  >
                    <span>{day}</span>
                    {count > 0 && (
                      <span className="ml-1.5 bg-primary/20 text-primary dark:text-teal-400 text-[10px] px-1.5 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* List of classes for active day */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getSortedDayItems(selectedDayTab).length === 0 ? (
                <div className="col-span-full py-16 text-center text-sm text-foreground/40 glass-card border border-border flex flex-col items-center justify-center gap-2">
                  <Calendar className="h-10 w-10 text-foreground/20" />
                  <p>No classes scheduled for {selectedDayTab}.</p>
                  <button
                    onClick={openAddModal}
                    className="text-xs font-semibold text-primary dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Create schedule item
                  </button>
                </div>
              ) : (
                getSortedDayItems(selectedDayTab).map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-5 border border-border flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <h4 className="font-heading font-bold text-base text-foreground truncate">{item.subject}</h4>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-foreground/60 hover:text-primary dark:hover:text-teal-400 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-foreground/60 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 space-y-2 text-xs text-foreground/70">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-foreground/40 shrink-0" />
                        <span>{item.startTime} - {item.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-foreground/40 shrink-0" />
                        <span>Room {item.room}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-foreground/40 shrink-0" />
                        <span>{item.teacher}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Weekly Grid View */
          <div className="overflow-x-auto border border-border rounded-2xl glass-card">
            <div className="min-w-[800px] divide-y divide-border/60">
              {/* Day columns headers */}
              <div className="grid grid-cols-8 bg-white/20 dark:bg-black/10 py-3 text-center text-xs font-bold uppercase tracking-wider text-foreground/60">
                <div className="border-r border-border/40">Time</div>
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="border-r border-border/40 last:border-r-0">
                    {day.substring(0, 3)}
                  </div>
                ))}
              </div>

              {/* Rows */}
              <div className="divide-y divide-border/30">
                {["09:00", "10:00", "11:00", "12:00", "01:00", "02:00", "03:00", "04:00"].map((hour, rIdx) => (
                  <div key={hour} className="grid grid-cols-8 min-h-[80px]">
                    {/* Time Label */}
                    <div className="flex items-center justify-center border-r border-border/40 text-[11px] font-bold text-foreground/50 bg-white/10 dark:bg-black/5">
                      {hour}
                    </div>

                    {/* Day columns cells */}
                    {DAYS_OF_WEEK.map((day) => {
                      // Find if any class matches this day and hour
                      const matched = filteredTimetable.filter((item) => {
                        if (item.day !== day) return false;
                        const [itemHour] = item.startTime.split(":");
                        const [rowHour] = hour.split(":");
                        // handle basic 12-hour/24-hour hour comparisons
                        return parseInt(itemHour) === parseInt(rowHour);
                      });

                      return (
                        <div key={day} className="border-r border-border/40 last:border-r-0 p-1 flex flex-col gap-1 overflow-hidden relative">
                          {matched.map((item) => (
                            <div
                              key={item._id}
                              onClick={() => openEditModal(item)}
                              className="text-[10px] p-1.5 rounded-lg border text-white font-semibold cursor-pointer truncate h-full flex flex-col justify-between transition-all hover:scale-[1.02]"
                              style={{ backgroundColor: item.color, borderColor: `${item.color}80` }}
                              title={`${item.subject} (${item.startTime}-${item.endTime})`}
                            >
                              <div className="truncate font-bold leading-none">{item.subject}</div>
                              <div className="text-[8px] opacity-90 truncate leading-none mt-1">{item.room}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slide-up dialog/modal for adding/editing schedule entries */}
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
                  {editingItem ? "Edit Class Schedule" : "Add Class Schedule"}
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
                {/* Subject Name */}
                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                    Subject Name
                  </label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="Database Management Systems"
                    {...register("subject")}
                    className={`w-full px-3 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                      errors.subject ? "border-red-500 ring-red-500/20" : ""
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-xs text-red-500 font-medium mt-1">{errors.subject.message}</p>
                  )}
                </div>

                {/* Teacher Name */}
                <div>
                  <label htmlFor="teacher" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                    Instructor / Teacher Name
                  </label>
                  <input
                    id="teacher"
                    type="text"
                    placeholder="Prof. Sarah Jenkins"
                    {...register("teacher")}
                    className={`w-full px-3 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                      errors.teacher ? "border-red-500 ring-red-500/20" : ""
                    }`}
                  />
                  {errors.teacher && (
                    <p className="text-xs text-red-500 font-medium mt-1">{errors.teacher.message}</p>
                  )}
                </div>

                {/* Room Location */}
                <div>
                  <label htmlFor="room" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                    Room / Lab Location
                  </label>
                  <input
                    id="room"
                    type="text"
                    placeholder="Lab 3 / Room 402"
                    {...register("room")}
                    className={`w-full px-3 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                      errors.room ? "border-red-500 ring-red-500/20" : ""
                    }`}
                  />
                  {errors.room && (
                    <p className="text-xs text-red-500 font-medium mt-1">{errors.room.message}</p>
                  )}
                </div>

                {/* Day Select */}
                <div>
                  <label htmlFor="day" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                    Day of Week
                  </label>
                  <select
                    id="day"
                    {...register("day")}
                    className="w-full px-3 py-2 glass-input text-foreground text-sm bg-transparent"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d} className="bg-slate-900 text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Timings (Start Time, End Time) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startTime" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                      Start Time (HH:MM)
                    </label>
                    <input
                      id="startTime"
                      type="text"
                      placeholder="09:00"
                      {...register("startTime")}
                      className={`w-full px-3 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                        errors.startTime ? "border-red-500 ring-red-500/20" : ""
                      }`}
                    />
                    {errors.startTime && (
                      <p className="text-xs text-red-500 font-medium mt-1">{errors.startTime.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endTime" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                      End Time (HH:MM)
                    </label>
                    <input
                      id="endTime"
                      type="text"
                      placeholder="10:30"
                      {...register("endTime")}
                      className={`w-full px-3 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                        errors.endTime ? "border-red-500 ring-red-500/20" : ""
                      }`}
                    />
                    {errors.endTime && (
                      <p className="text-xs text-red-500 font-medium mt-1">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                {/* Color Labels */}
                <div>
                  <label className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-2">
                    Color Tag
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setValue("color", color)}
                        className="w-7 h-7 rounded-full border border-white/20 transition-transform hover:scale-110 flex items-center justify-center cursor-pointer shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === color && (
                          <span className="text-[10px] font-bold text-white">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Panel */}
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
                      <span>Save Entry</span>
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
