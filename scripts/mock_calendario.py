import json
import random
from pathlib import Path

random.seed(42)

# 68 Departamentos distribuidos en 3 provincias
# Corrientes (25), Córdoba (26), Entre Ríos (17)
DEPARTAMENTOS = [
    # Corrientes (25)
    ("AR-COR-058", "Concepción", "Corrientes", "ibera"),
    ("AR-COR-059", "Ituzaingó", "Corrientes", "ibera"),
    ("AR-COR-060", "San Miguel", "Corrientes", "ibera"),
    ("AR-COR-061", "Santo Tomé", "Corrientes", "ibera"),
    ("AR-COR-062", "Mercedes", "Corrientes", "ibera"),
    ("AR-COR-063", "Curuzú Cuatiá", "Corrientes", "ibera"),
    ("AR-COR-064", "Monte Caseros", "Corrientes", "ibera"),
    ("AR-COR-065", "Bella Vista", "Corrientes", "agro"),
    ("AR-COR-066", "Berón de Astrada", "Corrientes", "agro"),
    ("AR-COR-067", "Capital", "Corrientes", "agro"),
    ("AR-COR-068", "Empedrado", "Corrientes", "agro"),
    ("AR-COR-069", "Esquina", "Corrientes", "agro"),
    ("AR-COR-070", "General Alvear", "Corrientes", "agro"),
    ("AR-COR-071", "General Paz", "Corrientes", "agro"),
    ("AR-COR-072", "Goya", "Corrientes", "agro"),
    ("AR-COR-073", "Itatí", "Corrientes", "agro"),
    ("AR-COR-074", "Lavalle", "Corrientes", "agro"),
    ("AR-COR-075", "Mburucuyá", "Corrientes", "agro"),
    ("AR-COR-076", "Paso de los Libres", "Corrientes", "agro"),
    ("AR-COR-077", "Saladas", "Corrientes", "agro"),
    ("AR-COR-078", "San Cosme", "Corrientes", "agro"),
    ("AR-COR-079", "San Luis del Palmar", "Corrientes", "agro"),
    ("AR-COR-080", "San Martín", "Corrientes", "agro"),
    ("AR-COR-081", "San Roque", "Corrientes", "agro"),
    ("AR-COR-082", "Sauce", "Corrientes", "agro"),

    # Córdoba (26)
    ("AR-CBA-011", "Punilla", "Córdoba", "sierras"),
    ("AR-CBA-012", "Santa María", "Córdoba", "sierras"),
    ("AR-CBA-013", "Calamuchita", "Córdoba", "sierras"),
    ("AR-CBA-014", "Colón", "Córdoba", "sierras"),
    ("AR-CBA-015", "Cruz del Eje", "Córdoba", "sierras"),
    ("AR-CBA-016", "Totoral", "Córdoba", "sierras"),
    ("AR-CBA-017", "Capital", "Córdoba", "agro"),
    ("AR-CBA-018", "General Roca", "Córdoba", "agro"),
    ("AR-CBA-019", "General San Martín", "Córdoba", "agro"),
    ("AR-CBA-020", "Ischilín", "Córdoba", "agro"),
    ("AR-CBA-021", "Juárez Celman", "Córdoba", "agro"),
    ("AR-CBA-022", "Marcos Juárez", "Córdoba", "agro"),
    ("AR-CBA-023", "Minas", "Córdoba", "sierras"),
    ("AR-CBA-024", "Pocho", "Córdoba", "sierras"),
    ("AR-CBA-025", "Presidente Roque Sáenz Peña", "Córdoba", "agro"),
    ("AR-CBA-026", "Río Cuarto", "Córdoba", "agro"),
    ("AR-CBA-027", "Río Primero", "Córdoba", "agro"),
    ("AR-CBA-028", "Río Seco", "Córdoba", "agro"),
    ("AR-CBA-029", "Río Segundo", "Córdoba", "agro"),
    ("AR-CBA-030", "San Alberto", "Córdoba", "sierras"),
    ("AR-CBA-031", "San Javier", "Córdoba", "sierras"),
    ("AR-CBA-032", "San Justo", "Córdoba", "agro"),
    ("AR-CBA-033", "Sobremonte", "Córdoba", "agro"),
    ("AR-CBA-034", "Tercero Arriba", "Córdoba", "agro"),
    ("AR-CBA-035", "Tulumba", "Córdoba", "agro"),
    ("AR-CBA-036", "Unión", "Córdoba", "agro"),

    # Entre Ríos (17)
    ("AR-ER-001", "Islas del Ibicuy", "Entre Ríos", "delta"),
    ("AR-ER-002", "Gualeguay", "Entre Ríos", "delta"),
    ("AR-ER-003", "Victoria", "Entre Ríos", "delta"),
    ("AR-ER-004", "Diamante", "Entre Ríos", "delta"),
    ("AR-ER-005", "Colón", "Entre Ríos", "agro"),
    ("AR-ER-006", "Concordia", "Entre Ríos", "agro"),
    ("AR-ER-007", "Federación", "Entre Ríos", "agro"),
    ("AR-ER-008", "Federal", "Entre Ríos", "agro"),
    ("AR-ER-009", "Feliciano", "Entre Ríos", "agro"),
    ("AR-ER-010", "Gualeguaychú", "Entre Ríos", "agro"),
    ("AR-ER-011", "La Paz", "Entre Ríos", "agro"),
    ("AR-ER-012", "Nogoyá", "Entre Ríos", "agro"),
    ("AR-ER-013", "Paraná", "Entre Ríos", "agro"),
    ("AR-ER-014", "San Salvador", "Entre Ríos", "agro"),
    ("AR-ER-015", "Tala", "Entre Ríos", "agro"),
    ("AR-ER-016", "Uruguay", "Entre Ríos", "agro"),
    ("AR-ER-017", "Villaguay", "Entre Ríos", "agro")
]

