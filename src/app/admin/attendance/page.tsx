"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { StatBlock } from "@/components/ui/stat-block";
import { cn } from "@/lib/utils";

const ADMIN_PASSCODE = "admin123";

interface AttendanceRecord {
  attendance_id: string;
  member_id: string;
  name: string;
  register_no: string;
  email: string;
  meeting_id: string;
  meeting_name: string;
  date: string;
  time: string;
  venue: string;
  distance_from_venue: number;
  gps_accuracy: number;
  allowed_radius: number;
  location_status: string;
  attendance_status: string;
}

interface Meeting {
  meeting_id: string;
  meeting_name: string;
}

export default function AdminAttendancePage() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [passcode, setPasscode] = React.useState("");
  const [passcodeError, setPasscodeError] = React.useState(false);

  const [loading, setLoading] = React.useState(true);
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  
  // Filters
  const [selectedMeetingId, setSelectedMeetingId] = React.useState("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/attendance");
      if (response.ok) {
        const data = await response.json();
        setRecords(data.attendance || []);
        setMeetings(data.meetings || []);
      } else {
        toast.error("Failed to load attendance logs.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
  }, [authenticated]);

  const handlePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_PASSCODE) {
      setAuthenticated(true);
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <form
          onSubmit={handlePasscode}
          className="w-full max-w-sm flex flex-col gap-4 p-8 border-2 border-brand-muted/20 bg-brand-black rounded-2xl"
        >
          <h2 className="font-display text-2xl uppercase text-center mb-2">
            Admin Attendance Gate
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

  // Filter logic
  const filteredRecords = records.filter((rec) => {
    const matchesMeeting = selectedMeetingId === "ALL" || rec.meeting_id === selectedMeetingId;
    const matchesSearch =
      rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.register_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMeeting && matchesSearch;
  });

  // Calculate statistics
  const totalPresent = filteredRecords.length;
  // Use unique members checking in as proxy for total present, or hardcode/stat checks
  const uniqueMembers = new Set(filteredRecords.map((r) => r.member_id)).size;
  
  // Calculate average distance
  const validDistances = filteredRecords.map((r) => r.distance_from_venue).filter((d) => d !== null);
  const avgDistance =
    validDistances.length > 0
      ? Math.round(validDistances.reduce((acc, d) => acc + d, 0) / validDistances.length)
      : 0;

  // Let's mock a fixed total number of members in the club (e.g. 50 members) to calculate attendance percentage
  const totalClubMembers = 50;
  const attendancePercentage =
    totalPresent > 0 ? Math.min(100, Math.round((uniqueMembers / totalClubMembers) * 100)) : 0;

  return (
    <SectionWrapper
      withWatermark
      className="pt-20 md:pt-28 pb-20 min-h-[85vh]"
    >
      <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-muted/15 pb-6">
          <div>
            <h1 className="text-4xl font-display uppercase tracking-tight text-brand-white">
              Admin Attendance Logs
            </h1>
            <p className="text-brand-muted text-sm mt-1">
              Real-time synchronization logs from Google Sheets.
            </p>
          </div>
          <Button onClick={fetchData} variant="ghost" className="border border-brand-muted/20 text-xs">
            Refresh Logs
          </Button>
        </div>

        {/* Stats Blocks */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-brand-black/30 border border-brand-muted/15 p-6 rounded-2xl">
          <StatBlock label="Total Checked In" value={totalPresent} />
          <StatBlock label="Unique Attendees" value={uniqueMembers} />
          <StatBlock label="Avg Distance" value={`${avgDistance}m`} />
          <StatBlock label="Attendance Rate" value={`${attendancePercentage}%`} />
        </div>

        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-brand-black/55 border border-brand-muted/20 p-5 rounded-xl">
          {/* Meeting Selection */}
          <div className="flex flex-col gap-1 w-full md:w-1/3">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
              Filter by Meeting
            </label>
            <select
              value={selectedMeetingId}
              onChange={(e) => setSelectedMeetingId(e.target.value)}
              className="bg-brand-black border border-brand-muted/30 text-brand-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-brand-lime"
            >
              <option value="ALL">All Meetings</option>
              {meetings.map((m) => (
                <option key={m.meeting_id} value={m.meeting_id}>
                  {m.meeting_name} ({m.meeting_id})
                </option>
              ))}
            </select>
          </div>

          {/* Search Field */}
          <div className="flex flex-col gap-1 w-full md:w-2/3">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
              Search Members
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, register number, email..."
              className="bg-brand-black border border-brand-muted/30 text-brand-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-brand-lime placeholder:text-brand-muted/50"
            />
          </div>
        </div>

        {/* Records Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-lime" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-20 border border-brand-muted/10 bg-brand-black/10 rounded-2xl">
            <p className="text-brand-muted text-sm">No attendance records found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-brand-muted/20 rounded-2xl bg-brand-black/20">
            <table className="w-full text-left text-sm text-brand-white/80">
              <thead className="text-xs text-brand-muted uppercase tracking-wider border-b border-brand-muted/15 bg-brand-black/60">
                <tr>
                  <th className="py-4 px-5">Name & Reg No</th>
                  <th className="py-4 px-5">Meeting</th>
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5">Time</th>
                  <th className="py-4 px-5">Distance</th>
                  <th className="py-4 px-5">GPS Accuracy</th>
                  <th className="py-4 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-muted/10">
                {filteredRecords.map((rec) => (
                  <tr key={rec.attendance_id} className="hover:bg-brand-white/5 transition-colors">
                    <td className="py-4 px-5 font-semibold text-brand-white">
                      {rec.name}
                      <span className="block text-[10px] text-brand-muted font-normal mt-0.5">
                        {rec.register_no} | {rec.email}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs text-brand-white/95">
                      {rec.meeting_name}
                      <span className="block text-[9px] text-brand-muted font-mono mt-0.5">{rec.meeting_id}</span>
                    </td>
                    <td className="py-4 px-5 text-xs">{rec.date}</td>
                    <td className="py-4 px-5 text-xs">{rec.time}</td>
                    <td className="py-4 px-5 text-xs">
                      {rec.distance_from_venue !== null ? `~${Math.round(rec.distance_from_venue)}m` : "Within Radius"}
                    </td>
                    <td className="py-4 px-5 text-xs">
                      {rec.gps_accuracy !== null ? `${Math.round(rec.gps_accuracy)}m` : "GPS verified"}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          rec.location_status === "Within Radius"
                            ? "bg-brand-lime/10 text-brand-lime border-brand-lime/30"
                            : "bg-brand-red/10 text-brand-red border-brand-red/30"
                        )}
                      >
                        {rec.attendance_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
