"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const PROFILE = {
  name: "你的名字",
  role: "独立创作者 · 设计 / 代码 / 观察",
  email: "hello@example.com",
};

const projects = [
  {
    number: "01",
    year: "2026",
    kind: "独立实验",
    title: "像素天气台",
    description: "把窗外的天气，变成桌面上一小格会呼吸的动画。",
    tags: ["Creative Coding", "UI Design"],
    art: "weather",
  },
  {
    number: "02",
    year: "2025",
    kind: "视觉记录",
    title: "城市散步地图",
    description: "记录转角、树影，以及没有目的地的下午。",
    tags: ["Mapping", "Storytelling"],
    art: "map",
  },
  {
    number: "03",
    year: "2025",
    kind: "交互设计",
    title: "声音采集簿",
    description: "一册可以听见的日记，收录微小的生活声响。",
    tags: ["Interaction", "Sound"],
    art: "sound",
  },
];

const notes = [
  {
    date: "08.06",
    title: "散步不是暂停，它是另一种思考",
    category: "日常观察",
  },
  {
    date: "07.18",
    title: "给小项目留一点不完美的空间",
    category: "制作手记",
  },
  {
    date: "06.30",
    title: "我如何整理一周里捡到的灵感",
    category: "工作方法",
  },
];

const mascotMessages = [
  "今天也做一点。",
  "作品在下面等你 ↓",
  "换个颜色，换种心情。",
  "灵感常在散步时出现。",
];

function ThemeIcon({ isDark }: { isDark: boolean }) {
  return (
    <span className="theme-icon" aria-hidden="true">
      {isDark ? (
        <span className="moon-icon" />
      ) : (
        <span className="sun-icon"><i /><i /><i /><i /></span>
      )}
    </span>
  );
}

function Mascot({ taps, onTap }: { taps: number; onTap: () => void }) {
  return (
    <div className="mascot-stage">
      <div className="stage-cloud cloud-one" />
      <div className="stage-cloud cloud-two" />
      <div className="speech-bubble" aria-live="polite">
        {mascotMessages[taps % mascotMessages.length]}
      </div>
      <button
        className="mascot-button"
        type="button"
        onClick={onTap}
        aria-label="和吉祥物薄荷芽打招呼"
      >
        <span className="mascot-character" key={taps} aria-hidden="true">
          <span className="sprout-stem" />
          <span className="sprout-leaf leaf-left" />
          <span className="sprout-leaf leaf-right" />
          <span className="mascot-arm arm-left" />
          <span className="mascot-arm arm-right" />
          <span className="mascot-body">
            <span className="mascot-eye eye-left" />
            <span className="mascot-eye eye-right" />
            <span className="mascot-cheek cheek-left" />
            <span className="mascot-cheek cheek-right" />
            <span className="mascot-mouth" />
            <span className="mascot-pocket">M-01</span>
          </span>
          <span className="mascot-shadow" />
          <span className="spark spark-one">✦</span>
          <span className="spark spark-two">•</span>
          <span className="spark spark-three">✦</span>
        </span>
      </button>
      <span className="scene-code">MINT—01 · TAKE {String((taps % 4) + 1).padStart(2, "0")}</span>
    </div>
  );
}

function ProjectArtwork({ type }: { type: string }) {
  if (type === "weather") {
    return (
      <div className="project-art art-weather" aria-hidden="true">
        <span className="weather-sun" />
        <span className="weather-window"><i /><i /><i /></span>
        <span className="weather-temp">24°</span>
      </div>
    );
  }

  if (type === "map") {
    return (
      <div className="project-art art-map" aria-hidden="true">
        <span className="map-route" />
        <span className="map-pin pin-start" />
        <span className="map-pin pin-end" />
        <span className="map-block block-one" />
        <span className="map-block block-two" />
      </div>
    );
  }

  return (
    <div className="project-art art-sound" aria-hidden="true">
      <span className="sound-bar bar-one" />
      <span className="sound-bar bar-two" />
      <span className="sound-bar bar-three" />
      <span className="sound-bar bar-four" />
      <span className="sound-bar bar-five" />
      <span className="sound-bar bar-six" />
      <span className="sound-dot" />
    </div>
  );
}

