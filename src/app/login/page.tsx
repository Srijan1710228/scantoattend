"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
        {label}
      </label>
      {children}
      {error && (
        <span className="text-xs text-brand-red font-medium">{error}</span>
      )}
    </div>
  );
}

const inputClass =
  "w-full bg-brand-black border border-brand-muted/30 text-brand-white px-4 py-3 rounded-lg text-sm font-sans focus:outline-none focus:border-brand-lime transition-colors placeholder:text-brand-muted/50";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        toast.success("Welcome back!");
        router.push("/member");
      } else {
        toast.error(resData.error || "Failed to log in.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <SectionWrapper
      withWatermark
      className="pt-20 md:pt-32 pb-20 min-h-[85vh] flex items-center justify-center"
    >
      <div className="relative w-full max-w-lg mx-auto bg-brand-black/40 backdrop-blur-md border border-brand-muted/20 p-8 rounded-2xl shadow-2xl flex flex-col gap-8 overflow-hidden group">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight mb-2 text-brand-white">
            Member Login
          </h1>
          <p className="text-brand-muted text-sm max-w-sm mx-auto">
            Log in to verify your identity and mark attendance.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Field label="Email Address *" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              className={inputClass}
              placeholder="srijan@example.com"
            />
          </Field>

          <Field label="Password *" error={errors.password?.message}>
            <input
              {...register("password")}
              type="password"
              className={inputClass}
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log In"}
            <Chevron className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="text-center text-xs text-brand-muted border-t border-brand-muted/15 pt-4">
          Need a member account?{" "}
          <Link href="/register" className="text-brand-lime hover:underline font-semibold uppercase">
            Register here
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
