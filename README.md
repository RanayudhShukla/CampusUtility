# Smart Campus Utility App

A premium, production-ready full-stack Smart Campus Utility Web Application built from scratch using **Next.js (App Router)**, **React**, **TypeScript**, and **Tailwind CSS**. It is designed with a premium, responsive glassmorphic SaaS interface inspired by Vercel, Linear, Apple, and Notion.

## Features

1.  **JWT Authentication**: Secure user Signup, Login, Forgot Password, and Reset Password flows with password hashing and protected routing guards.
2.  **Interactive Dashboard**: Aggregated overview of student statistics (Attendance, Pending Tasks, Today's Classes, and Recent Announcements) backed by **Recharts** subject-wise attendance metrics.
3.  **Timetable Scheduler**: Flexible daily tabs and desktop weekly grid view for scheduler entries (schedules, instructors, color tags, rooms).
4.  **Assignment / Task Tracker**: Kanban Board style progress tracking (Todo, In Progress, Completed), drag-free progress updating, priority badges, and attachments upload.
5.  **Attendance Logger**: Quick session logs (Present, Absent, Canceled), detailed logs history, monthly/semester charts, and smart mathematical skipping/attendance analytics.
6.  **Notebook / Editor**: Evernote-style folder organizations, split-screen live markdown editor, LaTeX mathematical block equation formulas ($E=mc^2$), and file uploads.
7.  **Notice Board**: Category feeds, keyword searching, pinning options, and admin-restricted post creations.
8.  **Profile Settings**: Editable credentials, photo uploads, skill tag additions, and bios.
9.  **Real-Time Notifications**: Unread notifications indicators, dropdown logs, and dismissals.

---

## Tech Stack

*   **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts, Lucide React, React Hook Form, Zod.
*   **Backend**: Next.js API Routes (Route Handlers).
*   **Database**: MongoDB (via Mongoose).
*   **File Upload**: Cloudinary (with a robust local filesystem fallback).
*   **Auth**: JWT (stored in HttpOnly cookies), BcryptJS.

---

## Folder Structure

```txt
e:\week2/
├── app/                      # Next.js App Router Pages & API Routes
│   ├── (app)/                # Protected App Pages Route Group
│   │   ├── dashboard/        # Dashboard view page
│   │   ├── timetable/        # Timetable scheduling page
│   │   ├── assignments/      # Task tracking Kanban page
│   │   ├── attendance/       # Attendance logs & graphs page
│   │   ├── notices/          # Campus announcements page
│   │   ├── notes/            # Folder-based Markdown editor page
│   │   ├── profile/          # User profile settings page
│   │   └── layout.tsx        # Dashboard layout wrapping Sidebar & Navigation
│   ├── api/                  # RESTful API Endpoints
│   │   ├── auth/             # Login, Signup, Logout, Forgot, Reset
│   │   ├── dashboard/        # Summary aggregator details
│   │   ├── timetable/        # Timetable CRUD actions
│   │   ├── assignments/      # Assignment CRUD actions
│   │   ├── attendance/       # Attendance logs CRUD & statistics calculations
│   │   ├── notices/          # Notice board CRUD actions
│   │   ├── notes/            # Note notebook CRUD actions
│   │   ├── notifications/    # Notifications CRUD actions
│   │   └── upload/           # File upload controller (Cloudinary/Local)
│   ├── globals.css           # Custom theme colors and glassmorphism styling
│   ├── layout.tsx            # Global providers (Auth, Theme, Notifications)
│   └── page.tsx              # Root redirects handler (Server-side)
├── components/               # Custom reusable components
│   └── shared/               # Sidebar, Header, BottomNavbar, ThemeToggle, NotificationsDropdown
├── hooks/                    # Custom Context Providers & React hooks
│   ├── useAuth.tsx           # Authentication session context
│   ├── useTheme.tsx          # Light/Dark mode state context
│   └── useNotifications.tsx  # Alerts list state context
├── lib/                      # Common database connections & cryptographic utilities
│   ├── authHelper.ts         # User session validator helper
│   ├── dbConnect.ts          # Mongoose database client cache handler
│   └── jwt.ts                # JWT signature generator & verifier
├── models/                   # Mongoose DB Collections Schemas
├── schemas/                  # Zod validation resolver schemas
├── utils/                    # Global utility files
│   └── markdown.ts           # Custom markdown + LaTeX compiler
├── public/                   # Static files and local uploads folder
└── middleware.ts             # Edge-compatible protected route interceptor
```

---

## Installation & Setup

### 1. Prerequisites
Ensure you have **Node.js (v18.x or later)** and **MongoDB** running locally or a cloud database connection string.

### 2. Clone and Install Dependencies
Navigate to the root project folder:
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file at the root of the project:
```env
# MongoDB Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/smart-campus

# JWT Secret Key
JWT_SECRET=super_secret_signing_key_token_2026

# Optional: Cloudinary Credentials (if left empty, files automatically upload locally to public/uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Run Locally

To start the development server:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## API Documentation

All routes expect authentication cookies to be present in headers (automatically handled by the web browser).

### Authentication
*   `POST /api/auth/signup` - Register a new account.
*   `POST /api/auth/login` - Authenticate credentials and establish token cookie session.
*   `POST /api/auth/logout` - Clear token cookie.
*   `GET /api/auth/me` - Fetch details for the current logged-in user.
*   `POST /api/auth/forgot` - Request password reset (returns reset token in demo mode).
*   `POST /api/auth/reset` - Complete password reset verification.

### Core Utilities
*   `GET /api/dashboard` - Fetch aggregated stats, schedules, notices, and notifications.
*   `POST /api/upload` - Upload any assignment attachment or note files (multipart/form-data).
*   `GET /api/profile` | `PUT /api/profile` - Update user bio, department, semester, skills, and password.

### Features
*   `/api/timetable` - Timetable schedule CRUD operations.
*   `/api/assignments` - Task and assignment CRUD.
*   `/api/attendance` - Attendance logs logs and statistical aggregations.
*   `/api/notices` - Notice Board CRUD (Admin creation restricted).
*   `/api/notes` - Note notebook list, folder tags, and markdown files.
*   `/api/notifications` - Notifications history logs.

---

## Deployment Guide

### Deploying to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` from the root directory.
3. Configure the environment variables (`MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) in the Vercel Dashboard settings.
