import Link from "next/link";

type LogoProps = {
  className?: string;
};

export default function Logo({ className = "h-14 w-auto" }: LogoProps) {
  return (
    <Link href="/" aria-label="Vows for Eternity home" className="inline-flex">
      <img
        src="/logo/vfeLogo.svg"
        alt=""
        width={195}
        height={147}
        className={className}
      />
    </Link>
  );
}
