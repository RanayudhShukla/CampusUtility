"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/shared/Header";
import { Plus, Check, X, AlertTriangle, Lightbulb, Clock, CheckCircle2, ChevronRight, Loader2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function AttendancePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mark Attendance Form state
  const [subjectInput, setSubjectInput] = useState("");
  const [statusInput, setStatusInput] = useState<"Present" | "Absent" | "Canceled">("Present");
  const [dateInput, setDateInput] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setAnalytics(data.analytics || null);
      }
    } catch (err) {
      console.error("Failed to load attendance data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectInput.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectInput.trim(),
          date: dateInput,
          status: statusInput,
        }),
      });

      if (res.ok) {
        fetchAttendance();
        setSubjectInput("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to mark attendance.");
      }
    } catch (err) {
      alert("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (subject: string, status: "Present" | "Absent" | "Canceled") => {
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          date: new Date().toISOString(),
          status,
        }),
      });

      if (res.ok) {
        fetchAttendance();
      }
    } catch (err) {
      console.error("Quick log failed:", err);
    }
  };

  const deleteLog = async (id: string) => {
    if (!confirm("Delete this log entry?")) return;
    try {
      const res = await fetch(`/api/attendance?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAttendance();
      }
    } catch (err) {
      console.error("Delete log failed:", err);
    }
  };

  // Math helper for skipping or attending insights (Target 75%)
  const getSubjectInsight = (present: number, total: number) => {
    if (total === 0) return { text: "No classes recorded yet.", status: "neutral" };
    const pct = Math.round((present / total) * 100);

    if (pct < 75) {
      // Need to attend consecutive classes
      // (P + x) / (T + x) >= 0.75 => x >= 3T - 4P
      const needed = Math.max(0, Math.ceil((0.75 * total - present) / 0.25));
      return {
        text: `Attend next ${needed} classes consecutively to reach 75%.`,
        status: "danger",
        needed,
      };
    } else {
      // Can skip consecutive classes
      // P / (T + y) >= 0.75 => 0.75y <= P - 0.75T => y <= (P - 0.75T) / 0.75
      const skippable = Math.max(0, Math.floor((present - 0.75 * total) / 0.75));
      return {
        text: skippable > 0
          ? `You can safely skip next ${skippable} classes.`
          : "Borderline. Do not skip any upcoming classes.",
        status: skippable > 0 ? "safe" : "warning",
        skippable,
      };
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Attendance Tracker" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  const overallPercent = analytics?.overallPercentage || 0;
  const totalClasses = analytics?.totalClasses || 0;
  const totalPresent = analytics?.totalPresent || 0;

  // Chart preparation
  const monthlyData = (analytics?.monthlyBreakdown || []).map((m: any) => ({
    name: new Date(m.month + "-02").toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
    rate: m.percentage,
  }));

  const subjectBreakdown = analytics?.subjectBreakdown || [];

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Attendance Tracker" />

      <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Row 1: Overall percentage card + marking quick logger */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Circular/Text Progress Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 border border-border flex items-center gap-6"
          >
            {/* Circular Gauge */}
            <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-primary dark:stroke-teal-400"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 48}
                  initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - overallPercent / 100) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-heading font-bold text-foreground">
                  {overallPercent}%
                </span>
                <span className="text-[10px] text-foreground/40 font-semibold uppercase">Overall</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-heading font-bold text-base text-foreground">Status Indicator</h3>
              <p className="text-xs text-foreground/60 leading-relaxed">
                You logged {analytics?.totalPresent} presence marks out of {analytics?.totalClasses} sessions.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {overallPercent >= 75 ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 rounded-full">
                    <Check className="h-3 w-3" />
                    <span>Meets Target (75%)</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Below Target (75%)</span>
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Mark Attendance Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-2 glass-card p-6 border border-border"
          >
            <h3 className="font-heading font-bold text-base text-foreground mb-4">Quick Logger</h3>
            <form onSubmit={handleMarkAttendance} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-1">
                <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full px-3 py-1.5 glass-input text-foreground text-xs placeholder:text-foreground/30"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  value={dateInput}
                  onChange={(e) => setDateInput(e.target.value)}
                  className="w-full px-3 py-1.5 glass-input text-foreground text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-foreground/50 uppercase tracking-wider mb-1.5">
                  Session Log Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value as any)}
                  className="w-full px-3 py-1.5 glass-input text-foreground text-xs bg-transparent"
                >
                  <option value="Present" className="bg-slate-900 text-white">Present</option>
                  <option value="Absent" className="bg-slate-900 text-white">Absent</option>
                  <option value="Canceled" className="bg-slate-900 text-white">Canceled</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <span>Record Attendance</span>
              </button>
            </form>
          </motion.div>
        </div>

        {/* Row 2: Graph Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly percentage line */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 border border-border flex flex-col"
          >
            <h4 className="font-heading font-bold text-base text-foreground mb-4">Monthly Analytics</h4>
            <div className="flex-1 min-h-[220px]">
              {monthlyData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-foreground/40">
                  Insufficient data to render monthly analytics.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ left: -25, top: 10 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(11, 15, 25, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="rate" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Semester Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-5 border border-border flex flex-col"
          >
            <h4 className="font-heading font-bold text-base text-foreground mb-4">Semester Graph Progress</h4>
            <div className="flex-1 min-h-[220px]">
              {monthlyData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-foreground/40">
                  Insufficient data to render semester progress.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ left: -25, top: 10 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F766E" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(11, 15, 25, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#0F766E" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>

        {/* Row 3: Subject Breakdown and Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Breakdown cards */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-heading font-bold text-base text-foreground">Subject-wise Attendance</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjectBreakdown.length === 0 ? (
                <div className="col-span-full py-16 text-center text-sm text-foreground/40 glass-card border border-border">
                  No subject records parsed yet. Use the logger above.
                </div>
              ) : (
                subjectBreakdown.map((item: any, index: number) => {
                  const ins = getSubjectInsight(item.present, item.total);
                  return (
                    <motion.div
                      key={item.subject}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-card p-5 border border-border flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h5 className="font-heading font-bold text-sm text-foreground truncate pr-2">
                            {item.subject}
                          </h5>
                          <span
                            className={`text-xs font-bold ${
                              item.percentage >= 75 ? "text-primary dark:text-teal-400" : "text-red-500"
                            }`}
                          >
                            {item.percentage}%
                          </span>
                        </div>

                        {/* Subject Progress Bar */}
                        <div className="w-full bg-white/20 dark:bg-black/20 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.percentage >= 75 ? "bg-primary dark:bg-teal-400" : "bg-red-500"
                            }`}
                            style={{ width: `${Math.min(100, item.percentage)}%` }}
                          />
                        </div>

                        <p className="text-[10px] text-foreground/50 mt-2">
                          Logged: {item.present} present, {item.absent} absent ({item.total} total)
                        </p>
                      </div>

                      {/* Log Action Increments */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                        <span className="text-[10px] text-foreground/40 font-semibold uppercase">Add Log Today</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleQuickStatusChange(item.subject, "Present")}
                            className="p-1 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500 border border-green-500/20 hover:text-white transition-colors cursor-pointer"
                            title="Present (+1)"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleQuickStatusChange(item.subject, "Absent")}
                            className="p-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 border border-red-500/20 hover:text-white transition-colors cursor-pointer"
                            title="Absent (+1)"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Insights Card list */}
          <div className="space-y-4">
            <h4 className="font-heading font-bold text-base text-foreground">Attendance Insights</h4>
            <div className="glass-card p-5 border border-border space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h5 className="font-heading font-bold text-sm text-foreground">Smart Insights</h5>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[300px] pr-1">
                {subjectBreakdown.length === 0 ? (
                  <p className="text-xs text-foreground/40 leading-relaxed">
                    Insight logs will appear once class lists are tracked.
                  </p>
                ) : (
                  subjectBreakdown.map((item: any) => {
                    const ins = getSubjectInsight(item.present, item.total);
                    return (
                      <div key={item.subject} className="text-xs leading-relaxed space-y-1">
                        <span className="font-semibold text-foreground block truncate">{item.subject}</span>
                        <div
                          className={`p-3 rounded-lg border flex gap-2 items-start ${
                            ins.status === "danger"
                              ? "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400"
                              : ins.status === "safe"
                              ? "bg-primary/5 border-primary/20 text-primary dark:text-teal-400"
                              : "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                          <span>{ins.text}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Detailed logs list history */}
        <div className="glass-card p-5 border border-border">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/60">
            <h4 className="font-heading font-bold text-base text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Logs History</span>
            </h4>
          </div>

          <div className="overflow-x-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-center py-6 text-foreground/40">No entries recorded in database.</p>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-foreground/50 font-bold uppercase tracking-wider">
                    <th className="py-2.5">Date</th>
                    <th>Subject</th>
                    <th>Log Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-foreground">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-medium">
                        {new Date(log.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="font-semibold text-foreground">{log.subject}</td>
                      <td>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === "Present"
                              ? "bg-green-500/10 text-green-500"
                              : log.status === "Absent"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => deleteLog(log._id)}
                          className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
