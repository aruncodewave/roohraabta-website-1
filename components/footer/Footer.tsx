"use client";

import { useEffect, useId, useRef, useState } from "react";
import Logo from "@/components/common/Logo";
import { footerMenuRows, footerNav, type FooterService } from "@/data/navigation";

const socialIcons: Record<string, string> = {
  Instagram: "/logo/instagram.svg",
  Facebook: "/logo/facebook.svg",
  LinkedIn: "/logo/linkedin.svg",
};

const columnTitle = "whitespace-nowrap text-center font-serif text-[20px] font-normal leading-none text-[#762323] lg:text-[24px]";
const columnText = "text-center font-serif text-[15px] font-normal leading-[1.45] text-[#762323] lg:text-[18px]";

function ServiceChevron({ open }: { open: boolean }) {
  return (
    <img
      src={open ? "/icons/arrowUp.svg" : "/icons/arrowDown.svg"}
      alt=""
      width={45}
      height={26}
      className="h-[6px] w-[10px] brightness-0 invert"
    />
  );
}

function ServiceItem({
  service,
  open,
  onToggle,
}: {
  service: FooterService;
  open: boolean;
  onToggle: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onToggle();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onToggle();
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onToggle]);

  return (
    <li className="flex justify-center">
      <div ref={rootRef} className="relative inline-flex items-center whitespace-nowrap">
        <a href={service.href} className="hover:opacity-70">
          {service.label}
        </a>
        <span className="relative ml-1.5">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${open ? "Hide" : "Show"} ${service.label} cities`}
            onClick={onToggle}
            className={`relative inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-[#8B7E2A] ${open ? "z-[10001]" : ""}`}
          >
            <ServiceChevron open={open} />
          </button>
          {open ? (
            <ul
              id={panelId}
              className="absolute top-1/2 left-0 z-[10000] min-w-[148px] rounded-lg bg-[#E6D9BE] py-2.5 pr-4 pl-6 text-left font-serif text-[14px] leading-[1.5] text-[#762323] lg:text-[15px]"
            >
              {service.cities.map((city) => (
                <li key={city.href} className="list-disc">
                  <a href={city.href} className="whitespace-nowrap hover:opacity-70">
                    {city.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </span>
      </div>
    </li>
  );
}

function LinkRow({ links }: { links: { label: string; href: string }[] }) {
  return (
    <p className={`${columnText} flex flex-wrap items-center justify-center`}>
      {links.map((link, index) => (
        <span key={link.label} className="whitespace-nowrap">
          <a href={link.href} className="hover:opacity-70">
            {link.label}
          </a>
          {index < links.length - 1 ? <span className="px-2">|</span> : null}
        </span>
      ))}
    </p>
  );
}

export default function Footer() {
  const [openService, setOpenService] = useState<string | null>(null);

  return (
    <footer className="bg-cream text-[#762323]">
      <div
        aria-hidden="true"
        className="pointer-events-none ml-[2px] h-0 w-[min(1725px,calc(100%-2px))] border-[4px] border-solid border-[#A2A2A2] opacity-30 shadow-[0px_4px_6px_0px_#00000040]"
      />
      <div className="mx-auto flex w-full flex-col items-center px-6 py-14 sm:px-10 lg:px-16 lg:py-16">
        <Logo className="h-24 w-auto sm:h-28" />

        <div className="mt-14 grid w-full grid-cols-1 gap-12 md:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-start md:gap-8">
          <nav aria-label="Footer menu" className="flex flex-col items-center gap-4">
            {footerMenuRows.map((row) => (
              <LinkRow key={row.map((link) => link.label).join("|")} links={row} />
            ))}
          </nav>

          <nav
            aria-label="Matchmaking services"
            className={`relative flex flex-col items-center gap-4 ${openService ? "z-[10000]" : ""}`}
          >
            <h2 className={columnTitle}>Matchmaking Services</h2>
            <ul className={`flex flex-col items-center gap-3 ${columnText}`}>
              {footerNav.services.map((service) => (
                <ServiceItem
                  key={service.href}
                  service={service}
                  open={openService === service.href}
                  onToggle={() => setOpenService((current) => (current === service.href ? null : service.href))}
                />
              ))}
            </ul>
          </nav>

          <div className="flex flex-col items-center gap-4">
            <h2 className={columnTitle}>Contact</h2>
            <p className={`${columnText} flex flex-wrap items-center justify-center`}>
              {footerNav.contactCities.map((city, index) => (
                <span key={city} className="whitespace-nowrap">
                  {city}
                  {index < footerNav.contactCities.length - 1 ? <span className="px-2">|</span> : null}
                </span>
              ))}
            </p>
            <a
              href={footerNav.whatsapp.href}
              className="whitespace-nowrap text-center font-serif text-[15px] leading-none text-[#8B7E2A] underline decoration-solid underline-offset-4 hover:opacity-70 lg:text-[18px]"
            >
              {footerNav.whatsapp.label}
            </a>
            <ul className="mt-2 flex items-center justify-center gap-4">
              {footerNav.social.map((item) => (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label} className="inline-flex hover:opacity-80">
                    <img src={socialIcons[item.label]} alt="" width={39} height={39} className="h-[39px] w-[39px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`mt-16 flex w-full flex-col items-center gap-4 md:flex-row md:justify-between ${columnText}`}>
          <p>{footerNav.copyright}</p>
          <p>
            {footerNav.legal.map((link, index) => (
              <span key={link.href} className="whitespace-nowrap">
                <a href={link.href} className="hover:opacity-70">
                  {link.label}
                </a>
                {index < footerNav.legal.length - 1 ? <span className="px-3">|</span> : null}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
