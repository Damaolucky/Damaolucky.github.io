"use client";

import { useSyncExternalStore } from "react";

const MOTION_PREFERENCE_EVENT = "homepage-motion-change";

function getMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return document.documentElement.dataset.motion !== "off"
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeToMotionPreference(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  window.addEventListener(MOTION_PREFERENCE_EVENT, callback);
  mediaQuery.addEventListener("change", callback);
  return () => {
    window.removeEventListener(MOTION_PREFERENCE_EVENT, callback);
    mediaQuery.removeEventListener("change", callback);
  };
}

export function useMotionEnabled() {
  return useSyncExternalStore(subscribeToMotionPreference, getMotionSnapshot, () => false);
}

export function setMotionPreference(enabled: boolean) {
  const value = enabled ? "on" : "off";
  document.documentElement.dataset.motion = value;
  try {
    window.localStorage.setItem("homepage-motion", value);
  } catch {
    // The page-level preference still applies when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(MOTION_PREFERENCE_EVENT));
}
