import { footerNav } from "@/data/navigation";

export default function WhatsAppButton() {
  return (
    <div className="fixed right-[18px] bottom-25 z-50 text-right sm:right-7">
      <a
        href={footerNav.whatsapp.href}
        className="mt-2 block text-green-700"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={footerNav.whatsapp.label}
      >
        <span className="inline-flex cursor-pointer rounded-full bg-green-500 p-4 shadow-lg">
          <img src="/logos/whatsapp-icon.jpeg" alt="" width={24} height={24} className="h-6 w-6" />
        </span>
      </a>
    </div>
  );
}
