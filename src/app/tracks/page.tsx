import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Chevron } from "@/components/ui/chevron";
import { tracks } from "@/lib/mock-data/tracks";

export const metadata = {
  title: "Tracks | IEEE AICSSYC 2026",
};

export default function TracksPage() {
  const technical = tracks.find((t) => t.id === "technical");
  const managerial = tracks.find((t) => t.id === "managerial");
  const entrepreneurial = tracks.find((t) => t.id === "entrepreneurial");

  return (
    <>
      <SectionWrapper withWatermark className="pt-20 md:pt-32 pb-12 border-b border-brand-muted/20">
        <h1 className="text-5xl md:text-7xl font-display uppercase mb-6 max-w-4xl">
          Event Tracks
        </h1>
        <p className="text-xl md:text-2xl text-brand-muted font-sans max-w-2xl">
          Three curated paths designed to expand your horizons. Mix and match sessions to build your perfect schedule.
        </p>
      </SectionWrapper>

      {technical && (
        <section className="py-24 border-b border-brand-muted/20 bg-brand-white text-brand-black">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-9xl font-display text-brand-black/10 absolute -mt-20 -ml-8 select-none pointer-events-none">
                  01
                </div>
                <h2 className="relative text-5xl md:text-6xl font-display uppercase mb-6">
                  {technical.name}
                </h2>
                <p className="text-lg leading-relaxed mb-8">
                  {technical.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-8">
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs text-brand-muted mb-2">Format</h4>
                    <p className="font-semibold">{technical.format}</p>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-widest text-xs text-brand-muted mb-2">Audience</h4>
                    <p className="font-semibold">{technical.audience}</p>
                  </div>
                </div>
              </div>
              <div className="relative h-64 lg:h-full min-h-[300px] border-4 border-brand-black/10 bg-brand-black/5 p-8 flex items-center justify-center">
                <Chevron className="w-32 h-32 text-brand-black/20" />
                <div className="absolute inset-0 border-l-4 border-brand-lime ml-4 -mt-4 w-full h-full pointer-events-none" />
              </div>
            </div>
          </div>
        </section>
      )}

      {managerial && (
        <section className="py-24 border-b border-brand-muted/20 bg-brand-black text-brand-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 flex flex-col gap-6">
                <div className="border border-brand-muted/30 p-8 bg-brand-white/5">
                  <h4 className="font-bold uppercase tracking-widest text-xs text-brand-lime mb-2">Format</h4>
                  <p className="text-lg">{managerial.format}</p>
                </div>
                <div className="border border-brand-muted/30 p-8 bg-brand-white/5">
                  <h4 className="font-bold uppercase tracking-widest text-xs text-brand-lime mb-2">Audience</h4>
                  <p className="text-lg">{managerial.audience}</p>
                </div>
              </div>
              <div className="order-1 lg:order-2 text-right">
                <div className="text-9xl font-display text-brand-white/5 absolute -mt-20 ml-auto right-4 select-none pointer-events-none">
                  02
                </div>
                <h2 className="relative text-5xl md:text-6xl font-display uppercase mb-6 text-brand-lime">
                  {managerial.name}
                </h2>
                <p className="text-lg leading-relaxed text-brand-muted ml-auto max-w-md">
                  {managerial.description}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {entrepreneurial && (
        <section className="py-24 bg-brand-white/5 text-brand-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block text-9xl font-display text-brand-white/5 select-none pointer-events-none mb-4">
                03
              </div>
              <h2 className="text-5xl md:text-6xl font-display uppercase mb-6">
                {entrepreneurial.name}
              </h2>
              <p className="text-xl leading-relaxed text-brand-muted mb-12">
                {entrepreneurial.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="border-t-2 border-brand-lime pt-6">
                  <h4 className="font-bold uppercase tracking-widest text-xs text-brand-muted mb-2">Format</h4>
                  <p className="text-lg font-semibold">{entrepreneurial.format}</p>
                </div>
                <div className="border-t-2 border-brand-lime pt-6">
                  <h4 className="font-bold uppercase tracking-widest text-xs text-brand-muted mb-2">Audience</h4>
                  <p className="text-lg font-semibold">{entrepreneurial.audience}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
