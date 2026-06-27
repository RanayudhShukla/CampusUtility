"use client";

import React, { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema } from "@/schemas/validation";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Lock, ArrowLeft, Key, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

type ResetFormValues = z.infer<typeof ResetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetFormValues) => {
    if (!token) {
      setErrorMsg("Reset token is missing. Please request a new link.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setErrorMsg(data.error || "Failed to update password.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-red-500 font-medium">Invalid or missing reset token.</p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary dark:text-teal-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Request New Reset Link</span>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-accent" />
        </div>
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-xl text-foreground">Password Updated</h3>
          <p className="text-sm text-foreground/75 leading-relaxed">
            Your password was changed successfully. Redirecting you to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {/* New Password */}
      <div>
        <label htmlFor="password" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-2">
          New Password
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
            className={`w-full pl-10 pr-4 py-2.5 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
              errors.password ? "border-red-500 ring-red-500/20" : ""
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 font-medium mt-1.5">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-foreground/75 uppercase tracking-wider mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40">
            <Lock className="h-4 w-4" />
          </span>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register("confirmPassword")}
            className={`w-full pl-10 pr-4 py-2.5 glass-input text-foreground text-sm placeholder:text-foreground/30 ${
              errors.confirmPassword ? "border-red-500 ring-red-500/20" : ""
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 font-medium mt-1.5">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer focus:outline-none disabled:opacity-70"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating Password...</span>
          </>
        ) : (
          <>
            <Key className="h-4 w-4" />
            <span>Update Password</span>
          </>
        )}
      </button>

      <div className="text-center border-t border-border/80 pt-4 mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary dark:text-teal-400 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign In</span>
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 bg-gradient-to-tr from-slate-100 via-slate-50 to-teal-50/30 dark:from-[#0B0F19] dark:via-[#111827] dark:to-teal-950/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-2xl bg-primary text-white mb-3 shadow-lg shadow-primary/20">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="font-heading font-bold text-3xl text-foreground">Set New Password</h2>
          <p className="text-sm text-foreground/50 mt-1">Choose a strong password</p>
        </div>

        {/* Card */}
        <div className="glass-card shadow-2xl p-8 border border-border">
          <Suspense
            fallback={
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
