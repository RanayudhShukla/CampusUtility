import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getCurrentUser } from "@/lib/authHelper";
import { ProfileUpdateSchema } from "@/schemas/validation";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ProfileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { name, email, phone, department, semester, skills, bio, avatar, password } = parsed.data;

    await dbConnect();

    // Check if email is updated and unique
    if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const emailTaken = await User.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return NextResponse.json({ error: "Email is already taken" }, { status: 400 });
      }
      currentUser.email = email.toLowerCase();
    }

    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.department = department;
    currentUser.semester = semester;
    currentUser.skills = skills;
    currentUser.bio = bio;
    
    if (avatar) {
      currentUser.avatar = avatar;
    }

    if (password && password.trim() !== "") {
      currentUser.passwordHash = await bcrypt.hash(password, 10);
    }

    await currentUser.save();

    const userResponse = {
      _id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      phone: currentUser.phone,
      department: currentUser.department,
      semester: currentUser.semester,
      skills: currentUser.skills,
      bio: currentUser.bio,
      avatar: currentUser.avatar,
    };

    return NextResponse.json({ user: userResponse }, { status: 200 });
  } catch (error) {
    console.error("Profile update PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
