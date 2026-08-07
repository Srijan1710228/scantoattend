import Link from "next/link";
import { Chevron } from "./chevron";

export function Footer() {
  return (
    <footer className="bg-brand-black border-t border-brand-muted/20 pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-display text-2xl tracking-tighter mb-4"
            >
              <Chevron className="text-brand-lime" />
              <span>AICSSYC<span className="text-brand-lime">26</span></span>
            </Link>
            <p className="text-brand-muted max-w-sm mb-6">
              The 12th edition of the IEEE All India Computer Society Student
              Youth Congress. Innovating for a Sustainable Future.
            </p>
            <p className="text-sm font-semibold text-brand-white">
              Hosted by IEEE Student Branch
            </p>
          </div>
          <div>
            <h4 className="font-display text-lg mb-4 text-brand-white">Explore</h4>
            <ul className="flex flex-col gap-2 text-brand-muted">
              <li>
                <Link href="/about" className="hover:text-brand-lime transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="hover:text-brand-lime transition-colors">
                  Schedule
                </Link>
              </li>
              <li>
                <Link href="/speakers" className="hover:text-brand-lime transition-colors">
                  Speakers
                </Link>
              </li>
              <li>
                <Link href="/sponsors" className="hover:text-brand-lime transition-colors">
                  Sponsors
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg mb-4 text-brand-white">Connect</h4>
            <ul className="flex flex-col gap-2 text-brand-muted">
              <li>
                <Link href="/contact" className="hover:text-brand-lime transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/venue" className="hover:text-brand-lime transition-colors">
                  Venue & Directions
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-brand-lime transition-colors">
                  Twitter / X
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-brand-lime transition-colors">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-brand-muted/20 text-sm text-brand-muted">
          <p>© 2026 IEEE CS. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built by Techtonics</p>
        </div>
      </div>
    </footer>
  );
}
