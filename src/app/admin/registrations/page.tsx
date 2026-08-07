"use client";

/**
 * ⚠️ DEV-ONLY PASSCODE GATE ⚠️
 * This placeholder passcode check MUST be replaced with real Supabase Auth
 * in Phase 3 before this touches production. It exists solely to prevent
 * casual access during development/demo.
 */

import * as React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { getRegistrations, type Registration } from "@/lib/store/mock-store";

const ADMIN_PASSCODE = "admin123"; // ⚠️ Replace with Supabase Auth in Phase 3

export default function AdminRegistrationsPage() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [passcode, setPasscode] = React.useState("");
  const [passcodeError, setPasscodeError] = React.useState(false);
  const [registrations, setRegistrations] = React.useState<Registration[]>([]);
  const [qrModalId, setQrModalId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRegistrations(getRegistrations());
    }
  }, [authenticated]);

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
  // QR download helper
  // -----------------------------------------------------------------------

  const downloadQR = (participantId: string) => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      "#qr-modal-canvas canvas"
    );
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${participantId}.png`;
    a.click();
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="min-h-[80vh]">
      {/* Header */}
      <section className="pt-20 md:pt-28 pb-8 border-b border-brand-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-display uppercase mb-2">
            Registrations
          </h1>
          <p className="text-brand-muted">
            {registrations.length} registered participant
            {registrations.length !== 1 ? "s" : ""}.
          </p>
        </div>
      </section>

      {/* Table */}
      <section className="py-8">
        <div className="container mx-auto px-4 md:px-6 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b-2 border-brand-lime/40 text-brand-muted uppercase tracking-wider text-xs">
                <th className="py-3 pr-4">ID</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4 hidden md:table-cell">Email</th>
                <th className="py-3 pr-4 hidden lg:table-cell">Institution</th>
                <th className="py-3 pr-4 hidden lg:table-cell">Track</th>
                <th className="py-3 pr-4 hidden lg:table-cell">IEEE #</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr
                  key={reg.participant_id}
                  className="border-b border-brand-muted/10 hover:bg-brand-lime/5 transition-colors"
                >
                  <td className="py-3 pr-4 font-mono text-xs text-brand-lime">
                    {reg.participant_id}
                  </td>
                  <td className="py-3 pr-4 font-semibold">{reg.name}</td>
                  <td className="py-3 pr-4 hidden md:table-cell text-brand-muted">
                    {reg.email}
                  </td>
                  <td className="py-3 pr-4 hidden lg:table-cell text-brand-muted">
                    {reg.institution ?? "—"}
                  </td>
                  <td className="py-3 pr-4 hidden lg:table-cell capitalize text-brand-muted">
                    {reg.track_preference ?? "—"}
                  </td>
                  <td className="py-3 pr-4 hidden lg:table-cell text-brand-muted">
                    {reg.ieee_membership_no ?? "—"}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => setQrModalId(reg.participant_id)}
                      className="text-brand-lime text-xs font-semibold uppercase tracking-wider hover:underline"
                    >
                      View QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {registrations.length === 0 && (
            <p className="text-center text-brand-muted py-12">
              No registrations yet.
            </p>
          )}
        </div>
      </section>

      {/* QR Modal */}
      {qrModalId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/80 backdrop-blur-sm p-4"
          onClick={() => setQrModalId(null)}
        >
          <div
            className="bg-brand-black border-2 border-brand-muted/20 p-8 max-w-sm w-full flex flex-col items-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg uppercase">
              QR for{" "}
              <span className="text-brand-lime font-mono text-sm">
                {qrModalId}
              </span>
            </h3>

            <div
              id="qr-modal-canvas"
              className="bg-brand-white p-4 inline-block"
            >
              <QRCodeCanvas
                value={qrModalId}
                size={200}
                bgColor="#FFFFFF"
                fgColor="#0D0D0D"
                level="M"
                marginSize={2}
              />
            </div>

            <div className="flex gap-3 w-full">
              <Button
                onClick={() => downloadQR(qrModalId)}
                className="flex-1"
                size="sm"
              >
                Download PNG
              </Button>
              <Button
                variant="ghost"
                onClick={() => setQrModalId(null)}
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
