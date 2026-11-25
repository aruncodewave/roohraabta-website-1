"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import Sidebar from "@/components/sidebar/Sidebar";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [menuOnScreen, setMenuOnScreen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMenu = useCallback(() => setOpen(false), []);
  const handleExited = useCallback(() => setMenuOnScreen(false), []);

  useEffect(() => {
    if (open) setMenuOnScreen(true);
  }, [open]);

  useEffect(() => {
    let compact = false;

    const apply = (next: boolean) => {
      if (next === compact) return;
      compact = next;
      setScrolled(next);
    };

    apply(window.scrollY > 160);

    const handleScroll = () => {
      const y = window.scrollY;
      if (y > 160) apply(true);
      else if (y < 8) apply(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOnScreen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOnScreen]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeMenu]);

  const toggleMenu = () => {
    if (rotating) return;
    setRotating(true);
    window.setTimeout(() => {
      setOpen((current) => !current);
      setRotating(false);
    }, 300);
  };

  return (
    <header className="sticky top-0 z-[80] bg-cream shadow-[0px_2px_8px_0px_#00000040] [overflow-anchor:none]">
      <div
        className={`grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center transition-all duration-300 ease-in-out ${
          scrolled ? "h-[68px] md:h-[90px]" : "h-[88px] sm:h-[104px] md:h-[150px]"
        }`}
      >
        <div className="flex min-w-0 items-center overflow-x-clip pl-3 sm:pl-6 md:pl-8">
          <div className="@container min-w-0 flex-1">
            <Link
              href="/contact"
              className="inline-block max-w-full py-1 text-center font-sans text-[clamp(16px,14.2cqw,40px)] font-bold leading-[1.15] tracking-[-0.02em] whitespace-nowrap text-[#762323] hover:opacity-70"
            >
              Begin Your Journey
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <Logo
            className={`object-contain transition-all duration-300 ease-in-out ${
              scrolled
                ? "h-[40px] w-[60px] sm:h-[48px] sm:w-[72px] md:h-[60px] md:w-[90px]"
                : "h-[52px] w-[78px] sm:h-[64px] sm:w-[96px] md:h-[80px] md:w-[120px]"
            }`}
          />
        </div>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={toggleMenu}
          className={`relative z-50 flex cursor-pointer items-center justify-self-end pr-3 text-burgundy md:pr-6 ${
            menuOnScreen ? "pointer-events-none invisible" : ""
          }`}
          tabIndex={menuOnScreen ? -1 : 0}
        >
          <span className={rotating ? "menu-spin" : ""}>
            <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-8 sm:w-8 md:h-16 md:w-16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </span>
        </button>
      </div>
      <Sidebar open={open} onClose={closeMenu} onExited={handleExited} />
    </header>
  );
}
