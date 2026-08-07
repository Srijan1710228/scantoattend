import { cn } from "@/lib/utils";

interface StatBlockProps {
  label: string;
  value: string | number;
  className?: string;
}

export function StatBlock({ label, value, className }: StatBlockProps) {
  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <span className="font-display text-5xl md:text-6xl text-brand-lime leading-none">
        {value}
      </span>
      <span className="text-brand-muted font-sans uppercase tracking-wider text-sm font-semibold">
        {label}
      </span>
    </div>
  );
}
