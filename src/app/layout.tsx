import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cron Builder — Constructor de Expresiones Cron Online",
  description: "Construye expresiones cron visualmente con descripción natural y próximas ejecuciones. Sin registro, 100% en el navegador.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head><link rel="author" href="https://miguelacm.es" /></head>
      <body>
        {children}
        <footer style={{ textAlign: "center", padding: "2rem 1rem", fontSize: "0.75rem", color: "var(--color-text-muted)", borderTop: "1px solid var(--color-border)", marginTop: "3rem" }}>
          Creado por{" "}
          <a href="https://miguelacm.es" style={{ color: "var(--color-primary)" }}>Miguel Ángel Colorado Marin (MACM)</a>
          {" · "}
          <a href="https://github.com/m-a-c-m/CronBuilder" style={{ color: "var(--color-primary)" }}>GitHub</a>
        </footer>
      </body>
    </html>
  );
}
