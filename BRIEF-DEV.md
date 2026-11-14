# GUARDIA v2 — Brief para el dev (versión para arrancar YA)
### Producto nuevo · Repo nuevo · Rama nueva · 3 provincias · 14–15 nov 2026

---

## 0. ARRANCÁ POR ACÁ (primeros 30 minutos, en este orden)

1. Crear repo público `guardia-riesgo-departamental`, licencia MIT, y la rama **`feat/guardia-v1`** (todo el trabajo va ahí, no en `main`).
2. Commit `chore: estructura y manifiesto de datos` con las carpetas vacías y `data/manifiesto.json`.
3. Arrancar la **descarga de focos** de las 3 provincias (ver §2.1) y **commitear a medida que baja**, un commit por provincia y producto. La descarga corre sola; vos seguís codificando.
4. Mientras baja: escribir `scripts/compute.py` con las fórmulas de §3 (no necesita los datos completos, se prueba con un CSV chico).
5. Cuando termine la descarga: `data/departamentos.geojson` con los 68 polígonos y el primer cálculo real.

**No preguntes nada antes de terminar estos 5 pasos.** El brief está completo.

---

## 1. Regla de oro

- **Prohibido** copiar archivos, componentes o funciones de `ignis-fire-calendar`. Otro producto, otro código.
- **Sí** se pueden reutilizar los **datos crudos** de NASA FIRMS: son datos públicos y su descarga es parte de la investigación previa, que las reglas permiten.
- Todo el código se commitea **hoy y mañana**, con hora real. Sin squash, sin reescritura de historia, sin fechas tocadas.
- **Todo va a la rama `feat/guardia-v1`.** Los commits se ven crecer con el tiempo real de trabajo.

---

## 2. Datos

**2.1 Focos — 3 provincias, 3 regímenes de fuego distintos**

| Provincia | bbox (lon_oeste, lat_sur, lon_este, lat_norte) | Por qué está |
|---|---|---|
| Corrientes | `-59.30, -30.90, -55.60, -27.20` | Humedales del Iberá: los grandes incendios de 2022 |
| Córdoba | `-65.80, -35.10, -61.70, -29.40` | Sierras e interfaz urbano-forestal |
| Entre Ríos | `-60.90, -34.10, -57.60, -29.90` | Delta y agro: pastizales y quema de rastrojo |

- Productos: **MODIS C6.1** (1 km) y **VIIRS C2 375 m** (NOAA-20 y NOAA-21). **Suomi-NPP excluido**: cesó el 2026-11-02.
- Rango: **2000-11-01 → 2026-11-13**.
- Los CSV crudos van a `data/raw/{provincia}/{producto}/` + `data/manifiesto.json` con `source`, `product`, `bbox`, `date_range`, `downloaded_at`, `rows`.
- **Commit por provincia y por producto** a medida que termina cada descarga.

**2.2 Polígonos departamentales (68 en total)**

- geoBoundaries gbOpen ARG ADM2:
  `https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/ARG/ADM2/geoBoundaries-ARG-ADM2_simplified.geojson`
  (verificado: HTTP 200, 525 features, `shapeName` con el nombre del departamento)
- Nombres y centroides oficiales para validar:
  `https://apis.datos.gob.ar/georef/api/departamentos?provincia=Corrientes&max=100` (idem Córdoba, Entre Ríos)
- Selección: los departamentos cuyo `shapeName` coincide con georef **y** cuyo centroide está a menos de 0,2° del oficial. Se congelan en `data/departamentos.geojson` con `provincia` y `zona`.
- **El WFS del IGN no responde** (probado). No perder tiempo ahí.

**2.3 Zonas (agrupación propia, va en `data/zonas.json`)**

Cuatro zonas que cruzan las tres provincias. Es la unidad de navegación de la interfaz:

