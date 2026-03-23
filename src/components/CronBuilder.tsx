"use client";

import { useState, useMemo, useCallback } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { MdTimer } from "react-icons/md";

interface Props {
  locale?: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Fields = [string, string, string, string, string];
// index:         0       1       2       3       4
// field:       minute   hour    dom    month    dow

interface FieldDef {
  label: string;
  labelEs: string;
  min: number;
  max: number;
  chips: { value: string; label?: string }[];
}

// ─── Field definitions ────────────────────────────────────────────────────────

const FIELD_DEFS: FieldDef[] = [
  {
    label: "Minute",
    labelEs: "Minuto",
    min: 0,
    max: 59,
    chips: [
      { value: "*" },
      { value: "*/5" },
      { value: "*/15" },
      { value: "*/30" },
      { value: "0" },
    ],
  },
  {
    label: "Hour",
    labelEs: "Hora",
    min: 0,
    max: 23,
    chips: [
      { value: "*" },
      { value: "*/2" },
      { value: "0" },
      { value: "9" },
      { value: "12" },
      { value: "18" },
    ],
  },
  {
    label: "Day of month",
    labelEs: "Día del mes",
    min: 1,
    max: 31,
    chips: [
      { value: "*" },
      { value: "1" },
      { value: "15" },
      { value: "L", label: "L (last)" },
    ],
  },
  {
    label: "Month",
    labelEs: "Mes",
    min: 1,
    max: 12,
    chips: [
      { value: "*" },
      { value: "1" },
      { value: "6" },
      { value: "12" },
    ],
  },
  {
    label: "Day of week",
    labelEs: "Día semana",
    min: 0,
    max: 6,
    chips: [
      { value: "*" },
      { value: "0", label: "0 (Sun)" },
      { value: "1", label: "1 (Mon)" },
      { value: "5", label: "5 (Fri)" },
    ],
  },
];

// ─── Preset schedules ─────────────────────────────────────────────────────────

interface Preset {
  labelEs: string;
  labelEn: string;
  fields: Fields;
}

const PRESETS: Preset[] = [
  { labelEs: "Cada minuto", labelEn: "Every minute", fields: ["*", "*", "*", "*", "*"] },
  { labelEs: "Cada hora", labelEn: "Every hour", fields: ["0", "*", "*", "*", "*"] },
  { labelEs: "Diario a medianoche", labelEn: "Daily at midnight", fields: ["0", "0", "*", "*", "*"] },
  { labelEs: "Lunes a las 9:00", labelEn: "Weekly Mon 9:00", fields: ["0", "9", "*", "*", "1"] },
  { labelEs: "Mensual día 1 a las 0:00", labelEn: "Monthly 1st 0:00", fields: ["0", "0", "1", "*", "*"] },
];

// ─── parseCronField ────────────────────────────────────────────────────────────

/**
 * Parses a single cron field value.
 * Supports: *, N, N-M, *\/N, N,M,O
 * Returns sorted number array or null if invalid.
 */
function parseCronField(field: string, min: number, max: number): number[] | null {
  if (!field || field.trim() === "") return null;

  const trimmed = field.trim();

  // Special case: 'L' for last-day-of-month — treat as valid, return [max]
  if (trimmed === "L") return [max];

  // Wildcard
  if (trimmed === "*") {
    const result: number[] = [];
    for (let i = min; i <= max; i++) result.push(i);
    return result;
  }

  // */N — step
  const stepMatch = trimmed.match(/^\*\/(\d+)$/);
  if (stepMatch) {
    const step = parseInt(stepMatch[1], 10);
    if (step <= 0) return null;
    const result: number[] = [];
    for (let i = min; i <= max; i += step) result.push(i);
    return result.length > 0 ? result : null;
  }

  // N-M — range
  const rangeMatch = trimmed.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const a = parseInt(rangeMatch[1], 10);
    const b = parseInt(rangeMatch[2], 10);
    if (a > b || a < min || b > max) return null;
    const result: number[] = [];
    for (let i = a; i <= b; i++) result.push(i);
    return result;
  }

  // N,M,O — list
  if (trimmed.includes(",")) {
    const parts = trimmed.split(",");
    const result: number[] = [];
    for (const part of parts) {
      const n = parseInt(part.trim(), 10);
      if (isNaN(n) || n < min || n > max) return null;
      result.push(n);
    }
    result.sort((a, b) => a - b);
    return result;
  }

  // Single number
  const n = parseInt(trimmed, 10);
  if (isNaN(n) || n < min || n > max) return null;
  return [n];
}

// ─── describeCron ─────────────────────────────────────────────────────────────

