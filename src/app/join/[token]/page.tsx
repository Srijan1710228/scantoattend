"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { SectionWrapper } from "@/components/ui/section-wrapper";

interface MemberProfile {
  memberId: string;
  name: string;
  email: string;
  registerNo: string;
  club: string;
  status: string;
}

interface ActiveMeeting {
  meetingId: string;
  meetingName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  allowedRadius: number;
}

interface SubmissionRecord {
  time: string;
  meeting_name: string;
}

export default function JoinMeetingWithTokenPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [profile, setProfile] = React.useState<MemberProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Flow steps: "verify" | "confirm" | "success"
  const [step, setStep] = React.useState<"verify" | "confirm" | "success">("verify");

  // Meeting specifications
  const [meeting, setMeeting] = React.useState<ActiveMeeting | null>(null);

  // Location parameters
  const [locLoading, setLocLoading] = React.useState(false);
  const [distance, setDistance] = React.useState<number | null>(null);
  const [accuracy, setAccuracy] = React.useState<number | null>(null);
  const [locationToken, setLocationToken] = React.useState("");

  // Checkin state
  const [checkingIn, setCheckingIn] = React.useState(false);
  const [attendanceRecord, setAttendanceRecord] = React.useState<SubmissionRecord | null>(null);

  // 1. Authenticate user and fetch meeting
  const initFlow = React.useCallback(async () => {
    try {
      // Get profile
      const profileRes = await fetch("/api/auth/me");
      if (!profileRes.ok) {
        toast.error("Please log in first to join this meeting.");
        router.push(`/login?redirect=/join/${token}`);
        return;
      }
      const profileData = await profileRes.json();
      setProfile(profileData.member);

      // Verify and join meeting using token
      const joinRes = await fetch("/api/meetings/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const joinData = await joinRes.json();
      if (joinRes.ok && joinData.success) {
        setMeeting(joinData.meeting);
        setStep("verify");
      } else {
        setErrorMsg(joinData.error || "Failed to join meeting using QR code.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please reload the page to try again.");
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  React.useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      initFlow();
    } else {
      setErrorMsg("Invalid meeting token.");
      setLoading(false);
    }
  }, [token, initFlow]);

  const handleVerifyLocation = () => {
    if (!meeting) return;
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy: gpsAcc } = position.coords;
        try {
          const response = await fetch("/api/meetings/verify-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              meetId: meeting.meetingId,
              latitude,
              longitude,
              accuracy: gpsAcc,
            }),
          });

          const data = await response.json();
          if (response.ok && data.success) {
            setDistance(data.distance);
            setAccuracy(data.accuracy);
            
            if (data.verified) {
              setLocationToken(data.locationToken);
              setStep("confirm");
              toast.success("Location verification successful!");
            } else {
              toast.error(data.message || "Location verification failed.");
            }
          } else {
            toast.error(data.error || "Failed to verify location.");
          }
        } catch (err) {
          console.error(err);
          toast.error("Network verification failed.");
        } finally {
          setLocLoading(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error("Permission denied. Enable GPS services to mark attendance.");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMarkAttendance = async () => {
    if (!locationToken) return;

    setCheckingIn(true);
    try {
      const response = await fetch("/api/attendance/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationToken }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAttendanceRecord(data.attendance);
        setStep("success");
        toast.success("Attendance marked successfully!");
      } else {
        toast.error(data.error || "Failed to mark attendance.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Attendance submission failed.");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        toast.success("Logged out successfully.");
        router.push(`/login?redirect=/join/${token}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-lime" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <SectionWrapper
        withWatermark
        className="pt-20 md:pt-32 pb-20 min-h-[85vh] flex items-center justify-center"
      >
        <div className="relative w-full max-w-lg mx-auto bg-brand-black/40 backdrop-blur-md border border-brand-muted/20 p-8 rounded-2xl shadow-2xl flex flex-col gap-6 text-center overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-brand-red/20 flex items-center justify-center border border-brand-red/40 text-brand-red text-3xl mx-auto font-bold">
            !
          </div>
          <h1 className="text-2xl font-display uppercase tracking-tight text-brand-white">
            Meeting Join Failed
          </h1>
          <p className="text-brand-muted text-sm">
            {errorMsg}
          </p>
          <Link href="/member" className="w-full mt-4">
            <Button className="w-full">
              Go to Member Dashboard
            </Button>
          </Link>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      withWatermark
      className="pt-20 md:pt-32 pb-20 min-h-[85vh] flex items-center justify-center"
    >
      <div className="relative w-full max-w-lg mx-auto bg-brand-black/40 backdrop-blur-md border border-brand-muted/20 p-8 rounded-2xl shadow-2xl flex flex-col gap-8 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Member Header Info */}
        {profile && (
          <div className="flex items-center justify-between border-b border-brand-muted/15 pb-4">
            <div>
              <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold">Logged in as</p>
              <p className="text-sm font-bold text-brand-white">{profile.name} ({profile.registerNo})</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-brand-red hover:underline uppercase font-bold"
            >
              Logout
            </button>
          </div>
        )}

        {/* STEP 1: Verify Geofence Location */}
        {step === "verify" && meeting && profile && (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-display uppercase tracking-tight mb-2 text-brand-white">
                Verify Location
              </h1>
              <p className="text-brand-muted text-sm max-w-sm mx-auto">
                We need to confirm you are physically present at {meeting.venue}.
              </p>
            </div>

            <div className="bg-brand-black/50 border border-brand-muted/20 p-5 rounded-xl flex flex-col gap-3 text-sm">
              <div>
                <span className="text-xs text-brand-muted uppercase block">Meeting</span>
                <span className="text-brand-white font-bold">{meeting.meetingName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-brand-muted/10 pt-3">
                <div>
                  <span className="text-xs text-brand-muted uppercase block">Venue</span>
                  <span className="text-brand-white">{meeting.venue}</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block">Allowed Radius</span>
                  <span className="text-brand-white">{meeting.allowedRadius}m</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-center">
              <Button onClick={handleVerifyLocation} disabled={locLoading} className="w-full">
                {locLoading ? "Locating device..." : "Verify Location"}
                <Chevron className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* STEP 2: Confirm Checklist */}
        {step === "confirm" && meeting && profile && (
          <>
            <div className="text-center">
              <h1 className="text-3xl font-display uppercase tracking-tight mb-2 text-brand-white">
                Confirm Attendance
              </h1>
              <p className="text-brand-muted text-sm">
                All parameters validated. Ready to mark attendance.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 my-2">
              <div className="flex items-center gap-3 text-sm bg-brand-lime/10 border border-brand-lime/25 px-4 py-3 rounded-lg text-brand-white">
                <span className="text-brand-lime font-bold text-lg">✓</span>
                <div>
                  <p className="font-bold text-xs uppercase text-brand-muted">Member verified</p>
                  <p>{profile.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm bg-brand-lime/10 border border-brand-lime/25 px-4 py-3 rounded-lg text-brand-white">
                <span className="text-brand-lime font-bold text-lg">✓</span>
                <div>
                  <p className="font-bold text-xs uppercase text-brand-muted">Meeting verified</p>
                  <p>{meeting.meetingName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm bg-brand-lime/10 border border-brand-lime/25 px-4 py-3 rounded-lg text-brand-white">
                <span className="text-brand-lime font-bold text-lg">✓</span>
                <div>
                  <p className="font-bold text-xs uppercase text-brand-muted">Location verified</p>
                  <p>
                    {distance !== null ? `~${Math.round(distance)}m from venue` : "Within Radius"} (Accuracy: {accuracy !== null ? `${Math.round(accuracy)}m` : "GPS verified"})
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleMarkAttendance} disabled={checkingIn} className="w-full">
              {checkingIn ? "Marking..." : "Mark My Attendance"}
              <Chevron className="w-4 h-4 ml-1" />
            </Button>
          </>
        )}

        {/* STEP 3: Success Screen */}
        {step === "success" && attendanceRecord && (
          <>
            <div className="text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-lime/20 flex items-center justify-center border border-brand-lime/40 text-brand-lime text-3xl font-bold">
                ✓
              </div>
              <div>
                <h1 className="text-3xl font-display uppercase tracking-tight mb-2 text-brand-white">
                  Check-in Success
                </h1>
                <p className="text-brand-muted text-sm max-w-xs mx-auto">
                  Your attendance has been recorded to Google Sheets.
                </p>
              </div>
            </div>

            <div className="bg-brand-black/50 border border-brand-muted/20 p-5 rounded-xl flex flex-col gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-brand-muted uppercase block">Status</span>
                  <span className="text-brand-lime font-bold">Present</span>
                </div>
                <div>
                  <span className="text-xs text-brand-muted uppercase block">Time</span>
                  <span className="text-brand-white font-medium">{attendanceRecord.time}</span>
                </div>
              </div>
              <div className="border-t border-brand-muted/10 pt-3">
                <span className="text-xs text-brand-muted uppercase block">Meeting</span>
                <span className="text-brand-white font-semibold">{attendanceRecord.meeting_name}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link href="/member/attendance">
                <Button className="w-full">
                  My Attendance History <Chevron className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </SectionWrapper>
  );
}
