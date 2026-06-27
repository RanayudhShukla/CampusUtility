import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Timetable from "@/models/Timetable";
import { getCurrentUser } from "@/lib/authHelper";
import { TimetableSchema } from "@/schemas/validation";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const timetable = await Timetable.find({ userId: user._id });
    return NextResponse.json({ timetable }, { status: 200 });
  } catch (error) {
    console.error("Timetable GET error:", error);
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
    const parsed = TimetableSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { subject, teacher, room, day, startTime, endTime, color } = parsed.data;

    const newItem = await Timetable.create({
      userId: user._id,
      subject,
      teacher,
      room,
      day,
      startTime,
      endTime,
      color,
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Timetable POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Timetable Item ID is required" }, { status: 400 });
    }

    await dbConnect();
    const body = await request.json();
    const parsed = TimetableSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { subject, teacher, room, day, startTime, endTime, color } = parsed.data;

    const updatedItem = await Timetable.findOneAndUpdate(
      { _id: id, userId: user._id },
      { subject, teacher, room, day, startTime, endTime, color },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: "Timetable item not found" }, { status: 404 });
    }

    return NextResponse.json({ item: updatedItem }, { status: 200 });
  } catch (error) {
    console.error("Timetable PUT error:", error);
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
      return NextResponse.json({ error: "Timetable Item ID is required" }, { status: 400 });
    }

    await dbConnect();
    const deleted = await Timetable.findOneAndDelete({ _id: id, userId: user._id });

    if (!deleted) {
      return NextResponse.json({ error: "Timetable item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Timetable item deleted" }, { status: 200 });
  } catch (error) {
    console.error("Timetable DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
