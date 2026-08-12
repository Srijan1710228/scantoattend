import Link from "next/link";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Chevron } from "@/components/ui/chevron";

export default function Home() {
  return (
    <SectionWrapper
      withWatermark
      className="pt-20 md:pt-32 pb-20 min-h-[85vh] flex items-center justify-center"
    >
      <div className="relative w-full max-w-xl mx-auto bg-brand-black/40 backdrop-blur-md border border-brand-muted/20 p-8 rounded-2xl shadow-2xl flex flex-col gap-10 overflow-hidden group">
        {/* Glow effect */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-lime/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight mb-2 text-brand-white">
            SCANTOATTEND
          </h1>
          <p className="text-brand-muted text-sm tracking-wider uppercase">
            Fast. Simple. Verified.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Member Selection Option */}
          <Link href="/member" className="block group/item">
            <div className="border border-brand-muted/30 hover:border-brand-lime/40 bg-brand-black/40 hover:bg-brand-lime/5 p-6 rounded-xl transition-all duration-300 flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-display text-xl uppercase text-brand-white group-hover/item:text-brand-lime transition-colors">
                  I&apos;m a Member
                </h3>
                <p className="text-brand-muted text-xs mt-1">
                  Scan &amp; mark attendance for active club sessions.
                </p>
              </div>
              <Chevron className="w-5 h-5 text-brand-muted group-hover/item:text-brand-lime transition-colors rotate-90" />
            </div>
          </Link>

          {/* Admin Selection Option */}
          <Link href="/admin" className="block group/item">
            <div className="border border-brand-muted/30 hover:border-brand-lime/40 bg-brand-black/40 hover:bg-brand-lime/5 p-6 rounded-xl transition-all duration-300 flex items-center justify-between">
              <div className="text-left">
                <h3 className="font-display text-xl uppercase text-brand-white group-hover/item:text-brand-lime transition-colors">
                  I&apos;m an Admin
                </h3>
                <p className="text-brand-muted text-xs mt-1">
                  Manage sessions, track check-ins, and export reports.
                </p>
              </div>
              <Chevron className="w-5 h-5 text-brand-muted group-hover/item:text-brand-lime transition-colors rotate-90" />
            </div>
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
