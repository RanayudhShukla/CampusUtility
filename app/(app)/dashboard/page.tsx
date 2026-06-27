"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/shared/Header";
import { useAuth } from "@/hooks/useAuth";
import {
  Calendar,
  ClipboardList,
  CheckSquare,
  Megaphone,
  ChevronRight,
  TrendingUp,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

interface DashboardData {
  metrics: {
    attendancePercentage: number;
    dueAssignmentsCount: number;
    noticesCount: number;
    totalClassesToday: number;
  };
  classesToday: any[];
  upcomingAssignments: any[];
  recentNotices: any[];
  notifications: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const result = await res.json();
        setData(result);
        
        // Fetch detailed attendance for chart
        const attRes = await fetch("/api/attendance");
        if (attRes.ok) {
          const attData = await attRes.json();
          if (attData.analytics && attData.analytics.subjectBreakdown) {
            setChartData(
              attData.analytics.subjectBreakdown.map((item: any) => ({
                name: item.subject,
                percentage: item.percentage,
              }))
            );
          }
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header title="Dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    attendancePercentage: 0,
    dueAssignmentsCount: 0,
    noticesCount: 0,
    totalClassesToday: 0,
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Dashboard" />
      
      <div className="flex-1 p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-card border border-border"
        >
          <div>
            <h3 className="font-heading font-bold text-2xl text-foreground">
              {getGreeting()}, {user?.name}!
            </h3>
            <p className="text-sm text-foreground/60 mt-1">
              Here is what is happening on your campus today.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary dark:text-teal-400 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/10">
            <TrendingUp className="h-4 w-4" />
            <span>Semester {user?.semester || 1} • {user?.department || "General"}</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Attendance",
              value: `${metrics.attendancePercentage}%`,
              link: "/attendance",
              desc: "Overall percentage",
              icon: CheckSquare,
              color: "text-teal-600 dark:text-teal-400",
              bgColor: "bg-teal-500/10",
            },
            {
              title: "Tasks Due",
              value: metrics.dueAssignmentsCount,
              link: "/assignments",
              desc: "Pending assignments",
              icon: ClipboardList,
              color: "text-amber-600 dark:text-amber-400",
              bgColor: "bg-amber-500/10",
            },
            {
              title: "Class Schedule",
              value: metrics.totalClassesToday,
              link: "/timetable",
              desc: "Classes scheduled today",
              icon: Calendar,
              color: "text-primary dark:text-teal-400",
              bgColor: "bg-primary/10",
            },
            {
              title: "Notices Feed",
              value: metrics.noticesCount,
              link: "/notices",
              desc: "Recent updates posted",
              icon: Megaphone,
              color: "text-green-600 dark:text-green-400",
              bgColor: "bg-green-500/10",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card glass-card-hover p-4 sm:p-5 border border-border flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">
                  {item.title}
                </span>
                <div className={`p-1.5 rounded-lg ${item.bgColor} ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
                  {item.value}
                </span>
                <p className="text-[10px] sm:text-xs text-foreground/40 mt-1">{item.desc}</p>
              </div>
              <Link
                href={item.link}
                className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-primary dark:text-teal-400 hover:underline cursor-pointer"
              >
                <span>View Details</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Dynamic content grid: charts, schedules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-card p-5 border border-border flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-heading font-bold text-base text-foreground">Attendance Analytics</h4>
                <p className="text-xs text-foreground/50 mt-0.5">Subject-wise attendance tracker comparison</p>
              </div>
            </div>
            <div className="flex-1 min-h-[250px] w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-foreground/40 text-sm gap-2">
                  <AlertCircle className="h-8 w-8 text-foreground/20" />
                  <p>No attendance records logged.</p>
                  <p className="text-xs text-foreground/30">Go to Attendance page to log class checks.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      className="fill-foreground/60"
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      className="fill-foreground/60"
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(15, 118, 110, 0.05)" }}
                      contentStyle={{
                        background: "rgba(11, 15, 25, 0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "#ffffff", fontWeight: "bold", fontSize: "12px" }}
                      itemStyle={{ color: "#14B8A6", fontSize: "12px" }}
                      formatter={(value: any) => [`${value}%`, "Attendance"]}
                    />
                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.percentage >= 75 ? "#14B8A6" : "#EF4444"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          {/* Today's Schedule Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-5 border border-border flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-heading font-bold text-base text-foreground">Today's Classes</h4>
                <p className="text-xs text-foreground/50 mt-0.5">Your timetable for today</p>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 dark:text-teal-400 px-2 py-0.5 rounded">
                {new Date().toLocaleDateString(undefined, { weekday: "long" })}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {data?.classesToday.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-foreground/40 text-sm py-12 gap-2">
                  <Clock className="h-8 w-8 text-foreground/20" />
                  <p>No classes scheduled today.</p>
                  <p className="text-xs text-foreground/30">Enjoy your free time!</p>
                </div>
              ) : (
                data?.classesToday.map((c: any) => (
                  <div
                    key={c._id}
                    className="p-3.5 rounded-xl border border-border/80 bg-white/20 dark:bg-black/10 flex items-start gap-3 hover:border-primary/20 transition-all duration-200"
                  >
                    <div className="w-1.5 h-12 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground">{c.subject}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        <span className="flex items-center gap-1 text-[10px] text-foreground/50">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{c.startTime} - {c.endTime}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-foreground/50">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{c.room}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-foreground/50">
                          <User className="h-3 w-3 shrink-0" />
                          <span>{c.teacher}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Row 3: Upcoming Tasks and Notice Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Assignments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5 border border-border flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-bold text-base text-foreground">Upcoming Assignments</h4>
              <Link href="/assignments" className="text-xs font-semibold text-primary dark:text-teal-400 hover:underline">
                View All
              </Link>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {data?.upcomingAssignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 text-sm text-foreground/40 gap-2">
                  <ClipboardList className="h-8 w-8 text-foreground/20" />
                  <p>No upcoming assignments.</p>
                </div>
              ) : (
                data?.upcomingAssignments.map((a: any) => (
                  <div
                    key={a._id}
                    className="p-3.5 rounded-xl border border-border bg-white/20 dark:bg-black/10 flex items-center justify-between gap-3 hover:border-primary/20 transition-all duration-200"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground">{a.title}</p>
                      <p className="text-[10px] text-foreground/40 mt-1">
                        Due: {new Date(a.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border shrink-0 ${
                          a.priority === "High"
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : a.priority === "Medium"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-green-500/10 text-green-500 border-green-500/20"
                        }`}
                      >
                        {a.priority}
                      </span>
                      <span className="text-[10px] font-semibold bg-primary/10 text-primary dark:text-teal-400 px-2 py-0.5 rounded border border-primary/10 shrink-0">
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Recent Notices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-5 border border-border flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-heading font-bold text-base text-foreground">Notice Board Pinned</h4>
              <Link href="/notices" className="text-xs font-semibold text-primary dark:text-teal-400 hover:underline">
                View Feed
              </Link>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {data?.recentNotices.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 text-sm text-foreground/40 gap-2">
                  <Megaphone className="h-8 w-8 text-foreground/20" />
                  <p>No active notices posted.</p>
                </div>
              ) : (
                data?.recentNotices.map((n: any) => (
                  <div
                    key={n._id}
                    className="p-3.5 rounded-xl border border-border bg-white/20 dark:bg-black/10 flex flex-col hover:border-primary/20 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold uppercase bg-primary/20 text-primary dark:text-teal-400 px-2 py-0.5 rounded">
                        {n.category}
                      </span>
                      <span className="text-[10px] text-foreground/40">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="text-sm font-semibold text-foreground mt-2 truncate">{n.title}</h5>
                    <p className="text-xs text-foreground/60 mt-1 line-clamp-2 leading-relaxed">
                      {n.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
