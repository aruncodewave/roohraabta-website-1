import type { ReactNode } from "react";
import { useId } from "react";

type TestimonialSectionProps = {
  src: string;
  title: ReactNode;
  paragraph: ReactNode;
  backgroundColor: string;
  textColor: string;
  iconColor?: string;
  credit?: ReactNode;
  bodyAlign?: "center" | "left";
  titleSizeClass?: string;
  bodySizeClass?: string;
  creditSizeClass?: string;
};

const titleClass = "type-h3 text-center italic";

function quoteFill(color: string) {
  const hex = color.replace("#", "");
  if (hex.length === 8) {
    return {
      fill: `#${hex.slice(0, 6)}`,
      opacity: Number.parseInt(hex.slice(6), 16) / 255,
    };
  }
  return { fill: color, opacity: 1 };
}

export default function TestimonialSection({
  src,
  title,
  paragraph,
  backgroundColor,
  textColor,
  iconColor = "#8B7E2A1A",
  credit = "Physician, Medical Resident | Boston | 27",
  bodyAlign = "center",
  titleSizeClass = "type-h3",
  bodySizeClass = "type-body-lg",
  creditSizeClass = "type-footer",
}: TestimonialSectionProps) {
  const clipId = useId().replaceAll(":", "");
  const { fill, opacity } = quoteFill(iconColor);
  const layerClass = "h-80 w-auto";

  return (
    <section style={{ backgroundColor, color: textColor }}>
      <img src={src} alt="" className="block h-auto w-full" />
      <div className="relative overflow-hidden py-16 text-center sm:py-24">
        <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
          <div className="absolute left-0 top-[-10rem] flex items-start gap-[6px]">
          <svg
            viewBox="0 0 86 443"
            className={layerClass}
            fill="none"
          >
            <g clipPath={`url(#${clipId}-1)`}>
              <path
                d="M80.8723 302.87C85.5509 325.1 83.9914 346.644 77.2807 367.478C62.6069 413.004 21.3974 441.935 -26.0738 442.976C-67.8268 443.9 -105.846 423.729 -126.617 387.128C-137.061 368.733 -143.204 348.633 -144.48 327.089C-148.497 259.19 -128.767 193.138 -89.3767 137.905C-46.655 78.008 13.0799 34.3519 77.257 0L85.9999 11.6243C-8.32825 63.8268 -69.5754 130.4 -92.1414 238.143C-75.719 222.992 -56.2485 216.41 -34.3914 215.226C20.594 212.243 69.3412 248.063 80.8487 302.87H80.8723Z"
                fill={fill}
                fillOpacity={opacity}
              />
            </g>
            <defs>
              <clipPath id={`${clipId}-1`}>
                <rect width="231" height="443" fill="white" transform="translate(-145)" />
              </clipPath>
            </defs>
          </svg>
          <svg
            viewBox="0 0 232 443"
            className={`mt-16 ${layerClass}`}
            fill="none"
          >
            <g clipPath={`url(#${clipId}-2)`}>
              <path
                d="M226.85 302.87C231.549 325.1 229.983 346.644 223.243 367.478C208.506 413.004 167.118 441.935 119.441 442.976C77.5072 443.9 39.3231 423.729 18.463 387.128C7.97368 368.733 1.80347 348.633 0.521964 327.089C-3.51241 259.19 16.3035 193.138 55.864 137.905C98.7707 78.008 158.764 34.3519 223.219 0L232 11.6243C137.263 63.8268 75.7511 130.4 53.0874 238.143C69.5809 222.992 89.1357 216.41 111.087 215.226C166.311 212.243 215.269 248.063 226.826 302.87H226.85Z"
                fill={fill}
                fillOpacity={opacity}
              />
            </g>
            <defs>
              <clipPath id={`${clipId}-2`}>
                <rect width="232" height="443" fill="white" />
              </clipPath>
            </defs>
          </svg>
          </div>
          <div className="absolute bottom-[-31px] right-0 flex items-end gap-[7px]">
          <svg
            viewBox="0 0 232 443"
            className={layerClass}
            fill="none"
          >
            <g clipPath={`url(#${clipId}-3)`}>
              <path
                d="M5.1499 302.87C0.45105 325.1 2.01733 346.644 8.7571 367.478C23.4944 413.004 64.8823 441.935 112.559 442.976C154.493 443.9 192.677 423.729 213.537 387.128C224.026 368.733 230.197 348.633 231.478 327.089C235.512 259.19 215.697 193.138 176.136 137.905C133.229 78.008 73.2358 34.3519 8.78084 0L0.000137329 11.6243C94.7366 63.8268 156.249 130.4 178.913 238.143C162.419 222.992 142.864 216.41 120.913 215.226C65.6892 212.243 16.7309 248.063 5.17363 302.87H5.1499Z"
                fill={fill}
                fillOpacity={opacity}
              />
            </g>
            <defs>
              <clipPath id={`${clipId}-3`}>
                <rect
                  width="232"
                  height="443"
                  fill="white"
                  transform="matrix(-1 0 0 1 232 0)"
                />
              </clipPath>
            </defs>
          </svg>
          <svg
            viewBox="0 0 66 443"
            className={layerClass}
            fill="none"
          >
            <g clipPath={`url(#${clipId}-4)`}>
              <path
                d="M5.12773 302.87C0.449127 325.1 2.00867 346.644 8.71938 367.478C23.3932 413.004 64.6026 441.935 112.074 442.976C153.827 443.9 191.846 423.729 212.617 387.128C223.061 368.733 229.204 348.633 230.48 327.089C234.497 259.19 214.767 193.138 175.377 137.905C132.655 78.008 72.9202 34.3519 8.74301 0L0.000167847 11.6243C94.3283 63.8268 155.575 130.4 178.141 238.143C161.719 222.992 142.249 216.41 120.391 215.226C65.4061 212.243 16.6588 248.063 5.15135 302.87H5.12773Z"
                fill={fill}
                fillOpacity={opacity}
              />
            </g>
            <defs>
              <clipPath id={`${clipId}-4`}>
                <rect
                  width="231"
                  height="443"
                  fill="white"
                  transform="matrix(-1 0 0 1 231 0)"
                />
              </clipPath>
            </defs>
          </svg>
          </div>
        </div>
        <div className="relative mx-auto my-10 max-w-4xl px-5 sm:my-16 sm:px-8">
          <h2 className={`${titleClass} ${titleSizeClass}`} style={{ color: textColor }}>
            {title}
          </h2>
          <div
            className={`mt-8 space-y-6 ${bodySizeClass} ${bodyAlign === "left" ? "text-left" : "text-center"}`}
            style={{ color: textColor }}
          >
            {typeof paragraph === "string"
              ? paragraph
                  .split(/\n\s*\n/)
                  .map((part) => part.trim())
                  .filter(Boolean)
                  .map((part) => <p key={part}>{part}</p>)
              : paragraph}
          </div>
          {credit ? (
            <p
              className={`mt-8 text-center ${creditSizeClass}`}
              style={{ color: textColor }}
            >
              {credit}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
