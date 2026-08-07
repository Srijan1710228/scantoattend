import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Chevron } from "@/components/ui/chevron";

export const metadata = {
  title: "About | IEEE AICSSYC 2026",
};

export default function AboutPage() {
  return (
    <>
      <SectionWrapper withWatermark className="pt-20 md:pt-32 pb-12 border-b border-brand-muted/20">
        <h1 className="text-5xl md:text-7xl font-display uppercase mb-6 max-w-4xl">
          About AICSSYC
        </h1>
        <p className="text-xl md:text-2xl text-brand-muted font-sans max-w-2xl">
          The premier gathering for computer science students and young professionals across India.
        </p>
      </SectionWrapper>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Sidebar Navigation / Quick Facts */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="sticky top-32 space-y-8">
                <div>
                  <h3 className="font-bold text-brand-lime uppercase tracking-widest text-sm mb-2">History</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">
                    First held in 2012, AICSSYC has grown into a flagship event, connecting thousands of innovators.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-brand-lime uppercase tracking-widest text-sm mb-2">Mission</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">
                    To foster technical excellence, leadership, and entrepreneurial spirit among the next generation of technologists.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-8 lg:col-span-7 max-w-none">
              
              <h2 className="text-3xl md:text-4xl mb-6 flex items-center gap-3 font-display uppercase">
                <Chevron className="text-brand-lime w-6 h-6" /> The 12th Edition
              </h2>
              <p className="text-lg leading-relaxed mb-8 text-brand-white/80">
                The IEEE All India Computer Society Student Youth Congress (AICSSYC) is more than just a conference. It is a melting pot of ideas, a launchpad for startups, and a classroom without walls. Now in its 12th year, the congress brings together the sharpest minds from across the country to discuss, debate, and design the future of technology.
              </p>

               <h2 className="text-3xl md:text-4xl mb-6 mt-16 flex items-center gap-3 font-display uppercase">
                 <Chevron className="text-brand-lime w-6 h-6" /> This Year&apos;s Theme
               </h2>
               <h3 className="text-2xl text-brand-lime mb-4 font-display uppercase">Innovating for a Sustainable Future</h3>
               <p className="text-lg leading-relaxed mb-8 text-brand-white/80">
                 Technology is advancing at an unprecedented pace, but so are the global challenges we face. This year, we are focusing on how AI, Web3, Green Computing, and robust software engineering can be leveraged to create sustainable solutions. We believe that the next breakthrough won&apos;t just be faster or smaller—it will be responsible and resilient.
               </p>

               <div className="my-16 p-8 border-l-4 border-brand-lime bg-brand-white/5">
                 <p className="text-2xl font-display leading-snug italic text-brand-white mb-0">
                   &quot;Our goal is to equip students not just with technical skills, but with the perspective needed to solve humanity&apos;s most pressing problems.&quot;
                 </p>
               </div>

              <h2 className="text-3xl md:text-4xl mb-6 mt-16 flex items-center gap-3 font-display uppercase">
                <Chevron className="text-brand-lime w-6 h-6" /> The Host
              </h2>
              <p className="text-lg leading-relaxed mb-8 text-brand-white/80">
                AICSSYC 2026 is proudly hosted by the <strong>IEEE Student Branch of Tech University</strong>. Known for its vibrant technical community and history of organizing large-scale hackathons, the student branch is committed to delivering an unforgettable experience.
              </p>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
