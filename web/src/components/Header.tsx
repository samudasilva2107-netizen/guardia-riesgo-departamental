"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { formatInt } from "@/lib/types";

interface HeaderProps {
  totalDetecciones?: number;
  showBigNumber?: boolean;
}

export function Header({ totalDetecciones = 0, showBigNumber = true }: HeaderProps) {
  const { lang, setLang, t } = useLanguage();

  return (
    <header className="bg-navy text-crema pt-10 pb-16 px-6 md:px-12 header-diagonal relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-block border border-mostaza rounded-capsule px-3 py-0.5 text-[10px] tracking-widest uppercase text-mostaza font-bold mb-3">
              {t("app.eyebrow")}
            </div>
            <h1 className="font-anton text-4xl md:text-5xl uppercase tracking-wide text-crema m-0">
              {t("app.title")}
            </h1>
            <p className="text-sm md:text-base text-stone-300 mt-1 max-w-xl">
              {t("app.tagline")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="capsule-chip border-stone-400 text-crema hover:border-mostaza hover:text-mostaza transition-colors"
              >
                {t("nav.ranking")}
              </Link>
              <Link
                href="/comparar"
                className="capsule-chip border-stone-400 text-crema hover:border-mostaza hover:text-mostaza transition-colors"
              >
                {t("nav.comparar")}
              </Link>
              <Link
                href="/metodo"
                className="capsule-chip border-stone-400 text-crema hover:border-mostaza hover:text-mostaza transition-colors"
              >
                {t("nav.metodo")}
              </Link>
            </nav>

            {/* Selector ES | EN en cápsulas */}
            <div className="flex items-center gap-1 pl-2 border-l border-navy-70" role="group" aria-label="Language">
              <button
                type="button"
                onClick={() => setLang("es")}
                className={`capsule-chip transition-colors ${
                  lang === "es"
                    ? "bg-mostaza text-navy border-mostaza"
                    : "border-stone-400 text-crema hover:border-mostaza"
                }`}
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`capsule-chip transition-colors ${
                  lang === "en"
                    ? "bg-mostaza text-navy border-mostaza"
                    : "border-stone-400 text-crema hover:border-mostaza"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {showBigNumber && totalDetecciones > 0 && (
          <div className="mt-8 pt-6 border-t border-navy-70 flex flex-col">
            <span className="text-[11px] font-bold tracking-widest uppercase text-mostaza">
              {t("home.total.label")}
            </span>
            <span className="font-anton text-7xl md:text-9xl text-crema leading-none tracking-tight">
              {formatInt(totalDetecciones, lang)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto bg-papel border-t border-linea py-8 px-6 text-xs text-navy-70">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span>
            <strong className="text-navy">GUARDIA v1.0</strong> — {t("footer.data")}
          </span>
          <a
            href="https://github.com/samudasilva2107-netizen/guardia-riesgo-departamental"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-1 underline-offset-2 hover:text-navy"
          >
            {t("footer.source")} github.com/samudasilva2107-netizen/guardia-riesgo-departamental
          </a>
        </div>
        <div className="flex gap-4">
          <Link href="/metodo" className="underline hover:text-navy">
            {t("footer.methodLink")}
          </Link>
          <a
            href="https://firms.modaps.eosdis.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-navy"
          >
            NASA FIRMS
          </a>
        </div>
      </div>
    </footer>
  );
}
