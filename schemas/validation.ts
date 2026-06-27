import { z } from "zod";

// --- AUTH SCHEMAS ---

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

export const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "admin"]),
  phone: z.string().optional(),
  department: z.string().optional(),
  semester: z.number().min(1).max(10),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// --- PROFILE SCHEMAS ---

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  department: z.string().optional(),
  semester: z.number().min(1).max(10),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

// --- TIMETABLE SCHEMAS ---

export const TimetableSchema = z.object({
  subject: z.string().min(2, "Subject name must be at least 2 characters"),
  teacher: z.string().min(2, "Teacher name must be at least 2 characters"),
  room: z.string().min(1, "Room/Lab location is required"),
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  startTime: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format"),
  endTime: z.string().regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color code"),
}).refine((data) => {
  const [startH, startM] = data.startTime.split(":").map(Number);
  const [endH, endM] = data.endTime.split(":").map(Number);
  return startH * 60 + startM < endH * 60 + endM;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

// --- ASSIGNMENT SCHEMAS ---

export const AssignmentSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
  dueDate: z.string().min(1, "Due date is required"),
  priority: z.enum(["High", "Medium", "Low"]),
  status: z.enum(["Todo", "In Progress", "Completed"]),
  attachments: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      size: z.number().optional(),
    })
  ),
});

// --- ATTENDANCE SCHEMAS ---

export const AttendanceSchema = z.object({
  subject: z.string().min(2, "Subject is required"),
  date: z.string().or(z.date()).transform((val) => new Date(val)),
  status: z.enum(["Present", "Absent", "Canceled"]).default("Present"),
});

export const NoticeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  category: z.enum(["Academic", "Exam", "Event", "Holiday", "Placement", "General"]),
  isPinned: z.boolean(),
});

// --- NOTE SCHEMAS ---

export const NoteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string(),
  folder: z.string().min(1, "Folder is required"),
  isPinned: z.boolean(),
  attachments: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
      size: z.number().optional(),
    })
  ),
});
