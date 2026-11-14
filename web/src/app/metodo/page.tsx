"use client";

import { Header, Footer } from "@/components/Header";
import { useLanguage } from "@/components/LanguageProvider";

export default function MetodoPage() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Header showBigNumber={false} />

      <main className="max-w-4xl mx-auto px-6 md:px-12 py-10 w-full space-y-10">
        <div>
          <h1 className="font-anton text-4xl uppercase tracking-wide text-navy m-0">
            {t("met.title")}
          </h1>
          <p className="text-sm text-navy-70 mt-1">
            {t("met.sub")}
          </p>
        </div>

        {/* Declaración de Origen */}
        <section className="bg-papel border border-linea rounded-card p-6 space-y-3">
          <h2 className="font-anton text-2xl uppercase tracking-wide text-navy">
            {t("met.h1")}
          </h2>
          <div className="font-mono text-xs bg-crema p-4 rounded border border-linea leading-relaxed text-navy">
            The public NASA FIRMS active-fire records used by this project were obtained during the team&apos;s preparation and research phase, which the event rules permit. All source code, the analysis method, the application and its interface were developed during the official event window (November 14, 9:00 to November 15, 23:59, 2026). No code from any previous project of the team is reused.
            <br /><br />
            Third-party inputs: NASA FIRMS MODIS C6.1 and VIIRS C2 (public), geoBoundaries gbOpen ARG ADM2 boundaries (CC BY 4.0), INDEC/georef department names (public).
          </div>
          <div className="text-xs font-mono text-navy pt-1">
            {t("footer.source")}{" "}
            <a
              href="https://github.com/samudasilva2107-netizen/guardia-riesgo-departamental"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-1 underline-offset-2 hover:text-mostaza"
            >
              https://github.com/samudasilva2107-netizen/guardia-riesgo-departamental
            </a>
          </div>
        </section>

        {/* Qué se Calculó */}
        <section className="bg-papel border border-linea rounded-card p-6 space-y-4">
          <h2 className="font-anton text-2xl uppercase tracking-wide text-navy">
            {t("met.h2")}
          </h2>
          <div className="space-y-3 text-sm text-navy leading-relaxed">
            <p>{t("met.h2.intro")}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>{t("met.espacial.title")}</strong> {t("met.espacial.body")}
              </li>
              <li>
                <strong>{t("met.nucleo.title")}</strong> {t("met.nucleo.body")}
              </li>
              <li>
                <strong>{t("met.tipica.title")}</strong> {t("met.tipica.body")}
              </li>
              <li>
                <strong>{t("met.p90.title")}</strong> {t("met.p90.body")}
              </li>
              <li>
                <strong>{t("met.gini.title")}</strong> {t("met.gini.body")}
              </li>
              <li>
                <strong>{t("met.epocas.title")}</strong> {t("met.epocas.body")}
              </li>
            </ul>
          </div>
        </section>

        {/* Límites del Producto */}
        <section className="bg-papel border-l-4 border-alerta border-y border-r border-linea rounded-card p-6 space-y-3">
          <h2 className="font-anton text-2xl uppercase tracking-wide text-alerta">
            {t("met.h3")}
          </h2>
          <p className="text-sm text-navy leading-relaxed">
            <strong className="font-mono text-alerta mr-1.5">{t("met.limites.no")}</strong>
            {t("met.limites")}
          </p>
        </section>

        {/* Fuentes y Bibliografía */}
        <section className="bg-papel border border-linea rounded-card p-6 space-y-3">
          <h2 className="font-anton text-2xl uppercase tracking-wide text-navy">
            {t("met.h4")}
          </h2>
          <ul className="text-xs font-mono space-y-2 text-navy-70">
            <li>• Giglio, Schroeder &amp; Justice (2016). The Collection 6 MODIS active fire detection algorithm and fire products. RSE 178:31-41.</li>
            <li>• Schroeder et al. (2014). The New VIIRS 375 m active fire detection data product. RSE 143:85-96.</li>
            <li>• De la Barrera et al. (2017). Wildland-urban interface fires in central Argentina.</li>
            <li>• Magi et al. (2012). Separating agricultural and non-agricultural fire seasonality.</li>
            <li>• Gumbricht et al. (2017). An expert system model for mapping tropical wetlands.</li>
            <li>• NASA FIRMS (MODIS C6.1 &amp; VIIRS C2) · geoBoundaries gbOpen ARG ADM2 (CC BY 4.0) · INDEC/georef.</li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
