"use client";

import { useSyncExternalStore } from "react";
import { setMotionPreference, useMotionEnabled } from "./motion-preference";

type Theme = "light" | "dark";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

const THEME_PREFERENCE_EVENT = "homepage-theme-change";

function getThemeSnapshot(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribeToThemePreference(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== "homepage-theme") return;

    const theme: Theme = event.newValue === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    callback();
  };

  window.addEventListener(THEME_PREFERENCE_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(THEME_PREFERENCE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function useTheme(): Theme {
  // The server snapshot is deliberately stable. React uses it for the first
  // hydration pass, then immediately reads the theme set by the layout script.
  return useSyncExternalStore(subscribeToThemePreference, getThemeSnapshot, () => "light");
}

function setThemePreference(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try {
    window.localStorage.setItem("homepage-theme", theme);
  } catch {
    // Theme switching still works if storage is blocked.
  }
  window.dispatchEvent(new Event(THEME_PREFERENCE_EVENT));
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const reducedMotion = document.documentElement.dataset.motion === "off"
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const viewTransitionDocument = document as ViewTransitionDocument;

    if (!reducedMotion && viewTransitionDocument.startViewTransition) {
      viewTransitionDocument.startViewTransition(() => setThemePreference(next));
      return;
    }

    setThemePreference(next);
  };

  return (
    <button
      className={className}
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to bright mode" : "Switch to dark mode"}
      aria-pressed={theme === "dark"}
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
      <span>{theme === "dark" ? "Bright" : "Dark"}</span>
    </button>
  );
}

export function MotionToggle({ className = "" }: { className?: string }) {
  const enabled = useMotionEnabled();

  return (
    <button
      className={className}
      type="button"
      onClick={() => setMotionPreference(!enabled)}
      aria-label={enabled ? "Turn motion off" : "Turn motion on"}
      aria-pressed={enabled}
      suppressHydrationWarning
    >
      <span aria-hidden="true">{enabled ? "Ⅱ" : "▶"}</span>
      <span suppressHydrationWarning>{enabled ? "Motion" : "Still"}</span>
    </button>
  );
}
