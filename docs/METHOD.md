# Método y Fundamento Científico — GUARDIA

**GUARDIA** es una herramienta analítica y operativa diseñada para la toma de decisiones en combate, prevención y gestión de incendios de vegetación en tres provincias argentinas con regímenes de fuego marcadamente dispares: **Corrientes** (humedales y pastizales), **Córdoba** (sierras e interfaz urbano-forestal) y **Entre Ríos** (delta del Paraná y quemas agrícolas).

---

## 1. Declaración de Origen de los Datos (Data Provenance)

> *The public NASA FIRMS active-fire records used by this project were obtained during the team's preparation and research phase, which the event rules permit. All source code, the analysis method, the application and its interface were developed during the official event window (November 14, 9:00 to November 15, 23:59, 2026). No code from any previous project of the team is reused.*
> 
> *Third-party inputs: NASA FIRMS MODIS C6.1 and VIIRS C2 (public), geoBoundaries gbOpen ARG ADM2 boundaries (CC BY 4.0), INDEC/georef department names (public).*

---

## 2. Insumos y Preprocesamiento

1. **NASA FIRMS**:
   - **MODIS C6.1** (satélites Terra y Aqua, resolución 1 km).
   - **VIIRS C2 375 m** (satélites NOAA-20 y NOAA-21).
   - *Exclusión justificada:* Suomi-NPP cesó transmisiones el 2 de noviembre de 2026 a las 13:00 UTC (alerta oficial NASA Earthdata).
   - Filtros de confianza operacional: MODIS $\ge 30$; VIIRS categórico `nominal` y `high`.
2. **Límites Jurisdiccionales**:
   - `geoBoundaries gbOpen ARG ADM2` (525 polígonos a nivel departamental).
   - Validación cruzada contra la API de Georef INDEC para asegurar nombres oficiales y centroides a distancia $\le 0,2^\circ$.

---

## 3. Formulación Matemática y Rigor Analítico

Para cada uno de los 68 departamentos analizados ($d$), a lo largo de las 53 semanas ISO del año ($w \in [1, 53]$) y la serie histórica de años disponibles ($y$):

### 3.1 Asignación Espacial
Cada foco activo $(lat, lon)$ se asigna mediante evaluación exacta de **Point-in-Polygon** contra los polígonos departamentales oficiales.

### 3.2 Núcleo Crítico (80% Acumulado)
Las 53 semanas se ordenan de mayor a menor según su acumulación histórica de detecciones $\sum_y \text{focos}(d, w, y)$. Se seleccionan las semanas requeridas para alcanzar el **80% del total departamental**.

> **Justificación operativa:** Ningún sistema provincial de bomberos o defensa civil puede mantener guardias activas reforzadas las 52 semanas del año. Si un departamento concentra el 80% en 6 semanas, la logística y prohibición de quemas debe concentrarse quirúrgicamente en esa ventana. Si requiere 25 semanas, el régimen es disperso y exige planes preventivos estructurales.

### 3.3 Detección de Anomalías (Invariante del P90)
Una semana $(w, y)$ se etiqueta como **anómala** si:
$$\text{focos}(d, w, y) > \text{Percentil}_{90}\left(\{ \text{focos}(d, w, y') \mid y' < y \}\right)$$
- **Regla de estricto rigor temporal:** El P90 se calcula **únicamente con años estrictamente anteriores** al evaluado. Nunca se incluye el propio año ni años futuros.
- **Condición de muestra mínima:** Se exige un mínimo de 5 años previos con datos consolidados para emitir una marca anómala.

### 3.4 Índice de Concentración de Gini
Calculado sobre el vector de 53 semanas acumuladas:
- **Crítico ($\ge 0,75$):** Ventana hiper-reducida (4–6 semanas).
- **Alto ($0,60 - 0,75$):** Temporada definida (8–12 semanas).
- **Medio ($0,45 - 0,60$):** Varios picos, programas mixtos.
- **Bajo ($< 0,45$):** Actividad continua a lo largo del año.

---

## 4. Qué NO se puede afirmar (Límites Metodológicos)

- **No predice incendios:** Describe la estacionalidad y concentración histórica observada.
- **No es tiempo real:** Las detecciones satelitales son near-real-time y la aplicación evalúa ciclos históricos consolidados.
- **No es superficie quemada ni precisión validada en campo:** El satélite registra anomalías térmicas instantáneas al momento del sobrepaso orbital; no mide hectáreas quemadas ni cuenta con calibración terrestre.
- **Los saltos entre épocas satelitales no son más incendios:** En la serie hay exactamente dos épocas instrumentales: **antes de abril de 2018** (solo MODIS Terra/Aqua, 1 km) y **desde abril de 2018** (MODIS + VIIRS NOAA-20/21 a 375 m, con Suomi-NPP excluido). El escalón a partir de 2018 refleja la incorporación de VIIRS.

---

## 5. Referencias Científicas

1. **Giglio, L., Schroeder, W., Justice, C. O. (2016).** *The Collection 6 MODIS active fire detection algorithm and fire products.* Remote Sensing of Environment, 178, 31-41.
2. **Schroeder, W., Oliva, P., Giglio, L., Csiszar, I. A. (2014).** *The New VIIRS 375 m active fire detection data product.* Remote Sensing of Environment, 143, 85-96.
3. **Gumbricht, T. et al. (2017).** *An expert system model for mapping tropical wetlands.*
4. **Nogueira, J. M. P. et al. (2017).** *Seasonal drought and fire in South American wetlands.*
5. **De la Barrera, F. et al. (2018).** *Wildland-urban interface fires in central Argentina.*
6. **García Ferreyra, M. F. et al. (2019).** *Fire and air quality in the Southern Cone.*
7. **Magi, B. I. et al. (2012).** *Separating agricultural and non-agricultural fire seasonality.*
8. **Chen, Y. et al. (2023).** *GFED framework for fire seasonality.*
