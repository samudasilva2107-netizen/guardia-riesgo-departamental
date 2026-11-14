import { Lang, translate } from "./i18n";

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

export type GiniNivel = "CRÍTICO" | "ALTO" | "MEDIO" | "BAJO" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export function getGiniNivel(gini: number, lang: Lang = "es"): { nivel: GiniNivel; color: string } {
  if (gini >= 0.75) {
    return {
      nivel: translate(lang, "nivel.critico") as GiniNivel,
      color: "border-alerta text-alerta bg-red-50",
    };
  }
  if (gini >= 0.60) {
    return {
      nivel: translate(lang, "nivel.alto") as GiniNivel,
      color: "border-mostaza text-navy bg-amber-50",
    };
  }
  if (gini >= 0.45) {
    return {
      nivel: translate(lang, "nivel.medio") as GiniNivel,
      color: "border-navy-70 text-navy bg-blue-50/30",
    };
  }
  return {
    nivel: translate(lang, "nivel.bajo") as GiniNivel,
    color: "border-linea text-navy-70 bg-stone-100",
  };
}

export function getRecomendacionOperativa(
  nucleoLen: number,
  semanasNucleo: number[],
  lang: Lang = "es"
): string {
  const minW = semanasNucleo.length > 0 ? Math.min(...semanasNucleo) : 1;
  const maxW = semanasNucleo.length > 0 ? Math.max(...semanasNucleo) : 53;

  if (nucleoLen <= 10) {
    return translate(lang, "dir.compacta", { a: minW, b: maxW });
  }
  if (nucleoLen <= 20) {
    return translate(lang, "dir.definida", { a: minW, b: maxW });
  }
  return translate(lang, "dir.dispersa");
}

const MESES_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const MESES_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function getMesSemana(semanaIso: number, lang: Lang = "es"): string {
  const mesIdx = Math.min(11, Math.max(0, Math.floor(((semanaIso - 1) * 12) / 53)));
  return lang === "en" ? MESES_EN[mesIdx] : MESES_ES[mesIdx];
}

export function formatInt(n: number, lang: Lang = "es"): string {
  return n.toLocaleString(lang === "en" ? "en-US" : "es-AR");
}

export function formatGini(g: number, lang: Lang = "es"): string {
  const fixed = g.toFixed(2);
  return lang === "en" ? fixed : fixed.replace(".", ",");
}
