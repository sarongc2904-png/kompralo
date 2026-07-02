import type { Metadata } from "next";
import { Playfair_Display, Inter, Pinyon_Script, Cinzel, Lora, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/invitation/SmoothScroll";
import { VirtualAssistantMount } from "@/features/virtual-assistant";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  variable: "--font-pinyon",
  weight: "400",
  display: "swap",
});

// Modern theme — dramatic Roman editorial caps
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "600", "700"],
  display: "swap",
});

// Olive/Tuscan theme — literary warm serif body
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600"],
  display: "swap",
  style: ["normal", "italic"],
});

// Champagne alt heading — elegant light display serif
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Kompralo — Invitaciones digitales",
  description: "Crea y comparte tu invitación digital para bodas, XV años, bautizos y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${inter.variable} ${pinyon.variable} ${cinzel.variable} ${lora.variable} ${cormorant.variable} antialiased`}
    >
      <head>
        <style>{`
          @font-face {
            font-family: 'Realistic Nature';
            src: url('/fonts/realistic-nature.otf') format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
        `}</style>
      </head>

      <body className="min-h-screen relative font-sans">
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <VirtualAssistantMount />
      </body>
    </html>
  );
}
