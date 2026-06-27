import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Timetable from "@/models/Timetable";
import Assignment from "@/models/Assignment";
import Attendance from "@/models/Attendance";
import Notice from "@/models/Notice";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/authHelper";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // 1. Get current day of week
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
    const today = daysOfWeek[new Date().getDay()];

    // 2. Query today's classes
    const classesToday = await Timetable.find({ userId: user._id, day: today }).sort({ startTime: 1 });

    // 3. Query due assignments count (Todo, In Progress)
    const dueAssignmentsCount = await Assignment.countDocuments({
      userId: user._id,
      status: { $in: ["Todo", "In Progress"] },
    });

    const upcomingAssignments = await Assignment.find({
      userId: user._id,
      status: { $in: ["Todo", "In Progress"] },
    })
      .sort({ dueDate: 1 })
      .limit(3);

    // 4. Query recent notices
    const recentNotices = await Notice.find({})
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(3);

    // 5. Calculate attendance overall percentage
    const attendanceLogs = await Attendance.find({ userId: user._id });
    const stats: Record<string, { present: number; total: number }> = {};
    attendanceLogs.forEach((log) => {
      const subj = log.subject;
      if (!stats[subj]) {
        stats[subj] = { present: 0, total: 0 };
      }
      if (log.status === "Present") {
        stats[subj].present++;
        stats[subj].total++;
      } else if (log.status === "Absent") {
        stats[subj].total++;
      }
    });

    let totalPresent = 0;
    let totalClasses = 0;
    Object.values(stats).forEach((s) => {
      totalPresent += s.present;
      totalClasses += s.total;
    });

    const attendancePercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    // 6. Query recent notifications
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // 7. Assemble dashboard metrics
    return NextResponse.json({
      metrics: {
        attendancePercentage,
        dueAssignmentsCount,
        noticesCount: recentNotices.length,
        totalClassesToday: classesToday.length,
      },
      classesToday,
      upcomingAssignments,
      recentNotices,
      notifications,
    }, { status: 200 });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
