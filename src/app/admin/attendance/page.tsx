"use client";

/**
 * ⚠️ DEV-ONLY PASSCODE GATE ⚠️
 * This placeholder passcode check MUST be replaced with real Supabase Auth
 * in Phase 3 before this touches production.
 */

import * as React from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { cn } from "@/lib/utils";
import { EVENT_DAYS, VENUE_LAT, VENUE_LNG } from "@/lib/config/venue";
import {
  getAttendance,
  getRegistrations,
  markAttendance,
  getRegistrationByParticipantId,
  addRegistration,
  type AttendanceRecord,
  type Registration,
} from "@/lib/store/mock-store";

const ADMIN_PASSCODE = "admin123"; // ⚠️ Replace with Supabase Auth in Phase 3

export default function AdminAttendancePage() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [passcode, setPasscode] = React.useState("");
  const [passcodeError, setPasscodeError] = React.useState(false);

  const [selectedDay, setSelectedDay] = React.useState(EVENT_DAYS[0].date);
  const [records, setRecords] = React.useState<AttendanceRecord[]>([]);
  const [registrations, setRegistrations] = React.useState<Registration[]>([]);
  const [showManualModal, setShowManualModal] = React.useState(false);
  const [manualPid, setManualPid] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const XLSX = await import("xlsx");
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

          let newRegsCount = 0;
          let newAttendanceCount = 0;

          jsonData.forEach((row: any) => {
            const rawId = row.participant_id || row.register_no || row.RegisterNo || row.ID || row.id || row["Register No"] || row["Participant ID"];
            const name = row.name || row.Name || row["Full Name"] || "Unknown Attendee";
            const email = row.email || row.Email || `${rawId}@college.edu`;
            const domain = row.domain || row.Domain || row.track_preference || "General";

            if (!rawId) return;
            const pid = String(rawId).trim().toUpperCase();

            // 1. Check/Add Registration
            const existing = getRegistrationByParticipantId(pid);
            if (!existing) {
              addRegistration({
                participant_id: pid,
                name: String(name).trim(),
                email: String(email).trim(),
                track_preference: String(domain).trim(),
              });
              newRegsCount++;
            }

            // 2. Mark Attendance
            const res = markAttendance({
              participant_id: pid,
              event_day: selectedDay,
              latitude: VENUE_LAT,
              longitude: VENUE_LNG,
              distance_from_venue_m: 0,
              location_verified: true, // admin import counts as verified
            });

            if (res.success) {
              newAttendanceCount++;
            }
          });

          toast.success(`Imported: ${newAttendanceCount} checked in (${newRegsCount} new registrations)`);
          refresh(selectedDay);
        } catch (err) {
          console.error(err);
          toast.error("Failed to parse sheet data. Please check layout.");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load file reader.");
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Refresh data
  const refresh = React.useCallback((day: string) => {
    setRecords(getAttendance(day));
    setRegistrations(getRegistrations());
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (authenticated) refresh(selectedDay);
  }, [authenticated, selectedDay, refresh]);

  // Auto-refresh every 5 seconds while authenticated
  React.useEffect(() => {
    if (!authenticated) return;
    const timer = setInterval(() => refresh(selectedDay), 5000);
    return () => clearInterval(timer);
  }, [authenticated, selectedDay, refresh]);

  // -----------------------------------------------------------------------
  // Passcode gate
  // -----------------------------------------------------------------------

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
          className="w-full max-w-sm flex flex-col gap-4 p-8 border-2 border-brand-muted/20"
        >
          <h2 className="font-display text-2xl uppercase text-center mb-2">
            Admin Access
          </h2>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            className="w-full bg-brand-black border-2 border-brand-muted/30 text-brand-white px-4 py-3 text-sm font-sans focus:outline-none focus:border-brand-lime transition-colors placeholder:text-brand-muted/50"
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

  // -----------------------------------------------------------------------
  // Manual mark handler
  // -----------------------------------------------------------------------

  const handleManualMark = (e: React.FormEvent) => {
    e.preventDefault();
    const pid = manualPid.trim();
    if (!pid) return;

    const result = markAttendance({
      participant_id: pid,
      event_day: selectedDay,
      latitude: 0,
      longitude: 0,
      distance_from_venue_m: 0,
      location_verified: false, // Manual override — auditable
    });

    if (result.success) {
      const reg = getRegistrationByParticipantId(pid);
      toast.success(`✅ Manually marked: ${reg?.name ?? pid}`);
      refresh(selectedDay);
    } else if (result.error === "already_marked") {
      toast(`⚠️ Already marked for this day`, { icon: "⚠️" });
    } else {
      toast.error("❌ Participant ID not found in registrations");
    }

    setManualPid("");
    setShowManualModal(false);
  };

  // -----------------------------------------------------------------------
  // Export to Excel
  // -----------------------------------------------------------------------

  const exportToExcel = async () => {
    const XLSX = await import("xlsx");
    const allAttendance = getAttendance(selectedDay);
    const allRegs = getRegistrations();

    const rows = allAttendance.map((a) => {
      const reg = allRegs.find((r) => r.participant_id === a.participant_id);
      return {
        participant_id: a.participant_id,
        name: reg?.name ?? "Unknown",
        email: reg?.email ?? "",
        institution: reg?.institution ?? "",
        event_day: a.event_day,
        scanned_at: a.scanned_at,
        distance_m: a.distance_from_venue_m,
        location_verified: a.location_verified ? "Yes" : "No (Manual)",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance_${selectedDay}.xlsx`);
    toast.success("Exported to Excel");
  };

  // -----------------------------------------------------------------------
  // Resolve name from participant_id
  // -----------------------------------------------------------------------

  const getName = (pid: string): string => {
    const reg = registrations.find((r) => r.participant_id === pid);
    return reg?.name ?? "Unknown";
  };

  const dayLabel =
    EVENT_DAYS.find((d) => d.date === selectedDay)?.label ?? selectedDay;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-[80vh]">
      {/* Header */}
      <section className="pt-20 md:pt-28 pb-8 border-b border-brand-muted/20">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display uppercase mb-2">
              Attendance
            </h1>
            <p className="text-brand-muted">
              Live attendance tracking — {dayLabel}.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportExcel}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Import Present List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowManualModal(true)}
            >
              + Manual Mark
            </Button>
            <Button size="sm" onClick={exportToExcel}>
              Export Excel <Chevron className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
        {/* Day selector + counter */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex gap-2 flex-wrap">
            {EVENT_DAYS.map((day) => (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.date)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold uppercase tracking-wider border-2 transition-colors",
                  selectedDay === day.date
                    ? "bg-brand-lime text-brand-black border-brand-lime"
                    : "border-brand-muted/30 text-brand-muted hover:border-brand-lime/50"
                )}
              >
                {day.label}
              </button>
            ))}
          </div>

          <div className="bg-brand-lime/10 border border-brand-lime/30 px-5 py-3 flex items-center gap-4">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-muted">
              Checked In
            </span>
            <span className="font-display text-2xl text-brand-lime">
              {records.length}{" "}
              <span className="text-base text-brand-muted">
                / {registrations.length}
              </span>
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b-2 border-brand-lime/40 text-brand-muted uppercase tracking-wider text-xs">
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">ID</th>
                <th className="py-3 pr-4 hidden md:table-cell">
                  Scanned At
                </th>
                <th className="py-3 pr-4 hidden md:table-cell">
                  Distance (m)
                </th>
                <th className="py-3 pr-4">Verified</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr
                  key={rec.id}
                  className="border-b border-brand-muted/10 hover:bg-brand-lime/5 transition-colors"
                >
                  <td className="py-3 pr-4 font-semibold">
                    {getName(rec.participant_id)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs text-brand-lime">
                    {rec.participant_id}
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell text-brand-muted">
                    {new Date(rec.scanned_at).toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 hidden md:table-cell text-brand-muted">
                    {rec.distance_from_venue_m}
                  </td>
                  <td className="py-3 pr-4">
                    {rec.location_verified ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        GPS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-yellow-400">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        Manual
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {records.length === 0 && (
            <p className="text-center text-brand-muted py-12">
              No attendance records for {dayLabel}.
            </p>
          )}
        </div>
      </div>

      {/* Manual Mark Modal */}
      {showManualModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowManualModal(false)}
        >
          <form
            onSubmit={handleManualMark}
            className="bg-brand-black border-2 border-brand-muted/20 p-8 max-w-sm w-full flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl uppercase">
              Manual Mark
            </h3>
            <p className="text-sm text-brand-muted">
              Enter the participant ID to manually mark attendance. This
              will be flagged as <strong>location_verified: false</strong>{" "}
              for audit purposes.
            </p>
            <input
              type="text"
              value={manualPid}
              onChange={(e) => setManualPid(e.target.value)}
              placeholder="e.g. AICSSYC26-A1B2C3"
              className="w-full bg-brand-black border-2 border-brand-muted/30 text-brand-white px-4 py-3 text-sm font-mono focus:outline-none focus:border-brand-lime transition-colors placeholder:text-brand-muted/50"
              autoFocus
            />

            {/* Quick pick from registered participants */}
            <div className="max-h-32 overflow-y-auto flex flex-col gap-1">
              {registrations
                .filter(
                  (r) =>
                    manualPid === "" ||
                    r.participant_id
                      .toLowerCase()
                      .includes(manualPid.toLowerCase()) ||
                    r.name.toLowerCase().includes(manualPid.toLowerCase())
                )
                .slice(0, 5)
                .map((r) => (
                  <button
                    type="button"
                    key={r.participant_id}
                    onClick={() => setManualPid(r.participant_id)}
                    className="text-left px-3 py-2 text-xs hover:bg-brand-lime/10 transition-colors flex justify-between items-center"
                  >
                    <span className="font-semibold">{r.name}</span>
                    <span className="font-mono text-brand-muted">
                      {r.participant_id}
                    </span>
                  </button>
                ))}
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" size="sm">
                Mark Present
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowManualModal(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
