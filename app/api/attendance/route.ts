import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Attendance from "@/models/Attendance";
import { getCurrentUser } from "@/lib/authHelper";
import { AttendanceSchema } from "@/schemas/validation";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch all logs
    const logs = await Attendance.find({ userId: user._id }).sort({ date: -1 });

    // Calculate analytics
    const subjectStats: Record<string, { present: number; absent: number; canceled: number; total: number }> = {};
    const monthlyStats: Record<string, { present: number; absent: number; total: number }> = {};

    logs.forEach((log) => {
      // 1. Subject Stats
      const subj = log.subject;
      if (!subjectStats[subj]) {
        subjectStats[subj] = { present: 0, absent: 0, canceled: 0, total: 0 };
      }

      if (log.status === "Present") {
        subjectStats[subj].present++;
        subjectStats[subj].total++;
      } else if (log.status === "Absent") {
        subjectStats[subj].absent++;
        subjectStats[subj].total++;
      } else if (log.status === "Canceled") {
        subjectStats[subj].canceled++;
      }

      // 2. Monthly Stats
      const dateObj = new Date(log.date);
      // Format as YYYY-MM
      const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { present: 0, absent: 0, total: 0 };
      }

      if (log.status === "Present") {
        monthlyStats[monthKey].present++;
        monthlyStats[monthKey].total++;
      } else if (log.status === "Absent") {
        monthlyStats[monthKey].absent++;
        monthlyStats[monthKey].total++;
      }
    });

    const subjectBreakdown = Object.entries(subjectStats).map(([subject, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
      return {
        subject,
        ...stats,
        percentage,
      };
    });

    const monthlyBreakdown = Object.entries(monthlyStats).map(([month, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
      return {
        month, // e.g. "2026-06"
        ...stats,
        percentage,
      };
    }).sort((a, b) => a.month.localeCompare(b.month));

    // Calculate overall attendance percent
    let totalPresent = 0;
    let totalClasses = 0;
    Object.values(subjectStats).forEach((stats) => {
      totalPresent += stats.present;
      totalClasses += stats.total;
    });

    const overallPercentage = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0;

    return NextResponse.json({
      logs,
      analytics: {
        subjectBreakdown,
        monthlyBreakdown,
        overallPercentage,
        totalPresent,
        totalClasses,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const parsed = AttendanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { subject, date, status } = parsed.data;

    // Check if entry already exists on the same day for this user/subject
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let log = await Attendance.findOne({
      userId: user._id,
      subject,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (log) {
      log.status = status;
      await log.save();
    } else {
      log = await Attendance.create({
        userId: user._id,
        subject,
        date: new Date(date),
        status,
      });
    }

    return NextResponse.json({ log }, { status: 200 });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Attendance ID is required" }, { status: 400 });
    }

    await dbConnect();
    const deleted = await Attendance.findOneAndDelete({ _id: id, userId: user._id });

    if (!deleted) {
      return NextResponse.json({ error: "Attendance entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Attendance entry deleted" }, { status: 200 });
  } catch (error) {
    console.error("Attendance DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
