"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordSchema } from "@/schemas/validation";
import { z } from "zod";
import Link from "next/link";
import { GraduationCap, Mail, ArrowLeft, Send, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type ForgotFormValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [demoToken, setDemoToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setDemoToken(null);
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        if (data.resetToken) {
          setDemoToken(data.resetToken);
        }
      } else {
        setErrorMsg(data.error || "Failed to submit request.");
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h2 className="font-heading font-bold text-3xl text-foreground">Reset Password</h2>
          <p className="text-sm text-foreground/50 mt-1">We'll help you get back in</p>
        </div>

        {/* Card */}
        <div className="glass-card shadow-2xl p-8 border border-border">
          {errorMsg && (
            <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-accent" />
              </div>
              <div className="space-y-2">
                <h3 className="font-heading font-bold text-xl text-foreground">Request Received</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{successMsg}</p>
              </div>

              {demoToken && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl space-y-3">
                  <p className="text-xs text-primary dark:text-teal-400 font-semibold leading-relaxed">
                    [Developer Mode / Demonstration Option]
                  </p>
                  <p className="text-[11px] text-foreground/60 leading-relaxed">
                    A mock token has been generated. You can click below to simulate clicking an email password link:
                  </p>
                  <Link
                    href={`/reset-password?token=${demoToken}`}
                    className="inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>Simulate Reset Link</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}

              <div className="border-t border-border/80 pt-4 mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary dark:text-teal-400 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <p className="text-xs text-foreground/60 leading-relaxed">
                Enter your registered email address below, and we will simulate generating a secure verification path.
              </p>

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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer focus:outline-none disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              <div className="text-center border-t border-border/80 pt-4 mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary dark:text-teal-400 hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
