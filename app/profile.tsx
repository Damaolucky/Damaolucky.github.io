import Image from "next/image";
import { AcademyBrand } from "./components/academy-brand";
import { AcademyCustomizer } from "./components/academy-customizer";
import { PixelCorner } from "./components/pixel-corner";
import { AcademyInteractions } from "./components/academy-interactions";
import { SectionNav } from "./components/section-nav";
import { MotionToggle, PetToggle, ThemeToggle } from "./components/theme-controls";
import { papers } from "./content/papers";
import { lastUpdated, miscText, profile, researchThemes, type RichTextSegment, type SchoolMarkId } from "./content/profile";
import styles from "./profile.module.css";

const years = [...new Set(papers.map((paper) => paper.year))];

function PaperLinks({ paper }: { paper: (typeof papers)[number] }) {
  if (paper.links.length === 0) {
    return <span className={styles.kindBadge}>{paper.kind}</span>;
  }

  return (
    <div className={styles.paperLinks}>
      {paper.links.map((link) => (
        <a key={link.label} href={link.href}>
          {link.label}<span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

function Signal({ paper }: { paper: (typeof papers)[number] }) {
  if (paper.image) return <Image className={styles.projectImage} src={paper.image.src} alt={paper.image.alt} width={320} height={400} unoptimized />;
  return (
    <div className={`${styles.signal} ${styles[`signal_${paper.art}`]}`} aria-hidden="true">
      <i /><i /><i /><i />
    </div>
  );
}

const SCHOOL_MARKS: Record<SchoolMarkId, { src: string; width: number; height: number }> = {
  sdu: { src: "/media/school-icons/sdu-96.webp", width: 96, height: 96 },
  uwmadison: { src: "/media/school-icons/uw-madison.svg", width: 56, height: 88 },
  cornell: { src: "/media/school-icons/cornell-tech.svg", width: 512, height: 512 },
};

function BioSegment({ segment }: { segment: RichTextSegment }) {
  const content = <>{segment.text}{segment.schoolMark && (
    <Image
      className={styles.schoolMark}
      src={SCHOOL_MARKS[segment.schoolMark].src}
      alt=""
      aria-hidden="true"
      width={SCHOOL_MARKS[segment.schoolMark].width}
      height={SCHOOL_MARKS[segment.schoolMark].height}
      unoptimized
    />
  )}</>;

  if (segment.href) {
    const link = <a href={segment.href} target="_blank" rel="noreferrer">{content}</a>;
    return segment.strong ? <strong>{link}</strong> : link;
  }

  return segment.strong ? <strong>{content}</strong> : content;
}

function BioText() {
  return (
    <div className={styles.bioText}>
      {profile.bioParagraphs.map((paragraph, paragraphIndex) => (
        <p key={paragraphIndex}>
          {paragraph.map((segment, segmentIndex) => (
            <BioSegment segment={segment} key={`${segment.text}-${segmentIndex}`} />
          ))}
        </p>
      ))}
    </div>
  );
}

function ProfileIcon({ kind }: { kind: "email" | "github" | "scholar" | "x" }) {
  if (kind === "email") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m4.5 7 7.5 5.8L19.5 7" /></svg>;
  }

  if (kind === "github") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 21v-3.8c.04-1.18-.42-2.31-1.26-3.13 3.1-.35 6.36-1.52 6.36-6.9A5.38 5.38 0 0 0 18.66 3.4 5 5 0 0 0 18.52.3S17.39-.06 15 1.74a13.2 13.2 0 0 0-6 0C6.61-.06 5.48.3 5.48.3a5 5 0 0 0-.14 3.1A5.38 5.38 0 0 0 3.9 7.2c0 5.36 3.26 6.53 6.36 6.9A4 4 0 0 0 9 17.2V21m0-2.8c-3 .92-3-1.5-4.2-1.8" /></svg>;
  }

  if (kind === "x") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h4.5L20 21h-4.5ZM20 3l-6.9 8M4 21l6.9-8" /></svg>;
  }

  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2.5 9.5 9.5-5 9.5 5-9.5 5Z" /><path d="M6 11.4v5.2c3.6 2.6 8.4 2.6 12 0v-5.2M21.5 9.5v6" /></svg>;
}

function CuteDecoration() {
  return (
    <div className={styles.cuteDecoration} aria-hidden="true">
      <span /><span /><span /><span /><span /><span />
    </div>
  );
}

export function ProfilePage() {
  return (
    <div
      className={`${styles.page} notranslate`}
      id="top"
      tabIndex={-1}
      translate="no"
    >
      <AcademyInteractions />
      <AcademyCustomizer />
      <div className={styles.edgeDecorations} aria-hidden="true">
        <span /><span /><span /><span /><span />
        <span /><span /><span /><span /><span />
        <span /><span /><span /><span /><span /><span />
        <span /><span /><span /><span />
        <span /><span /><span /><span />
      </div>
      <a className={styles.skipLink} href="#work">Skip to selected work</a>

      <header className={styles.topbar}>
        <AcademyBrand />
        <SectionNav className={styles.primaryNav} />
        <div className={styles.topActions}>
          <div className={styles.inlineControls} aria-label="Display preferences">
            <MotionToggle className={styles.preferenceButton} />
            <PetToggle className={styles.preferenceButton} />
            <ThemeToggle className={styles.preferenceButton} />
          </div>
        </div>
      </header>

      <main className={styles.shell}>
        <aside className={styles.profileRail}>
          <div className={styles.railIdentity}>
            <h1>{profile.name}</h1>
            <p>{profile.role}</p>
            <span>{profile.affiliation}</span>
          </div>
          <dl className={styles.facts}>
            <div><dt>Based</dt><dd>{profile.location}</dd></div>
            <div><dt>Focus</dt><dd>Vision · GenAI</dd></div>
          </dl>
          <div className={styles.profileLinks} data-academy-no-effect>
            <details className={styles.emailContact}>
              <summary className={styles.profileIcon} aria-label="Show email address" title="Show email address">
                <ProfileIcon kind="email" />
              </summary>
              <a className={styles.emailPopover} href={`mailto:${profile.email}`} title="Select to copy or click to compose">{profile.email}</a>
            </details>
            {profile.links.map((link) => link.href ? (
              <a className={styles.profileIcon} href={link.href} key={link.id} target="_blank" rel="noreferrer" aria-label={link.label} title={link.label}>
                <ProfileIcon kind={link.id} />
              </a>
            ) : (
              <span className={styles.profileIcon} data-disabled="true" key={link.id} role="link" aria-disabled="true" aria-label={`${link.label} — coming soon`} title={`${link.label} — coming soon`}>
                <ProfileIcon kind={link.id} />
              </span>
            ))}
          </div>
        </aside>

        <div className={styles.content}>
          <section className={styles.hero} id="about" tabIndex={-1} aria-labelledby="about-title">
            <CuteDecoration />
            <div className={styles.introHeading}>
              <span className={styles.helloBubble} aria-hidden="true">Hi!</span>
              <div>
                <h2 id="about-title">I&apos;m Hua.</h2>
                <p>Computer vision · generative AI</p>
              </div>
            </div>
            <BioText />
          </section>

          <section className={styles.publications} id="work" tabIndex={-1} aria-labelledby="work-title">
            <div className={styles.sectionHeading}>
              <div><p>Research & projects</p><h2 id="work-title">Selected work</h2></div>
              <span>{papers.length} project</span>
            </div>

            {years.map((year) => (
              <section className={styles.yearGroup} key={year} aria-labelledby={`year-${year}`}>
                <h3 id={`year-${year}`}>{year}</h3>
                <div className={styles.yearPapers}>
                  {papers.filter((paper) => paper.year === year).map((paper, index) => (
                    <article className={styles.paper} id={paper.id} key={paper.id}>
                      <div className={styles.paperNumber}><span>{String(index + 1).padStart(2, "0")}</span><i aria-hidden="true" /></div>
                      <Signal paper={paper} />
                      <div className={styles.paperCopy}>
                        <div className={styles.paperMeta}><span>{paper.venueShort}</span>{paper.award && <strong>{paper.award}</strong>}</div>
                        <h4>{paper.title}</h4>
                        <p className={styles.venue}>{paper.venue}</p>
                        <p className={styles.summary}>{paper.summary}</p>
                        <div className={styles.topicTags}>
                          {paper.topics.map((topic) => <span key={topic}>{researchThemes.find((item) => item.id === topic)?.short}</span>)}
                        </div>
                      </div>
                      <PaperLinks paper={paper} />
                    </article>
                  ))}
                </div>
              </section>
            ))}
            <div className={styles.projectCompanion}><PixelCorner /></div>
          </section>

          <section className={styles.misc} id="misc" tabIndex={-1} aria-labelledby="misc-title">
            <div className={styles.sectionHeading}><div><p>A little more</p><h2 id="misc-title">Misc</h2></div></div>
            <p className={styles.miscText}>{miscText}</p>
          </section>

          <footer className={styles.footer}>
            <p>Hua Zhou · 2026</p>
            <time dateTime={lastUpdated.dateTime}>{`Last updated: ${lastUpdated.label}`}</time>
          </footer>
        </div>
      </main>
    </div>
  );
}
