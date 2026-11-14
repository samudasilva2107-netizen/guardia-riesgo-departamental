"use client";

import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { WeeklyBar } from "@/components/WeeklyBar";
import { useLanguage } from "@/components/LanguageProvider";
import { I18nKey } from "@/lib/i18n";
import {
  Departamento,
  formatGini,
  formatInt,
  getGiniNivel,
  getMesSemana,
  getRecomendacionOperativa,
  ZonaRef,
} from "@/lib/types";

interface DepartamentoViewProps {
  dept: Departamento;
  zonaInfo?: ZonaRef;
}

export function DepartamentoView({ dept, zonaInfo }: DepartamentoViewProps) {
  const { lang, t } = useLanguage();
  const semaforo = getGiniNivel(dept.gini, lang);
  const recomendacion = getRecomendacionOperativa(dept.semanas_nucleo.length, dept.semanas_nucleo, lang);
  const zonaDetalle = t(`zona.${dept.zona}` as I18nKey);

  return (
    <div className="flex flex-col min-h-screen">
      <Header showBigNumber={false} />

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-10 w-full space-y-8">
        {/* Cabecera Ficha */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-linea pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                href="/"
                className="text-xs font-mono text-navy-70 hover:text-navy underline"
              >
                {t("ficha.volver")}
              </Link>
              <span className="text-navy-70">•</span>
              <span className="text-xs font-mono uppercase text-navy-70">
                {dept.provincia}
              </span>
              <span className="text-navy-70">•</span>
              <span className="text-xs font-mono uppercase bg-crema border border-linea px-2 py-0.5 rounded-sm">
                {t("ficha.zona", { zona: dept.zona.toUpperCase(), detalle: zonaDetalle })}
              </span>
            </div>

            <h1 className="font-anton text-4xl md:text-5xl uppercase tracking-wide text-navy m-0">
              {dept.nombre}
            </h1>
            <p className="text-xs font-mono text-navy-70 mt-1">{t("ficha.indec", { id: dept.id })}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`capsule-chip ${semaforo.color}`}>
              Gini {formatGini(dept.gini, lang)} — {semaforo.nivel}
            </span>
            <a
              href={`/api/export/${dept.id}?lang=${lang}`}
              download={`${dept.nombre}-focos-semanales.csv`}
              className="capsule-chip border-navy bg-navy text-crema hover:bg-navy-70 transition-colors"
            >
              {t("ficha.csv")}
            </a>
          </div>
        </div>

        {/* Recomendación operativa por regla */}
        <div className="bg-papel border-l-4 border-mostaza border-y border-r border-linea rounded-card p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-mostaza font-mono">
            {t("ficha.directiva")}
          </div>
          <p className="text-base text-navy font-semibold mt-1 leading-snug">
            {recomendacion}
          </p>
          <p className="text-xs text-navy-70 mt-2">
            {t("dir.regla", { n: dept.semanas_nucleo.length })}
          </p>
        </div>

        {/* Gráfico 53 Semanas con bandas de referencia */}
        <div className="bg-papel border border-linea rounded-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-anton text-xl uppercase tracking-wide text-navy">
              {t("ficha.chart.title")}
            </h2>
            <span className="text-xs font-mono text-navy-70">
              {t("ficha.total", { n: formatInt(dept.total, lang) })}
            </span>
          </div>

          <WeeklyBar
            semanas={dept.semanas}
            semanasNucleo={dept.semanas_nucleo}
            semanaTipica={dept.semana_tipica}
            maximoHistorico={dept.maximo_historico}
            zonaRef={zonaInfo}
          />

          {dept.semanas_nucleo.length > 20 && (
            <p className="text-[15px] text-navy-70 pt-2 border-t border-linea leading-relaxed">
              {t("ficha.bimodal")}
            </p>
          )}
        </div>

        {/* 3 Bloques métricos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bloque 1: Núcleo crítico */}
          <div className="bg-papel border border-linea rounded-card p-5 relative">
            <div className="filete-mostaza absolute top-0 left-0 right-0 rounded-t-card" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-navy-70 font-mono">
              {t("ficha.b1.label")}
            </span>
            <div className="font-anton text-3xl text-navy mt-2">
              {t("ficha.b1.title", { n: dept.semanas_nucleo.length })}
            </div>
            <p className="text-xs text-navy-70 mt-2 leading-relaxed">
              {t("ficha.b1.desc")}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {dept.semanas_nucleo.map((w) => (
                <span
                  key={w}
                  className="bg-mostaza/20 border border-mostaza/40 text-navy font-mono text-xs px-2 py-0.5 rounded-sm"
                >
                  {t("ficha.b1.chip", { w })}
                </span>
              ))}
            </div>
          </div>

          {/* Bloque 2: Semana Típica y Máximo Histórico */}
          <div className="bg-papel border border-linea rounded-card p-5 relative">
            <div className="h-[2px] bg-alerta absolute top-0 left-0 right-0 rounded-t-card" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-navy-70 font-mono">
              {t("ficha.b2.label")}
            </span>
            <div className="font-anton text-3xl text-navy mt-2">
              {t("table.semMes", {
                w: dept.semana_tipica.semana,
                mes: getMesSemana(dept.semana_tipica.semana, lang),
              })}
            </div>
            <p className="text-xs text-navy-70 mt-1">
              {t("ficha.b2.desc", { n: formatInt(dept.semana_tipica.detecciones, lang) })}
            </p>
            <div className="mt-3 pt-2 border-t border-linea font-mono text-xs text-navy">
              <span className="text-alerta font-bold">{t("ficha.b2.maxLabel")}</span>{" "}
              {t("ficha.b2.maxVal", {
                w: dept.maximo_historico.semana,
                anio: dept.maximo_historico.anio,
                n: formatInt(dept.maximo_historico.detecciones, lang),
              })}
            </div>
          </div>

          {/* Bloque 3: Semanas Anómalas (> p90 histórico) */}
          <div className="bg-papel border border-linea rounded-card p-5 relative">
            <div className="filete-mostaza absolute top-0 left-0 right-0 rounded-t-card" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-navy-70 font-mono">
              {t("ficha.b3.label")}
            </span>
            <div className="font-anton text-3xl text-navy mt-2">
              {t("ficha.b3.title", { n: dept.anomalias.length })}
            </div>
            <p className="text-xs text-navy-70 mt-2 leading-relaxed">
              {t("ficha.b3.desc")}
            </p>
            <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
              {dept.anomalias.length > 0 ? (
                dept.anomalias.map((a, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono bg-crema px-2 py-1 rounded border border-linea flex justify-between"
                  >
                    <span>{t("ficha.b3.item", { anio: a.anio, w: a.semana })}</span>
                    <span className="font-bold text-alerta">
                      {t("ficha.b3.itemVal", {
                        n: formatInt(a.n, lang),
                        p90: lang === "en" ? a.p90.toFixed(1) : a.p90.toFixed(1).replace(".", ","),
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-navy-70 italic">
                  {t("ficha.b3.empty")}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
