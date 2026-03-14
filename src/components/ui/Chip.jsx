const LEVEL_STYLES = {
  critical: "bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900",
  high:     "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-900",
  medium:   "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900",
  low:      "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900",
  good:     "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900",
  warning:  "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
  "needs-update": "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-900",
};

export function Chip({ label, level = "medium" }) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES.medium;
  return (
    <span className={`inline-flex items-center border rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style}`}>
      {label}
    </span>
  );
}
