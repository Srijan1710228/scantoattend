"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { SectionWrapper } from "@/components/ui/section-wrapper";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuth = localStorage.getItem("admin_auth");
      if (isAuth === "true") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuthorized(true);
      } else {
        router.push("/admin");
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_auth");
    }
    router.push("/admin");
  };

  if (!authorized) {
    return (
      <SectionWrapper
        withWatermark
        className="pt-20 md:pt-32 pb-20 min-h-[85vh] flex items-center justify-center text-brand-white"
      >
        <div className="text-center font-display text-xl uppercase tracking-wider animate-pulse">
          Authorizing...
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      withWatermark
      className="pt-20 md:pt-32 pb-20 min-h-[85vh] flex items-center justify-center"
    >
      <div className="relative w-full max-w-lg mx-auto bg-brand-black/40 backdrop-blur-md border border-brand-muted/20 p-8 rounded-2xl shadow-2xl flex flex-col gap-8 overflow-hidden group">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center">
          <h1 className="text-3xl font-display uppercase tracking-tight mb-2 text-brand-white">
            ADMIN DASHBOARD
          </h1>
          <p className="text-brand-muted text-sm">
            Configure attendance configurations and track check-ins.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/admin/sessions" className="w-full">
            <Button className="w-full py-5 text-sm" variant="ghost">
              Start Attendance <Chevron className="w-4 h-4 ml-1" />
            </Button>
          </Link>

          <Link href="/admin/attendance" className="w-full">
            <Button className="w-full py-5 text-sm" variant="ghost">
              View Attendance <Chevron className="w-4 h-4 ml-1" />
            </Button>
          </Link>

          <Link href="/admin/sessions" className="w-full">
            <Button className="w-full py-5 text-sm" variant="ghost">
              Attendance Sessions <Chevron className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-brand-muted hover:text-brand-red transition-colors uppercase tracking-wider font-semibold self-center"
        >
          Logout / Lock Admin Panel
        </button>
      </div>
    </SectionWrapper>
  );
}
