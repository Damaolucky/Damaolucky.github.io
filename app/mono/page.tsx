import type { Metadata } from "next";
import { SectionNav } from "../components/section-nav";
import { ThemeToggle } from "../components/theme-controls";
import { VersionSwitch } from "../components/version-switch";
import { papers } from "../content/papers";
import { lastUpdated, miscText, profile, researchThemes, type RichTextSegment } from "../content/profile";
import styles from "./mono.module.css";

export const metadata: Metadata = {
  title: `${profile.name} · Monochrome`,
  robots: { index: false, follow: true },
};

function BioSegment({ segment }: { segment: RichTextSegment }) {
  const text = segment.strong ? <strong>{segment.text}</strong> : segment.text;
  return segment.href ? <a href={segment.href} target="_blank" rel="noreferrer">{text}</a> : text;
}

export default function MonochromePage() {
  return (
    <div className={`${styles.page} notranslate`} id="top" tabIndex={-1} translate="no">
      <a className={styles.skipLink} href="#work">Skip to selected work</a>
      <VersionSwitch current="mono" />
      <header className={styles.header}>
        <a className={styles.wordmark} href="#top" aria-label="Hua Zhou — back to top">hz<span aria-hidden="true">.</span></a>
        <SectionNav className={styles.nav} />
        <ThemeToggle className={styles.themeToggle} />
      </header>

      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="name">
          <div className={styles.eyebrow}><span>RESEARCH / SELECTED WORK</span><span>{profile.location}</span></div>
          <h1 id="name">{profile.name}<span aria-hidden="true">.</span></h1>
          <div className={styles.heroBottom}>
            <p>Computer vision.<br /><span>Generative intelligence.</span></p>
            <a href="#work">Explore the work <span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section className={styles.section} id="about" tabIndex={-1} aria-labelledby="about-title">
          <div className={styles.sectionLabel}><span>01 / ABOUT</span><h2 id="about-title">A little<br /> about me.</h2></div>
          <div>
            <p className={styles.affiliation}>{profile.role}<br />{profile.affiliation}</p>
            <div className={styles.bio}>
              {profile.bioParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph.map((segment, segmentIndex) => <BioSegment key={segmentIndex} segment={segment} />)}</p>
              ))}
            </div>
            <div className={styles.contacts}>
              <a href={`mailto:${profile.email}`}>Email <span aria-hidden="true">↗</span></a>
              {profile.links.map((link) => link.href ? (
                <a href={link.href} key={link.id} target="_blank" rel="noreferrer">{link.label} <span aria-hidden="true">↗</span></a>
              ) : <span className={styles.unavailable} key={link.id} aria-disabled="true" title={`${link.label} — coming soon`}>{link.label} <small>soon</small></span>)}
            </div>
          </div>
        </section>

        <section className={styles.work} id="work" tabIndex={-1} aria-labelledby="work-title">
          <div className={styles.workHeading}>
            <div className={styles.sectionLabel}><span>02 / RESEARCH & PROJECTS</span><h2 id="work-title">Selected work<span className={styles.count}>({String(papers.length).padStart(2, "0")})</span></h2></div>
            <span className={styles.workNote}>An ongoing exploration.</span>
          </div>
          {papers.map((paper, index) => (
            <article className={styles.paper} id={paper.id} key={paper.id}>
              <div className={styles.paperIndex}>{String(index + 1).padStart(2, "0")}<span>{paper.year}</span></div>
              <div className={styles.paperBody}>
                <p className={styles.paperMeta}>{paper.venueShort}{paper.award && <strong> · {paper.award}</strong>}</p>
                <h3>{paper.title}</h3>
                <p className={styles.venue}>{paper.venue}</p>
                <p className={styles.summary}>{paper.summary}</p>
                <div className={styles.tags}>{paper.topics.map((topic) => <span key={topic}>{researchThemes.find((theme) => theme.id === topic)?.short}</span>)}</div>
                {paper.links.length > 0 && <div className={styles.paperLinks}>{paper.links.map((link) => <a href={link.href} key={link.label}>{link.label} <span aria-hidden="true">↗</span></a>)}</div>}
              </div>
              <span className={styles.paperKind}>{paper.kind}</span>
            </article>
          ))}
        </section>

        <section className={`${styles.section} ${styles.misc}`} id="misc" tabIndex={-1} aria-labelledby="misc-title">
          <div className={styles.sectionLabel}><span>03 / OFFLINE</span><h2 id="misc-title">Beyond the work.</h2></div>
          <p>{miscText}</p>
        </section>
        <footer className={styles.footer}>
          <a className={styles.footerName} href="#top">{profile.name}<span aria-hidden="true"> ↑</span></a>
          <span>Vision. Motion. Possibility.</span>
          <time dateTime={lastUpdated.dateTime}>Updated {lastUpdated.label}</time>
        </footer>
      </main>
    </div>
  );
}
