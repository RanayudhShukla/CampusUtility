import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotice extends Document {
  title: string;
  content: string;
  category: "Academic" | "Exam" | "Event" | "Holiday" | "Placement" | "General";
  authorId: mongoose.Types.ObjectId; // References User (usually admin)
  authorName: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema: Schema<INotice> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
      type: String,
      enum: ["Academic", "Exam", "Event", "Holiday", "Placement", "General"],
      default: "General",
    },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notice: Model<INotice> = mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);
export default Notice;
