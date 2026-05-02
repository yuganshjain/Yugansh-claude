"use client";
import { useTheme } from "./ThemeProvider";

const themes = [
  {
    id: "white" as const,
    label: "Light",
    icon: "☀️",
    preview: "bg-white border-gray-200",
    dot: "bg-gray-800",
  },
  {
    id: "dark" as const,
    label: "Dark",
    icon: "🌙",
    preview: "bg-gray-900 border-gray-700",
    dot: "bg-violet-400",
  },
  {
    id: "anthropic" as const,
    label: "Clay",
    icon: "🏺",
    preview: "bg-[#F5EFE6] border-[#D6C9B8]",
    dot: "bg-[#E86C4A]",
  },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--bg-secondary)" }}>
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={t.label}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
            theme === t.id
              ? "shadow-sm"
              : "opacity-60 hover:opacity-80"
          }`}
          style={
            theme === t.id
              ? { backgroundColor: "var(--bg-card)", color: "var(--text-primary)" }
              : { color: "var(--text-secondary)" }
          }
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
