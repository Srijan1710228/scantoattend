"use client";

import { useState } from "react";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { Chevron } from "@/components/ui/chevron";
import { speakers, Speaker } from "@/lib/mock-data/speakers";
import { X } from "lucide-react";

export default function SpeakersPage() {
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  return (
    <>
      <SectionWrapper withWatermark className="pt-20 md:pt-32 pb-12 border-b border-brand-muted/20">
        <h1 className="text-5xl md:text-7xl font-display uppercase mb-6 max-w-4xl">
          Speakers
        </h1>
        <p className="text-xl md:text-2xl text-brand-muted font-sans max-w-2xl">
          Meet the experts, visionaries, and leaders shaping the future of technology.
        </p>
      </SectionWrapper>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {speakers.map((speaker) => (
              <div 
                key={speaker.id} 
                className="group relative cursor-pointer border border-brand-muted/30 bg-brand-white/5 hover:border-brand-lime transition-colors"
                onClick={() => setSelectedSpeaker(speaker)}
              >
                {/* Photo Placeholder */}
                <div className="aspect-square bg-brand-black flex items-center justify-center p-8 overflow-hidden relative">
                   <div className="absolute inset-0 bg-brand-muted/10 group-hover:bg-brand-lime/10 transition-colors" />
                   <Chevron className="w-16 h-16 text-brand-muted/20 group-hover:text-brand-lime/40 transition-colors" />
                </div>
                
                <div className="p-6">
                  <h3 className="font-display text-xl uppercase leading-tight mb-1 group-hover:text-brand-lime transition-colors">{speaker.name}</h3>
                  <p className="font-bold text-sm">{speaker.title}</p>
                  <p className="text-sm text-brand-muted mb-4">{speaker.affiliation}</p>
                  <div className="text-xs font-semibold text-brand-lime uppercase tracking-widest flex items-center">
                    Read Bio <Chevron className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Modal */}
      {selectedSpeaker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/80 backdrop-blur-sm">
          <div className="bg-brand-black border border-brand-lime p-6 md:p-10 max-w-2xl w-full relative shadow-2xl overflow-y-auto max-h-[90vh]">
            <button 
              className="absolute top-4 right-4 text-brand-muted hover:text-brand-white"
              onClick={() => setSelectedSpeaker(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl md:text-5xl font-display uppercase mb-2 text-brand-lime">{selectedSpeaker.name}</h2>
            <p className="text-lg font-bold">{selectedSpeaker.title}</p>
            <p className="text-brand-muted mb-8">{selectedSpeaker.affiliation}</p>
            
            <h4 className="font-bold uppercase tracking-widest text-xs text-brand-muted mb-2">Biography</h4>
            <p className="text-brand-white/90 leading-relaxed mb-8">
              {selectedSpeaker.bio}
            </p>
            
            <h4 className="font-bold uppercase tracking-widest text-xs text-brand-muted mb-2">Session</h4>
            <p className="text-lg font-semibold border-l-2 border-brand-lime pl-4">
              {selectedSpeaker.talkTitle}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
