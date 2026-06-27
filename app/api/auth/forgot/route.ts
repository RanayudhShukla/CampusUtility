import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { ForgotPasswordSchema } from "@/schemas/validation";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const parsed = ForgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { email } = parsed.data;
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If that email exists in our system, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password reset link generated.",
      resetToken,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error?.message || String(error) 
    }, { status: 500 });
  }
}
