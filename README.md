# GUARDIA — Calendario operativo de riesgo de incendios por departamento

Herramienta analítica de toma de decisiones para prevención, planificación logística y asignación de guardias de incendios de vegetación en **68 departamentos** de **Corrientes, Córdoba y Entre Ríos** (Argentina), basada en la serie histórica 2000–2026 de **NASA FIRMS**.

## Qué responde

- **Núcleo crítico (80 %):** Qué semanas ISO del año concentran históricamente el 80 % de las detecciones del departamento.
- **Semana típica vs. Máximo histórico:** Separa la semana ISO de mayor acumulado histórico (régimen normal) de la semana/año récord puntual (eventos extremos como La Niña 2022).
- **Anomalías (> P90 previo):** Qué semanas superaron el percentil 90 calculado estrictamente con años anteriores (mínimo 5 años previos).
- **Contraste con la literatura:** Superpone la temporada esperada según bibliografía científica por zona (`ibera`, `delta`, `sierras`, `agro`) detrás de la actividad observada.

---

## Asignación espacial y cobertura (33,63 % descartado)

- **Focos leídos (MODIS C6.1 + VIIRS NOAA-20/21, excluyendo Suomi-NPP):** `1,045,996`
- **Asignados a los 68 departamentos (Point-in-Polygon exacto):** `694,201`
- **Descartados fuera de los 68 polígonos:** `351,795` (`33,63 %`)

Los bounding boxes rectangulares descargados para cubrir Corrientes, Córdoba y Entre Ríos incluyen porciones de provincias vecinas (Santa Fe, Chaco, San Luis, Buenos Aires) y países limítrofes (Paraguay, Brasil, Uruguay). Durante el cálculo espacial, todo foco que cae fuera de los 68 polígonos departamentales oficiales se descarta y no entra en los totales.

---

## Diccionario de `data/calendario.json`

Cada entrada dentro de `departamentos[]` contiene:

- `total`: suma total de detecciones asignadas al departamento en toda la serie histórica.
- `gini`: coeficiente de concentración de Gini (`0` a `1`, 3 decimales) calculado sobre las 53 semanas acumuladas.
- `semanas_nucleo`: array de semanas ISO (1–53) ordenadas que acumulan el 80 % de `total`.
- `semana_tipica`: `{ semana, detecciones }` — la semana ISO con mayor acumulado en toda la serie (`max(S(d, w))`).
- `maximo_historico`: `{ semana, anio, detecciones }` — el récord puntual en un único año de la serie.
- `anomalias`: lista de `{ anio, semana, n, p90 }` para semanas que superan el percentil 90 de todos los años estrictamente anteriores (con ≥ 5 años previos).
- `semanas[].n`: detecciones acumuladas en la semana ISO `w` (`1..53`, siempre 53 filas por departamento).

*(Nota de proceso: `data/calendario.mock.json` y `scripts/mock_calendario.py` se conservan como registro de desarrollo: el mock se usó para construir la interfaz antes de tener los datos procesados; el archivo real es `data/calendario.json`.)*

---

## Cómo reproducir

### Requisitos y versiones
- **Python 3.11+** (solo biblioteca estándar: **sin dependencias geoespaciales externas**, Point-in-Polygon implementado en Python puro).
- **Node.js 20+** y **Next.js 14.2** para la aplicación web (`web/`).

### Pasos
```bash
python3 scripts/ingest.py      # ingesta y filtrado FIRMS desde cache_firms (~8 min)
python3 scripts/compute.py     # cálculo espacial y métricas por departamento (~11 min)
python3 scripts/test_criterios.py  # verificación de invariantes (68 deptos, 53 semanas, p90)
cd web && npm install && npm run build
```

*(Nota: `compute.py` se corre una vez de forma local y su salida se commitea en `data/calendario.json` y `web/src/lib/calendario.json`. El build de Vercel solo lee los JSON commiteados.)*

---

## Estructura del repositorio

```text
├── .vercelignore                 # Excluye data/raw/, scripts/ y docs del deploy web
├── LICENSE                       # Licencia MIT
├── README.md
├── data/
│   ├── raw/{provincia}/{producto}/focos.csv
│   ├── manifiesto.json           # Metadatos de productos, bboxes y conteos
│   ├── departamentos.geojson     # 68 polígonos (geoBoundaries + Georef INDEC)
│   ├── zonas.json                # Bandas de referencia científica por zona
│   ├── calendario.mock.json      # Mock inicial usado para desbloquear el front
│   └── calendario.json           # Salida real consolidada (694.201 focos)
├── docs/
│   ├── RESEARCH.md               # Decisiones metodológicas y fuentes (EN)
│   ├── METHOD.md                 # Fundamento matemático, citas y límites
│   └── ORIGEN-DATOS.md           # Declaración de procedencia de insumos
├── scripts/
│   ├── ingest.py                 # Extracción y filtrado por confianza
│   ├── fetch_departamentos.py    # Descarga y validación de los 68 polígonos
│   ├── compute.py                # Point-in-Polygon, núcleo 80%, Gini y P90
│   ├── build_map_paths.py        # Proyección SVG para el coroplético
│   ├── mock_calendario.py        # Generador del mock inicial
│   └── test_criterios.py         # Suite de tests de aceptación
└── web/                          # Aplicación Next.js 14 (Tailwind, SVG puro)
    └── src/
        ├── app/                  # Rutas: /, /departamento/[id], /comparar, /metodo, /api/export/[id]
        ├── components/           # Header, WeeklyBar, ChoroplethMap
        └── lib/                  # types.ts, calendario.json, zonas.json, mapa_paths.json
```

---

## Documentación

- [docs/RESEARCH.md](docs/RESEARCH.md) — decisiones metodológicas y fuentes
- [docs/METHOD.md](docs/METHOD.md) — fundamento matemático, citas y límites
- [docs/ORIGEN-DATOS.md](docs/ORIGEN-DATOS.md) — declaración de procedencia de insumos

---

## Data Provenance

```text
The public NASA FIRMS active-fire records used by this project were obtained
during the team's preparation and research phase, which the event rules permit.
All source code, the analysis method, the application and its interface were
developed during the official event window (November 14, 9:00 to November 15,
23:59, 2026). No code from any previous project of the team is reused.

Third-party inputs: NASA FIRMS MODIS C6.1 and VIIRS C2 (public), geoBoundaries
gbOpen ARG ADM2 boundaries (CC BY 4.0), INDEC/georef department names (public).
```

### Use of Super Intelligence

Portions of the source code, the documentation and the English text of this
project were written with the assistance of Super Intelligence (large language
models), used as an accelerator. All computations, the departmental assignment
and every figure shown in the application are produced by the code in this
repository from NASA FIRMS data; no number in the interface is generated by a
model. No AI-generated imagery is used: every visual is a screenshot of the
running application.

---

## Licencia

MIT — ver [LICENSE](LICENSE).
