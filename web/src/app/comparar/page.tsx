"use client";

import { useState } from "react";
import { Header, Footer } from "@/components/Header";
import { WeeklyBar } from "@/components/WeeklyBar";
import { CalendarioData, formatInt, ZonaRef } from "@/lib/types";
import dataCalendario from "@/lib/calendario.json";
import dataZonas from "@/lib/zonas.json";

export default function CompararPage() {
  const data = dataCalendario as CalendarioData;
  const zonas = dataZonas as Record<string, ZonaRef>;

  const [idA, setIdA] = useState<string>(data.departamentos[0]?.id || "");
  const [idB, setIdB] = useState<string>(data.departamentos[1]?.id || "");

  const deptA = data.departamentos.find((d) => d.id === idA) || data.departamentos[0];
  const deptB = data.departamentos.find((d) => d.id === idB) || data.departamentos[1];

  const diffTipica = Math.abs(deptA.semana_tipica.semana - deptB.semana_tipica.semana);
  const conclusion =
    diffTipica === 0
      ? `Ambos departamentos alcanzan su semana típica en el mismo período (Semana ${deptA.semana_tipica.semana}).`
      : `Las temporadas no coinciden plenamente: la semana típica de ${deptA.nombre} (Sem. ${deptA.semana_tipica.semana}) difiere por ${diffTipica} semanas respecto a la de ${deptB.nombre} (Sem. ${deptB.semana_tipica.semana}).`;

  return (
    <div className="flex flex-col min-h-screen">
      <Header showBigNumber={false} />

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-10 w-full space-y-8">
        <div>
          <h1 className="font-anton text-4xl uppercase tracking-wide text-navy m-0">
            Comparador Operativo Departamental
          </h1>
          <p className="text-sm text-navy-70 mt-1">
            Contraste de calendarios de 53 semanas entre jurisdicciones. Responde: ¿la temporada crítica de mi territorio coincide con la del territorio vecino?
          </p>
        </div>

        {/* Conclusión generada por regla */}
        <div className="bg-papel border-l-4 border-mostaza border-y border-r border-linea rounded-card p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-mostaza font-mono">
            Diagnóstico Comparativo
          </div>
          <p className="text-base text-navy font-semibold mt-1">
            {conclusion}
          </p>
        </div>

        {/* Paneles Lado a Lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Panel A */}
          <div className="bg-papel border border-linea rounded-card p-6 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono uppercase text-navy-70 font-bold">
                Departamento A:
              </label>
              <select
                value={idA}
                onChange={(e) => setIdA(e.target.value)}
                className="bg-crema border border-linea rounded-sm p-2 text-sm text-navy font-semibold focus:outline-none focus:border-navy"
              >
                {data.departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} ({d.provincia} — Zona {d.zona})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-anton text-2xl text-navy">{deptA.nombre}</span>
                <span className="text-xs font-mono text-navy-70">
                  {formatInt(deptA.total)} focos
                </span>
              </div>
              <WeeklyBar
                semanas={deptA.semanas}
                semanasNucleo={deptA.semanas_nucleo}
                semanaTipica={deptA.semana_tipica}
                maximoHistorico={deptA.maximo_historico}
                zonaRef={zonas[deptA.zona]}
              />
            </div>
          </div>

          {/* Panel B */}
          <div className="bg-papel border border-linea rounded-card p-6 space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono uppercase text-navy-70 font-bold">
                Departamento B:
              </label>
              <select
                value={idB}
                onChange={(e) => setIdB(e.target.value)}
                className="bg-crema border border-linea rounded-sm p-2 text-sm text-navy font-semibold focus:outline-none focus:border-navy"
              >
                {data.departamentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} ({d.provincia} — Zona {d.zona})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-anton text-2xl text-navy">{deptB.nombre}</span>
                <span className="text-xs font-mono text-navy-70">
                  {formatInt(deptB.total)} focos
                </span>
              </div>
              <WeeklyBar
                semanas={deptB.semanas}
                semanasNucleo={deptB.semanas_nucleo}
                semanaTipica={deptB.semana_tipica}
                maximoHistorico={deptB.maximo_historico}
                zonaRef={zonas[deptB.zona]}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
