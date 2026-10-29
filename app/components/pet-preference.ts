"use client";

import { useSyncExternalStore } from "react";

const PET_PREFERENCE_EVENT = "homepage-pet-change";

function getPetSnapshot() {
  if (typeof document === "undefined") return false;
  const value = document.documentElement.dataset.pet;
  return value === "on";
}

function subscribeToPetPreference(callback: () => void) {
  const applyPreference = () => {
    const root = document.documentElement;
    const preference = root.dataset.petPreference;
    root.dataset.pet = preference === "on" || preference === "off"
      ? preference
      : "off";
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
  window.addEventListener(PET_PREFERENCE_EVENT, callback);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(PET_PREFERENCE_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function usePetVisible() {
  return useSyncExternalStore(subscribeToPetPreference, getPetSnapshot, () => false);
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
