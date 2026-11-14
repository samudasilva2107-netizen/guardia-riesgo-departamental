# GUARDIA — Calendario operativo de riesgo de incendios por departamento

Herramienta analítica de toma de decisiones para prevención, planificación logística y asignación de guardias de incendios de vegetación en **68 departamentos** de **Corrientes, Córdoba y Entre Ríos** (Argentina), basada en la serie histórica 2000–2026 de **NASA FIRMS**.

## Qué responde

- **Núcleo crítico (80 %):** Qué semanas ISO del año concentran históricamente el 80 % de las detecciones del departamento.
- **Semana pico histórica:** En qué semana y año se registró la mayor actividad del período.
- **Anomalías (> P90 previo):** Qué semanas superaron el percentil 90 de todos los años estrictamente anteriores (con un mínimo de 5 años previos).
- **Contraste con la literatura:** Superpone la temporada esperada según bibliografía científica por zona (`ibera`, `delta`, `sierras`, `agro`) detrás de la actividad observada.

## Asignación espacial y cobertura

- **Focos leídos (MODIS C6.1 + VIIRS NOAA-20/21, excluyendo Suomi-NPP):** `1,045,996`
- **Asignados a los 68 departamentos (Point-in-Polygon):** `694,201`
- **Descartados fuera de los 68 polígonos (otras jurisdicciones dentro de los bboxes):** `351,795` (`33.63%`)

## Estructura del repositorio

- `data/raw/{provincia}/{producto}/focos.csv`: registros crudos filtrados por confianza (`MODIS >= 30`, `VIIRS nominal/high`).
- `data/departamentos.geojson`: 68 polígonos oficiales (`geoBoundaries gbOpen ARG ADM2` validados con `Georef INDEC`).
- `data/zonas.json`: bandas de temporada esperada de referencia científica por zona.
- `data/calendario.json`: salida consolidada por departamento y semana ISO (1–53).
- `scripts/`: `ingest.py`, `fetch_departamentos.py`, `compute.py`, `test_criterios.py`.
- `web/`: aplicación Next.js (Portada/Ranking, Ficha departamental, Comparador, Método y Exportación CSV BOM UTF-8).

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

## Licencia

MIT — ver [LICENSE](LICENSE).
