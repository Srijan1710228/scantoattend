"use client";

import * as React from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { SectionWrapper } from "@/components/ui/section-wrapper";

interface HistoryRecord {
  attendance_id: string;
  meeting_id: string;
  meeting_name: string;
  date: string;
  time: string;
  venue: string;
  distance_from_venue: number;
  gps_accuracy: number;
  location_status: string;
  attendance_status: string;
}

export default function MemberAttendanceHistoryPage() {
  const [history, setHistory] = React.useState<HistoryRecord[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/attendance/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      } else {
        toast.error("Failed to load attendance history.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory();
  }, []);

  return (
    <SectionWrapper
      withWatermark
      className="pt-20 md:pt-32 pb-20 min-h-[85vh] flex items-center justify-center"
    >
      <div className="relative w-full max-w-3xl mx-auto bg-brand-black/40 backdrop-blur-md border border-brand-muted/20 p-8 rounded-2xl shadow-2xl flex flex-col gap-6 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-muted/15 pb-4">
          <div>
            <h1 className="text-3xl font-display uppercase tracking-tight text-brand-white">
              My Attendance History
            </h1>
            <p className="text-brand-muted text-xs mt-1">
              Personal log of verified check-ins.
            </p>
          </div>
          <Link href="/member">
            <Button variant="ghost" className="border border-brand-muted/20 text-xs">
              Check in to Meeting <Chevron className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-lime" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-16 bg-brand-black/20 rounded-xl border border-brand-muted/10">
            <p className="text-brand-muted text-sm">No attendance records found.</p>
            <p className="text-xs text-brand-muted/65 mt-1">
              Mark attendance at a meeting venue to list checked-ins here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-brand-white/80">
              <thead className="text-xs text-brand-muted uppercase tracking-wider border-b border-brand-muted/15">
                <tr>
                  <th className="py-3 px-4">Meeting Name</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-muted/10">
                {history.map((rec) => (
                  <tr key={rec.attendance_id} className="hover:bg-brand-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-brand-white">
                      {rec.meeting_name}
                      <span className="block text-[10px] text-brand-muted font-normal mt-0.5">
                        Venue: {rec.venue}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">{rec.date}</td>
                    <td className="py-3.5 px-4 text-xs">{rec.time}</td>
                    <td className="py-3.5 px-4 text-xs">
                      {rec.distance_from_venue !== null
                        ? `~${Math.round(rec.distance_from_venue)}m`
                        : "Verified"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="bg-brand-lime/10 text-brand-lime border border-brand-lime/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
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
