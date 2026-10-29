import styles from "./version-switch.module.css";

export function VersionSwitch({ current }: { current: "lavender" | "mono" }) {
  return (
    <nav className={styles.switcher} aria-label="Compare designs" data-academy-no-effect>
      <span>DESIGN STUDY</span>
      <div>
        <a href="/" aria-current={current === "lavender" ? "page" : undefined}>01 · Lavender</a>
        <a href="/mono" aria-current={current === "mono" ? "page" : undefined}>02 · Monochrome</a>
      </div>
    </nav>
  );
}
