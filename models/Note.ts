import mongoose, { Schema, Document, Model } from "mongoose";

export interface INoteAttachment {
  name: string;
  url: string;
  size?: number;
}

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  folder: string; // Folder name
  isPinned: boolean;
  attachments: INoteAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const NoteAttachmentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  size: { type: Number },
});

const NoteSchema: Schema<INote> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    folder: { type: String, default: "General", trim: true },
    isPinned: { type: Boolean, default: false },
    attachments: { type: [NoteAttachmentSchema], default: [] },
  },
  { timestamps: true }
);

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
export default Note;
