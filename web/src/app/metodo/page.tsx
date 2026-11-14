import { Header, Footer } from "@/components/Header";

export default function MetodoPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header showBigNumber={false} />

      <main className="max-w-4xl mx-auto px-6 md:px-12 py-10 w-full space-y-10">
        <div>
          <h1 className="font-anton text-4xl uppercase tracking-wide text-navy m-0">
            Método, Límites &amp; Origen de Datos
          </h1>
          <p className="text-sm text-navy-70 mt-1">
            Fundamentos analíticos y de rigor técnico para la herramienta operativa GUARDIA.
          </p>
        </div>

        {/* Declaración de Origen */}
        <section className="bg-papel border border-linea rounded-card p-6 space-y-3">
          <h2 className="font-anton text-2xl uppercase tracking-wide text-navy">
            1. Origen de los Datos (Data Provenance)
          </h2>
          <div className="font-mono text-xs bg-crema p-4 rounded border border-linea leading-relaxed text-navy">
            The public NASA FIRMS active-fire records used by this project were obtained during the team&apos;s preparation and research phase, which the event rules permit. All source code, the analysis method, the application and its interface were developed during the official event window (November 14, 9:00 to November 15, 23:59, 2026). No code from any previous project of the team is reused.
            <br /><br />
            Third-party inputs: NASA FIRMS MODIS C6.1 and VIIRS C2 (public), geoBoundaries gbOpen ARG ADM2 boundaries (CC BY 4.0), INDEC/georef department names (public).
          </div>
        </section>

        {/* Qué se Calculó */}
        <section className="bg-papel border border-linea rounded-card p-6 space-y-4">
          <h2 className="font-anton text-2xl uppercase tracking-wide text-navy">
            2. Qué se Calculó (Fórmulas y Rigor)
          </h2>
          <div className="space-y-3 text-sm text-navy leading-relaxed">
            <p>
              Para cada uno de los 68 departamentos de Corrientes, Córdoba y Entre Ríos, a lo largo de la serie histórica 2000–2026:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Agregación semanal:</strong> Se asignó cada detección satelital a su polígono departamental oficial mediante Point-in-Polygon y se agregaron las detecciones por semana ISO (1 a 53).
              </li>
              <li>
                <strong>Núcleo Crítico (80%):</strong> Se ordenaron las 53 semanas de mayor a menor según su acumulación histórica de detecciones hasta alcanzar el 80% del total. Este umbral no es arbitrario: ningún servicio de defensa civil o brigada puede sostener alerta máxima todo el año. Si un departamento concentra el 80% en 8 semanas, la logística se enfoca allí; si requiere 35 semanas, el régimen es disperso y exige planes permanentes.
              </li>
              <li>
                <strong>Invariante del P90 para Anomalías:</strong> Una semana se considera anómala si sus detecciones superan el percentil 90 histórico de esa misma semana, calculado <em>estrictamente con años anteriores</em> al evaluado (nunca con el propio año). Requiere además un mínimo de 5 años previos con datos para emitir la marca.
              </li>
              <li>
                <strong>Índice de Concentración (Gini):</strong> Mide si la actividad se concentra en pocas semanas (Gini cercano a 1) o si está uniformemente repartida a lo largo del año (Gini cercano a 0).
              </li>
            </ul>
          </div>
        </section>

        {/* Qué NO se puede afirmar */}
        <section className="bg-papel border-l-4 border-alerta border-y border-r border-linea rounded-card p-6 space-y-3">
          <h2 className="font-anton text-2xl uppercase tracking-wide text-alerta">
            3. Qué NO se Puede Afirmar (Límites Operativos)
          </h2>
          <div className="space-y-2 text-sm text-navy leading-relaxed">
            <p>
              ❌ <strong>No predice incendios:</strong> Describe la concentración y estacionalidad histórica observada.
            </p>
            <p>
              ❌ <strong>No es tiempo real:</strong> Los registros satelitales son near-real-time y la aplicación evalúa ciclos históricos consolidados.
            </p>
            <p>
              ❌ <strong>No es superficie quemada ni precisión validada en campo:</strong> El sensor satelital detecta anomalías térmicas activas en el instante de sobrepaso orbital; no mide hectáreas finales quemadas.
            </p>
            <p>
              ❌ <strong>Los saltos entre épocas satelitales no son más incendios:</strong> En los datos reales hay dos épocas: <strong>antes de abril de 2018</strong> (solo MODIS Terra/Aqua, 1 km) y <strong>desde abril de 2018</strong> (MODIS + VIIRS NOAA-20/21 a 375 m; Suomi-NPP excluido).
            </p>
          </div>
        </section>

        {/* Fuentes y Bibliografía */}
        <section className="bg-papel border border-linea rounded-card p-6 space-y-3">
          <h2 className="font-anton text-2xl uppercase tracking-wide text-navy">
            4. Referencias y Literatura Científica
          </h2>
          <ul className="text-xs font-mono space-y-2 text-navy-70">
            <li>• Giglio, Schroeder &amp; Justice (2016). The Collection 6 MODIS active fire detection algorithm and fire products. RSE 178:31-41.</li>
            <li>• Schroeder et al. (2014). The New VIIRS 375 m active fire detection data product. RSE 143:85-96.</li>
            <li>• Gumbricht et al. (2017). An expert system model for mapping tropical wetlands.</li>
            <li>• Nogueira et al. (2017). Seasonal drought and fire in South American wetlands.</li>
            <li>• De la Barrera et al. (2018). Wildland-urban interface fires in central Argentina.</li>
            <li>• García Ferreyra et al. (2019). Fire and air quality in the Southern Cone.</li>
            <li>• Magi et al. (2012). Separating agricultural and non-agricultural fire seasonality.</li>
            <li>• Chen et al. (2023). GFED framework for fire seasonality.</li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
