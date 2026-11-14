export interface SemanaData {
  w: number;
  n: number;
  anios: number[];
}

export interface MaximoHistorico {
  semana: number;
  anio: number;
  detecciones: number;
}

export interface SemanaTipica {
  semana: number;
  detecciones: number;
}

export interface Anomalia {
  anio: number;
  semana: number;
  n: number;
  p90: number;
}

export interface Departamento {
  id: string;
  nombre: string;
  provincia: "Corrientes" | "Córdoba" | "Entre Ríos";
  zona: "ibera" | "delta" | "sierras" | "agro";
  total: number;
  gini: number;
  semanas_nucleo: number[];
  semana_tipica: SemanaTipica;
  maximo_historico: MaximoHistorico;
  semanas: SemanaData[];
  anomalias: Anomalia[];
}

export interface ZonaRef {
  nombre: string;
  temporada_ref: number[];
  pico_ref: number[];
}

export interface CalendarioData {
  generado: string;
  serie: {
    desde: string;
    hasta: string;
    n_anios: number;
  };
  departamentos: Departamento[];
}

export type GiniNivel = "CRÍTICO" | "ALTO" | "MEDIO" | "BAJO";

export function getGiniNivel(gini: number): { nivel: GiniNivel; color: string; desc: string } {
  if (gini >= 0.75) {
    return {
      nivel: "CRÍTICO",
      color: "border-alerta text-alerta bg-red-50",
      desc: "Ventana hiper-reducida (4-6 semanas), movilización concentrada",
    };
  }
  if (gini >= 0.60) {
    return {
      nivel: "ALTO",
      color: "border-mostaza text-navy bg-amber-50",
      desc: "Temporada definida (8-12 semanas), esquema clásico",
    };
  }
  if (gini >= 0.45) {
    return {
      nivel: "MEDIO",
      color: "border-navy-70 text-navy bg-blue-50/30",
      desc: "Varios picos, programas mixtos",
    };
  }
  return {
    nivel: "BAJO",
    color: "border-linea text-navy-70 bg-stone-100",
    desc: "Actividad continua, gestión permanente",
  };
}

export function getRecomendacionOperativa(nucleoLen: number, semanasNucleo: number[]): string {
  const minW = Math.min(...semanasNucleo);
  const maxW = Math.max(...semanasNucleo);

  if (nucleoLen <= 10) {
    return `Ventana compacta: conviene concentrar brigadas y prohibición de quemas entre las semanas ${minW} y ${maxW}.`;
  }
  if (nucleoLen <= 20) {
    return `Temporada definida: guardias activas en el núcleo (semanas ${minW}-${maxW}) y refuerzo preventivo en los bordes.`;
  }
  return "Régimen disperso: no hay ventana única; la estrategia tiene que ser preventiva y permanente durante todo el ciclo.";
}

const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function getMesSemana(semanaIso: number): string {
  const mesIdx = Math.min(11, Math.max(0, Math.floor(((semanaIso - 1) * 12) / 53)));
  return MESES_ES[mesIdx];
}
