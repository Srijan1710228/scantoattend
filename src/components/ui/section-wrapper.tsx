import * as React from "react";
import { cn } from "@/lib/utils";
import { Chevron } from "./chevron";

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  withWatermark?: boolean;
}

export function SectionWrapper({
  className,
  children,
  withWatermark = false,
  ...props
}: SectionWrapperProps) {
  return (
    <section
      className={cn("relative overflow-hidden py-16 md:py-24", className)}
      {...props}
    >
      {withWatermark && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-12 scale-[3] text-brand-lime">
          <Chevron className="w-full h-full" />
        </div>
      )}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        {children}
      </div>
    </section>
  );
}
