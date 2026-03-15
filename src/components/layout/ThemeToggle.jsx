import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-[30px] w-[30px] flex items-center justify-center border border-border rounded-md bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      {isDark
        ? <Sun size={13} />
        : <Moon size={13} />
      }
    </button>
  );
}
