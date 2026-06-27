"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas/validation";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import Link from "next/link";
import { GraduationCap, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setGeneralError(null);
    const result = await login(values);
    setIsLoading(false);
    if (!result.success) {
      setGeneralError(result.error || "Invalid email or password");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-tr from-slate-100 via-slate-50 to-teal-50/30 dark:from-[#0B0F19] dark:via-[#111827] dark:to-teal-950/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Brand/Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-primary text-white mb-3 shadow-lg shadow-primary/20">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="font-heading font-bold text-3xl text-foreground">Welcome Back</h2>
          <p className="text-sm text-foreground/50 mt-1">Sign in to your Smart Campus account</p>
        </div>

        {/* Login Card */}
        <div className="glass-card shadow-2xl p-8 border border-border">
          {generalError && (
            <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-2">
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
                  className={`w-full pl-10 pr-4 py-2.5 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                    errors.email ? "border-red-500 ring-red-500/20" : ""
                  }`}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 font-medium mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-primary dark:text-teal-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full pl-10 pr-10 py-2.5 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
                    errors.password ? "border-red-500 ring-red-500/20" : ""
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground cursor-pointer focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register("rememberMe")}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 bg-transparent cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs text-foreground/70 select-none cursor-pointer">
                Remember my login credentials
              </label>
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
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footnotes */}
          <div className="mt-8 text-center text-xs text-foreground/50 border-t border-border/80 pt-6">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-primary dark:text-teal-400 hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
