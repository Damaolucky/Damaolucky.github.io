"use client";

import { useSyncExternalStore } from "react";

const PET_PREFERENCE_EVENT = "homepage-pet-change";
// Also used by the pre-hydration script in app/layout.tsx.
const MOBILE_PET_QUERY = "(max-width: 780px), (hover: none) and (pointer: coarse)";

function getPetSnapshot() {
  if (typeof document === "undefined") return true;
  const value = document.documentElement.dataset.pet;
  return value === "on" || (value !== "off" && !window.matchMedia(MOBILE_PET_QUERY).matches);
}

function subscribeToPetPreference(callback: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_PET_QUERY);
  const applyPreference = () => {
    const root = document.documentElement;
    const preference = root.dataset.petPreference;
    root.dataset.pet = preference === "on" || preference === "off"
      ? preference
      : mediaQuery.matches ? "off" : "on";
    callback();
  };
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== "homepage-pet") return;

    if (event.newValue === "on" || event.newValue === "off") {
      document.documentElement.dataset.petPreference = event.newValue;
    } else {
      delete document.documentElement.dataset.petPreference;
    }
    applyPreference();
  };

  applyPreference();
  mediaQuery.addEventListener("change", applyPreference);
  window.addEventListener(PET_PREFERENCE_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    mediaQuery.removeEventListener("change", applyPreference);
    window.removeEventListener(PET_PREFERENCE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function usePetVisible() {
  return useSyncExternalStore(subscribeToPetPreference, getPetSnapshot, () => true);
}

export function setPetPreference(visible: boolean) {
  const value = visible ? "on" : "off";
  document.documentElement.dataset.pet = value;
  document.documentElement.dataset.petPreference = value;
  try {
    window.localStorage.setItem("homepage-pet", value);
  } catch {
    // The page-level preference still applies when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(PET_PREFERENCE_EVENT));
}
