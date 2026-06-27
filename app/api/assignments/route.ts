import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Assignment from "@/models/Assignment";
import Notification from "@/models/Notification";
import { getCurrentUser } from "@/lib/authHelper";
import { AssignmentSchema } from "@/schemas/validation";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const sortBy = searchParams.get("sortBy") || "dueDate"; // "dueDate" or "priority"
    const order = searchParams.get("order") === "desc" ? -1 : 1;

    await dbConnect();
    
    const query: any = { userId: user._id };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    let assignmentsQuery = Assignment.find(query);

    if (sortBy === "dueDate") {
      assignmentsQuery = assignmentsQuery.sort({ dueDate: order });
    } else if (sortBy === "priority") {
      // In MongoDB we can't easily sort by custom enum order (High, Medium, Low) unless we aggregate.
      // We can sort by createdAt as fallback, then sort in JS code. We'll do sorting in endpoint.
    }

    const assignments = await assignmentsQuery;

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    console.error("Assignments GET error:", error);
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
    const parsed = AssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { title, description, dueDate, priority, status, attachments } = parsed.data;

    const newAssignment = await Assignment.create({
      userId: user._id,
      title,
      description,
      dueDate,
      priority,
      status,
      attachments,
    });

    // Create a notification for task creation
    await Notification.create({
      userId: user._id,
      title: "New Assignment Created",
      message: `Assignment "${title}" has been created. Due on ${new Date(dueDate).toLocaleDateString()}.`,
      link: `/assignments`,
      status: "unread",
    });

    return NextResponse.json({ assignment: newAssignment }, { status: 201 });
  } catch (error) {
    console.error("Assignments POST error:", error);
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
      return NextResponse.json({ error: "Assignment ID required" }, { status: 400 });
    }

    await dbConnect();
    const body = await request.json();
    const parsed = AssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { title, description, dueDate, priority, status, attachments } = parsed.data;

    const updated = await Assignment.findOneAndUpdate(
      { _id: id, userId: user._id },
      { title, description, dueDate, priority, status, attachments },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Trigger notification if marked completed
    if (status === "Completed") {
      await Notification.create({
        userId: user._id,
        title: "Assignment Completed",
        message: `Great job! You finished the assignment "${title}".`,
        link: `/assignments`,
        status: "unread",
      });
    }

    return NextResponse.json({ assignment: updated }, { status: 200 });
  } catch (error) {
    console.error("Assignments PUT error:", error);
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
      return NextResponse.json({ error: "Assignment ID required" }, { status: 400 });
    }

    await dbConnect();
    const deleted = await Assignment.findOneAndDelete({ _id: id, userId: user._id });

    if (!deleted) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Assignment deleted" }, { status: 200 });
  } catch (error) {
    console.error("Assignments DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