- `ibera` — humedales (Corrientes: Concepción, Ituzaingó, San Miguel, Santo Tomé, Mercedes, Curuzú Cuatiá, Monte Caseros)
- `delta` — Delta del Paraná (Entre Ríos: Islas del Ibicuy, Gualeguay, Victoria, Diamante, Zárate-Campana si aparece)
- `sierras` — sierras y WUI (Córdoba: Punilla, Santa María, Calamuchita, Colón, Cruz del Eje, Totoral)
- `agro` — resto de ambos territorios: pastizal y rastrojo

Cada departamento pertenece a una y solo una zona.

**2.4 Asignación de focos**
- Punto en polígono (`shapely` / `turf`). Sin aproximaciones por distancia.
- Focos fuera de todo polígono se descartan y se reporta el porcentaje en el README.

---

## 3. Cálculo (exacto, sin interpretación)

Para cada departamento `d` (68), cada año `y`, cada semana ISO `w`:

1. `semana(d, y, w)` = detecciones del departamento en esa semana.
2. `S(d, w)` = array de `semana(d, y, w)` para todos los años con datos.
3. **Núcleo crítico**: ordenar las 53 semanas por detecciones acumuladas (suma de todos los años), de mayor a menor; acumular hasta el **80 % del total del departamento**. Ese conjunto de semanas es su núcleo.
4. **Semana pico**: el par `(y, w)` de mayor valor de `semana(d, y, w)`; se muestra con su año.
5. **Semana anómala**: `semana(d, y, w)` > **p90 de `S(d, w)` calculado solo con años anteriores a `y`** (nunca incluyendo el propio año). Con menos de 5 años previos, no se marca.
6. **Concentración (Gini)** sobre las 53 semanas acumuladas: 0 = actividad repartida, 1 = toda en pocas semanas.
7. **Época satelital** por año: 1 plataforma antes de 2012, 2 desde 2012, 3 desde 2018, 4 desde 2024. Se muestra al lado de cada año y se explica en Método.

**Regla dura:** ningún número escrito a mano en el código ni en el copy. Todo sale de los archivos de datos en runtime.

---

## 4. Interfaz — tiene que verse DISTINTA de IGNIS

IGNIS es oscuro, científico, con mapa grande y densidad alta. **GUARDIA va al revés:**

