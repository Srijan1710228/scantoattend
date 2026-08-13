"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { cn } from "@/lib/utils";
import { QRCodeCanvas } from "qrcode.react";

const ADMIN_PASSCODE = "admin123";

interface MeetingData {
  meeting_id: string;
  meeting_name: string;
  date: string;
  start_time: string;
  end_time: string;
  venue: string;
  venue_latitude: number;
  venue_longitude: number;
  allowed_radius: number;
  passcode: string;
  status: "UPCOMING" | "ACTIVE" | "ENDED" | "EXPIRED";
  created_at: string;
}

export default function AdminSessionsPage() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [passcode, setPasscode] = React.useState("");
  const [passcodeError, setPasscodeError] = React.useState(false);

  // Form State
  const [meetingName, setMeetingName] = React.useState("");
  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [lat, setLat] = React.useState(12.9716);
  const [lng, setLng] = React.useState(77.5946);
  const [radius, setRadius] = React.useState(200);
  const [loading, setLoading] = React.useState(false);

  // Active Meeting State
  const [meeting, setMeeting] = React.useState<MeetingData | null>(null);
  const [showQR, setShowQR] = React.useState(false);

  const joinUrl = React.useMemo(() => {
    if (typeof window === "undefined" || !meeting) return "";
    const origin = window.location.origin;
    const token = (meeting as MeetingData & { join_token?: string }).join_token || "";
    return `${origin}/join/${token}`;
  }, [meeting]);

  const downloadQR = () => {
    const canvas = document.getElementById("meeting-qr-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `meeting-qr-${meeting?.meeting_id}.png`;
    link.href = url;
    link.click();
    toast.success("QR code downloaded!");
  };

  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinUrl);
    toast.success("Join link copied to clipboard!");
  };

  const handlePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setAuthenticated(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingName.trim() || !date || !startTime || !endTime || !venue) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingName,
          date,
          startTime,
          endTime,
          venue,
          venueLatitude: lat,
          venueLongitude: lng,
          allowedRadius: radius,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMeeting(data.meeting);
        toast.success("Meeting created successfully!");
      } else {
        toast.error(data.error || "Failed to create meeting.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: MeetingData["status"]) => {
    if (!meeting) return;

    try {
      const response = await fetch("/api/meetings/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: meeting.meeting_id,
          status,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setMeeting((prev) => prev ? { ...prev, status } : null);
        toast.success(`Meeting status updated to ${status}`);
      } else {
        toast.error(data.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    }
  };

  const handleReset = () => {
    setMeeting(null);
    setShowQR(false);
    setMeetingName("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setVenue("");
    setLat(12.9716);
    setLng(77.5946);
    setRadius(200);
  };

  if (!authenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <form
          onSubmit={handlePasscode}
          className="w-full max-w-sm flex flex-col gap-4 p-8 border-2 border-brand-muted/20 bg-brand-black rounded-2xl"
        >
          <h2 className="font-display text-2xl uppercase text-center mb-2">
            Admin Meetings Gate
          </h2>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            className="w-full bg-brand-black border-2 border-brand-muted/30 text-brand-white px-4 py-3 rounded-lg text-sm font-sans focus:outline-none focus:border-brand-lime transition-colors placeholder:text-brand-muted/50"
          />
          {passcodeError && (
            <p className="text-brand-red text-xs font-semibold">
              Incorrect passcode.
            </p>
          )}
          <Button type="submit" className="w-full">
            Enter <Chevron className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </div>
    );
  }

  // Active Meeting Screen View
  if (meeting) {
    return (
      <SectionWrapper
        withWatermark
        className="pt-20 md:pt-32 pb-20 min-h-[85vh] flex items-center justify-center"
      >
        <div className="relative w-full max-w-2xl mx-auto bg-brand-black/40 backdrop-blur-md border border-brand-muted/20 p-8 rounded-2xl shadow-2xl flex flex-col gap-8 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-lime/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="text-center border-b border-brand-muted/15 pb-6">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                meeting.status === "ACTIVE" && "bg-brand-lime/20 text-brand-lime border border-brand-lime/30",
                meeting.status === "UPCOMING" && "bg-blue-500/25 text-blue-400 border border-blue-500/40",
                meeting.status === "ENDED" && "bg-brand-muted/25 text-brand-muted border border-brand-muted/40",
                meeting.status === "EXPIRED" && "bg-brand-red/20 text-brand-red border border-brand-red/30"
              )}
            >
              {meeting.status}
            </span>
            <h1 className="text-3xl md:text-4xl font-display uppercase tracking-tight mt-3 mb-2 text-brand-white">
              {meeting.meeting_name}
            </h1>
            <p className="text-brand-muted text-sm">{meeting.venue}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
            {/* Left Box: Meet ID & Passcode */}
            <div className="bg-brand-black/50 border border-brand-muted/20 p-6 rounded-xl flex flex-col items-center justify-center gap-4 text-center">
              <div>
                <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold">
                  Meet ID
                </p>
                <p className="font-display text-4xl text-brand-lime font-bold tracking-widest mt-1">
                  {meeting.meeting_id}
                </p>
              </div>
              <div className="border-t border-brand-muted/10 w-full pt-4">
                <p className="text-xs text-brand-muted uppercase tracking-wider font-semibold">
                  Meeting Passcode
                </p>
                <p className="font-mono text-3xl text-brand-white font-bold tracking-widest mt-1">
                  {meeting.passcode}
                </p>
              </div>
            </div>

            {/* Right Box: Settings */}
            <div className="flex flex-col gap-4 justify-center">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-brand-muted uppercase">Date</p>
                  <p className="font-semibold text-brand-white text-sm">{meeting.date}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase">Radius</p>
                  <p className="font-semibold text-brand-white text-sm">{meeting.allowed_radius} meters</p>
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase">Start Time</p>
                  <p className="font-semibold text-brand-white text-sm">{meeting.start_time}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-muted uppercase">End Time</p>
                  <p className="font-semibold text-brand-white text-sm">{meeting.end_time}</p>
                </div>
              </div>
              <Button onClick={() => setShowQR(true)} className="mt-4 w-full">
                Generate QR
              </Button>
            </div>
          </div>

          {showQR && (
            <div className="border-t border-brand-muted/15 pt-6 flex flex-col items-center gap-5 bg-brand-black/25 p-6 rounded-xl border border-brand-muted/10">
              <h3 className="font-display text-xl uppercase tracking-wider text-brand-white">Meeting QR</h3>
              
              <div className="bg-white p-4 rounded-xl border border-brand-muted/30 flex items-center justify-center">
                <QRCodeCanvas
                  id="meeting-qr-canvas"
                  value={joinUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="text-center flex flex-col gap-1">
                <p className="text-brand-white font-bold text-lg">{meeting.meeting_name}</p>
                <p className="text-brand-lime font-mono text-sm">ID: {meeting.meeting_id}</p>
                <p className="text-brand-muted text-xs uppercase font-semibold">
                  {meeting.date} | {meeting.start_time} - {meeting.end_time}
                </p>
                <p className="text-brand-muted text-xs">{meeting.venue}</p>
              </div>

              <div className="flex gap-4 w-full">
                <Button onClick={downloadQR} className="flex-1 text-xs">
                  Download QR
                </Button>
                <Button onClick={copyJoinLink} variant="ghost" className="flex-1 text-xs border border-brand-muted/20">
                  Copy Join Link
                </Button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col md:flex-row gap-4 border-t border-brand-muted/15 pt-6">
            {meeting.status !== "ACTIVE" && (
              <Button onClick={() => handleUpdateStatus("ACTIVE")} className="flex-1">
                Start Meeting
              </Button>
            )}
            {meeting.status === "ACTIVE" && (
              <Button onClick={() => handleUpdateStatus("ENDED")} variant="destructive" className="flex-1">
                End Meeting
              </Button>
            )}
            <Link href="/admin/attendance" className="flex-1">
              <Button variant="ghost" className="w-full border border-brand-muted/20">
                View Attendance
              </Button>
            </Link>
          </div>

          <Button onClick={handleReset} variant="ghost" className="text-xs text-brand-muted hover:text-brand-white font-semibold">
            Create Another Meeting
          </Button>
        </div>
      </SectionWrapper>
    );
  }

  // Create Meeting View Form
  return (
    <SectionWrapper
      withWatermark
      className="pt-20 md:pt-32 pb-20 min-h-[85vh] flex items-center justify-center"
    >
      <div className="relative w-full max-w-lg mx-auto bg-brand-black/40 backdrop-blur-md border border-brand-muted/20 p-8 rounded-2xl shadow-2xl flex flex-col gap-8 overflow-hidden">
        <div className="text-center">
          <h1 className="text-3xl font-display uppercase tracking-tight mb-2 text-brand-white">
            Create Attendance Meeting
          </h1>
          <p className="text-brand-muted text-sm">
            Setup session specifications and coordinate allowed radii.
          </p>
        </div>

        <form onSubmit={handleCreateMeeting} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Meeting Name *
            </label>
            <input
              type="text"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              placeholder="e.g. IEEE CS Weekly Meeting"
              className="w-full bg-brand-black border border-brand-muted/30 text-brand-white px-4 py-3 rounded-lg text-sm font-sans focus:outline-none focus:border-brand-lime transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Date *
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 08 August 2026"
                className="w-full bg-brand-black border border-brand-muted/30 text-brand-white px-4 py-3 rounded-lg text-sm font-sans focus:outline-none focus:border-brand-lime transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Start Time *
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="e.g. 4:00 PM"
                className="w-full bg-brand-black border border-brand-muted/30 text-brand-white px-4 py-3 rounded-lg text-sm font-sans focus:outline-none focus:border-brand-lime transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                End Time *
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="e.g. 5:00 PM"
                className="w-full bg-brand-black border border-brand-muted/30 text-brand-white px-4 py-3 rounded-lg text-sm font-sans focus:outline-none focus:border-brand-lime transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Venue Name *
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="e.g. SRM KTR"
              className="w-full bg-brand-black border border-brand-muted/30 text-brand-white px-4 py-3 rounded-lg text-sm font-sans focus:outline-none focus:border-brand-lime transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full bg-brand-black border border-brand-muted/30 text-brand-white px-4 py-3 rounded-lg text-sm font-sans focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full bg-brand-black border border-brand-muted/30 text-brand-white px-4 py-3 rounded-lg text-sm font-sans focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Radius (m)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full bg-brand-black border border-brand-muted/30 text-brand-white px-4 py-3 rounded-lg text-sm font-sans focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-4">
            {loading ? "Creating..." : "Start Attendance"}
            <Chevron className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </div>
    </SectionWrapper>
  );
}
