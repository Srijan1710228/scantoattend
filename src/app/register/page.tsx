"use client";

import * as React from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";

export default function RegisterPage() {
  const [attendanceUrl, setAttendanceUrl] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setAttendanceUrl(window.location.origin + "/attendance-form");
    }
  }, []);

  return (
    <SectionWrapper
      withWatermark
      className="pt-20 md:pt-32 pb-20 min-h-[85vh] flex items-center justify-center"
    >
      <div className="relative w-full max-w-lg mx-auto bg-brand-black/40 backdrop-blur-md border border-brand-muted/20 p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center gap-8 overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-lime/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-brand-lime/15 transition-all duration-700" />
        
        <div className="w-16 h-16 rounded-full bg-brand-lime/10 flex items-center justify-center border border-brand-lime/30 shadow-[0_0_20px_rgba(163,230,53,0.1)]">
          <Chevron className="w-8 h-8 text-brand-lime" />
        </div>

        <div>
          <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight mb-3 bg-gradient-to-r from-brand-white to-brand-muted bg-clip-text text-transparent">
            Scan to Attend
          </h1>
          <p className="text-brand-muted text-base max-w-sm mx-auto">
            Scan this QR code with your mobile device to fill out the attendance registration form.
          </p>
        </div>

        {/* QR Code Card */}
        <div className="relative p-6 bg-brand-white rounded-2xl shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
          {attendanceUrl ? (
            <QRCodeCanvas
              value={attendanceUrl}
              size={220}
              bgColor="#FFFFFF"
              fgColor="#0D0D0D"
              level="H"
              marginSize={2}
            />
          ) : (
            <div className="w-[220px] h-[220px] bg-brand-muted/10 animate-pulse rounded-lg" />
          )}
        </div>

        <div className="flex flex-col gap-4 w-full">
          <div className="flex items-center gap-2 justify-center text-xs text-brand-muted font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-ping" />
            Live Verification Active
          </div>

          <div className="border-t border-brand-muted/15 pt-4">
            <p className="text-sm text-brand-muted mb-3">
              On a mobile device or cannot scan?
            </p>
            <Link href="/attendance-form">
              <Button variant="ghost" className="w-full text-brand-white hover:text-brand-lime border border-brand-muted/20 hover:border-brand-lime/40">
                Fill Form Directly
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