def calculate_gini(values):
    """Calcula Gini para un array de 53 valores."""
    sorted_v = sorted(values)
    n = len(sorted_v)
    if n == 0 or sum(sorted_v) == 0:
        return 0.0
    cum_v = 0
    total = sum(sorted_v)
    gini_sum = 0
    for i, v in enumerate(sorted_v, 1):
        gini_sum += (2 * i - n - 1) * v
    return round(gini_sum / (n * total), 3)

def generate_dept_data(dept_id, nombre, provincia, zona):
    # Generar 53 semanas
    base_activity = []
    # Dependiendo de la zona, concentramos actividad en ciertas semanas
    for w in range(1, 54):
        if zona == "ibera":
            # Pico w27-w40
            weight = 4.0 if 27 <= w <= 40 else 0.4
        elif zona == "delta":
            # Pico w27-w44
            weight = 3.5 if 27 <= w <= 44 else 0.3
        elif zona == "sierras":
            # Pico w31-w45
            weight = 4.5 if 31 <= w <= 45 else 0.2
        else: # agro
            # Bimodal w22-w32 y w48-w53
            weight = 3.0 if (22 <= w <= 32 or w >= 48) else 0.5

        detections = int(random.gammavariate(1.5, 40) * weight)
        base_activity.append(detections)

    total = sum(base_activity)
    gini = calculate_gini(base_activity)

    # Semanas nucleo (acumulan 80%)
    indexed_w = sorted([(w, base_activity[w-1]) for w in range(1, 54)], key=lambda x: x[1], reverse=True)
    cum = 0
    target_80 = total * 0.8
    nucleo = []
    for w, count in indexed_w:
        cum += count
        nucleo.append(w)
        if cum >= target_80:
            break
    nucleo.sort()

    # Semana pico
    max_w, max_n = indexed_w[0]
    pico_anio = random.choice([2020, 2021, 2022, 2023])
    semana_pico = {
        "semana": max_w,
        "anio": pico_anio,
        "detecciones": int(max_n * 1.6)
    }

    # 53 semanas estructuradas
    semanas_obj = []
    for w in range(1, 54):
        n_val = base_activity[w-1]
        anios_sample = random.sample(range(2005, 2025), k=min(4, max(1, n_val % 5 + 1)))
        semanas_obj.append({
            "w": w,
            "n": n_val,
            "anios": sorted(anios_sample)
        })

    # Anomalias (ejemplo histórico)
    anomalias = []
    if nucleo:
        anom_w = random.choice(nucleo)
        anomalias.append({
            "anio": pico_anio,
            "semana": anom_w,
            "n": semana_pico["detecciones"],
            "p90": int(semana_pico["detecciones"] * 0.55)
        })

    return {
        "id": dept_id,
        "nombre": nombre,
        "provincia": provincia,
        "zona": zona,
        "total": total,
        "gini": gini,
        "semanas_nucleo": nucleo,
        "semana_pico": semana_pico,
        "semanas": semanas_obj,
        "anomalias": anomalias
    }

def main():
    depts_data = []
    for dept_id, nombre, provincia, zona in DEPARTAMENTOS:
        depts_data.append(generate_dept_data(dept_id, nombre, provincia, zona))

    res = {
        "generado": "2026-11-14T18:20:00Z",
        "serie": { "desde": "2000-11-01", "hasta": "2026-11-13", "n_anios": 27 },
        "departamentos": depts_data
    }

    out_file = Path("data/calendario.json")
    out_file.parent.mkdir(parents=True, exist_ok=True)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2)

    # Mock copy as reference
    with open("data/calendario.mock.json", "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2)

    print(f"Generado {out_file} con {len(depts_data)} departamentos.")

if __name__ == "__main__":
    main()
