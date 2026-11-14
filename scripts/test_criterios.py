"""
Tests de aceptación para GUARDIA (§5 del brief):
- 68 departamentos sin repetidos
- 53 semanas en cada departamento
- Suma de semanas == total del departamento
- Invariante del p90: no incluye el año evaluado y requiere >= 5 años previos
- Departamento sin detecciones no rompe el cálculo
"""
import json
from collections import defaultdict
from pathlib import Path
from compute import compute_departamento


def test_synthetic_empty_and_p90():
    # 1. Departamento sin detecciones
    meta_empty = {"id": "TEST-0", "nombre": "Vacío", "provincia": "Corrientes", "zona": "agro"}
    res_empty = compute_departamento(meta_empty, defaultdict(lambda: defaultdict(int)))
    assert len(res_empty["semanas"]) == 53
    assert res_empty["total"] == 0
    assert res_empty["anomalias"] == []

    # 2. Invariante p90: 5 años previos con 10 focos en sem 35, año 6 con 1000 focos
    # Si se incluyera el año 6, p90 subiría; al excluirlo, p90 debe ser 10.0
    weekly = defaultdict(lambda: defaultdict(int))
    for y in range(2015, 2020):
        weekly[y][35] = 10
    weekly[2020][35] = 1000

    res_p90 = compute_departamento(meta_empty, weekly)
    assert len(res_p90["anomalias"]) == 1
    anom = res_p90["anomalias"][0]
    assert anom["anio"] == 2020
    assert anom["semana"] == 35
    assert anom["p90"] == 10.0, f"Se esperaba p90=10.0 sin incluir 2020, se obtuvo {anom['p90']}"
    print("[PASS] Tests sintéticos (departamento vacío + invariante p90)")


def test_real_calendario():
    cal_path = Path("data/calendario.json")
    data = json.loads(cal_path.read_text(encoding="utf-8"))
    depts = data["departamentos"]

    assert len(depts) == 68, f"Se esperaban 68 departamentos, hay {len(depts)}"
    ids = [d["id"] for d in depts]
    assert len(set(ids)) == 68, "Hay IDs repetidos"

    total_ranking = 0
    for d in depts:
        assert len(d["semanas"]) == 53, f"{d['nombre']} no tiene 53 semanas"
        suma_semanas = sum(s["n"] for s in d["semanas"])
        assert suma_semanas == d["total"], f"{d['nombre']}: suma semanas ({suma_semanas}) != total ({d['total']})"
        total_ranking += d["total"]

    if "resumen_espacial" in data:
        asignados = data["resumen_espacial"]["asignados"]
        assert total_ranking == asignados, f"Total ranking ({total_ranking}) != asignados ({asignados})"

    print(f"[PASS] Tests sobre data/calendario.json real: 68 depts, {total_ranking:,} detecciones exactas.")


if __name__ == "__main__":
    test_synthetic_empty_and_p90()
    test_real_calendario()
