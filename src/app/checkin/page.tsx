"use client";

import * as React from "react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { cn } from "@/lib/utils";
import { haversineDistance } from "@/lib/utils/geo";
import { VENUE_LAT, VENUE_LNG, RADIUS_M, EVENT_DAYS } from "@/lib/config/venue";
import {
  markAttendance,
  getRegistrationByParticipantId,
  getAttendanceCount,
  getRegistrations,
} from "@/lib/store/mock-store";

type LocationStatus =
  | "checking"
  | "verified"
  | "out_of_range"
  | "denied"
  | "unavailable";

export default function CheckinPage() {
  const [locationStatus, setLocationStatus] =
    React.useState<LocationStatus>("checking");
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = React.useState<number | null>(null);
  const [scanning, setScanning] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState(EVENT_DAYS[0].date);

  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const lastScannedRef = React.useRef<{ code: string; time: number } | null>(
    null
  );

  const markedCount = React.useMemo(
    () => getAttendanceCount(selectedDay),
    [selectedDay]
  );
  const totalRegistered = React.useMemo(
    () => getRegistrations().length,
    []
  );

  const requestLocation = React.useCallback(() => {
    setLocationStatus("checking");

    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
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
        } else {
          setLocationStatus("out_of_range");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus("denied");
        } else {
          setLocationStatus("unavailable");
        }
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    requestLocation();
  }, [requestLocation]);

  const startScanner = async () => {
    const reader = new Html5Qrcode("qr-reader");
    scannerRef.current = reader;

    try {
      await reader.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleScan(decodedText),
        () => {}
      );
      setScanning(true);
    } catch (err) {
      console.error("Scanner start error:", err);
      toast.error("Could not access camera. Check permissions.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch { /* already stopped */ }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  React.useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleScan = (participantId: string) => {
    const now = Date.now();
    if (
      lastScannedRef.current &&
      lastScannedRef.current.code === participantId &&
      now - lastScannedRef.current.time < 4000
    ) {
      return;
    }
    lastScannedRef.current = { code: participantId, time: now };

    if (!coords) return;

    const dist = haversineDistance(coords.lat, coords.lng, VENUE_LAT, VENUE_LNG);

    const result = markAttendance({
      participant_id: participantId,
      event_day: selectedDay,
      latitude: coords.lat,
      longitude: coords.lng,
      distance_from_venue_m: Math.round(dist),
      location_verified: dist <= RADIUS_M,
    });

    if (result.success) {
      const reg = getRegistrationByParticipantId(participantId);
      const name = reg?.name ?? participantId;
      toast.success(`Marked: ${name}`);
    } else if (result.error === "already_marked") {
      const dayLabel =
        EVENT_DAYS.find((d) => d.date === selectedDay)?.label ?? selectedDay;
      toast(`Already checked in for ${dayLabel}`, { icon: "" });
    } else {
      toast.error(
        "Not a registered participant — check at registration desk"
      );
    }
  };

  const statusConfig: Record<
    LocationStatus,
    { dot: string; label: string; description: string }
  > = {
    checking: {
      dot: "bg-yellow-400 animate-pulse",
      label: "Checking location...",
      description: "Requesting GPS access.",
    },
    verified: {
      dot: "bg-green-500",
      label: "Location Verified",
      description: `You're ${distance ?? ""}m from the venue (within ${RADIUS_M}m radius).`,
    },
    out_of_range: {
      dot: "bg-brand-red",
      label: "Out of Range",
      description: `You're ${distance ?? ""}m away. Move within ${RADIUS_M}m of the venue to scan.`,
    },
    denied: {
      dot: "bg-brand-red",
      label: "Permission Denied",
      description:
        "Location access is required. Enable it in your browser settings and reload.",
    },
    unavailable: {
      dot: "bg-brand-red",
      label: "Location Unavailable",
      description: "Geolocation is not supported by this device/browser.",
    },
  };

  const status = statusConfig[locationStatus];
  const canScan = locationStatus === "verified";

  return (
    <div className="min-h-[80vh] flex flex-col">
      <section className="pt-20 md:pt-28 pb-8 border-b border-brand-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-display uppercase mb-2">
            Check-In Scanner
          </h1>
          <p className="text-brand-muted">
            Scan attendee QR codes to mark attendance.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-8 flex flex-col gap-6 max-w-lg">
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

        <div className="border-2 border-brand-muted/20 p-5 flex items-start gap-4">
          <div className={cn("w-4 h-4 rounded-full mt-0.5 shrink-0", status.dot)} />
          <div>
            <p className="font-display text-lg uppercase">{status.label}</p>
            <p className="text-sm text-brand-muted mt-1">{status.description}</p>
            {(locationStatus === "denied" || locationStatus === "out_of_range") && (
              <button
                onClick={requestLocation}
                className="text-sm text-brand-lime underline mt-2"
              >
                Retry location check
              </button>
            )}
          </div>
        </div>

        <div className="bg-brand-lime/10 border border-brand-lime/30 px-5 py-4 flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wider text-brand-muted">
            Marked Today
          </span>
          <span className="font-display text-2xl text-brand-lime">
            {markedCount}{" "}
            <span className="text-base text-brand-muted">/ {totalRegistered}</span>
          </span>
        </div>

        <div className="flex flex-col items-center gap-4">
          {!scanning ? (
            <Button
              onClick={startScanner}
              disabled={!canScan}
              className="w-full text-base py-6"
              size="lg"
            >
              {canScan ? "Start Scan" : "Location Required"}
              <Chevron className="w-5 h-5 ml-1" />
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={stopScanner}
              className="w-full text-base py-6"
              size="lg"
            >
              Stop Scanning
            </Button>
          )}

          <div
            id="qr-reader"
            className={cn(
              "w-full max-w-sm",
              !scanning && "hidden"
            )}
          />
        </div>
      </div>
    </div>
  );
}