export default function Home() {
  const [theme, setTheme] = useState<Theme>("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mascotTaps, setMascotTaps] = useState(0);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const current = document.documentElement.dataset.theme as Theme | undefined;
    setTheme(current === "dark" ? "dark" : "light");

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      setShowBackToTop(window.scrollY > 560);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem("homepage-theme", next);
    setTheme(next);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${PROFILE.email}`;
    }
  };

  const closeMenu = () => setMenuOpen(false);
  const isDark = theme === "dark";

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ width: `${scrollProgress}%` }} />
      </div>

      <div className="site-shell" id="top">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="返回首页顶部">
            <span className="brand-mark" aria-hidden="true">芽</span>
            <span className="brand-copy">
              <strong>{PROFILE.name}</strong>
              <small>YOUR NAME</small>
            </span>
          </a>

          <nav className="desktop-nav" aria-label="主导航">
            <a href="#work">作品</a>
            <a href="#about">关于</a>
            <a href="#notes">随笔</a>
            <a href="#contact">联系</a>
          </nav>

          <div className="header-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "切换到明亮模式" : "切换到深色模式"}
              aria-pressed={isDark}
            >
              <ThemeIcon isDark={isDark} />
              <span>{isDark ? "Bright" : "Dark"}</span>
              <i className="theme-knob" aria-hidden="true" />
            </button>
            <button
              className={`menu-button${menuOpen ? " is-open" : ""}`}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "关闭导航" : "打开导航"}
            >
              <i /><i />
            </button>
          </div>

          <nav
            id="mobile-navigation"
            className={`mobile-nav${menuOpen ? " is-open" : ""}`}
            aria-label="移动端导航"
          >
            <a href="#work" onClick={closeMenu}>作品 <span>01</span></a>
            <a href="#about" onClick={closeMenu}>关于 <span>02</span></a>
            <a href="#notes" onClick={closeMenu}>随笔 <span>03</span></a>
            <a href="#contact" onClick={closeMenu}>联系 <span>04</span></a>
          </nav>
        </header>

        <main>
          <section className="story-shot hero-section" aria-labelledby="hero-title">
            <aside className="shot-index" aria-hidden="true">
              <span>SHOT 01</span>
              <i />
              <span>INTRO</span>
            </aside>

            <div className="hero-copy">
              <p className="eyebrow"><span>HELLO, WORLD</span> — 2026</p>
              <h1 id="hero-title">
                把好奇心，<br />
                <span>做成看得见的东西。</span>
              </h1>
              <p className="hero-description">
                设计、代码与日常观察的个人存档。<br />
                慢慢做，认真看，偶尔冒出一点奇怪的灵感。
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#work">
                  看看作品 <span aria-hidden="true">↗</span>
                </a>
                <a className="button button-secondary" href="#about">
                  关于我 <span aria-hidden="true">↓</span>
                </a>
              </div>
              <div className="hero-fields" aria-label="关注领域">
                <span>DESIGN</span><i />
                <span>CODE</span><i />
                <span>DAILY LIFE</span>
              </div>
            </div>

            <div className="hero-scene">
              <Mascot taps={mascotTaps} onTap={() => setMascotTaps((taps) => taps + 1)} />
              <p className="mascot-hint">点一点薄荷芽，它会和你说话</p>
            </div>
          </section>

          <section className="story-shot work-section" id="work" aria-labelledby="work-title">
            <aside className="shot-index" aria-hidden="true">
              <span>SHOT 02</span>
              <i />
              <span>SELECTED</span>
            </aside>
            <div className="section-content">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">SELECTED WORK</p>
                  <h2 id="work-title">最近做了这些</h2>
                </div>
                <p className="section-note">三件正在生长的小作品 <span aria-hidden="true">↘</span></p>
              </div>

              <div className="project-grid">
                {projects.map((project) => (
                  <article className="project-card" key={project.number}>
                    <ProjectArtwork type={project.art} />
                    <div className="project-info">
                      <div className="project-meta">
                        <span>{project.number} / {project.kind}</span>
                        <span>{project.year}</span>
                      </div>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                      <div className="project-footer">
                        <div className="tag-list">
                          {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                        </div>
                        <span className="project-arrow" aria-hidden="true">↗</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="story-shot about-section" id="about" aria-labelledby="about-title">
            <aside className="shot-index" aria-hidden="true">
              <span>SHOT 03</span>
              <i />
              <span>ABOUT</span>
            </aside>
            <div className="about-layout">
              <div className="about-intro">
                <p className="eyebrow">A LITTLE ABOUT ME</p>
                <h2 id="about-title">在理性与想象力<br />之间来回散步。</h2>
              </div>
              <div className="about-story">
                <p className="about-lead">
                  你好，我是<span>{PROFILE.name}</span>。我喜欢把复杂的事情整理清楚，
                  再给它加上一点让人会心一笑的细节。
                </p>
                <p>
                  目前专注于数字产品、创意编程和视觉叙事。这里收集完成的项目，
                  也保留尚未长大的念头。
                </p>
                <div className="skill-list" aria-label="擅长领域">
                  <span>界面设计</span>
                  <span>前端开发</span>
                  <span>创意编程</span>
                  <span>视觉记录</span>
                </div>
              </div>
              <div className="about-card" aria-label="个人状态">
                <span className="status-dot" />
                <p>NOW BASED IN</p>
                <strong>一座适合散步的城市</strong>
                <small>{PROFILE.role}</small>
                <div className="mini-mascot" aria-hidden="true"><i /><i /><b /></div>
              </div>
            </div>
          </section>

          <section className="story-shot notes-section" id="notes" aria-labelledby="notes-title">
            <aside className="shot-index" aria-hidden="true">
              <span>SHOT 04</span>
              <i />
              <span>NOTES</span>
            </aside>
            <div className="section-content notes-content">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">RECENT NOTES</p>
                  <h2 id="notes-title">最近写了这些</h2>
                </div>
                <p className="section-note">一些不急着得出结论的想法</p>
              </div>
              <div className="notes-list">
                {notes.map((note, index) => (
                  <article className="note-row" key={note.title}>
                    <span className="note-number">0{index + 1}</span>
                    <time dateTime={`2026-${note.date.replace(".", "-")}`}>{note.date}</time>
                    <h3>{note.title}</h3>
                    <span className="note-category">{note.category}</span>
                    <span className="note-arrow" aria-hidden="true">↗</span>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="now-strip" aria-labelledby="now-title">
            <div className="now-label">
              <span className="status-dot" />
              <p>NOW / 现在</p>
            </div>
            <h2 id="now-title">正在学习把复杂问题讲简单，也在收集城市里奇怪又可爱的声音。</h2>
            <p className="now-date">UPDATED · AUG 2026</p>
          </section>

          <section className="contact-section" id="contact" aria-labelledby="contact-title">
            <div className="contact-sun" aria-hidden="true"><span /></div>
            <p className="eyebrow">SAY HELLO · 05</p>
            <h2 id="contact-title">有好点子？<br /><span>一起把它做出来。</span></h2>
            <p>欢迎聊项目、交换灵感，或者只是分享一条很棒的散步路线。</p>
            <div className="contact-actions">
              <a className="button button-primary" href={`mailto:${PROFILE.email}`}>
                写封邮件 <span aria-hidden="true">↗</span>
              </a>
              <button className="copy-button" type="button" onClick={copyEmail}>
                <span>{PROFILE.email}</span>
                <strong>{copied ? "已复制 ✓" : "复制邮箱"}</strong>
              </button>
            </div>
            <p className="sr-only" aria-live="polite">{copied ? "邮箱地址已复制" : ""}</p>
          </section>
        </main>

        <footer className="site-footer">
          <div>
            <span className="footer-mark" aria-hidden="true">芽</span>
            <p>© 2026 {PROFILE.name}<br /><small>MADE WITH CURIOSITY</small></p>
          </div>
          <p className="footer-note">请随意走走，慢慢看。</p>
          <a href="#top">回到顶部 <span aria-hidden="true">↑</span></a>
        </footer>
      </div>

      <button
        className={`back-to-top${showBackToTop ? " is-visible" : ""}`}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="回到页面顶部"
      >
        ↑
      </button>
    </>
  );
}
