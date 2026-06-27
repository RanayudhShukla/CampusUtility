"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/shared/Header";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileUpdateSchema } from "@/schemas/validation";
import { z } from "zod";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  Layers,
  Award,
  Upload,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

type ProfileFormValues = z.infer<typeof ProfileUpdateSchema>;

export default function ProfilePage() {
  const { user, updateUser, refreshUser } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      department: user?.department || "",
      semester: user?.semester || 1,
      skills: user?.skills || [],
      bio: user?.bio || "",
      avatar: user?.avatar || "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatar || "");
      setValue("name", user.name);
      setValue("email", user.email);
      setValue("phone", user.phone || "");
      setValue("department", user.department || "");
      setValue("semester", user.semester || 1);
      setValue("skills", user.skills || []);
      setValue("bio", user.bio || "");
      setValue("avatar", user.avatar || "");
    }
  }, [user]);

  const skillsWatch = watch("skills") || [];
  const [skillInput, setSkillInput] = useState("");

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skillsWatch.includes(skillInput.trim())) {
        setValue("skills", [...skillsWatch, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setValue(
      "skills",
      skillsWatch.filter((s) => s !== skillToRemove)
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setAvatarUrl(data.url);
        setValue("avatar", data.url);
        setSuccessMsg("Photo uploaded. Save profile to apply changes.");
      } else {
        setErrorMsg(data.error || "Failed to upload photo.");
      }
    } catch (err) {
      setErrorMsg("Upload error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (res.ok) {
        updateUser(data.user);
        setSuccessMsg("Profile updated successfully!");
        refreshUser();
      } else {
        setErrorMsg(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Profile Settings" />

      <div className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 border border-border flex flex-col sm:flex-row items-center gap-6"
        >
          {/* Profile photo uploader */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary dark:text-teal-400 font-heading text-3xl font-bold uppercase overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
              ) : (
                user?.name.charAt(0)
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 p-2 rounded-full bg-primary hover:bg-primary-hover text-white cursor-pointer shadow shadow-black/20 hover:scale-105 transition-transform flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <input
                type="file"
                onChange={handlePhotoUpload}
                className="sr-only"
                disabled={isUploading || isSaving}
              />
            </label>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h3 className="font-heading font-bold text-xl text-foreground">{user?.name}</h3>
            <p className="text-xs text-foreground/50 capitalize font-medium">{user?.role} Account</p>
            <p className="text-[10px] text-foreground/40 bg-white/20 dark:bg-black/20 border border-border/80 px-2 py-0.5 rounded inline-block">
              UID: {user?._id}
            </p>
          </div>
        </motion.div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Settings Form Grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 sm:p-8 border border-border"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-foreground/75 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    {...register("name")}
                    className="w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-foreground/75 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-xs font-bold text-foreground/75 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    id="phone"
                    type="text"
                    {...register("phone")}
                    className="w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-xs font-bold text-foreground/75 uppercase tracking-wider mb-2">
                  Academic Department
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <input
                    id="department"
                    type="text"
                    {...register("department")}
                    className="w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Semester */}
              <div>
                <label htmlFor="semester" className="block text-xs font-bold text-foreground/75 uppercase tracking-wider mb-2">
                  Active Semester
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                    <Layers className="h-4 w-4" />
                  </span>
                  <input
                    id="semester"
                    type="number"
                    min={1}
                    max={10}
                    {...register("semester", { valueAsNumber: true })}
                    className="w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Password update */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-foreground/75 uppercase tracking-wider mb-2">
                  Change Password (Leave blank to keep current)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-xs font-bold text-foreground/75 uppercase tracking-wider mb-2">
                Short Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                {...register("bio")}
                className="w-full px-4 py-2 glass-input text-foreground text-sm resize-none"
                placeholder="Brief summary..."
                disabled={isSaving}
              />
            </div>

            {/* Skills */}
            <div>
              <label htmlFor="skills" className="block text-xs font-bold text-foreground/75 uppercase tracking-wider mb-2">
                Skills / Competencies (Press Enter to add tag)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                  <Award className="h-4 w-4" />
                </span>
                <input
                  id="skills"
                  type="text"
                  placeholder="Python, Java, Data Analysis..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  className="w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm"
                  disabled={isSaving}
                />
              </div>

              {skillsWatch.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skillsWatch.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary dark:text-teal-400 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="hover:text-red-500 font-bold cursor-pointer"
                        disabled={isSaving}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border/80 pt-6 mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg shadow shadow-primary/10 flex items-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
