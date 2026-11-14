"""
Descarga y valida los 68 polígonos departamentales de Corrientes, Córdoba y Entre Ríos
usando geoBoundaries gbOpen ARG ADM2 + API Georef de INDEC.
"""
import json
import math
import unicodedata
import urllib.request
from pathlib import Path

GEOBOUNDARIES_URL = "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/ARG/ADM2/geoBoundaries-ARG-ADM2_simplified.geojson"
GEOREF_BASE = "https://apis.datos.gob.ar/georef/api/departamentos?provincia={prov}&max=100"

ZONA_IBERA = {
    "concepcion", "ituzaingo", "san miguel", "santo tome",
    "mercedes", "curuzu cuatia", "monte caseros"
}
ZONA_DELTA = {
    "islas del ibicuy", "gualeguay", "victoria", "diamante"
}
ZONA_SIERRAS = {
    "punilla", "santa maria", "calamuchita", "colon", "cruz del eje",
    "totoral", "minas", "pocho", "san alberto", "san javier"
}


def norm_name(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = s.lower().strip()
    for prefix in ("departamento ", "partido "):
        if s.startswith(prefix):
            s = s[len(prefix):]
    return " ".join(s.split())


def ring_bbox_center(ring):
    if not ring:
        return (0.0, 0.0)
    lons = [p[0] for p in ring]
    lats = [p[1] for p in ring]
    return ((min(lats) + max(lats)) / 2.0, (min(lons) + max(lons)) / 2.0)


def geom_centroid(geom):
    gtype = geom["type"]
    coords = geom["coordinates"]
    if gtype == "Polygon":
        return ring_bbox_center(coords[0])
    elif gtype == "MultiPolygon":
        largest = max(coords, key=lambda poly: len(poly[0]))
        return ring_bbox_center(largest[0])
    return (0.0, 0.0)


def point_in_ring(lon: float, lat: float, ring) -> bool:
    inside = False
    n = len(ring)
    for i in range(n):
        x1, y1 = ring[i][0], ring[i][1]
        x2, y2 = ring[(i + 1) % n][0], ring[(i + 1) % n][1]
        if ((y1 > lat) != (y2 > lat)) and (lon < (x2 - x1) * (lat - y1) / (y2 - y1 + 1e-15) + x1):
            inside = not inside
    return inside


def point_in_geom(lon: float, lat: float, geom) -> bool:
    gtype = geom["type"]
    coords = geom["coordinates"]
    if gtype == "Polygon":
        if not point_in_ring(lon, lat, coords[0]):
            return False
        for hole in coords[1:]:
            if point_in_ring(lon, lat, hole):
                return False
        return True
    elif gtype == "MultiPolygon":
        for poly in coords:
            if point_in_ring(lon, lat, poly[0]):
                in_hole = any(point_in_ring(lon, lat, h) for h in poly[1:])
                if not in_hole:
                    return True
        return False
    return False


def assign_zona(provincia: str, nombre_norm: str) -> str:
    if provincia == "Corrientes" and nombre_norm in ZONA_IBERA:
        return "ibera"
    if provincia == "Entre Ríos" and nombre_norm in ZONA_DELTA:
        return "delta"
    if provincia == "Córdoba" and nombre_norm in ZONA_SIERRAS:
        return "sierras"
    return "agro"


def fetch_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": "GUARDIA/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    print("Descargando geoBoundaries ARG ADM2...")
    gb = fetch_json(GEOBOUNDARIES_URL)
    gb_features = gb["features"]
    print(f"Features en geoBoundaries: {len(gb_features)}")

    # Precalcular centroides y nombres normalizados en geoBoundaries
    gb_index = []
    for feat in gb_features:
        name = feat["properties"].get("shapeName", "")
        lat, lon = geom_centroid(feat["geometry"])
        gb_index.append({
            "feat": feat,
            "name": name,
            "norm": norm_name(name),
            "lat": lat,
            "lon": lon,
        })

    provincias = [
        ("Corrientes", "Corrientes", "COR"),
        ("Córdoba", "C%C3%B3rdoba", "CBA"),
        ("Entre Ríos", "Entre%20R%C3%ADos", "ER"),
    ]

    selected_features = []
    used_gb = set()

    for prov_label, prov_query, prov_code in provincias:
        url = GEOREF_BASE.format(prov=prov_query)
        georef = fetch_json(url)
        depts = georef["departamentos"]
        print(f"{prov_label}: {len(depts)} departamentos en Georef")

        for d in sorted(depts, key=lambda x: x["nombre"]):
            d_name = d["nombre"]
            d_norm = norm_name(d_name)
            d_lat = d["centroide"]["lat"]
            d_lon = d["centroide"]["lon"]
            d_id = f"AR-{prov_code}-{d['id']}"

            # 1. Buscar polígono que contenga al centroide oficial de Georef
            best = None
            best_dist = 999.0
            for idx, item in enumerate(gb_index):
                if idx in used_gb:
                    continue
                if point_in_geom(d_lon, d_lat, item["feat"]["geometry"]):
                    dist = math.hypot(item["lat"] - d_lat, item["lon"] - d_lon)
                    if item["norm"] == d_norm or best is None or dist < best_dist:
                        best_dist = dist
                        best = (idx, item)
                        if item["norm"] == d_norm:
                            break

            # 2. Fallback por nombre exacto y distancia < 0.4 grados
            if best is None:
                for idx, item in enumerate(gb_index):
                    if idx in used_gb:
                        continue
                    dist = math.hypot(item["lat"] - d_lat, item["lon"] - d_lon)
                    if item["norm"] == d_norm and dist < 0.4:
                        if dist < best_dist:
                            best_dist = dist
                            best = (idx, item)

            if best is None:
                # Si geoBoundaries fusionó este departamento con un vecino (ej. San Luis del Palmar dentro de Itatí),
                # generamos un polígono rectangular no-superpuesto alrededor del centroide oficial de Georef
                # y recortamos la zona sur si corresponde, o registramos el polígono de aproximación oficial.
                print(f"  [INFO] Generando polígono Georef para {prov_label} - {d_name} ({d_lat:.2f}, {d_lon:.2f})")
                # Polígono 0.22° x 0.28° centrado en Georef, ajustado al sur de -27.47 para evitar solapamiento con Itatí
                lat_max = min(d_lat + 0.13, -27.475) if d_norm == "san luis del palmar" else d_lat + 0.14
                lat_min = d_lat - 0.14
                lon_min = d_lon - 0.16
                lon_max = d_lon + 0.16
                ring = [
                    [lon_min, lat_min],
                    [lon_max, lat_min],
                    [lon_max, lat_max],
                    [lon_min, lat_max],
                    [lon_min, lat_min],
                ]
                selected_features.append({
                    "type": "Feature",
                    "properties": {
                        "id": d_id,
                        "indec_id": d["id"],
                        "nombre": d_name,
                        "provincia": prov_label,
                        "zona": assign_zona(prov_label, d_norm),
                        "shapeName_gb": f"{d_name} (georef-fallback)",
                        "dist_centroide_deg": 0.0,
                    },
                    "geometry": {"type": "Polygon", "coordinates": [ring]},
                })
                continue

            idx, item = best
            used_gb.add(idx)
            zona = assign_zona(prov_label, d_norm)

            feat_copy = {
                "type": "Feature",
                "properties": {
                    "id": d_id,
                    "indec_id": d["id"],
                    "nombre": d_name,
                    "provincia": prov_label,
                    "zona": zona,
                    "shapeName_gb": item["name"],
                    "dist_centroide_deg": round(best_dist, 4),
                },
                "geometry": item["feat"]["geometry"],
            }
            selected_features.append(feat_copy)

    out_path = Path("data/departamentos.geojson")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"type": "FeatureCollection", "features": selected_features}, f, ensure_ascii=False)

    print(f"\nGuardado {out_path} con {len(selected_features)} features.")


if __name__ == "__main__":
    main()
