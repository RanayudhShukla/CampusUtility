import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import dbConnect from "./dbConnect";
import User, { IUser } from "@/models/User";

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    await dbConnect();
    const user = await User.findById(payload.userId);
    return user || null;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}
