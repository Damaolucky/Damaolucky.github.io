"use client";

import { useSyncExternalStore } from "react";

type Background = "white" | "lavender";

const BACKGROUND_PREFERENCE_EVENT = "homepage-background-change";
const BACKGROUND_STORAGE_KEY = "homepage-background";

function getBackgroundSnapshot(): Background {
  if (typeof document === "undefined") return "white";
  return document.documentElement.dataset.background === "lavender" ? "lavender" : "white";
}

function subscribeToBackgroundPreference(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== BACKGROUND_STORAGE_KEY) return;

    document.documentElement.dataset.background = event.newValue === "lavender" ? "lavender" : "white";
    callback();
  };

  window.addEventListener(BACKGROUND_PREFERENCE_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(BACKGROUND_PREFERENCE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function useBackground(): Background {
  // Keep the server snapshot deterministic; the layout script applies a saved
  // preference before hydration, and React reads it immediately afterwards.
  return useSyncExternalStore(subscribeToBackgroundPreference, getBackgroundSnapshot, () => "white");
}

function setBackgroundPreference(background: Background) {
  document.documentElement.dataset.background = background;
  try {
    window.localStorage.setItem(BACKGROUND_STORAGE_KEY, background);
  } catch {
    // The choice still applies for this visit if browser storage is unavailable.
  }
  window.dispatchEvent(new Event(BACKGROUND_PREFERENCE_EVENT));
}

export function BackgroundToggle({ className = "" }: { className?: string }) {
  const background = useBackground();
  const next: Background = background === "white" ? "lavender" : "white";

  return (
    <button
      className={className}
      type="button"
      onClick={() => setBackgroundPreference(next)}
      aria-label={`Use ${next} page background`}
      aria-pressed={background === "lavender"}
    >
      <span aria-hidden="true">{background === "white" ? "✦" : "○"}</span>
      <span>{background === "white" ? "Lavender" : "White"}</span>
    </button>
  );
}