const DOW_NAMES_ES = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const DOW_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES_ES = ["", "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MONTH_NAMES_EN = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function describeCron(fields: Fields, isEs: boolean): string {
  const [minF, hourF, domF, monthF, dowF] = fields;

  // Parse each field for introspection
  const minParsed = parseCronField(minF, 0, 59);
  const hourParsed = parseCronField(hourF, 0, 23);
  const domParsed = parseCronField(domF, 1, 31);
  const monthParsed = parseCronField(monthF, 1, 12);
  const dowParsed = parseCronField(dowF, 0, 6);

  if (!minParsed || !hourParsed || !domParsed || !monthParsed || !dowParsed) {
    return isEs ? "Expresión inválida" : "Invalid expression";
  }

  const isEveryMin = minF === "*";
  const isEveryHour = hourF === "*";
  const isEveryDom = domF === "*" || domF.trim() === "*";
  const isEveryMonth = monthF === "*";
  const isEveryDow = dowF === "*";

  // Step patterns
  const minStepMatch = minF.match(/^\*\/(\d+)$/);
  const hourStepMatch = hourF.match(/^\*\/(\d+)$/);

  // Every minute
  if (isEveryMin && isEveryHour && isEveryDom && isEveryMonth && isEveryDow) {
    return isEs ? "Cada minuto" : "Every minute";
  }

  // Every N minutes
  if (minStepMatch && isEveryHour && isEveryDom && isEveryMonth && isEveryDow) {
    const n = minStepMatch[1];
    return isEs ? `Cada ${n} minutos` : `Every ${n} minutes`;
  }

  // Every hour at minute N
  if (!isEveryMin && !minStepMatch && isEveryHour && isEveryDom && isEveryMonth && isEveryDow) {
    const m = minParsed[0];
    return isEs
      ? `Cada hora, al minuto ${m}`
      : `Every hour, at minute ${m}`;
  }

  // Every N hours
  if (minParsed.length === 1 && hourStepMatch && isEveryDom && isEveryMonth && isEveryDow) {
    const n = hourStepMatch[1];
    const m = pad2(minParsed[0]);
    return isEs ? `Cada ${n} horas, al minuto ${m}` : `Every ${n} hours, at minute ${m}`;
  }

  // Build time string when hour and minute are single values
  const hasSingleTime = minParsed.length === 1 && hourParsed.length === 1;
  const timeStr = hasSingleTime ? `${pad2(hourParsed[0])}:${pad2(minParsed[0])}` : null;

  // Daily at time
  if (hasSingleTime && isEveryDom && isEveryMonth && isEveryDow) {
    return isEs
      ? `Diariamente a las ${timeStr}`
      : `Daily at ${timeStr}`;
  }

  // Weekly — specific dow + time
  if (hasSingleTime && isEveryDom && isEveryMonth && dowParsed.length === 1) {
    const dayName = isEs
      ? DOW_NAMES_ES[dowParsed[0]] ?? dowF
      : DOW_NAMES_EN[dowParsed[0]] ?? dowF;
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    return isEs
      ? `Cada ${cap(dayName)} a las ${timeStr}`
      : `Every ${dayName} at ${timeStr}`;
  }

  // Monthly — specific dom + time
  if (hasSingleTime && domParsed.length === 1 && isEveryMonth && isEveryDow) {
    return isEs
      ? `El día ${domParsed[0]} de cada mes a las ${timeStr}`
      : `Monthly on day ${domParsed[0]} at ${timeStr}`;
  }

  // Last day of month
  if (domF.trim() === "L" && hasSingleTime && isEveryMonth && isEveryDow) {
    return isEs
      ? `El último día de cada mes a las ${timeStr}`
      : `Last day of every month at ${timeStr}`;
  }

  // Specific month
  if (hasSingleTime && isEveryDom && monthParsed.length === 1 && isEveryDow) {
    const mName = isEs ? MONTH_NAMES_ES[monthParsed[0]] : MONTH_NAMES_EN[monthParsed[0]];
    return isEs
      ? `En ${mName ?? monthF} a las ${timeStr}`
      : `In ${mName ?? monthF} at ${timeStr}`;
  }

  // Generic fallback
  const parts: string[] = [];

  if (isEveryMin) {
    parts.push(isEs ? "cada minuto" : "every minute");
  } else if (minStepMatch) {
    parts.push(isEs ? `cada ${minStepMatch[1]} min` : `every ${minStepMatch[1]} min`);
  } else if (minParsed.length === 1) {
    parts.push(isEs ? `min ${minParsed[0]}` : `min ${minParsed[0]}`);
  } else {
    parts.push(isEs ? `min [${minF}]` : `min [${minF}]`);
  }

  if (!isEveryHour) {
    if (hourParsed.length === 1) {
      parts.push(isEs ? `hora ${hourParsed[0]}` : `hour ${hourParsed[0]}`);
    } else {
      parts.push(isEs ? `hora [${hourF}]` : `hour [${hourF}]`);
    }
  }

  if (!isEveryDom) {
    parts.push(isEs ? `día ${domF}` : `day ${domF}`);
  }

  if (!isEveryMonth) {
    const mName = monthParsed.length === 1
      ? (isEs ? MONTH_NAMES_ES[monthParsed[0]] : MONTH_NAMES_EN[monthParsed[0]])
      : null;
    parts.push(mName ?? (isEs ? `mes ${monthF}` : `month ${monthF}`));
  }

  if (!isEveryDow) {
    const dName = dowParsed.length === 1
      ? (isEs ? DOW_NAMES_ES[dowParsed[0]] : DOW_NAMES_EN[dowParsed[0]])
      : null;
    parts.push(dName ?? (isEs ? `dow ${dowF}` : `dow ${dowF}`));
  }

  return parts.join(", ");
}

