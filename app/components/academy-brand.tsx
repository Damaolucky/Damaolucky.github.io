"use client";

import { useState, type CSSProperties } from "react";
import { ACADEMY_BRAND_HEART_EVENT } from "./academy-events";
import { useMotionEnabled } from "./motion-preference";
import styles from "./academy-brand.module.css";

const bubbles = [
  { x: -32, y: -27, delay: 0 },
  { x: -13, y: -43, delay: 35 },
  { x: 12, y: -39, delay: 70 },
  { x: 33, y: -22, delay: 25 },
  { x: 39, y: 2, delay: 85 },
  { x: -37, y: 4, delay: 55 },
] as const;

export function AcademyBrand() {
  const [burst, setBurst] = useState(0);
  const motionEnabled = useMotionEnabled();

  const activate = () => {
    if (motionEnabled) setBurst((current) => current + 1);
    window.dispatchEvent(new Event(ACADEMY_BRAND_HEART_EVENT));
    window.scrollTo({ top: 0, behavior: motionEnabled ? "smooth" : "auto" });
  };

  return (
    <div className={styles.brand} data-academy-no-effect>
      <button
        className={styles.mark}
        type="button"
        aria-label="Play heart animation and return to the top"
        onClick={activate}
      >
        <svg
          className={styles.heart}
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            className={styles.heartShape}
            d="M12 20.15C9.1 17.52 4.15 14.08 4.15 9.42C4.15 6.58 6.01 4.75 8.42 4.75C10.01 4.75 11.23 5.68 12 6.77C12.77 5.68 13.99 4.75 15.58 4.75C17.99 4.75 19.85 6.58 19.85 9.42C19.85 14.08 14.9 17.52 12 20.15Z"
            transform="translate(0 -0.45)"
          />
        </svg>
        <span className={styles.bubbles} key={burst}>
          {motionEnabled && burst > 0 && bubbles.map((bubble, index) => (
            <i
              key={`${burst}-${index}`}
              style={{
                "--bubble-x": `${bubble.x}px`,
                "--bubble-y": `${bubble.y}px`,
                "--bubble-delay": `${bubble.delay}ms`,
              } as CSSProperties}
            />
          ))}
        </span>
      </button>
    </div>
  );
}
