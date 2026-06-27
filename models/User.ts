import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  department?: string;
  semester?: number;
  skills?: string[];
  bio?: string;
  avatar?: string;
  role: "student" | "admin";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: "" },
    department: { type: String, default: "" },
    semester: { type: Number, default: 1 },
    skills: { type: [String], default: [] },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Prevent compiling model multiple times
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
