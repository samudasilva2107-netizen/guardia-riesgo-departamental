# RESEARCH — Methodological decisions and their sources

**GUARDIA — Operational fire-risk calendar by department**
NASA Space Apps Challenge 2026 · Local Event Bahía Blanca, Argentina

This document records **why** the product computes what it computes. Each methodological
decision appears with its rationale, the evidence that supports it, the file where it is
implemented, and the limitation it accepts. It exists so that any reader — a judge, a civil-defence
officer, another team — can audit the reasoning without reading the code first.

*Documento en inglés a propósito: su función es que un jurado internacional pueda auditar el
método. La aplicación está disponible en español y en inglés.*

---

## D1 — The unit of analysis is the department, not the province

**Decision.** Every metric is computed for each of the 68 departments of Corrientes, Córdoba and
Entre Ríos, never for a province as a whole.

**Why.** A provincial average mixes fire regimes that do not share a season. Corrientes contains
both wetland and agricultural departments; Córdoba mixes mountain interfaces with plain cropland.
An average over such a province produces a number that describes no place in particular, and a
civil-defence office cannot act on it. The department is also the administrative unit that owns the
brigades, the burn-ban enforcement and the patrol schedule.

**Implemented in.** `scripts/compute.py` (aggregation keyed by department polygon).
**Limit accepted.** Departments are large: internal variation is lost. The tool answers at
municipal scale, not at farm scale.

---

## D2 — Time is aggregated by ISO week

**Decision.** Detections are counted per ISO week (1–53), not per month or per day.

**Why.** Daily series are too noisy to support a staffing decision, and months are too coarse: the
Sierras season concentrates in September and October and ends abruptly with the first convective
storms of November, which a monthly average smears. The week is the resolution at which a brigade
roster can actually be planned.

**Implemented in.** `scripts/compute.py`.
**Limit accepted.** ISO weeks do not align with calendar months, so a week can straddle two months.
The interface labels weeks with an approximate month, and says so.

---

## D3 — The critical core is the set of weeks that accumulate 80 % of the record

**Decision.** For each department, the 53 weeks are ranked by accumulated detections and the
smallest set that reaches 80 % of the department total is the *critical core*.

**Why.** No fire service can sustain maximum alert for twelve months, nor keep aerial means
deployed over an entire territory. The operational question is not "when is there risk" but "in
which compact window does the overwhelming majority of the damage historically happen". A
department that reaches 80 % in eight weeks can concentrate maintenance, patrols and burn bans in
that window. A department that needs thirty-five weeks has no single window and requires a
structural, year-round posture. In our data that difference is real: the Sierras reach the threshold
in 5 to 15 weeks, the Iberá departments need 23 to 33.

**Implemented in.** `scripts/compute.py`; the operational directive is generated from
`semanas_nucleo.length` in the department view.
**Limit accepted.** The 80 % threshold is a management choice, not a physical constant. It is
declared in the Method page so the reader can judge it.

---

## D4 — Anomalies use the 90th percentile of *previous* years only

**Decision.** A week of year *y* is flagged anomalous if its value exceeds the 90th percentile of
the same week computed only from years prior to *y*. The year being evaluated never enters its own
reference. With fewer than five prior years, no flag is raised.

**Why.** Including the evaluated year in its own threshold dilutes exactly the extremes the metric
is meant to detect: a record-breaking season raises its own percentile and can stop looking
exceptional. The five-year minimum prevents unstable percentiles from short series.

**Implemented in.** `scripts/compute.py`; covered by synthetic tests in `scripts/test_criterios.py`.
**Limit accepted.** With 26 years of record the earliest computable anomalies start around 2005.

---

## D5 — Concentration is measured with a Gini coefficient over the 53 weekly totals

**Decision.** Each department receives a Gini coefficient of its 53 weekly accumulated totals,
shown as four bands: ≥ 0.75 critical, 0.60–0.75 high, 0.45–0.60 medium, below 0.45 low.

**Why.** The critical core answers *when*; the Gini answers *how concentrated*. Two departments can
reach 80 % in ten weeks with very different shapes — one with a single dominant spike, one spread
across a broad plateau — and those require different logistics. Gini is a standard inequality
measure over a distribution and applies directly to weekly totals ordered by volume.

**Honest note.** **The four band boundaries are our own operational mapping**, not a standard in
the fire literature. They were chosen so that each band corresponds to a recognisable planning
behaviour (massive concentrated mobilisation / classic season / mixed programme / permanent
management). We state this explicitly rather than attributing the thresholds to a source that does
not define them.

**Implemented in.** `scripts/compute.py`; bands and colours in `web/src/components/ChoroplethMap.tsx`.

---

## D6 — The expected season is drawn from the literature, as a reference band

**Decision.** Each of the four operational zones carries a reference range of weeks, drawn as a
band behind the observed data. It is labelled as literature, never as an output of the model.

