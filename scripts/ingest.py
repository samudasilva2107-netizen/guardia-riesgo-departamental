"""
Extrae y particiona los registros crudos de NASA FIRMS para Corrientes, Córdoba y Entre Ríos
(MODIS C6.1 y VIIRS C2 NOAA-20/21; excluye Suomi-NPP) a partir del caché de research previo.
"""
import csv
import glob
import json
import os
from datetime import datetime, timezone
from pathlib import Path

CACHE_DIR = Path(os.environ.get("FIRMS_CACHE_DIR", "data/cache_firms"))
OUT_RAW = Path("data/raw")

# BBox: (lon_oeste, lat_sur, lon_este, lat_norte)
PROVINCIAS = {
    "corrientes": (-59.30, -30.90, -55.60, -27.20),
    "cordoba": (-65.80, -35.10, -61.70, -29.40),
    "entre_rios": (-60.90, -34.10, -57.60, -29.90),
}

# Excluye VIIRS_SNPP por cese de transmisiones el 2026-11-02
VALID_PREFIXES = {
    "MODIS_SP": "modis",
    "MODIS_NRT": "modis",
    "VIIRS_NOAA20_SP": "viirs",
    "VIIRS_NOAA20_NRT": "viirs",
    "VIIRS_NOAA21_SP": "viirs",
    "VIIRS_NOAA21_NRT": "viirs",
}


def classify_file(filename: str):
    for prefix, product in VALID_PREFIXES.items():
        if filename.startswith(prefix + "_"):
            return product, prefix
    return None, None


def in_bbox(lon: float, lat: float, bbox) -> bool:
    return bbox[0] <= lon <= bbox[2] and bbox[1] <= lat <= bbox[3]


def main():
    if not CACHE_DIR.exists():
        raise FileNotFoundError(f"No se encuentra {CACHE_DIR.resolve()}")

    files = sorted(CACHE_DIR.glob("*.csv"))
    print(f"Escaneando {len(files)} archivos en {CACHE_DIR}...")

    writers = {}
    handles = {}
    counts = {prov: {"modis": 0, "viirs": 0} for prov in PROVINCIAS}
    seen = {prov: {"modis": set(), "viirs": set()} for prov in PROVINCIAS}

    base_header = [
        "latitude", "longitude", "brightness", "scan", "track",
        "acq_date", "acq_time", "satellite", "instrument",
        "confidence", "version", "bright_t31", "frp", "daynight", "source_product"
    ]

    for prov in PROVINCIAS:
        for prod in ("modis", "viirs"):
            pdir = OUT_RAW / prov / prod
            pdir.mkdir(parents=True, exist_ok=True)
            fpath = pdir / "focos.csv"
            fh = open(fpath, "w", newline="", encoding="utf-8")
            w = csv.writer(fh)
            w.writerow(base_header)
            handles[(prov, prod)] = fh
            writers[(prov, prod)] = w

    processed_files = 0
    for f in files:
        prod, prefix = classify_file(f.name)
        if prod is None:
            continue
        processed_files += 1
        with open(f, "r", encoding="utf-8", errors="ignore") as fh:
            reader = csv.DictReader(fh)
            for row in reader:
                acq_date = row.get("acq_date", "")
                if not ("2000-11-01" <= acq_date <= "2026-11-13"):
                    continue
                try:
                    lat = float(row["latitude"])
                    lon = float(row["longitude"])
                except (KeyError, ValueError):
                    continue

                # Filtro de confianza operacional: MODIS >= 30, VIIRS nominal/high
                conf = str(row.get("confidence", "")).strip().lower()
                if prod == "modis":
                    try:
                        if float(conf) < 30:
                            continue
                    except ValueError:
                        continue
                else:
                    if conf not in ("nominal", "high", "n", "h"):
                        continue

                sat = row.get("satellite", "")
                acq_time = row.get("acq_time", "")
                dedup_key = (round(lat, 5), round(lon, 5), acq_date, acq_time, sat)

                for prov, bbox in PROVINCIAS.items():
                    if in_bbox(lon, lat, bbox):
                        if dedup_key in seen[prov][prod]:
                            continue
                        seen[prov][prod].add(dedup_key)
                        writers[(prov, prod)].writerow([
                            row.get("latitude", ""),
                            row.get("longitude", ""),
                            row.get("brightness", row.get("bright_ti4", "")),
                            row.get("scan", ""),
                            row.get("track", ""),
                            acq_date,
                            acq_time,
                            sat,
                            row.get("instrument", ""),
                            row.get("confidence", ""),
                            row.get("version", ""),
                            row.get("bright_t31", row.get("bright_ti5", "")),
                            row.get("frp", ""),
                            row.get("daynight", ""),
                            prefix,
                        ])
                        counts[prov][prod] += 1

        if processed_files % 500 == 0:
            print(f"  Procesados {processed_files} archivos válidos...")

    for fh in handles.values():
        fh.close()

    print("\nResumen de extracción por provincia y producto:")
    for prov, c in counts.items():
        print(f"  {prov}: MODIS={c['modis']:,} | VIIRS={c['viirs']:,}")

    # Actualizar data/manifiesto.json
    manifest_path = Path("data/manifiesto.json")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["downloaded_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    manifest["rows"] = counts
    manifest["files_scanned"] = processed_files
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Actualizado {manifest_path}")


if __name__ == "__main__":
    main()
