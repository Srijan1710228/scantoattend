"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { cn } from "@/lib/utils";
import { haversineDistance } from "@/lib/utils/geo";
import { VENUE_LAT, VENUE_LNG, RADIUS_M } from "@/lib/config/venue";
import {
  addRegistration,
  markAttendance,
  getRegistrationByParticipantId,
  getRegistrations,
  getAttendance,
} from "@/lib/store/mock-store";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const attendanceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  domain: z.string().min(2, "Domain must be at least 2 characters"),
  registerNo: z
    .string()
    .min(3, "Register number must be at least 3 characters")
    .toUpperCase(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

// ---------------------------------------------------------------------------
// Field Helper
// ---------------------------------------------------------------------------

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

type LocationStatus =
  | "idle"
  | "checking"
  | "verified"
  | "out_of_range"
  | "denied"
  | "unavailable";

export default function AttendanceFormPage() {
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = React.useState<number | null>(null);
  const [locationStatus, setLocationStatus] = React.useState<LocationStatus>("idle");
  const [submittedId, setSubmittedId] = React.useState<string | null>(null);
  const [submittedName, setSubmittedName] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      name: "",
      email: "",
      domain: "",
      registerNo: "",
    },
  });

  // Request user geo-location
  const requestLocation = React.useCallback(() => {
    setLocationStatus("checking");

    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationStatus("unavailable");
      toast.error("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const dist = haversineDistance(lat, lng, VENUE_LAT, VENUE_LNG);

        setCoords({ lat, lng });
        setDistance(Math.round(dist));

        if (dist <= RADIUS_M) {
          setLocationStatus("verified");
          toast.success("Location verified successfully!");
        } else {
          setLocationStatus("out_of_range");
          toast.error(`Out of range. You are ${Math.round(dist)}m away.`);
        }
      },
      (err) => {
        console.error(err);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus("denied");
          toast.error("Location permission denied. Please enable location services.");
        } else {
          setLocationStatus("unavailable");
          toast.error("Location unavailable. Try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Fetch location automatically on load
  React.useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const onSubmit = async (data: AttendanceFormData) => {
    if (!coords) {
      toast.error("Please grant location access before submitting.");
      requestLocation();
      return;
    }

    const todayDateStr = "2026-10-25"; // Day 1 date

    // 0. Strict check: verify if this email OR register number has already marked attendance for today
    const allRegs = getRegistrations();
    const allAttendance = getAttendance(todayDateStr);

    const isAlreadyCheckedIn = allAttendance.some((a) => {
      const reg = allRegs.find((r) => r.participant_id === a.participant_id);
      return (
        reg &&
        (reg.email.toLowerCase() === data.email.toLowerCase() ||
          reg.participant_id.toUpperCase() === data.registerNo.toUpperCase())
      );
    });

    if (isAlreadyCheckedIn) {
      toast.error("Attendance has already been marked today for this email address or register number!");
      return;
    }

    // 1. Check if participant exists, otherwise register them
    const existing = getRegistrationByParticipantId(data.registerNo);
    if (!existing) {
      addRegistration({
        participant_id: data.registerNo,
        name: data.name,
        email: data.email,
        track_preference: data.domain,
      });
      toast.success("New registration added!");
    } else {
      // update email/domain if changed/needed or verify compatibility
      if (existing.email.toLowerCase() !== data.email.toLowerCase()) {
        toast.error("Register number belongs to a different email address!");
        return;
      }
    }

    // 2. Mark attendance
    const dist = distance ?? haversineDistance(coords.lat, coords.lng, VENUE_LAT, VENUE_LNG);
    const result = markAttendance({
      participant_id: data.registerNo,
      event_day: todayDateStr,
      latitude: coords.lat,
      longitude: coords.lng,
      distance_from_venue_m: Math.round(dist),
      location_verified: dist <= RADIUS_M,
    });

    if (result.success) {
      setSubmittedId(data.registerNo);
      setSubmittedName(data.name);
      toast.success("Attendance marked successfully!");
    } else {
      if (result.error === "already_marked") {
        toast.error("Attendance already marked for today!");
      } else {
        toast.error("Failed to mark attendance.");
      }
    }
  };

  // Success state view
  if (submittedId) {
    return (
      <SectionWrapper
        withWatermark
        className="pt-20 md:pt-32 pb-20 min-h-[85vh] flex items-center justify-center"
      >
        <div className="relative w-full max-w-lg mx-auto bg-brand-black/40 backdrop-blur-md border border-brand-muted/20 p-8 rounded-2xl shadow-2xl text-center flex flex-col items-center gap-8 overflow-hidden group">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-lime/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="w-16 h-16 rounded-full bg-brand-lime/20 flex items-center justify-center border border-brand-lime/40 animate-bounce">
            <Chevron className="w-8 h-8 text-brand-lime rotate-90" />
          </div>

          <div>
            <h1 className="text-4xl font-display uppercase tracking-tight mb-2 text-brand-white">
              Checked In!
            </h1>
            <p className="text-brand-lime font-mono text-lg font-bold tracking-widest mb-4">
              {submittedId}
            </p>
            <p className="text-brand-muted text-base max-w-sm mx-auto">
              Thank you, <strong className="text-brand-white">{submittedName}</strong>! Your attendance is recorded for Day 1 of IEEE AICSSYC 2026.
            </p>
          </div>

          <div className="w-full border-t border-brand-muted/15 pt-6 flex flex-col gap-3">
            <Link href="/">
              <Button className="w-full">Go to Homepage</Button>
            </Link>
          </div>
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
        {/* Glow effect */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight mb-2 text-brand-white">
            Attendance Check-in
          </h1>
          <p className="text-brand-muted text-sm max-w-sm mx-auto">
            Please enter your registration details. Your location will be verified against the venue coords.
          </p>
        </div>

        {/* Location Status Banner */}
        <div
          className={cn(
            "p-4 rounded-xl border flex flex-col gap-2 items-center text-center transition-all duration-300",
            locationStatus === "verified" && "bg-brand-lime/10 border-brand-lime/30 text-brand-lime",
            locationStatus === "out_of_range" && "bg-brand-red/10 border-brand-red/30 text-brand-red",
            locationStatus === "checking" && "bg-brand-muted/10 border-brand-muted/30 text-brand-muted animate-pulse",
            (locationStatus === "denied" || locationStatus === "unavailable" || locationStatus === "idle") &&
              "bg-brand-red/10 border-brand-red/20 text-brand-white"
          )}
        >
          <div className="flex items-center gap-2 font-semibold uppercase tracking-wider text-xs">
            {locationStatus === "checking" && (
              <>
                <span className="w-2 h-2 rounded-full bg-brand-white animate-ping" />
                Retrieving Location...
              </>
            )}
            {locationStatus === "verified" && (
              <>
                <span className="w-2 h-2 rounded-full bg-brand-lime animate-ping" />
                Verified at Venue
              </>
            )}
            {locationStatus === "out_of_range" && (
              <>
                <span className="w-2 h-2 rounded-full bg-brand-red" />
                Out of Range
              </>
            )}
            {locationStatus === "denied" && "Location Access Denied"}
            {locationStatus === "unavailable" && "Location Services Offline"}
            {locationStatus === "idle" && "Location Required"}
          </div>

          <p className="text-xs opacity-90 max-w-xs">
            {locationStatus === "checking" && "Calculating distance to the venue geofence..."}
            {locationStatus === "verified" && `Welcome! You are within the event perimeter (~${distance}m away).`}
            {locationStatus === "out_of_range" &&
              `You are ${distance}m away from the venue. Please check-in from within the event premises.`}
            {locationStatus === "denied" &&
              "Please enable GPS / location permissions for this site to verify check-in."}
            {locationStatus === "unavailable" && "Unable to retrieve accurate GPS signals."}
            {locationStatus === "idle" && "Click button below to trigger location verification."}
          </p>

          {(locationStatus === "denied" || locationStatus === "unavailable" || locationStatus === "idle") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={requestLocation}
              className="mt-1 text-xs py-1 border border-brand-white/10 hover:border-brand-lime/30 text-brand-white hover:text-brand-lime"
            >
              Verify My Location
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Full Name */}
          <Field label="Full Name *" error={errors.name?.message}>
            <input
              {...register("name")}
              type="text"
              className={inputClass}
              placeholder="e.g. Aarav Mehta"
              autoComplete="name"
            />
          </Field>

          {/* Email Address */}
          <Field label="Email Address *" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              className={inputClass}
              placeholder="aarav@college.edu"
              autoComplete="email"
            />
          </Field>

          {/* Domain */}
          <Field label="Domain (Track/Department) *" error={errors.domain?.message}>
            <input
              {...register("domain")}
              type="text"
              className={inputClass}
              placeholder="e.g. Technical / CSE"
              autoComplete="off"
            />
          </Field>

          {/* Register No */}
          <Field label="Register No (Participant ID) *" error={errors.registerNo?.message}>
            <input
              {...register("registerNo")}
              type="text"
              className={inputClass}
              placeholder="e.g. AICSSYC26-XXXXXX"
              autoComplete="off"
            />
          </Field>

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={isSubmitting || !coords || locationStatus === "checking"}
          >
            {isSubmitting ? "Submitting..." : "Submit & Mark Attendance"}
            <Chevron className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </div>
    </SectionWrapper>
  );
}
