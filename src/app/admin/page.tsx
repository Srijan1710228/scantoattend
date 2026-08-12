"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { SectionWrapper } from "@/components/ui/section-wrapper";

const ADMIN_PASSCODE = "admin123";

export default function AdminEntryPage() {
  const router = useRouter();
  const [passcode, setPasscode] = React.useState("");
  const [error, setError] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setError(false);
      // Save auth status locally so dashboards can verify
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_auth", "true");
      }
      router.push("/admin/dashboard");
    } else {
      setError(true);
    }
  };

  return (
    <SectionWrapper
      withWatermark
      className="min-h-[80vh] flex items-center justify-center"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 p-8 border-2 border-brand-muted/20 bg-brand-black rounded-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />

        <h2 className="font-display text-2xl uppercase text-center mb-2 text-brand-white">
          ADMIN ACCESS
        </h2>
        <p className="text-brand-muted text-xs text-center -mt-2 mb-2">
          Please enter the administrator passcode to proceed.
        </p>

        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Enter passcode"
          className="w-full bg-brand-black border-2 border-brand-muted/30 text-brand-white px-4 py-3 rounded-lg text-sm font-sans focus:outline-none focus:border-brand-lime transition-colors placeholder:text-brand-muted/50"
          required
        />

        {error && (
          <p className="text-brand-red text-xs font-semibold text-center">
            Incorrect passcode.
          </p>
        )}

        <Button type="submit" className="w-full mt-2">
          Enter <Chevron className="w-4 h-4 ml-1" />
        </Button>
      </form>
    </SectionWrapper>
  );
}
