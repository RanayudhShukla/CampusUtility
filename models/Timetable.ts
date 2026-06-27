import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITimetable extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  teacher: string;
  room: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  color: string;     // Hex color code
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema: Schema<ITimetable> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true },
    teacher: { type: String, required: true, trim: true },
    room: { type: String, required: true, trim: true },
    day: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    color: { type: String, default: "#0F766E" },
  },
  { timestamps: true }
);

const Timetable: Model<ITimetable> =
  mongoose.models.Timetable || mongoose.model<ITimetable>("Timetable", TimetableSchema);
export default Timetable;
