import { cn } from "@/lib/utils";

interface ChevronProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function Chevron({ className, ...props }: ChevronProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
      {...props}
    >
      <path
        d="M6.5 17.5L12 12L6.5 6.5M13 17.5L18.5 12L13 6.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