**Why.** A calendar that only shows observed data cannot reveal that a territory behaves
differently from what its biome predicts. Drawing the expectation makes the divergence visible: in
the Iberá departments the typical week falls in February, outside the August–September band the
literature describes for the wetlands, because the extreme drought regime dominates the accumulated
record. Without the band, that fact is invisible; with it, it is the most striking thing on screen.

The zones and their expected seasons:

| Zone | Expected season | Peak | Source |
|---|---|---|---|
| Iberá wetlands (Corrientes) | July–November, with an extreme summer mode under severe drought | August–September; January–February in drought years | Gumbricht et al. (2017) on South American wetland extent and seasonality |
| Paraná Delta (Entre Ríos) | July–November | August–September | Same wetland literature; delta hydrology |
| Sierras and WUI (Córdoba) | August–November, interrupted by the first spring storms | September–October | De la Barrera et al. (2017); García Ferreyra et al. (2019) |
| Agriculture and stubble (Entre Ríos, east Córdoba) | Bimodal: post-harvest and pre-sowing pulses | June–August (winter cereal stubble); December–February (summer crop residue) | Magi et al. (2012) |

**Implemented in.** `data/zonas.json` (`temporada_ref`, `pico_ref`) and the weekly bar chart.
**Limit accepted.** The bands are regional generalisations; a specific department may legitimately
depart from them. That is the point of showing them.

---

## D7 — Two satellite eras, declared

**Decision.** Years before April 2018 are labelled MODIS only; from April 2018 onwards they are
labelled MODIS + VIIRS.

**Why.** The FIRMS archive used here provides MODIS Collection 6.1 from November 2000 and VIIRS
Collection 2 from April 2018 (NOAA-20; NOAA-21 later). Suomi-NPP was excluded because its
distribution ceased on 2026-11-02. VIIRS detects at 375 m and MODIS at 1 km, so the number of
detections is not comparable across the boundary: a step in the series is an instrument change
before it is any change in fire activity. Declaring the era next to every year is the only honest
way to let a reader compare.

**Implemented in.** `docs/METHOD.md`, the Method page and the per-year labels.
**Source.** Giglio et al. (2016) for the MODIS C6 algorithm and FRP retrieval; Schroeder et al.
(2014) for the VIIRS 375 m product and its saturation behaviour.

---

## What we deliberately did **not** implement

**The Fire Weather Index (FWI) and the GWIS/EFFIS danger classes.** They are the international
standard for fire danger, but they are meteorological: they require daily temperature, relative
humidity, wind and precipitation to model fuel moisture. GUARDIA is built on satellite detections
alone. Implementing FWI without weather inputs would have produced a number with the appearance of
rigour and no physical meaning, so we cite it as context and leave it out.

We also do not estimate burned area, do not produce fire perimeters, and do not claim predictive
skill. The product describes the historical concentration of detected thermal anomalies; it does
not forecast.

---

## Verified sources

| Source | Used for | Status |
|---|---|---|
| Giglio, Schroeder & Justice (2016). The Collection 6 MODIS active fire detection algorithm and fire products. *RSE* 178:31–41. doi:10.1016/j.rse.2016.02.054 | MODIS product behaviour, FRP retrieval | Verified |
| Schroeder et al. (2014). The New VIIRS 375 m active fire detection data product. *RSE* 143:85–96. doi:10.1016/j.rse.2013.12.008 | VIIRS product behaviour, pixel saturation | Verified |
| De la Barrera et al. (2017). Assessing wildfire exposure in the Wildland-Urban Interface area of the mountains of central Argentina. *J. Environ. Manage.* doi:10.1016/j.jenvman.2017.03.058 | Sierras / WUI seasonality and exposure | Verified |
| García Ferreyra et al. (2019). Monitoring air pollution from wildfires using ground data, satellite products and modelling. *IGARSS 2019*. doi:10.1109/igarss.2019.8898023 | Fire occurrence and smoke in the Southern Cone | Verified |
| Magi et al. (2012). Separating agricultural and non-agricultural fire seasonality at regional scales. *Biogeosciences* 9:3003–3012 | Bimodal agricultural burning seasonality | Verified |
| Gumbricht et al. (2017). An expert system model for mapping tropical wetlands and peatlands reveals South America as the largest contributor. *Global Change Biology* | Wetland extent and seasonal behaviour of the Iberá and Delta | Verified |

**A source we discarded.** An earlier research pass cited *Nogueira et al. (2017)* for seasonal
drought and fire in South American wetlands. We could not locate or verify that reference, so it
was removed from this document and from the project. We note it rather than hide it: the citation
audit is part of the method.

---

## Use of Super Intelligence in this document

This research synthesis — the structure of decisions, the literature search and the drafting — was
produced with the assistance of Super Intelligence tools, as declared in the README and in the
project submission. Every citation above was checked against its DOI or publisher page before being
included, and one was discarded because it could not be verified. No numeric result in this
document or in the application is generated by a model: all figures come from `scripts/compute.py`
running over NASA FIRMS data.
