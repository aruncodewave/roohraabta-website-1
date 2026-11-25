import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant_Infant, Lora, Newsreader } from "next/font/google";
import localFont from "next/font/local";
import SiteAssist from "@/components/common/SiteAssist";
import Toaster from "@/components/common/Toaster";
import Footer from "@/components/footer/Footer";
import Header from "@/components/header/Header";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-family-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const lora = Lora({
  variable: "--font-family-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-family-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const cormorantInfant = Cormorant_Infant({
  variable: "--font-family-infant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const sacramentoRegular = localFont({
  src: "../fonts/Sacramento-Regular.ttf",
  variable: "--font-sacramento-regular",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vows for Eternity",
  description: "Vows for Eternity. We begin with the person, not the profile.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${lora.variable} ${cormorantGaramond.variable} ${cormorantInfant.variable} ${sacramentoRegular.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream">
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <SiteAssist />
        <Toaster />
      </body>
    </html>
  );
}
