import { notFound } from "next/navigation";
import { DepartamentoView } from "@/components/DepartamentoView";
import { CalendarioData, ZonaRef } from "@/lib/types";
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

  return <DepartamentoView dept={dept} zonaInfo={zonas[dept.zona]} />;
}
