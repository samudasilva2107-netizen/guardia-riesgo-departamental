import { Departamento, formatInt, ZonaRef } from "@/lib/types";

interface WeeklyBarProps {
  semanas: Departamento["semanas"];
  semanasNucleo: number[];
  semanaTipica: Departamento["semana_tipica"];
  maximoHistorico: Departamento["maximo_historico"];
  zonaRef?: ZonaRef;
}

export function WeeklyBar({ semanas, semanasNucleo, semanaTipica, maximoHistorico, zonaRef }: WeeklyBarProps) {
  // Asegurar 53 semanas
  const safeWeeks = Array.from({ length: 53 }, (_, i) => {
    const wNum = i + 1;
    const found = semanas.find((s) => s.w === wNum);
    return found || { w: wNum, n: 0, anios: [] };
  });

  const maxVal = Math.max(...safeWeeks.map((s) => s.n), 1);
  const nucleoSet = new Set(semanasNucleo);

  // Bandas de referencia de la literatura
  const tempRef = zonaRef?.temporada_ref || [0, 0];
  const picoRef = zonaRef?.pico_ref || [0, 0];

  return (
    <div className="w-full">
      <div className="relative h-48 w-full bg-papel border border-linea rounded-card p-3 flex items-end">
        {/* Franja de referencia de la literatura (detrás) */}
        {tempRef[0] > 0 && (
          <div
            className="absolute top-0 bottom-0 bg-amber-200/40 border-l border-r border-amber-400/50 pointer-events-none z-0"
            style={{
              left: `${((tempRef[0] - 1) / 53) * 100}%`,
              width: `${((tempRef[1] - tempRef[0] + 1) / 53) * 100}%`,
            }}
          >
            <span className="text-[10px] uppercase font-bold text-amber-800/80 px-1 block mt-1">
              Ref. Literatura
            </span>
          </div>
        )}

        {/* Línea punteada de pico de referencia */}
        {picoRef[0] > 0 && (
          <div
            className="absolute top-0 bottom-0 border-r-2 border-dashed border-amber-600/70 pointer-events-none z-0"
            style={{
              left: `${((picoRef[0] - 0.5) / 53) * 100}%`,
            }}
          />
        )}

        {/* 53 Columnas observadas */}
        <div className="relative z-10 w-full h-full flex items-end justify-between gap-[2px]">
          {safeWeeks.map((s) => {
            const isNucleo = nucleoSet.has(s.w);
            const isTipica = s.w === semanaTipica.semana;
            const isMaxHist = s.w === maximoHistorico.semana;
            const heightPct = Math.max((s.n / maxVal) * 100, 3);

            return (
              <div
                key={s.w}
                className="group relative flex-1 flex flex-col items-center justify-end h-full"
              >
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 z-30 pointer-events-none bg-navy text-crema text-[11px] font-mono px-2 py-1 rounded shadow whitespace-nowrap">
                  Semana {s.w}: {formatInt(s.n)} detecciones
                  {isNucleo && " (Núcleo 80%)"}
                  {isTipica && " [Semana Típica]"}
                  {isMaxHist && " [Máx. Histórico]"}
                </div>

                <div
                  className={`w-full rounded-t-sm transition-all ${
                    isTipica
                      ? "bg-alerta"
                      : isNucleo
                      ? "bg-mostaza"
                      : "bg-navy/20 group-hover:bg-navy/40"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Rótulos del eje X */}
      <div className="flex justify-between text-[11px] font-mono text-navy-70 mt-1 px-1">
        <span>Semana 1 (Ene)</span>
        <span>Semana 13 (Abr)</span>
        <span>Semana 26 (Jul)</span>
        <span>Semana 39 (Oct)</span>
        <span>Semana 53 (Dic)</span>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-navy-70 mt-3 pt-2 border-t border-linea">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-mostaza inline-block rounded-xs" />
          <span>Núcleo Crítico (80% acumulado)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-alerta inline-block rounded-xs" />
          <span>Semana Típica (máx. acumulado)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 bg-navy/20 inline-block rounded-xs" />
          <span>Actividad Base</span>
        </div>
        {tempRef[0] > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-amber-200/70 border border-amber-400 inline-block rounded-xs" />
            <span>Temporada Esperada (Referencia científica)</span>
          </div>
        )}
      </div>
    </div>
  );
}
