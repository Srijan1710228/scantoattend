"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Chevron } from "./chevron";
import { Menu, X } from "lucide-react";
import { Button } from "./button";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/tracks", label: "Tracks" },
  { href: "/schedule", label: "Schedule" },
  { href: "/speakers", label: "Speakers" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/venue", label: "Venue" },
];

export function NavBar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-brand-black/90 backdrop-blur-md border-b border-brand-muted/20 py-4"
          : "bg-transparent py-6"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl tracking-tighter"
        >
          <Chevron className="text-brand-lime" />
          <span>AICSSYC<span className="text-brand-lime">26</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-semibold uppercase tracking-wider transition-colors hover:text-brand-lime",
                pathname === link.href ? "text-brand-lime" : "text-brand-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link href="/register">
            <Button>
              Register your attendance <Chevron className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-brand-white p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-brand-black border-b border-brand-muted/20 py-4 px-4 flex flex-col gap-4 shadow-xl">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "text-lg font-semibold uppercase tracking-wider py-2",
                pathname === link.href ? "text-brand-lime" : "text-brand-white"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-brand-muted/20">
            <Link href="/register" onClick={() => setIsOpen(false)}>
              <Button className="w-full">Register your attendance</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
