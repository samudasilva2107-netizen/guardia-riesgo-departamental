import { notFound } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/Header";
import { WeeklyBar } from "@/components/WeeklyBar";
import {
  CalendarioData,
  getGiniNivel,
  getMesSemana,
  getRecomendacionOperativa,
  ZonaRef,
} from "@/lib/types";
import dataCalendario from "@/lib/calendario.json";
import dataZonas from "@/lib/zonas.json";

interface Props {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  const data = dataCalendario as CalendarioData;
  return data.departamentos.map((d) => ({
    id: d.id,
  }));
}

export default function DepartamentoPage({ params }: Props) {
  const data = dataCalendario as CalendarioData;
  const zonas = dataZonas as Record<string, ZonaRef>;

  const dept = data.departamentos.find((d) => d.id === params.id);
  if (!dept) {
    notFound();
  }

  const zonaInfo = zonas[dept.zona];
  const semaforo = getGiniNivel(dept.gini);
  const recomendacion = getRecomendacionOperativa(dept.semanas_nucleo.length, dept.semanas_nucleo);

  return (
    <div className="flex flex-col min-h-screen">
      <Header showBigNumber={false} />

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-10 w-full space-y-8">
        {/* Cabecera Ficha */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-linea pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/"
                className="text-xs font-mono text-navy-70 hover:text-navy underline"
              >
                ← Volver al ranking
              </Link>
              <span className="text-navy-70">•</span>
              <span className="text-xs font-mono uppercase text-navy-70">
                {dept.provincia}
              </span>
              <span className="text-navy-70">•</span>
              <span className="text-xs font-mono uppercase bg-crema border border-linea px-2 py-0.5 rounded-sm">
                Zona {dept.zona} ({zonaInfo?.nombre || dept.zona})
              </span>
            </div>

            <h1 className="font-anton text-4xl md:text-5xl uppercase tracking-wide text-navy m-0">
              {dept.nombre}
            </h1>
            <p className="text-xs font-mono text-navy-70 mt-1">ID INDEC: {dept.id}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`capsule-chip ${semaforo.color}`}>
              Gini {dept.gini.toFixed(2)} — {semaforo.nivel}
            </span>
            <a
              href={`/api/export/${dept.id}`}
              download={`${dept.nombre}-focos-semanales.csv`}
              className="capsule-chip border-navy bg-navy text-crema hover:bg-navy-70 transition-colors"
            >
              Descargar CSV
            </a>
          </div>
        </div>

        {/* Recomendación operativa por regla */}
        <div className="bg-papel border-l-4 border-mostaza border-y border-r border-linea rounded-card p-5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-mostaza font-mono">
            Directiva Operativa Sugerida
          </div>
          <p className="text-base text-navy font-semibold mt-1 leading-snug">
            {recomendacion}
          </p>
          <p className="text-xs text-navy-70 mt-2">
            Regla analítica calculada sobre la concentración del 80% histórico de detecciones ({dept.semanas_nucleo.length} semanas activas en el núcleo).
          </p>
        </div>

        {/* Gráfico 53 Semanas con bandas de referencia */}
        <div className="bg-papel border border-linea rounded-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-anton text-xl uppercase tracking-wide text-navy">
              Distribución Histórica por Semana ISO (1..53)
            </h2>
            <span className="text-xs font-mono text-navy-70">
              {dept.total.toLocaleString()} detecciones totales
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
              Régimen bimodal: la actividad se reparte en dos ventanas del año y el acumulado histórico está dominado por los años extremos de sequía. La temporada de referencia de la zona describe el modo normal, no el extremo.
            </p>
          )}
        </div>

        {/* 3 Bloques métricos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bloque 1: Núcleo crítico */}
          <div className="bg-papel border border-linea rounded-card p-5 relative">
            <div className="filete-mostaza absolute top-0 left-0 right-0 rounded-t-card" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-navy-70 font-mono">
              Núcleo Crítico (80% Total)
            </span>
            <div className="font-anton text-3xl text-navy mt-2">
              {dept.semanas_nucleo.length} Semanas
            </div>
            <p className="text-xs text-navy-70 mt-2 leading-relaxed">
              Semanas ISO que concentran el 80% de los fuegos:
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {dept.semanas_nucleo.map((w) => (
                <span
                  key={w}
                  className="bg-mostaza/20 border border-mostaza/40 text-navy font-mono text-xs px-2 py-0.5 rounded-sm"
                >
                  Sem {w}
                </span>
              ))}
            </div>
          </div>

          {/* Bloque 2: Semana Típica y Máximo Histórico */}
          <div className="bg-papel border border-linea rounded-card p-5 relative">
            <div className="h-[2px] bg-alerta absolute top-0 left-0 right-0 rounded-t-card" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-navy-70 font-mono">
              Semana Típica vs. Máximo Histórico
            </span>
            <div className="font-anton text-3xl text-navy mt-2">
              Sem. {dept.semana_tipica.semana} ({getMesSemana(dept.semana_tipica.semana)})
            </div>
            <p className="text-xs text-navy-70 mt-1">
              Mayor acumulado histórico: <strong>{dept.semana_tipica.detecciones.toLocaleString()}</strong> detecciones sumadas en toda la serie.
            </p>
            <div className="mt-3 pt-2 border-t border-linea font-mono text-xs text-navy">
              <span className="text-alerta font-bold">Máximo histórico:</span>{" "}
              s{dept.maximo_historico.semana}/{dept.maximo_historico.anio} con{" "}
              <strong>{dept.maximo_historico.detecciones.toLocaleString()}</strong> detecciones
            </div>
          </div>

          {/* Bloque 3: Semanas Anómalas (> p90 histórico) */}
          <div className="bg-papel border border-linea rounded-card p-5 relative">
            <div className="filete-mostaza absolute top-0 left-0 right-0 rounded-t-card" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-navy-70 font-mono">
              Semanas Anómalas (&gt; P90)
            </span>
            <div className="font-anton text-3xl text-navy mt-2">
              {dept.anomalias.length} Eventos
            </div>
            <p className="text-xs text-navy-70 mt-2 leading-relaxed">
              Semanas que superaron el P90 de los años anteriores (con ≥5 años previos):
            </p>
            <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
              {dept.anomalias.length > 0 ? (
                dept.anomalias.map((a, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono bg-crema px-2 py-1 rounded border border-linea flex justify-between"
                  >
                    <span>{a.anio} · Sem {a.semana}</span>
                    <span className="font-bold text-alerta">
                      {a.n} focos (P90: {a.p90})
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-navy-70 italic">
                  Sin registros anómalos que superen el P90 histórico previo.
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
