import Link from "next/link";

interface HeaderProps {
  totalDetecciones?: number;
  showBigNumber?: boolean;
}

export function Header({ totalDetecciones = 0, showBigNumber = true }: HeaderProps) {
  return (
    <header className="bg-navy text-crema pt-10 pb-16 px-6 md:px-12 header-diagonal relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-block border border-mostaza rounded-capsule px-3 py-0.5 text-[10px] tracking-widest uppercase text-mostaza font-bold mb-3">
              NASA Space Apps Challenge 2026
            </div>
            <h1 className="font-anton text-4xl md:text-5xl uppercase tracking-wide text-crema m-0">
              GUARDIA
            </h1>
            <p className="text-sm md:text-base text-stone-300 mt-1 max-w-xl">
              Calendario operativo de riesgo de incendios por departamento. Registros históricos 2000–2026.
            </p>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="capsule-chip border-stone-400 text-crema hover:border-mostaza hover:text-mostaza transition-colors"
            >
              Ranking
            </Link>
            <Link
              href="/comparar"
              className="capsule-chip border-stone-400 text-crema hover:border-mostaza hover:text-mostaza transition-colors"
            >
              Comparador
            </Link>
            <Link
              href="/metodo"
              className="capsule-chip border-stone-400 text-crema hover:border-mostaza hover:text-mostaza transition-colors"
            >
              Método
            </Link>
          </nav>
        </div>

        {showBigNumber && totalDetecciones > 0 && (
          <div className="mt-8 pt-6 border-t border-navy-70 flex flex-col">
            <span className="text-[11px] font-bold tracking-widest uppercase text-mostaza">
              Total detecciones registradas (Corrientes · Córdoba · Entre Ríos)
            </span>
            <span className="font-anton text-7xl md:text-9xl text-crema leading-none tracking-tight">
              {totalDetecciones.toLocaleString("es-AR")}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto bg-papel border-t border-linea py-8 px-6 text-xs text-navy-70">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <strong className="text-navy">GUARDIA v1.0</strong> — Insumos públicos NASA FIRMS (MODIS C6.1 y VIIRS C2),
          geoBoundaries gbOpen e INDEC.
        </div>
        <div className="flex gap-4">
          <Link href="/metodo" className="underline hover:text-navy">
            Método & Límites
          </Link>
          <a
            href="https://firms.modaps.eosdis.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-navy"
          >
            NASA FIRMS
          </a>
        </div>
      </div>
    </footer>
  );
}
