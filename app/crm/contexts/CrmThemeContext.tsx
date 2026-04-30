"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CrmTheme = "light" | "dark";

type CrmThemeContextValue = {
  theme: CrmTheme;
  setTheme: (t: CrmTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
};

const STORAGE_KEY = "ballo-crm-theme";

const CrmThemeContext = createContext<CrmThemeContextValue | null>(null);

function readStoredTheme(): CrmTheme {
  if (typeof window === "undefined") return "light";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "dark" ? "dark" : "light";
}

export function CrmThemeProvider({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const [theme, setThemeState] = useState<CrmTheme>("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setThemeState(readStoredTheme());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, hydrated]);

  const setTheme = useCallback((t: CrmTheme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "light" ? "dark" : "light")),
    [],
  );

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark: theme === "dark" }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <CrmThemeContext.Provider value={value}>
      <div
        className={`crm-root ${className}`.trim()}
        data-crm-theme={theme}
        suppressHydrationWarning
      >
        {children}
      </div>
    </CrmThemeContext.Provider>
  );
}

export function useCrmTheme() {
  const ctx = useContext(CrmThemeContext);
  if (!ctx) throw new Error("useCrmTheme must be used within CrmThemeProvider");
  return ctx;
}
