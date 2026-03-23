import CronBuilder from "../../components/CronBuilder";

const card = {
  background: "var(--color-surface)",
  borderRadius: "1rem",
  border: "1px solid var(--color-border)",
  padding: "1.5rem",
  marginBottom: "2rem",
};

const section = { marginBottom: "2rem" };
const h2 = { fontSize: "1.25rem", fontWeight: "bold" as const, color: "var(--color-text)", marginBottom: "1rem" };
const muted = { color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: "1.6" };
const li = { color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: "1.8" };

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", padding: "2rem 1rem", maxWidth: "900px", margin: "0 auto" }}>
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--color-text)", marginBottom: "0.5rem" }}>
          Cron Builder
        </h1>
        <p style={muted}>
          Construye expresiones cron visualmente con descripción en lenguaje natural y cálculo de próximas ejecuciones.
        </p>
      </header>

      <div style={card}>
        <CronBuilder />
      </div>

      <div style={card}>
        <div style={section}>
          <h2 style={h2}>Cómo usar / How to use</h2>
          <ol style={{ paddingLeft: "1.5rem" }}>
            <li style={li}><strong>Configura cada campo</strong> — Introduce valores para minuto, hora, día del mes, mes y día de la semana. Usa * para cualquier valor.</li>
            <li style={li}><strong>Usa los presets rápidos</strong> — Botones bajo cada campo con valores comunes: */5, */15, 0, etc.</li>
            <li style={li}><strong>Lee la descripción</strong> — La herramienta genera automáticamente una descripción en lenguaje natural de la expresión.</li>
            <li style={li}><strong>Comprueba las próximas ejecuciones</strong> — Verás las próximas 5 fechas y horas exactas de ejecución.</li>
          </ol>
        </div>

        <div style={section}>
          <h2 style={h2}>FAQ</h2>
          <p style={{ ...muted, fontWeight: "bold", marginBottom: "0.25rem" }}>¿Qué es una expresión cron?</p>
          <p style={{ ...muted, marginBottom: "1rem" }}>Una cadena de 5 campos separados por espacios que define cuándo ejecutar una tarea: minuto (0-59), hora (0-23), día del mes (1-31), mes (1-12) y día de la semana (0-6, 0=domingo).</p>

          <p style={{ ...muted, fontWeight: "bold", marginBottom: "0.25rem" }}>¿Qué significa el asterisco (*)?</p>
          <p style={{ ...muted, marginBottom: "1rem" }}>Significa "cualquier valor". Por ejemplo, * * * * * ejecuta cada minuto. 0 * * * * ejecuta al inicio de cada hora.</p>

          <p style={{ ...muted, fontWeight: "bold", marginBottom: "0.25rem" }}>¿Cómo especifico cada 15 minutos?</p>
          <p style={{ ...muted, marginBottom: "1rem" }}>Usa la notación */N. Por ejemplo, */15 en el campo minuto significa "cada 15 minutos". Es equivalente a 0,15,30,45.</p>

          <p style={{ ...muted, fontWeight: "bold", marginBottom: "0.25rem" }}>¿Puedo especificar varios valores?</p>
          <p style={{ ...muted, marginBottom: "1rem" }}>Sí. Usa comas para listar valores (1,15,30) y guiones para rangos (1-5). También puedes combinar: 1-5,10,15.</p>

          <p style={{ ...muted, fontWeight: "bold", marginBottom: "0.25rem" }}>¿Funciona sin conexión?</p>
          <p style={muted}>Sí. Todo el cálculo ocurre íntegramente en tu navegador con JavaScript puro. No se envía ningún dato a ningún servidor.</p>
        </div>

        <div>
          <h2 style={h2}>📦 Embed on your website</h2>
          <pre style={{ background: "#0a0a0f", borderRadius: "0.5rem", padding: "1rem", fontSize: "0.75rem", color: "var(--color-text-muted)", overflowX: "auto" }}>
{`<iframe
  src="https://miguelacm.es/embed/cron-builder"
  width="100%"
  height="700"
  style="border:none;border-radius:12px;"
  title="Cron Builder — miguelacm.es"
  loading="lazy"
></iframe>`}
          </pre>
        </div>
      </div>
    </main>
  );
}
