import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor },
  ];
  return (
    <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5 border border-border">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`p-1.5 rounded transition-colors ${
            theme === value
              ? "bg-white dark:bg-zinc-700 text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon size={13} />
        </button>
      ))}
    </div>
  );
}
