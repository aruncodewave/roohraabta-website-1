import type { Metadata } from "next";
import Link from "next/link";
import { PaymentResult } from "@/components/packages/PaymentResult";

export const metadata: Metadata = {
  title: "Payment failed | Vows for Eternity",
  description: "Your membership payment could not be completed.",
};

const retryClass =
  "type-footer inline-flex aspect-[619/265] w-[min(88vw,420px)] items-center justify-center bg-[url('/images/buttonFrame2.svg')] bg-contain bg-center bg-no-repeat px-[16%] text-center leading-tight text-[#FFFDF7] transition-opacity hover:opacity-90";

export default function PaymentFailedPage() {
  return (
    <PaymentResult
      tone="failure"
      title="Payment failed"
      message="Please try again or contact support for assistance."
    >
      <Link href="/packages/index" className={retryClass}>
        Try again
      </Link>
    </PaymentResult>
  );
}