- **Tema claro**, fondo blanco hueso (#FAFAF8), texto casi negro, un solo color de acento (verde oliva / ámbar). **Nada de fondo oscuro, nada de gradientes, nada de glassmorphism.**
- **Tabla primero, mapa nunca en la v1.** La unidad es la fila, no el punto.
- **Semáforo por chips**: `crítico` / `alto` / `medio` / `bajo`, con texto además del color (accesible).
- Tipografía grande, mucho aire, una idea por bloque. Se lee en un celular en la calle.
- Idioma: **español por defecto**, inglés con un selector.

**P1 — Zonas y ranking**
Arriba, 4 tarjetas de zona con su temporada crítica resumida. Abajo, la tabla de los 68 departamentos: nombre, provincia, zona, total de detecciones, semana pico, semanas del núcleo, chip de concentración. Ordenable por columna. Filtro por zona y por provincia.

**P2 — Ficha del departamento**
- Título con nombre y provincia.
- Los tres bloques: **núcleo crítico** (lista de semanas), **semana pico** (con año), **semanas anómalas** (con año).
- Una barra horizontal de 53 semanas con el núcleo marcado.
- **Una línea de recomendación operativa**, generada por regla desde los datos (no por modelo, no escrita a mano).
- Botón **Descargar CSV** del departamento (semana, detecciones, años, marca de núcleo).

**P3 — Comparar**
Dos departamentos (o dos zonas) lado a lado sobre las mismas 53 semanas. La pregunta que responde: *¿la temporada crítica de mi zona es la misma que la de la zona vecina?*

**P4 — Método**
Media página, lenguaje llano: qué datos, qué se calculó, qué no se puede afirmar, citas. Incluye la declaración de origen de datos de §9.

**Sin login. Sin base de datos. Sin panel de administración. Sin mapa en la v1.**

---

## 5. Criterios de aceptación (uno por uno, verificables)

1. `npm run build` sin errores ni warnings nuevos.
2. Las 4 rutas responden 200 en producción.
3. El ranking muestra los **68** departamentos, sin filas vacías ni nombres repetidos.
4. La suma de detecciones del ranking es igual al total del archivo de datos (test, diferencia 0).
5. Un departamento sin detecciones en un año no rompe el cálculo (test con datos sintéticos).
6. El p90 no incluye el año evaluado (test con serie artificial conocida).
7. El CSV descarga con BOM UTF-8 y `\r\n`: abre en Excel sin caracteres rotos.
8. La ficha renderiza en menos de 300 ms con los datos completos.
9. A 375 px de ancho no hay scroll horizontal.
10. Ningún texto de la UI dice "predicción", "tiempo real" ni "precisión validada".

---

## 6. Lo que NO se puede afirmar

- ❌ "predice incendios" → dice **dónde y cuándo se concentró históricamente la actividad**.
- ❌ "tiempo real" → los datos son near-real-time y la serie es histórica.
- ❌ "precisión validada" → no hay validación contra focos verificados en terreno.
- ❌ "nadie lo hizo antes" → existen GWIS, EFFIS, GFED4s.
- ❌ "los incendios aumentaron" → los escalones de 2012, 2018 y 2024 son **plataformas nuevas**. Va explicado en Método.
- ❌ Comparar años sin declarar la época satelital al lado.

---

## 7. Repositorio y commits

**Nombre:** `guardia-riesgo-departamental` · **público** · **MIT** · rama de trabajo **`feat/guardia-v1`**

```
data/raw/{provincia}/{producto}/*.csv
data/manifiesto.json
data/departamentos.geojson      (68 features con provincia + zona)
data/zonas.json
data/calendario.json            (salida del cálculo, por departamento y semana)
scripts/ingest.*                descarga y normaliza
scripts/compute.*               núcleo crítico, pico, p90, Gini
web/                            Next.js
docs/METHOD.md
docs/ORIGEN-DATOS.md
```

| Momento | Commit |
|---|---|
| Sábado 14, tarde | `chore: estructura y manifiesto` |
| Sábado 14, tarde | `feat(ingest): focos Corrientes · MODIS + VIIRS` |
| Sábado 14, noche | `feat(ingest): focos Cordoba + Entre Rios` |
| Sábado 14, noche | `feat(compute): nucleo critico, pico y p90 por departamento` |
| Domingo 15, mañana | `feat(web): ranking por zona y tabla de 68 departamentos` |
| Domingo 15, mediodía | `feat(web): ficha, comparador y export CSV` |
| Domingo 15, tarde | `docs: metodo, limites y origen de datos` |
| Domingo 15, 20:00 | **CONGELAR CÓDIGO** |

---

## 8. Entrega (para la submission)

- **Project Name:** `GUARDIA — Calendario operativo de riesgo de incendios por zona y departamento`
- **Project:** URL de Vercel (rama `feat/guardia-v1` promovida a producción)
- **Project Demonstration:** video ≤30 s grabado sobre la app funcionando
- **NASA Data:** FIRMS portal, Area API, MOD14A1, VNP14IMG
- **Space Agency Partner & Other Data:** CONAE, geoBoundaries (CC BY 4.0), INDEC/georef, Next.js
- **Use of SI:** LLMs (código y documentación), TTS (voz del video)
- **Congelar 20:00 · Submit 22:00 · Nunca después de las 23:00**

---

## 9. Declaración de origen de datos (README + ORIGEN-DATOS.md)

```
Data provenance

The public NASA FIRMS active-fire records used by this project were obtained
during the team's preparation and research phase, which the event rules permit.
All source code, the analysis method, the application and its interface were
developed during the official event window (November 14, 9:00 to November 15,
23:59, 2026). No code from any previous project of the team is reused.

Third-party inputs: NASA FIRMS MODIS C6.1 and VIIRS C2 (public), geoBoundaries
gbOpen ARG ADM2 boundaries (CC BY 4.0), INDEC/georef department names (public).
```
