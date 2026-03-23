# ⏱ Constructor de Expresiones Cron Online Gratis

**Free Cron Expression Builder.** Build cron expressions visually with 5 labelled fields, instant natural language description (ES + EN), and calculation of the next 5 exact execution dates by iterating minute-by-minute from now. Supports *, N, N-M, */N, N,M,O and L syntax. No sign-up, no ads, 100% client-side.

🌐 **Demo en vivo / Live demo:** [miguelacm.es/tools/cron-builder](https://miguelacm.es/tools/cron-builder)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ✨ Features

- **5 campos visuales / 5 visual fields:** Minute, hour, day-of-month, month, day-of-week with labelled inputs
- **Presets por campo / Per-field presets:** Quick chip buttons with the most common values (*/5, */15, 0, L, Sun/Mon/Fri…)
- **Lenguaje natural / Natural language:** Auto-generated bilingual description ("Every 15 minutes", "A las 09:00 los lunes"…)
- **Próximas ejecuciones / Next executions:** Next 5 dates calculated by iterating up to 527 040 minutes from now
- **Sintaxis completa / Full syntax:** *, N, N-M, */N, N,M,O and L (last day of month) all supported
- **Validación / Validation:** Per-field inline error messages in red when a value is invalid
- **5 presets globales / 5 global presets:** Every minute, every hour, daily midnight, weekly Mon 9:00, monthly 1st
- **Copiar expresión / Copy expression:** Copy the full cron string to clipboard with one click
- **Sin servidor / Zero server:** All calculation happens in the browser — nothing sent to a server
- **Embebible / Embeddable:** Use it as an iframe on any website
- **Open source:** MIT license, use it freely

---

## 🚀 Quick start

```bash
git clone https://github.com/m-a-c-m/CronBuilder.git
cd CronBuilder
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables (optional)

```env
NEXT_PUBLIC_SITE_URL=https://miguelacm.es/tools/cron-builder
NEXT_PUBLIC_EMBED_URL=https://miguelacm.es/embed/cron-builder
```

---

## 📦 Embed on your website

### Iframe (plug & play)

```html
<iframe
  src="https://miguelacm.es/embed/cron-builder"
  width="100%"
  height="700"
  style="border:none;border-radius:12px;"
  title="Cron Builder — miguelacm.es"
  loading="lazy"
></iframe>
```

### Link with attribution (recommended for backlink)

```html
<a href="https://miguelacm.es/tools/cron-builder" target="_blank" rel="noopener">
  Constructor de cron gratis por MACM
</a>
```

> 💡 The link option generates a real backlink that benefits the project. Recommended if your platform supports custom HTML.

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [Next.js](https://nextjs.org) | 15 | React framework + SSG |
| [TypeScript](https://www.typescriptlang.org) | 5 | Type safety |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Styling |
| [react-icons](https://react-icons.github.io/react-icons/) | 5 | Icons |

---

## 📄 License

MIT © [Miguel Ángel Colorado Marin (MACM)](https://miguelacm.es)

Built with ❤️ by **[MACM](https://miguelacm.es)** — Full Stack Developer & Cybersecurity Specialist from Guadalajara, Spain.

- 🌐 Portfolio: [miguelacm.es](https://miguelacm.es)
- 💼 LinkedIn: [linkedin.com/in/macm](https://www.linkedin.com/in/macm/)
- 🐙 GitHub: [github.com/m-a-c-m](https://github.com/m-a-c-m)
