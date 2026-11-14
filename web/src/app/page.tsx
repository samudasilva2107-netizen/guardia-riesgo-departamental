"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { ChoroplethMap } from "@/components/ChoroplethMap";
import { useLanguage } from "@/components/LanguageProvider";
import { I18nKey } from "@/lib/i18n";
import { CalendarioData, formatGini, formatInt, getGiniNivel, getMesSemana } from "@/lib/types";
import dataCalendario from "@/lib/calendario.json";
import dataZonas from "@/lib/zonas.json";

export default function HomePage() {
  const { lang, t } = useLanguage();
  const data = dataCalendario as CalendarioData;
  const zonas = dataZonas as Record<string, { nombre: string; temporada_ref: number[]; pico_ref: number[] }>;

  const [filtroProvincia, setFiltroProvincia] = useState<string>("todas");
  const [filtroZona, setFiltroZona] = useState<string>("todas");
  const [ordenCampo, setOrdenCampo] = useState<"total" | "nombre" | "gini">("total");
  const [ordenAsc, setOrdenAsc] = useState<boolean>(false);

  // Total global de detecciones
  const totalGlobal = useMemo(() => {
    return data.departamentos.reduce((acc, d) => acc + d.total, 0);
  }, [data]);

  // Lista filtrada y ordenada
  const departamentosFiltrados = useMemo(() => {
    return data.departamentos
      .filter((d) => {
        if (filtroProvincia !== "todas" && d.provincia !== filtroProvincia) return false;
        if (filtroZona !== "todas" && d.zona !== filtroZona) return false;
        return true;
      })
      .sort((a, b) => {
        if (ordenCampo === "total") {
          return ordenAsc ? a.total - b.total : b.total - a.total;
        }
        if (ordenCampo === "gini") {
          return ordenAsc ? a.gini - b.gini : b.gini - a.gini;
        }
        return ordenAsc ? a.nombre.localeCompare(b.nombre) : b.nombre.localeCompare(a.nombre);
      });
  }, [data, filtroProvincia, filtroZona, ordenCampo, ordenAsc]);

  const handleSort = (campo: "total" | "nombre" | "gini") => {
    if (ordenCampo === campo) {
      setOrdenAsc(!ordenAsc);
    } else {
      setOrdenCampo(campo);
      setOrdenAsc(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header totalDetecciones={totalGlobal} showBigNumber={true} />

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-10 w-full space-y-10">
        {/* 4 Tarjetas de Zona */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-anton text-2xl uppercase tracking-wide text-navy">
              {t("home.zonas.title")}
            </h2>
            <span className="text-xs text-navy-70">{t("home.zonas.sub", { n: 4 })}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(zonas).map(([key, z]) => {
              const deptsEnZona = data.departamentos.filter((d) => d.zona === key);
              const totalZona = deptsEnZona.reduce((acc, d) => acc + d.total, 0);
              const avgGini =
                deptsEnZona.length > 0
                  ? deptsEnZona.reduce((acc, d) => acc + d.gini, 0) / deptsEnZona.length
                  : 0;
              const semaforo = getGiniNivel(avgGini, lang);
              const zonaNameKey = `zona.${key}` as I18nKey;

              return (
                <div
                  key={key}
                  className="bg-papel border border-linea rounded-card p-5 relative flex flex-col justify-between"
                >
                  <div className="filete-mostaza absolute top-0 left-0 right-0 rounded-t-card" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-navy-70">
                      {t("zona.label", { z: key.toUpperCase() })}
                    </span>
                    <h3 className="font-anton text-xl text-navy mt-1">{t(zonaNameKey)}</h3>
                    <p className="text-xs text-navy-70 mt-1">
                      {t("zona.temporadaRef", { a: z.temporada_ref[0], b: z.temporada_ref[1] })}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-linea flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-navy-70">{t("zona.detecciones")}</div>
                      <div className="font-anton text-lg text-navy">{formatInt(totalZona, lang)}</div>
                    </div>
                    <span className={`capsule-chip ${semaforo.color}`}>
                      {semaforo.nivel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Separador filete */}
        <div className="filete-mostaza" />

        {/* Mapa coroplético de los 68 departamentos (polígonos por Gini, sin puntos ni tiles) */}
        <section>
          <ChoroplethMap
            departamentos={data.departamentos}
            filteredIds={new Set(departamentosFiltrados.map((d) => d.id))}
          />
        </section>

        {/* Tabla de 68 Departamentos */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-anton text-2xl uppercase tracking-wide text-navy">
                {t("table.title")}
              </h2>
              <p className="text-xs text-navy-70">
                {t("table.sub", { a: departamentosFiltrados.length, b: data.departamentos.length })}
              </p>
            </div>

            {/* Filtros en Cápsulas */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-navy-70 mr-1">{t("table.provincia")}</span>
              {["todas", "Corrientes", "Córdoba", "Entre Ríos"].map((p) => (
                <button
                  key={p}
                  onClick={() => setFiltroProvincia(p)}
                  className={`capsule-chip transition-colors ${
                    filtroProvincia === p
                      ? "bg-navy text-crema border-navy"
                      : "bg-papel text-navy border-linea hover:border-mostaza"
                  }`}
                >
                  {p === "todas" ? t("table.todas") : p}
                </button>
              ))}

              <span className="text-xs font-bold text-navy-70 ml-2 mr-1">{t("table.zona")}</span>
              {["todas", "ibera", "delta", "sierras", "agro"].map((z) => (
                <button
                  key={z}
                  onClick={() => setFiltroZona(z)}
                  className={`capsule-chip transition-colors ${
                    filtroZona === z
                      ? "bg-navy text-crema border-navy"
                      : "bg-papel text-navy border-linea hover:border-mostaza"
                  }`}
                >
                  {z === "todas" ? t("table.todas") : z}
                </button>
              ))}
            </div>
          </div>

          {/* Tabla accesible */}
          <div className="overflow-x-auto bg-papel border border-linea rounded-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-linea bg-stone-100/60 text-[11px] font-mono uppercase text-navy-70 tracking-wider">
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-navy"
                    onClick={() => handleSort("nombre")}
                  >
                    {t("th.departamento")} {ordenCampo === "nombre" && (ordenAsc ? "↑" : "↓")}
                  </th>
                  <th className="py-3 px-4">{t("th.provincia")}</th>
                  <th className="py-3 px-4">{t("th.zona")}</th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer hover:text-navy"
                    onClick={() => handleSort("total")}
                  >
                    {t("th.detecciones")} {ordenCampo === "total" && (ordenAsc ? "↑" : "↓")}
                  </th>
                  <th className="py-3 px-4 text-center">{t("th.tipica")}</th>
                  <th className="py-3 px-4 text-center">{t("th.maximo")}</th>
                  <th className="py-3 px-4 text-center">{t("th.nucleo")}</th>
                  <th
                    className="py-3 px-4 text-center cursor-pointer hover:text-navy"
                    onClick={() => handleSort("gini")}
                  >
                    {t("th.gini")} {ordenCampo === "gini" && (ordenAsc ? "↑" : "↓")}
                  </th>
                  <th className="py-3 px-4 text-right">{t("th.ficha")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linea text-sm">
                {departamentosFiltrados.map((d) => {
                  const semaforo = getGiniNivel(d.gini, lang);
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-mostaza/10 transition-colors h-11"
                    >
                      <td className="py-2.5 px-4 font-semibold text-navy">
                        <Link href={`/departamento/${d.id}`} className="hover:underline">
                          {d.nombre}
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 text-navy-70 text-xs">{d.provincia}</td>
                      <td className="py-2.5 px-4">
                        <span className="text-[10px] font-mono uppercase bg-crema border border-linea px-2 py-0.5 rounded-sm">
                          {d.zona}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-medium text-navy">
                        {formatInt(d.total, lang)}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-xs">
                        {t("table.semMes", {
                          w: d.semana_tipica.semana,
                          mes: getMesSemana(d.semana_tipica.semana, lang),
                        })}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-xs text-navy">
                        <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                          <span>
                            {t("table.semAnio", {
                              w: d.maximo_historico.semana,
                              anio: d.maximo_historico.anio,
                            })}
                          </span>
                          <span className="text-navy-70">{formatInt(d.maximo_historico.detecciones, lang)}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-xs text-navy-70">
                        {t("table.semanas", { n: d.semanas_nucleo.length })}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`capsule-chip ${semaforo.color}`}>
                          {semaforo.nivel} ({formatGini(d.gini, lang)})
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Link
                          href={`/departamento/${d.id}`}
                          className="capsule-chip border-navy text-navy hover:bg-navy hover:text-crema transition-colors text-[10px]"
                        >
                          {t("table.ver")}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
