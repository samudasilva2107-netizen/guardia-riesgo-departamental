import type { Metadata } from "next";
import { Anton, Barlow } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const barlow = Barlow({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GUARDIA — Calendario operativo de riesgo por departamento",
  description: "Herramienta operativa de toma de decisiones para prevención y combate de incendios basada en registros históricos de NASA FIRMS (2000-2026).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${anton.variable} ${barlow.variable}`}>
      <body className="min-h-screen flex flex-col bg-crema text-navy font-barlow">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
