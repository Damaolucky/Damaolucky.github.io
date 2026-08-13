"use client";

import { useSyncExternalStore } from "react";

const PET_PREFERENCE_EVENT = "homepage-pet-change";

function getPetSnapshot() {
  if (typeof document === "undefined") return true;
  return document.documentElement.dataset.pet !== "off";
}

function subscribeToPetPreference(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== "homepage-pet") return;

    document.documentElement.dataset.pet = event.newValue === "off" ? "off" : "on";
    callback();
  };

  window.addEventListener(PET_PREFERENCE_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  return () => {
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
  try {
    window.localStorage.setItem("homepage-pet", value);
  } catch {
    // The page-level preference still applies when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(PET_PREFERENCE_EVENT));
}
