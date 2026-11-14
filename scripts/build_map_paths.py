"""
Convierte data/departamentos.geojson en paths SVG pre-proyectados (sin tiles ni librerías externas)
para el mapa coroplético de la portada en web/src/lib/mapa_paths.json.
"""
import json
import math
from pathlib import Path


def project(lon: float, lat: float, min_lon, max_lon, min_lat, max_lat, width, height, pad, cos_lat):
    span_x = (max_lon - min_lon) * cos_lat
    span_y = max_lat - min_lat
    usable_w = width - 2 * pad
    usable_h = height - 2 * pad
    scale = min(usable_w / span_x, usable_h / span_y)

    # Centrar en el viewBox
    drawn_w = span_x * scale
    drawn_h = span_y * scale
    off_x = (width - drawn_w) / 2.0
    off_y = (height - drawn_h) / 2.0

    x = off_x + (lon - min_lon) * cos_lat * scale
    y = off_y + (max_lat - lat) * scale
    return round(x, 1), round(y, 1)


def ring_to_svg(ring, proj_args):
    pts = [project(p[0], p[1], *proj_args) for p in ring]
    if not pts:
        return ""
    # Simplificación mínima: evitar puntos consecutivos duplicados tras redondeo
    dedup = [pts[0]]
    for pt in pts[1:]:
        if pt != dedup[-1]:
            dedup.append(pt)
    if len(dedup) < 3:
        return ""
    cmds = [f"M{dedup[0][0]},{dedup[0][1]}"]
    for x, y in dedup[1:]:
        cmds.append(f"L{x},{y}")
    cmds.append("Z")
    return "".join(cmds)


def main():
    gj = json.loads(Path("data/departamentos.geojson").read_text(encoding="utf-8"))
    features = gj["features"]

    all_lons = []
    all_lats = []
    for feat in features:
        g = feat["geometry"]
        polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        for poly in polys:
            for ring in poly:
                for lon, lat in ring:
                    all_lons.append(lon)
                    all_lats.append(lat)

    min_lon, max_lon = min(all_lons), max(all_lons)
    min_lat, max_lat = min(all_lats), max(all_lats)
    mid_lat = (min_lat + max_lat) / 2.0
    cos_lat = math.cos(math.radians(mid_lat))

    width, height, pad = 760, 520, 20
    proj_args = (min_lon, max_lon, min_lat, max_lat, width, height, pad, cos_lat)

    paths = []
    for feat in features:
        props = feat["properties"]
        g = feat["geometry"]
        polys = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        d_parts = []
        for poly in polys:
            for ring in poly:
                s = ring_to_svg(ring, proj_args)
                if s:
                    d_parts.append(s)
        paths.append({
            "id": props["id"],
            "d": " ".join(d_parts),
        })

    out = {
        "width": width,
        "height": height,
        "paths": paths,
    }
    out_path = Path("web/src/lib/mapa_paths.json")
    out_path.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print(f"Generado {out_path} con {len(paths)} polígonos ({out_path.stat().st_size / 1024:.1f} KB).")


if __name__ == "__main__":
    main()
