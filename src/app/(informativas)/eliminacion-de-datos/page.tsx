import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eliminación de Datos | Kompralo",
  description: "Instrucciones para solicitar la eliminación de tus datos personales en Kompralo.",
};

export default function EliminacionDeDatosPage() {
  return (
    <main className="min-h-screen bg-[#FAF3EE] px-6 py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-serif text-3xl md:text-4xl text-[#4A3B35] mb-2">
          Eliminación de Datos
        </h1>
        <div className="w-16 h-[2px] bg-[#9C6B70] mb-10" />

        <section className="space-y-8 text-[#4A3B35]">
          <div>
            <p className="text-base leading-relaxed">
              Si deseas solicitar la eliminación de tus datos personales
              almacenados en Kompralo (incluyendo información asociada a tu
              cuenta, invitaciones digitales, o datos de contacto vinculados
              a través de integraciones como WhatsApp o Meta), puedes
              hacerlo siguiendo estos pasos:
            </p>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-wide text-[#9C6B70] mb-2">
              Cómo solicitar la eliminación
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-base leading-relaxed">
              <li>
                Envía un correo a{" "}
                <a
                  href="mailto:soporte@kompralo.com.mx"
                  className="underline"
                >
                  soporte@kompralo.com.mx
                </a>{" "}
                con el asunto &quot;Solicitud de eliminación de datos&quot;.
              </li>
              <li>
                Incluye el correo electrónico o número de teléfono
                asociado a tu cuenta o interacción con Kompralo.
              </li>
              <li>
                Procesaremos tu solicitud y eliminaremos los datos
                correspondientes en un plazo máximo de 30 días hábiles.
              </li>
              <li>
                Te confirmaremos por correo cuando el proceso haya
                finalizado.
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-wide text-[#9C6B70] mb-2">
              Alternativa por WhatsApp
            </h2>
            <p className="text-base leading-relaxed">
              También puedes solicitar la eliminación de tus datos
              escribiendo directamente a nuestro WhatsApp:{" "}
              <a
                href="https://wa.me/5218672453620?text=Quiero%20solicitar%20la%20eliminaci%C3%B3n%20de%20mis%20datos."
                className="underline"
              >
                867 245 3620
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-wide text-[#9C6B70] mb-2">
              Responsable
            </h2>
            <p className="text-base leading-relaxed">
              José Iván Gómez Mayorga — Soluciones Tecnológicas
              <br />
              Av. Rosa del Norte 4, Col. Infonavit El Rosario, C.P. 29049,
              Tuxtla Gutiérrez, Chiapas, México.
            </p>
          </div>
        </section>

        <p className="mt-14 text-xs text-[#9C6B70]">
          Consulta también nuestro{" "}
          <a href="/aviso-de-privacidad" className="underline">
            Aviso de Privacidad
          </a>{" "}
          completo.
        </p>
      </div>
    </main>
  );
}
