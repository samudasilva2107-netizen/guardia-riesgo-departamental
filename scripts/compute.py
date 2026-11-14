"""
Calcula el calendario operativo departamental a partir de los focos crudos de NASA FIRMS
y los 68 polígonos oficiales en data/departamentos.geojson.
Genera data/calendario.json y actualiza web/src/lib/calendario.json.
"""
import csv
import json
import math
import shutil
from collections import defaultdict
from datetime import date, datetime, timezone
from pathlib import Path


def extract_rings(geom):
    gtype = geom["type"]
    coords = geom["coordinates"]
    if gtype == "Polygon":
        return [(coords[0], coords[1:])]
    elif gtype == "MultiPolygon":
        return [(poly[0], poly[1:]) for poly in coords]
    return []


def ring_bbox(ring):
    lons = [p[0] for p in ring]
    lats = [p[1] for p in ring]
    return (min(lons), min(lats), max(lons), max(lats))


def point_in_ring(lon: float, lat: float, ring) -> bool:
    inside = False
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i][0], ring[i][1]
        x2, y2 = ring[(i + 1) % n][0], ring[(i + 1) % n][1]
        if ((y1 > lat) != (y2 > lat)) and (lon < (x2 - x1) * (lat - y1) / (y2 - y1 + 1e-15) + x1):
            inside = not inside
    return inside


def point_in_polys(lon: float, lat: float, polys) -> bool:
    for outer, holes in polys:
        if point_in_ring(lon, lat, outer):
            if not any(point_in_ring(lon, lat, h) for h in holes):
                return True
    return False


def calculate_gini(values) -> float:
    sorted_v = sorted(values)
    n = len(sorted_v)
    total = sum(sorted_v)
    if n == 0 or total == 0:
        return 0.0
    gini_sum = sum((2 * i - n - 1) * v for i, v in enumerate(sorted_v, 1))
    return round(gini_sum / (n * total), 3)


def percentile_90(values) -> float:
    """Percentil 90 por interpolación lineal sobre lista no vacía."""
    s = sorted(values)
    n = len(s)
    if n == 1:
        return float(s[0])
    pos = 0.9 * (n - 1)
    lo = int(math.floor(pos))
    hi = int(math.ceil(pos))
    if lo == hi:
        return float(s[lo])
    return s[lo] + (s[hi] - s[lo]) * (pos - lo)


def compute_departamento(dept_meta, weekly_by_year):
    """
    weekly_by_year: dict[int, dict[int, int]] -> {anio: {semana_iso: count}}
    """
    all_years = sorted(weekly_by_year.keys())
    cum_week = [0] * 53
    years_per_week = [set() for _ in range(53)]

    best_val = -1
    best_pair = (1, 0)

    for y in all_years:
        for w, cnt in weekly_by_year[y].items():
            if 1 <= w <= 53 and cnt > 0:
                cum_week[w - 1] += cnt
                years_per_week[w - 1].add(y)
                if cnt > best_val:
                    best_val = cnt
                    best_pair = (w, y)

    total = sum(cum_week)
    gini = calculate_gini(cum_week)

    # Núcleo crítico: semanas ordenadas descendentemente hasta acumular 80%
    if total > 0:
        indexed = sorted([(w + 1, cum_week[w]) for w in range(53)], key=lambda x: x[1], reverse=True)
        target = total * 0.80
        acc = 0
        nucleo = []
        for w, cnt in indexed:
            if cnt == 0:
                break
            acc += cnt
            nucleo.append(w)
            if acc >= target:
                break
        nucleo.sort()
    else:
        nucleo = []

    maximo_historico = {
        "semana": best_pair[0],
        "anio": best_pair[1] if best_val > 0 else 0,
        "detecciones": max(0, best_val),
    }

    if total > 0:
        tipica_w, tipica_n = max(((w + 1, cum_week[w]) for w in range(53)), key=lambda x: x[1])
    else:
        tipica_w, tipica_n = 1, 0

    semana_tipica = {
        "semana": tipica_w,
        "detecciones": tipica_n,
    }

    # Anomalías: semana(d, y, w) > p90 de S(d, w) con años estrictamente anteriores a y (>= 5 años previos)
    anomalias = []
    for w in range(1, 54):
        prior_vals = []
        for y in all_years:
            val = weekly_by_year[y].get(w, 0)
            if len(prior_vals) >= 5:
                p90 = percentile_90(prior_vals)
                if val > p90 and val > 0:
                    anomalias.append({
                        "anio": y,
                        "semana": w,
                        "n": val,
                        "p90": round(p90, 1),
                    })
            # Solo se agrega después de evaluar el año y (invariante estricto)
            prior_vals.append(val)

    anomalias.sort(key=lambda a: (a["anio"], a["semana"]), reverse=True)

    semanas_list = [
        {
            "w": w,
            "n": cum_week[w - 1],
            "anios": sorted(years_per_week[w - 1]),
        }
        for w in range(1, 54)
    ]

    return {
        "id": dept_meta["id"],
        "nombre": dept_meta["nombre"],
        "provincia": dept_meta["provincia"],
        "zona": dept_meta["zona"],
        "total": total,
        "gini": gini,
        "semanas_nucleo": nucleo,
        "semana_tipica": semana_tipica,
        "maximo_historico": maximo_historico,
        "semanas": semanas_list,
        "anomalias": anomalias[:30],
    }


