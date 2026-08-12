"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../profile.module.css";

type PortraitMode = "oval" | "clip";

const PORTRAIT_STORAGE_KEY = "academy-profile-portrait-v2";

export function ProfilePortrait() {
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
    <figure className={styles.profilePortrait} data-portrait-mode={mode}>
      <button
        className={styles.photoFrame}
        type="button"
        data-academy-no-effect
        aria-label={`Current portrait: ${mode}. Switch to ${nextStyle} style.`}
        title={`Switch to ${nextStyle} style`}
        onClick={togglePortrait}
      >
        <span className={styles.photoViewport}>
          <Image
            className={`${styles.portraitImage} ${styles.portraitPrimary}`}
            src="/media/hua-profile.png"
            alt={mode === "oval" ? "Illustrated profile portrait of Hua Zhou" : ""}
            width={768}
            height={768}
            sizes="(max-width: 780px) 100px, (max-width: 1080px) 154px, 274px"
            priority
            unoptimized
          />
          <Image
            className={`${styles.portraitImage} ${styles.portraitAlternate}`}
            src="/media/hua-profile-anime-clean.png"
            alt={mode === "clip" ? "Anime-style alternate profile portrait" : ""}
            width={1327}
            height={1186}
            sizes="(max-width: 780px) 100px, (max-width: 1080px) 154px, 274px"
            unoptimized
          />
        </span>
        <span className={styles.photoAccent} aria-hidden="true" />
      </button>
    </figure>
  );
}
