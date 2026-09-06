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
  const applyPreference = () => {
    const root = document.documentElement;
    const preference = root.dataset.motionPreference;
    root.dataset.motion = preference === "on" || preference === "off"
      ? preference
      : mediaQuery.matches ? "off" : "on";
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== "homepage-motion") return;
    if (event.newValue === "on" || event.newValue === "off") {
      document.documentElement.dataset.motionPreference = event.newValue;
    } else {
      delete document.documentElement.dataset.motionPreference;
    }
    applyPreference();
  };
  applyPreference();
  window.addEventListener(MOTION_PREFERENCE_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  mediaQuery.addEventListener("change", applyPreference);
  return () => {
    window.removeEventListener(MOTION_PREFERENCE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
    mediaQuery.removeEventListener("change", applyPreference);
  };
}

export function useMotionEnabled() {
  return useSyncExternalStore(subscribeToMotionPreference, getMotionSnapshot, () => false);
}

export function setMotionPreference(enabled: boolean) {
  const value = enabled ? "on" : "off";
  document.documentElement.dataset.motion = value;
  document.documentElement.dataset.motionPreference = value;
  try {
    window.localStorage.setItem("homepage-motion", value);
  } catch {
    // The page-level preference still applies when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(MOTION_PREFERENCE_EVENT));
}
