import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { SignupSchema } from "@/schemas/validation";
import { signToken } from "@/lib/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { name, email, password, role, phone, department, semester, skills, bio } = parsed.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role,
      phone,
      department,
      semester,
      skills,
      bio,
    });

    const token = signToken({
      userId: (newUser._id as any).toString(),
      role: newUser.role,
      email: newUser.email,
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      department: newUser.department,
      semester: newUser.semester,
      skills: newUser.skills,
      bio: newUser.bio,
      avatar: newUser.avatar,
    };

    return NextResponse.json({ user: userResponse }, { status: 201 });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error?.message || String(error) 
    }, { status: 500 });
  }
}
