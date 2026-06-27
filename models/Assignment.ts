import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttachment {
  name: string;
  url: string;
  size?: number;
}

export interface IAssignment extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  priority: "High" | "Medium" | "Low";
  status: "Todo" | "In Progress" | "Completed";
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number },
});

const AssignmentSchema: Schema<IAssignment> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    status: { type: String, enum: ["Todo", "In Progress", "Completed"], default: "Todo" },
    attachments: { type: [AttachmentSchema], default: [] },
  },
  { timestamps: true }
);

const Assignment: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>("Assignment", AssignmentSchema);
export default Assignment;
