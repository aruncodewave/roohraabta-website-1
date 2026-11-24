"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { memberLogin, primaryNav, type NavItem } from "@/data/navigation";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  onExited: () => void;
};

function MenuArrow({ open }: { open: boolean }) {
  return (
    <img
      src="/icons/arrow.svg"
      alt=""
      width={30}
      height={16}
      className={`h-3.5 w-[30px] shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
    />
  );
}

const highlight = "text-[#f3d98a]";

function scrollToHash(hash: string) {
  let attempts = 0;

  const tryScroll = () => {
    const target = document.getElementById(hash);
    if (target) {
      const header = document.querySelector("header");
      const offset = (header?.getBoundingClientRect().height ?? 0) + 24;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      return;
    }

    attempts += 1;
    if (attempts < 12) window.setTimeout(tryScroll, 100);
  };

  // The menu keeps the page from scrolling until it finishes closing.
  window.setTimeout(tryScroll, 600);
}

function MenuRow({
  item,
  expanded,
  activeId,
  onToggle,
  onSelect,
}: {
  item: NavItem;
  expanded: boolean;
  activeId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  if (!item.children) {
    return (
      <li className="w-full">
        <Link
          href={item.href ?? "/"}
          onClick={(event) => {
            onSelect(item.id);
            const href = item.href ?? "/";
            const hash = href.split("#")[1];
            if (!hash) return;

            const path = href.split("#")[0] || "/";
            if (window.location.pathname === path) {
              event.preventDefault();
              const nextUrl = `${window.location.pathname}${window.location.search}#${hash}`;
              window.history.replaceState(null, "", nextUrl);
              scrollToHash(hash);
            }
          }}
          className={`block w-full text-center transition-colors hover:opacity-80 ${activeId === item.id ? highlight : ""}`}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li className="flex w-full flex-col items-center">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => onToggle(item.id)}
        className={`flex w-full cursor-pointer items-center justify-center gap-3 text-center transition-colors hover:opacity-80 ${activeId === item.id ? highlight : ""}`}
      >
        <span className="min-w-0">{item.label}</span>
        <MenuArrow open={expanded} />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <ul
          className={`mt-4 space-y-3 overflow-hidden text-center font-serif text-[0.75em] font-normal italic leading-none tracking-[-0.01em] ${expanded ? "" : "hidden"}`}
        >
          {item.children.map((child) => (
            <li key={child.href} className="w-full">
              <Link
                href={child.href}
                onClick={() => onSelect(child.href)}
                className={`block w-full text-center transition-colors hover:opacity-80 ${activeId === child.href ? highlight : ""}`}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export default function Sidebar({ open, onClose, onExited }: SidebarProps) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }

    setShown(false);
    setOpenId(null);
    const timeout = window.setTimeout(() => {
      setMounted(false);
      onExited();
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [open, onExited]);

  if (!mounted) return null;

  return (
    <nav
      id="site-menu"
      aria-label="Primary"
      className={`fixed top-0 right-0 z-[90] flex h-dvh w-full flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-olive text-cream transition-transform duration-500 ease-in-out md:w-1/2 ${shown ? "translate-x-0" : "translate-x-full"}`}
    >
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute right-4 top-4 z-50 inline-flex h-10 w-10 cursor-pointer items-center justify-center text-white sm:right-6 sm:top-6"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.75" aria-hidden="true">
          <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div className="mt-[60px] flex min-h-0 flex-1 flex-col justify-between px-6 pb-10 text-center font-newsreader text-[clamp(1.5rem,2.6vw,2rem)] font-medium leading-none tracking-[-0.01em] text-white sm:px-8 lg:mt-[130px]">
          <ul className="flex w-full flex-col items-center gap-6 overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-[30px] md:pt-[50px] lg:pt-0 sm:gap-8">
            {primaryNav.map((item) => (
              <MenuRow
                key={item.id}
                item={item}
                expanded={openId === item.id}
                activeId={activeId}
                onToggle={(id) => {
                  setOpenId((current) => (current === id ? null : id));
                  setActiveId(id);
                }}
                onSelect={(id) => {
                  setActiveId(id);
                  onClose();
                }}
              />
            ))}
          </ul>
          <div className="mx-auto mt-12 w-full max-w-md shrink-0">
            <Link
              href={memberLogin.href}
              onClick={() => {
                setActiveId(memberLogin.href);
                onClose();
              }}
              className={`inline-block border-y py-4 transition-colors hover:opacity-80 ${activeId === memberLogin.href ? "border-[#f3d98a] text-[#f3d98a]" : "border-white"}`}
            >
              {memberLogin.label}
            </Link>
          </div>
        </div>
    </nav>
  );
}