def main():
    geojson_path = Path("data/departamentos.geojson")
    if not geojson_path.exists():
        raise FileNotFoundError("Falta data/departamentos.geojson. Ejecutá fetch_departamentos.py primero.")

    gj = json.loads(geojson_path.read_text(encoding="utf-8"))
    depts = []
    for feat in gj["features"]:
        props = feat["properties"]
        polys = extract_rings(feat["geometry"])
        bboxes = [ring_bbox(outer) for outer, _ in polys]
        full_bbox = (
            min(b[0] for b in bboxes),
            min(b[1] for b in bboxes),
            max(b[2] for b in bboxes),
            max(b[3] for b in bboxes),
        )
        depts.append({
            "meta": props,
            "polys": polys,
            "bbox": full_bbox,
            "weekly": defaultdict(lambda: defaultdict(int)),
        })

    # Ordenar por área de bbox ascendente para que polígonos más específicos/pequeños tengan prioridad sin duplicar
    depts.sort(key=lambda d: (d["bbox"][2] - d["bbox"][0]) * (d["bbox"][3] - d["bbox"][1]))
    print(f"Cargados {len(depts)} departamentos desde {geojson_path}")

    raw_files = sorted(Path("data/raw").glob("*/*/focos.csv"))
    if not raw_files:
        raise FileNotFoundError("No hay archivos en data/raw/*/*/focos.csv.")

    total_rows = 0
    assigned_rows = 0
    outside_rows = 0

    for rf in raw_files:
        print(f"Procesando {rf}...")
        with open(rf, "r", encoding="utf-8") as fh:
            reader = csv.DictReader(fh)
            for row in reader:
                total_rows += 1
                try:
                    lat = float(row["latitude"])
                    lon = float(row["longitude"])
                    y_str, m_str, d_str = row["acq_date"].split("-")
                    dt = date(int(y_str), int(m_str), int(d_str))
                    iso_y, iso_w, _ = dt.isocalendar()
                except Exception:
                    continue

                matched = False
                for dept in depts:
                    bx0, by0, bx1, by1 = dept["bbox"]
                    if bx0 <= lon <= bx1 and by0 <= lat <= by1:
                        if point_in_polys(lon, lat, dept["polys"]):
                            dept["weekly"][iso_y][iso_w] += 1
                            matched = True
                            break

                if matched:
                    assigned_rows += 1
                else:
                    outside_rows += 1

    pct_outside = (outside_rows / total_rows * 100) if total_rows else 0.0
    print(f"\nTotal focos leídos: {total_rows:,}")
    print(f"Asignados a departamentos: {assigned_rows:,}")
    print(f"Fuera de los 68 polígonos (descartados): {outside_rows:,} ({pct_outside:.2f}%)")

    departamentos_out = [compute_departamento(d["meta"], d["weekly"]) for d in depts]
    departamentos_out.sort(key=lambda x: x["total"], reverse=True)

    output = {
        "generado": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "serie": {"desde": "2000-11-01", "hasta": "2026-11-13", "n_anios": 27},
        "resumen_espacial": {
            "total_leidos": total_rows,
            "asignados": assigned_rows,
            "descartados_fuera_poligono": outside_rows,
            "porcentaje_fuera": round(pct_outside, 2),
        },
        "departamentos": departamentos_out,
    }

    out_path = Path("data/calendario.json")
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    shutil.copyfile(out_path, Path("web/src/lib/calendario.json"))
    print(f"Actualizados {out_path} y web/src/lib/calendario.json con datos reales.")


if __name__ == "__main__":
    main()
