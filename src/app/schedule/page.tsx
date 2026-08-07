import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Chevron } from "@/components/ui/chevron";
import { sessions } from "@/lib/mock-data/sessions";
import { speakers } from "@/lib/mock-data/speakers";
import { EVENT_DAYS } from "@/lib/config/venue";

export const metadata = {
  title: "Schedule | IEEE AICSSYC 2026",
};

const days = EVENT_DAYS;

export default function SchedulePage() {
  return (
    <>
      <SectionWrapper
        withWatermark
        className="pt-20 md:pt-32 pb-12 border-b border-brand-muted/20"
      >
        <h1 className="text-5xl md:text-7xl font-display uppercase mb-6 max-w-4xl">
          Schedule
        </h1>
        <p className="text-xl md:text-2xl text-brand-muted font-sans max-w-2xl">
          Three days of keynotes, workshops, and networking. Plan your perfect
          congress.
        </p>
      </SectionWrapper>

      {days.map((day) => {
        const daySessions = sessions.filter((s) => s.date === day.date);
        if (daySessions.length === 0) return null;

        return (
          <section key={day.id} className="py-20 border-b border-brand-muted/20">
            <div className="container mx-auto px-4 md:px-6">
              <div className="flex items-center gap-4 mb-12">
                <span className="text-brand-lime font-display text-6xl md:text-8xl leading-none">
                  0{day.id.split("-")[1]}
                </span>
                <div>
                  <h2 className="text-3xl md:text-4xl font-display uppercase">
                    {day.label}
                  </h2>
                  <p className="text-brand-muted mt-1">
                    {daySessions.length} sessions
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-6 max-w-4xl">
                {daySessions.map((session) => {
                  const speaker = speakers.find(
                    (s) => s.id === session.speakerId
                  );
                  return (
                    <div
                      key={session.id}
                      className="border-2 border-brand-muted/20 p-6 md:p-8 hover:border-brand-lime/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-lime border border-brand-lime/30 px-2 py-1">
                              {session.startTime} – {session.endTime}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-muted border border-brand-muted/30 px-2 py-1">
                              {session.room}
                            </span>
                          </div>
                          <h3 className="text-xl md:text-2xl font-display uppercase leading-tight">
                            {session.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-brand-muted text-sm leading-relaxed mb-6 max-w-2xl">
                        {session.description}
                      </p>

                      {speaker && (
                        <div className="flex items-center gap-4 pt-4 border-t border-brand-muted/10">
                          <div className="w-10 h-10 bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center">
                            <Chevron className="w-5 h-5 text-brand-lime" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {speaker.name}
                            </p>
                            <p className="text-xs text-brand-muted">
                              {speaker.title} • {speaker.affiliation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
