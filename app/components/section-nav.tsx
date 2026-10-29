"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import styles from "./section-nav.module.css";

const sections = [
  { id: "top", label: "About" },
  { id: "work", label: "Work" },
  { id: "misc", label: "Misc" },
] as const;

type SectionId = (typeof sections)[number]["id"];

function prefersInstantScroll() {
  return document.documentElement.dataset.motion === "off"
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SectionNav({ className = "" }: { className?: string }) {
  // A fixed server snapshot keeps the nav's first client render hydration-safe.
  // The effect below calculates the real section immediately after hydration.
  const [activeSection, setActiveSection] = useState<SectionId>("top");

  useEffect(() => {
    let frame = 0;

    const updateActiveSection = () => {
      frame = 0;
      const root = document.documentElement;
      const pageHeight = Math.max(root.scrollHeight, document.body.scrollHeight);
      const atPageEnd = window.scrollY + window.innerHeight >= pageHeight - 4;

      let nextSection: SectionId = "top";

      if (atPageEnd) {
        nextSection = "misc";
      } else {
        // Select the section occupying the reading area just below the sticky
        // header. A small buffer prevents flicker when a heading crosses it.
        const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 76;
        const readingLine = Math.max(headerBottom + 20, Math.min(160, window.innerHeight * 0.18));

        for (const section of sections.slice(1)) {
          const element = document.getElementById(section.id);
          if (element && element.getBoundingClientRect().top <= readingLine) {
            nextSection = section.id;
          }
        }
      }

      setActiveSection((current) => current === nextSection ? current : nextSection);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    window.addEventListener("hashchange", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const navigateToSection = useCallback((event: MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    // Preserve modified-click behavior so anchors can still be copied/opened
    // through the browser's standard link controls.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    const header = event.currentTarget.closest("header");
    const headerHeight = header && window.getComputedStyle(header).position === "sticky"
      ? header.getBoundingClientRect().height
      : 0;
    const top = id === "top"
      ? 0
      : Math.max(0, window.scrollY + target.getBoundingClientRect().top - headerHeight - 18);

    window.history.pushState(null, "", `#${id}`);
    setActiveSection(id);
    target.focus({ preventScroll: true });
    window.scrollTo({
      top,
      behavior: prefersInstantScroll() ? "auto" : "smooth",
    });
  }, []);

  return (
    <nav className={`${className} ${styles.nav}`} aria-label="Primary navigation">
      {sections.map((section) => (
        <a
          className={styles.link}
          href={`#${section.id}`}
          key={section.id}
          aria-current={activeSection === section.id ? "location" : undefined}
          onClick={(event) => navigateToSection(event, section.id)}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
