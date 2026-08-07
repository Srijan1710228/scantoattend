import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Button } from "@/components/ui/button";
import { Chevron } from "@/components/ui/chevron";
import { sponsors, SponsorTier } from "@/lib/mock-data/sponsors";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Sponsors | IEEE AICSSYC 2026",
};

export default function SponsorsPage() {
  const getSponsorsByTier = (tier: SponsorTier) => 
    sponsors.filter(s => s.tier === tier);

  const tiers: { name: SponsorTier; size: "xl" | "lg" | "md" | "sm" }[] = [
    { name: "Title", size: "xl" },
    { name: "Platinum", size: "lg" },
    { name: "Gold", size: "md" },
    { name: "Silver", size: "sm" },
    { name: "Community", size: "sm" },
  ];

  return (
    <>
      <SectionWrapper withWatermark className="pt-20 md:pt-32 pb-12 border-b border-brand-muted/20">
        <h1 className="text-5xl md:text-7xl font-display uppercase mb-6 max-w-4xl">
          Sponsors & Partners
        </h1>
        <p className="text-xl md:text-2xl text-brand-muted font-sans max-w-2xl mb-8">
          We are deeply grateful to the organizations making this event possible.
        </p>
        <a href="#prospectus">
          <Button>
            Download Prospectus <Chevron className="w-4 h-4 ml-1" />
          </Button>
        </a>
      </SectionWrapper>

      <section className="py-20 bg-brand-white text-brand-black">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col gap-24 items-center">
            {tiers.map(({ name, size }) => {
              const tierSponsors = getSponsorsByTier(name);
              if (tierSponsors.length === 0) return null;

              return (
                <div key={name} className="w-full flex flex-col items-center">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-brand-muted mb-8 text-center border-b-2 border-brand-lime pb-2 inline-block">
                    {name} {name === "Community" ? "Partners" : "Sponsors"}
                  </h2>
                  
                  <div className="flex flex-wrap justify-center gap-6 md:gap-8 w-full max-w-5xl">
                    {tierSponsors.map(sponsor => (
                      <div 
                        key={sponsor.id} 
                        className={cn(
                          "border border-brand-black/10 bg-brand-black/5 flex items-center justify-center p-6 text-center hover:bg-brand-black/10 transition-colors",
                          size === "xl" && "w-full md:w-[600px] h-48 md:h-64",
                          size === "lg" && "w-full md:w-[400px] h-32 md:h-48",
                          size === "md" && "w-[calc(50%-1rem)] md:w-[300px] h-28 md:h-40",
                          size === "sm" && "w-[calc(50%-1rem)] md:w-[200px] h-24 md:h-32"
                        )}
                      >
                        <span className={cn(
                          "font-display uppercase leading-none",
                          size === "xl" && "text-4xl md:text-6xl",
                          size === "lg" && "text-2xl md:text-4xl",
                          size === "md" && "text-xl md:text-3xl",
                          size === "sm" && "text-lg md:text-xl"
                        )}>
                          {sponsor.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="prospectus" className="py-24 bg-brand-lime text-brand-black text-center">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Chevron className="w-16 h-16 mx-auto mb-6 text-brand-black" />
          <h2 className="text-4xl md:text-6xl font-display uppercase mb-6">
            Become a Sponsor
          </h2>
          <p className="text-lg mb-8 font-semibold">
            Connect with over 500 top-tier students and young professionals. Support the ecosystem and build your employer brand.
          </p>
          <Button variant="ghost" className="border-brand-black text-brand-black hover:bg-brand-black/10">
            Contact Sponsorship Team
          </Button>
        </div>
      </section>
    </>
  );
}
