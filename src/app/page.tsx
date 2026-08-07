import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { StatBlock } from "@/components/ui/stat-block";
import { Chevron } from "@/components/ui/chevron";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { tracks } from "@/lib/mock-data/tracks";
import { speakers } from "@/lib/mock-data/speakers";
import { sponsors } from "@/lib/mock-data/sponsors";

export default function Home() {
  const featuredSpeakers = speakers.filter((s) => s.featured).slice(0, 4);
  const titleSponsor = sponsors.find((s) => s.tier === "Title");
  const platinumSponsors = sponsors.filter((s) => s.tier === "Platinum");

  return (
    <>
      {/* Hero Section */}
      <SectionWrapper withWatermark className="pt-20 md:pt-32 pb-24 md:pb-40 border-b border-brand-muted/20">
        <div className="max-w-4xl">
          <p className="text-brand-lime font-bold uppercase tracking-widest mb-4">
            12th Edition • October 25-27, 2026 • Tech University
          </p>
          <h1 className="text-6xl md:text-8xl font-display uppercase leading-[0.9] mb-6">
            IEEE AICSSYC <br /> 2026
          </h1>
          <p className="text-xl md:text-2xl text-brand-muted font-sans max-w-2xl mb-12">
            Innovating for a Sustainable Future. Join the brightest minds in tech
            for three days of deep technical insights, leadership growth, and
            entrepreneurial vision.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-16">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Register your attendance <Chevron className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/schedule">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto">
                View Schedule
              </Button>
            </Link>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-muted mb-4">
              Event starts in
            </p>
            <CountdownTimer targetDate="2026-10-25T09:00:00" />
          </div>
        </div>
      </SectionWrapper>

      {/* Stats Strip */}
      <section className="border-b border-brand-muted/20 bg-brand-black">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-brand-muted/20">
            <StatBlock label="Tracks" value={3} className="md:px-8 first:pl-0" />
            <StatBlock label="Speakers" value="15+" className="md:px-8" />
            <StatBlock label="Delegates" value="500+" className="md:px-8" />
            <StatBlock label="Editions" value={12} className="md:px-8" />
          </div>
        </div>
      </section>

      {/* Tracks Overview */}
      <SectionWrapper>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-display uppercase">The Tracks</h2>
            <p className="text-brand-muted text-lg mt-4 max-w-xl">
              Tailored experiences for engineers, leaders, and founders. Choose
              your path or mix and match.
            </p>
          </div>
          <Link href="/tracks" className="text-brand-lime font-bold uppercase tracking-wider flex items-center hover:underline">
            View full track details <Chevron className="ml-1 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tracks.map((track, i) => (
            <Card
              key={track.id}
              className={i === 1 ? "md:translate-y-8" : i === 2 ? "md:translate-y-16" : ""}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-brand-lime/10 flex items-center justify-center mb-4 border border-brand-lime/20">
                  <span className="font-display text-brand-lime text-2xl">
                    0{i + 1}
                  </span>
                </div>
                <CardTitle>{track.name}</CardTitle>
                <CardDescription className="pt-2">{track.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </SectionWrapper>

      {/* Featured Speakers */}
      <SectionWrapper className="bg-brand-white text-brand-black">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-display uppercase">Featured Speakers</h2>
            <p className="text-brand-muted text-lg mt-4 max-w-xl">
              Hear from industry veterans, cutting-edge researchers, and successful founders.
            </p>
          </div>
          <Link href="/speakers" className="text-brand-black font-bold uppercase tracking-wider flex items-center hover:underline">
            See all speakers <Chevron className="ml-1 w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSpeakers.map((speaker) => (
            <div key={speaker.id} className="group relative overflow-hidden bg-brand-black/5 aspect-[3/4] border border-brand-black/10 flex flex-col justify-end p-6">
              {/* Image Placeholder */}
              <div className="absolute inset-0 bg-brand-black/10 mix-blend-multiply group-hover:bg-brand-lime/20 transition-colors" />
              
              <div className="relative z-10">
                <h3 className="font-display text-2xl uppercase leading-tight mb-1">{speaker.name}</h3>
                <p className="font-bold text-sm">{speaker.title}</p>
                <p className="text-sm text-brand-muted">{speaker.affiliation}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* Sponsors Strip */}
      <section className="py-24 border-t border-brand-muted/20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-muted mb-12">
            Supported By
          </h2>
          
          <div className="flex flex-col items-center gap-16">
            {/* Title Sponsor */}
            {titleSponsor && (
              <div className="flex flex-col items-center">
                <span className="text-brand-lime text-xs uppercase tracking-widest font-bold mb-4">Title Sponsor</span>
                <div className="h-20 md:h-28 px-12 py-6 border border-brand-muted/30 flex items-center justify-center bg-brand-white/5">
                  <span className="font-display text-3xl md:text-5xl">{titleSponsor.name}</span>
                </div>
              </div>
            )}
            
            {/* Platinum Sponsors */}
            <div className="flex flex-col items-center w-full">
              <span className="text-brand-muted text-xs uppercase tracking-widest font-bold mb-4">Platinum Sponsors</span>
              <div className="flex flex-wrap justify-center gap-8 w-full">
                {platinumSponsors.map(sponsor => (
                  <div key={sponsor.id} className="h-16 md:h-20 px-8 py-4 border border-brand-muted/30 flex items-center justify-center bg-brand-white/5 min-w-[200px]">
                    <span className="font-display text-xl md:text-2xl">{sponsor.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/sponsors" className="mt-8">
              <Button variant="ghost">
                View all sponsors & Prospectus
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
