import { SectionWrapper } from "@/components/ui/section-wrapper";
import { VENUE_LAT, VENUE_LNG, EVENT_DAYS } from "@/lib/config/venue";

export const metadata = {
  title: "Venue | IEEE AICSSYC 2026",
};

export default function VenuePage() {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${VENUE_LNG - 0.01}%2C${VENUE_LAT - 0.01}%2C${VENUE_LNG + 0.01}%2C${VENUE_LAT + 0.01}&layer=mapnik&marker=${VENUE_LAT}%2C${VENUE_LNG}`;

  return (
    <>
      <SectionWrapper
        withWatermark
        className="pt-20 md:pt-32 pb-12 border-b border-brand-muted/20"
      >
        <h1 className="text-5xl md:text-7xl font-display uppercase mb-6 max-w-4xl">
          Venue
        </h1>
        <p className="text-xl md:text-2xl text-brand-muted font-sans max-w-2xl">
          Join us at Tech University campus for three days of innovation and
          collaboration.
        </p>
      </SectionWrapper>

      <section className="py-20 border-b border-brand-muted/20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl md:text-5xl font-display uppercase mb-8">
                Tech University
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-lime mb-2">
                    Address
                  </h3>
                  <p className="text-brand-white/80 leading-relaxed">
                    Tech University Campus
                    <br />
                    123 Innovation Drive
                    <br />
                    Bangalore, Karnataka 560001
                    <br />
                    India
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-lime mb-2">
                    Coordinates
                  </h3>
                  <p className="text-brand-white/80 font-mono text-sm">
                    {VENUE_LAT.toFixed(6)}° N, {VENUE_LNG.toFixed(6)}° E
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-lime mb-2">
                    Getting There
                  </h3>
                  <ul className="text-brand-white/80 space-y-2">
                    <li>
                      <strong>Metro:</strong> Nearest station — Tech Park
                      (Purple Line), 1.2 km from venue.
                    </li>
                    <li>
                      <strong>Bus:</strong> Routes 201, 210, and 335 stop at
                      University Gate.
                    </li>
                    <li>
                      <strong>Parking:</strong> On-campus parking available at
                      Gate C (limited spots).
                    </li>
                    <li>
                      <strong>Airport:</strong> Kempegowda International
                      Airport (BLR) — ~35 km, ~45 min by taxi.
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-brand-lime mb-2">
                    Event Dates
                  </h3>
                  <div className="flex flex-col gap-2">
                    {EVENT_DAYS.map((day) => (
                      <div
                        key={day.id}
                        className="border border-brand-muted/30 px-4 py-3 bg-brand-white/5"
                      >
                        <span className="font-display uppercase">
                          {day.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-2 border-brand-muted/20 aspect-video bg-brand-white/5">
                <iframe
                  title="Venue Map"
                  src={mapUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>

              <div className="bg-brand-lime/10 border border-brand-lime/30 p-6">
                <h3 className="font-display text-xl uppercase mb-3">
                  Check-In Location
                </h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Arrive at the <strong>Main Auditorium entrance</strong>{" "}
                  (Gate A). Event volunteers will be stationed there from 8:00
                  AM onwards to assist with QR check-in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
