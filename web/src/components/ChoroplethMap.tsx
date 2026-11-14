"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Departamento, formatGini, formatInt, getGiniNivel, getMesSemana } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";
import mapaData from "@/lib/mapa_paths.json";

interface ChoroplethMapProps {
  departamentos: Departamento[];
  filteredIds?: Set<string>;
}

function getGiniFillColor(gini: number): string {
  if (gini >= 0.75) return "#C62828"; // Crítico
  if (gini >= 0.60) return "#F6B50C"; // Alto
  if (gini >= 0.45) return "#4A5878"; // Medio
  return "#D9CFB8"; // Bajo
}

export function ChoroplethMap({ departamentos, filteredIds }: ChoroplethMapProps) {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const deptById = useMemo(() => {
    const map = new Map<string, Departamento>();
    for (const d of departamentos) {
      map.set(d.id, d);
    }
    return map;
  }, [departamentos]);

  const hoveredDept = hoveredId ? deptById.get(hoveredId) : null;
  const hoveredSemaforo = hoveredDept ? getGiniNivel(hoveredDept.gini, lang) : null;

  return (
    <div className="bg-papel border border-linea rounded-card p-5 relative">
      <div className="filete-mostaza absolute top-0 left-0 right-0 rounded-t-card" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-navy m-0">
            {t("map.title")}
          </h2>
          <p className="text-xs text-navy-70 mt-0.5">
            {t("map.sub", { n: departamentos.length })}
          </p>
        </div>

        {/* Leyenda de los 4 tramos */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-navy">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 inline-block border border-navy/30" style={{ backgroundColor: "#C62828" }} />
            <span>{t("map.legend.critico", { v: formatGini(0.75, lang) })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 inline-block border border-navy/30" style={{ backgroundColor: "#F6B50C" }} />
            <span>{t("map.legend.alto", { a: formatGini(0.60, lang), b: formatGini(0.75, lang) })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 inline-block border border-navy/30" style={{ backgroundColor: "#4A5878" }} />
            <span>{t("map.legend.medio", { a: formatGini(0.45, lang), b: formatGini(0.60, lang) })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 inline-block border border-navy/30" style={{ backgroundColor: "#D9CFB8" }} />
            <span>{t("map.legend.bajo", { v: formatGini(0.45, lang) })}</span>
          </div>
        </div>
      </div>

      {/* Contenedor SVG neutro sin tiles satelitales */}
      <div
        className="relative w-full bg-crema/40 border border-linea rounded-card overflow-hidden flex justify-center"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
        onMouseLeave={() => setHoveredId(null)}
      >
        <svg
          viewBox={`0 0 ${mapaData.width} ${mapaData.height}`}
          className="w-full max-w-3xl h-auto max-h-[460px] select-none"
          role="img"
          aria-label={t("map.aria")}
        >
          {mapaData.paths.map((item) => {
            const dept = deptById.get(item.id);
            if (!dept) return null;

            const isFilteredOut = filteredIds ? !filteredIds.has(item.id) : false;
            const isHovered = hoveredId === item.id;
            const fill = getGiniFillColor(dept.gini);

            return (
              <path
                key={item.id}
                d={item.d}
                fill={fill}
                fillOpacity={isFilteredOut ? 0.15 : isHovered ? 0.95 : 0.82}
                stroke={isHovered ? "#16274D" : "#FBF7EE"}
                strokeWidth={isHovered ? 2 : 0.8}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredId(item.id)}
                onClick={() => router.push(`/departamento/${item.id}`)}
              />
            );
          })}
        </svg>

        {/* Tooltip flotante (único lugar donde se permite sombra según guía de diseño) */}
        {hoveredDept && hoveredSemaforo && (
          <div
            className="pointer-events-none absolute z-30 bg-navy text-crema px-3 py-2.5 rounded text-xs shadow-lg max-w-[270px]"
            style={{
              left: Math.min(mousePos.x + 14, 520),
              top: Math.max(mousePos.y - 14, 8),
            }}
          >
            <div className="font-anton text-base tracking-wide text-mostaza leading-tight">
              {hoveredDept.nombre}
            </div>
            <div className="text-[11px] text-stone-300 mb-1.5">
              {hoveredDept.provincia} · {t("zona.label", { z: hoveredDept.zona.toUpperCase() })}
            </div>
            <div className="font-mono text-[11px] space-y-0.5 border-t border-navy-70 pt-1.5">
              <div>
                {t("map.tooltip.conc")} <strong>{hoveredSemaforo.nivel}</strong> ({formatGini(hoveredDept.gini, lang)})
              </div>
              <div>
                {t("map.tooltip.nucleo")} <strong>{t("table.semanas", { n: hoveredDept.semanas_nucleo.length })}</strong>
                {hoveredDept.semanas_nucleo.length > 0 && (
                  <span className="text-stone-300">
                    {" "}
                    {t("map.tooltip.rango", {
                      a: Math.min(...hoveredDept.semanas_nucleo),
                      b: Math.max(...hoveredDept.semanas_nucleo),
                    })}
                  </span>
                )}
              </div>
              <div>
                {t("map.tooltip.tipica")}{" "}
                <strong>
                  {t("table.semMes", {
                    w: hoveredDept.semana_tipica.semana,
                    mes: getMesSemana(hoveredDept.semana_tipica.semana, lang),
                  })}
                </strong>
              </div>
              <div>
                {t("map.tooltip.maximo")}{" "}
                <strong>
                  {t("table.semAnio", {
                    w: hoveredDept.maximo_historico.semana,
                    anio: hoveredDept.maximo_historico.anio,
                  })}{" "}
                  ({formatInt(hoveredDept.maximo_historico.detecciones, lang)})
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-navy-70 mt-2.5">
        {t("map.note")}
      </p>
    </div>
  );
}
