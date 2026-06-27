"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema } from "@/schemas/validation";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import Link from "next/link";
import { GraduationCap, Lock, Mail, User, Phone, BookOpen, Layers, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type SignupFormValues = z.infer<typeof SignupSchema>;

export default function SignupPage() {
  const { signup } = useAuth();
  const [showOptional, setShowOptional] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      phone: "",
      department: "",
      semester: 1,
      skills: [],
      bio: "",
    },
  });

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

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    setGeneralError(null);
    const result = await signup(values);
    setIsLoading(false);
    if (!result.success) {
      setGeneralError(result.error || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-tr from-slate-100 via-slate-50 to-teal-50/30 dark:from-[#0B0F19] dark:via-[#111827] dark:to-teal-950/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Brand Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 rounded-2xl bg-primary text-white mb-2 shadow-lg shadow-primary/20">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="font-heading font-bold text-3xl text-foreground">Create Account</h2>
          <p className="text-sm text-foreground/50 mt-1">Get started with Smart Campus Utility</p>
        </div>

        {/* Signup Card */}
        <div className="glass-card shadow-2xl p-8 border border-border">
          {generalError && (
            <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  {...register("name")}
                  className={`w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                    errors.name ? "border-red-500 ring-red-500/20" : ""
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 font-medium mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@university.edu"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                    errors.email ? "border-red-500 ring-red-500/20" : ""
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 font-medium mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                Password
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
                  className={`w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                    errors.password ? "border-red-500 ring-red-500/20" : ""
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Role / Account Type */}
            <div>
              <label className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center justify-center p-3 rounded-lg border border-border bg-white/20 dark:bg-black/10 cursor-pointer select-none hover:bg-white/40 dark:hover:bg-black/20 transition-all [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                  <input
                    type="radio"
                    value="student"
                    {...register("role")}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-semibold text-foreground">Student</span>
                </label>
                <label className="flex items-center justify-center p-3 rounded-lg border border-border bg-white/20 dark:bg-black/10 cursor-pointer select-none hover:bg-white/40 dark:hover:bg-black/20 transition-all [&:has(input:checked)]:border-primary [&:has(input:checked)]:bg-primary/5">
                  <input
                    type="radio"
                    value="admin"
                    {...register("role")}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-semibold text-foreground">Campus Staff / Admin</span>
                </label>
              </div>
            </div>

            {/* Expandable Optional Profile Details */}
            <div className="border-t border-border/80 pt-4 mt-2">
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="w-full flex items-center justify-between text-xs font-semibold text-foreground/60 hover:text-foreground cursor-pointer transition-colors focus:outline-none"
              >
                <span>OPTIONAL PROFILE DETAILS</span>
                {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              <AnimatePresence>
                {showOptional && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-4">
                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                            <Phone className="h-4 w-4" />
                          </span>
                          <input
                            id="phone"
                            type="text"
                            placeholder="+1 (555) 019-2834"
                            {...register("phone")}
                            className="w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Department & Semester */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="department" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                            Department
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                              <BookOpen className="h-4 w-4" />
                            </span>
                            <input
                              id="department"
                              type="text"
                              placeholder="Computer Science"
                              {...register("department")}
                              className="w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="semester" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                            Semester
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
                              className="w-full pl-10 pr-4 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label htmlFor="bio" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                          Brief Bio
                        </label>
                        <textarea
                          id="bio"
                          placeholder="Tell us about yourself..."
                          rows={2}
                          {...register("bio")}
                          className="w-full px-4 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30 resize-none"
                          disabled={isLoading}
                        />
                      </div>

                      {/* Skills Tags */}
                      <div>
                        <label htmlFor="skills" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-1.5">
                          Skills (Press Enter to add tag)
                        </label>
                        <input
                          id="skills"
                          type="text"
                          placeholder="Java, React, SQL..."
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleAddSkill}
                          className="w-full px-4 py-2 glass-input text-foreground text-sm placeholder:text-foreground/30"
                          disabled={isLoading}
                        />
                        {skillsWatch.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {skillsWatch.map((s) => (
                              <span
                                key={s}
                                className="flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary dark:text-teal-400 px-2 py-0.5 rounded-full"
                              >
                                <span>{s}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(s)}
                                  className="hover:text-red-500 font-bold cursor-pointer"
                                  disabled={isLoading}
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          {/* Footnotes */}
          <div className="mt-6 text-center text-xs text-foreground/50 border-t border-border/80 pt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary dark:text-teal-400 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
