"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: string; // ISO format
  className?: string;
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={cn("flex items-center gap-4 text-center", className)}>
      <TimeUnit value={timeLeft.days} label="Days" />
      <span className="text-2xl font-display text-brand-lime mb-5">:</span>
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <span className="text-2xl font-display text-brand-lime mb-5">:</span>
      <TimeUnit value={timeLeft.minutes} label="Mins" />
      <span className="text-2xl font-display text-brand-lime mb-5 hidden sm:block">:</span>
      <TimeUnit value={timeLeft.seconds} label="Secs" className="hidden sm:flex" />
    </div>
  );
}

function TimeUnit({ value, label, className }: { value: number; label: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <span className="text-3xl md:text-5xl font-display text-brand-white w-12 md:w-20">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs md:text-sm text-brand-muted uppercase tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}
