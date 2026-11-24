"use client";

import dynamic from "next/dynamic";
import WhatsAppButton from "@/components/common/WhatsAppButton";

const Chatbot = dynamic(() => import("@/components/chatbot/Chatbot"), { ssr: false });

export default function SiteAssist() {
  return (
    <>
      <Chatbot />
      <WhatsAppButton />
    </>
  );
}