// ─── getNextExecutions ────────────────────────────────────────────────────────

function getNextExecutions(fields: Fields, count: number = 5): Date[] {
  const [minF, hourF, domF, monthF, dowF] = fields;

  const minParsed = parseCronField(minF, 0, 59);
  const hourParsed = parseCronField(hourF, 0, 23);
  const domParsed = parseCronField(domF, 1, 31);
  const monthParsed = parseCronField(monthF, 1, 12);
  const dowParsed = parseCronField(dowF, 0, 6);

  if (!minParsed || !hourParsed || !domParsed || !monthParsed || !dowParsed) {
    return [];
  }

  // Build sets for O(1) lookup
  const minSet = new Set(minParsed);
  const hourSet = new Set(hourParsed);
  const domSet = new Set(domParsed);
  const monthSet = new Set(monthParsed);
  const dowSet = new Set(dowParsed);

  const results: Date[] = [];
  // Start 1 minute from now (skip the current minute)
  const startMs = Date.now() + 60_000;
  // Round down to the start of the next minute
  const startMin = Math.ceil(startMs / 60_000) * 60_000;

  const MAX_ITERATIONS = 527040; // 366 days × 24 × 60

  for (let i = 0; i < MAX_ITERATIONS && results.length < count; i++) {
    const d = new Date(startMin + i * 60_000);
    const minute = d.getMinutes();
    const hour = d.getHours();
    const dom = d.getDate();
    const month = d.getMonth() + 1; // 1-12
    const dow = d.getDay(); // 0-6

    if (
      monthSet.has(month) &&
      domSet.has(dom) &&
      dowSet.has(dow) &&
      hourSet.has(hour) &&
      minSet.has(minute)
    ) {
      results.push(new Date(d));
    }
  }

  return results;
}

// ─── formatDate ───────────────────────────────────────────────────────────────

function formatDate(d: Date, isEs: boolean): string {
  try {
    const locale = isEs ? "es-ES" : "en-US";
    return d.toLocaleString(locale, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: !isEs,
    });
  } catch {
    return d.toISOString().slice(0, 16).replace("T", " ");
  }
}

// ─── Field validation error ───────────────────────────────────────────────────

