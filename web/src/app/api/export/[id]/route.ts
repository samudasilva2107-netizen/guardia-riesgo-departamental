import { NextRequest, NextResponse } from "next/server";
import { CalendarioData } from "@/lib/types";
import dataCalendario from "@/lib/calendario.json";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  const data = dataCalendario as CalendarioData;
  const dept = data.departamentos.find((d) => d.id === params.id);
  const lang = request.nextUrl.searchParams.get("lang") === "en" ? "en" : "es";

  if (!dept) {
    return new NextResponse(lang === "en" ? "Department not found" : "Departamento no encontrado", {
      status: 404,
    });
  }

  const nucleoSet = new Set(dept.semanas_nucleo);

  // Formato CSV con BOM UTF-8 y CRLF (\r\n) para abrir en Excel sin caracteres rotos
  const headers =
    lang === "en"
      ? ["iso_week", "accumulated_detections", "is_core_80", "recorded_years"]
      : ["semana_iso", "detecciones_acumuladas", "es_nucleo_80", "anios_registrados"];

  const rows = dept.semanas.map((s) => {
    const flag = nucleoSet.has(s.w)
      ? lang === "en"
        ? "YES"
        : "SI"
      : "NO";
    return [s.w, s.n, flag, `"${s.anios.join(";")}"`].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dept.id}-${dept.nombre}-${lang === "en" ? "weekly-fires" : "focos-semanales"}.csv"`,
    },
  });
}
