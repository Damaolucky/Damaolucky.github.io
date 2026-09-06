"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./profile-portrait.module.css";

type PortraitMode = "oval" | "clip";

const PORTRAIT_STORAGE_KEY = "academy-profile-portrait-v2";
const PORTRAIT_SIZES = "(max-width: 360px) 80px, (max-width: 780px) 100px, (max-width: 1080px) 132px, 274px";

export function ProfilePortrait({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<PortraitMode>("clip");

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(PORTRAIT_STORAGE_KEY);
        if (saved === "oval" || saved === "clip") setMode(saved);
      } catch {
        // The portrait still switches when local storage is unavailable.
      }
    }, 0);
    return () => window.clearTimeout(loadTimer);
  }, []);

  const togglePortrait = () => {
    const nextMode: PortraitMode = mode === "oval" ? "clip" : "oval";
    setMode(nextMode);
    try {
      window.localStorage.setItem(PORTRAIT_STORAGE_KEY, nextMode);
    } catch {
      // Keep the current-session selection when storage is unavailable.
    }
  };

  const nextStyle = mode === "oval" ? "anime Clip" : "painted Oval";

  return (
    <figure className={`${className} ${styles.profilePortrait}`} data-portrait-mode={mode}>
      <button
        className={styles.photoFrame}
        type="button"
        data-academy-no-effect
        aria-label={`Current portrait: ${mode}. Switch to ${nextStyle} style.`}
        title={`Switch to ${nextStyle} style`}
        onClick={togglePortrait}
      >
        <span className={styles.photoViewport}>
          <picture>
            <source
              type="image/webp"
              srcSet="/media/hua-profile-256.webp 256w, /media/hua-profile-512.webp 512w, /media/hua-profile-768.webp 768w"
              sizes={PORTRAIT_SIZES}
            />
            <Image
              className={`${styles.portraitImage} ${styles.portraitPrimary}`}
              src="/media/hua-profile-768.webp"
              alt={mode === "oval" ? "Illustrated profile portrait of Hua Zhou" : ""}
              width={768}
              height={768}
              sizes={PORTRAIT_SIZES}
              loading="lazy"
              decoding="async"
              unoptimized
            />
          </picture>
          <picture>
            <source
              type="image/webp"
              srcSet="/media/hua-profile-anime-clean-256.webp 256w, /media/hua-profile-anime-clean-512.webp 512w, /media/hua-profile-anime-clean-768.webp 768w"
              sizes={PORTRAIT_SIZES}
            />
            <Image
              className={`${styles.portraitImage} ${styles.portraitAlternate}`}
              src="/media/hua-profile-anime-clean-768.webp"
              alt={mode === "clip" ? "Anime-style alternate profile portrait" : ""}
              width={768}
              height={686}
              sizes={PORTRAIT_SIZES}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              unoptimized
            />
          </picture>
        </span>
        <span className={styles.photoAccent} aria-hidden="true" />
      </button>
    </figure>
  );
}