function getFieldError(value: string, min: number, max: number, isEs: boolean): string {
  if (!value.trim()) return isEs ? "Campo vacío" : "Empty field";
  // L is valid for dom
  if (value.trim() === "L") return "";
  const parsed = parseCronField(value, min, max);
  if (!parsed) {
    return isEs
      ? `Valor inválido (rango ${min}–${max})`
      : `Invalid value (range ${min}–${max})`;
  }
  return "";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CronBuilder({ locale = "es" }: Props) {
  const isEs = locale === "es";

  const [fields, setFields] = useState<Fields>(["*", "*", "*", "*", "*"]);
  const [copied, setCopied] = useState(false);

  // ── Derived state ──────────────────────────────────────────────────────────

  const fieldErrors = useMemo<string[]>(() => {
    return FIELD_DEFS.map((def, i) =>
      getFieldError(fields[i], def.min, def.max, isEs)
    );
  }, [fields, isEs]);

  const hasErrors = useMemo(() => fieldErrors.some((e) => e !== ""), [fieldErrors]);

  const cronExpression = useMemo(
    () => fields.join(" "),
    [fields]
  );

  const description = useMemo(
    () => (hasErrors ? (isEs ? "Expresión inválida" : "Invalid expression") : describeCron(fields, isEs)),
    [fields, hasErrors, isEs]
  );

  const nextExecutions = useMemo<Date[]>(
    () => (hasErrors ? [] : getNextExecutions(fields, 5)),
    [fields, hasErrors]
  );

  // ── Callbacks ──────────────────────────────────────────────────────────────

  const setField = useCallback((index: number, value: string) => {
    setFields((prev) => {
      const next: Fields = [...prev] as Fields;
      next[index] = value;
      return next;
    });
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setFields([...preset.fields] as Fields);
  }, []);

  const copyExpression = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cronExpression);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [cronExpression]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MdTimer className="text-primary text-2xl" />
        <h2 className="text-xl font-bold text-white">
          {isEs ? "Constructor de Cron" : "Cron Builder"}
        </h2>
      </div>

      {/* Preset buttons */}
      <div className="bg-surface/40 border border-border/20 rounded-xl p-4 space-y-2">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">
          {isEs ? "Presets" : "Presets"}
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.labelEn}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-border/20 text-white/70 hover:bg-primary/10 hover:border-primary/30 hover:text-white transition-colors"
            >
              {isEs ? preset.labelEs : preset.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Cron fields */}
      <div className="bg-surface/40 border border-border/20 rounded-xl p-4 space-y-4">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">
          {isEs ? "Campos" : "Fields"}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {FIELD_DEFS.map((def, i) => {
            const error = fieldErrors[i];
            return (
              <div key={def.label} className="space-y-2">
                <label className="block text-xs font-semibold text-white/70">
                  {isEs ? def.labelEs : def.label}
                  <span className="block text-white/30 font-normal">
                    {def.min}–{def.max}
                  </span>
                </label>
                <input
                  type="text"
                  value={fields[i]}
                  onChange={(e) => setField(i, e.target.value)}
                  spellCheck={false}
                  className={[
                    "w-full bg-white/5 border rounded-lg px-2 py-1.5 font-mono text-sm text-white",
                    "focus:outline-none focus:ring-2 transition-colors text-center",
                    error
                      ? "border-red-500/60 focus:ring-red-500/30"
                      : "border-border/20 focus:ring-primary/30",
                  ].join(" ")}
                />
                {error && (
                  <p className="text-xs text-red-400 leading-tight">{error}</p>
                )}
                {/* Quick chips */}
                <div className="flex flex-wrap gap-1">
                  {def.chips.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setField(i, value)}
                      className={[
                        "px-1.5 py-0.5 rounded text-xs font-mono border transition-colors",
                        fields[i] === value
                          ? "bg-primary/20 border-primary/50 text-primary"
                          : "bg-white/5 border-border/10 text-white/50 hover:text-white/80 hover:border-border/30",
                      ].join(" ")}
                    >
                      {label ?? value}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expression display */}
      <div className="bg-surface/40 border border-border/20 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">
          {isEs ? "Expresión cron" : "Cron expression"}
        </p>
        <div className="flex items-center gap-3">
          <code
            className={[
              "flex-1 bg-black/30 border rounded-lg px-4 py-2.5 font-mono text-lg tracking-widest",
              hasErrors ? "text-red-400 border-red-500/30" : "text-primary border-border/20",
            ].join(" ")}
          >
            {cronExpression}
          </code>
          <button
            onClick={copyExpression}
            title={isEs ? "Copiar" : "Copy"}
            className="p-2.5 rounded-lg border border-border/20 text-white/60 hover:text-white hover:border-border/50 transition-colors shrink-0"
          >
            {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
          </button>
        </div>

        {/* Natural language description */}
        <div className="flex items-start gap-2">
          <span className="text-xs text-white/40 pt-0.5 shrink-0">
            {isEs ? "Descripción:" : "Description:"}
          </span>
          <span
            className={`text-sm font-medium ${
              hasErrors ? "text-red-400" : "text-white/90"
            }`}
          >
            {description}
          </span>
        </div>
      </div>

      {/* Next executions */}
      {!hasErrors && nextExecutions.length > 0 && (
        <div className="bg-surface/40 border border-border/20 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-white/60 uppercase tracking-wide">
            {isEs ? "Próximas ejecuciones" : "Next executions"}
          </p>
          <ol className="space-y-1.5">
            {nextExecutions.map((d, i) => (
              <li
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-border/10"
              >
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="font-mono text-sm text-white/80">
                  {formatDate(d, isEs)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {!hasErrors && nextExecutions.length === 0 && !fields.every((f) => f === "*") && (
        <div className="text-center py-6 text-white/40">
          <MdTimer className="mx-auto text-3xl mb-2 opacity-40" />
          <p className="text-sm">
            {isEs
              ? "No se encontraron ejecuciones en el próximo año."
              : "No executions found within the next year."}
          </p>
        </div>
      )}
    </div>
  );
}
