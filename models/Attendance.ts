import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  date: Date;
  status: "Present" | "Absent" | "Canceled";
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema<IAttendance> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Present", "Absent", "Canceled"], default: "Present" },
  },
  { timestamps: true }
);

// Compiling index for faster aggregations
AttendanceSchema.index({ userId: 1, subject: 1 });
AttendanceSchema.index({ userId: 1, date: 1 });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
export default Attendance;
