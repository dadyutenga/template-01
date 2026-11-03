// Kibegi Marketing — components. Exports to window for cross-script use.
const { useState } = React;

const LOGO = "../../assets/kibegi-logo.png";
const HERO = "../../assets/hero-students.jpeg";
const ILLO = "../../assets/hero-education.jpg";

function Icon({ name, style }) {
  // lucide via data attribute; createIcons() called after render
  return <i data-lucide={name} style={style}></i>;
}

function MktNavbar({ lang, setLang }) {
  const links = lang === "en"
    ? ["Home", "About", "How to Use", "Privacy", "Contact Us"]
    : ["Nyumbani", "Kuhusu", "Jinsi ya Kutumia", "Faragha", "Wasiliana"];
  const linkIcons = ["home", "info", "book-open", "shield-check", "mail"];
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <div className="brand"><img src={LOGO} alt="Kibegi" /><span>Kibegi</span></div>
        <div className="nav-links">
          {links.map((l, i) => (
            <a key={l}><Icon name={linkIcons[i]} />{l}</a>
          ))}
        </div>
        <div className="nav-right">
          <button className="icon-btn" title="Theme"><Icon name="moon" /></button>
          <button className="icon-btn" title="Language" onClick={() => setLang(lang === "en" ? "sw" : "en")}>
            {lang === "en" ? "🇹🇿" : "🇺🇸"}
          </button>
        </div>
      </div>
    </nav>
  );
}

function MktHero({ copy }) {
  return (
    <section style={{ position: "relative", overflow: "hidden", paddingTop: 64, paddingBottom: 80 }}>
      <div className="blob" style={{ left: "-6%", top: 30, width: 240, height: 240, background: "hsl(187 85% 43% / .12)" }}></div>
      <div className="blob" style={{ right: "-2%", top: 40, width: 300, height: 300, background: "hsl(187 85% 70% / .3)" }}></div>
      <div className="blob" style={{ bottom: 0, left: "35%", width: 180, height: 180, background: "hsl(160 60% 75% / .4)" }}></div>
      <div className="container" style={{ position: "relative", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 48, alignItems: "center" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 56, lineHeight: 1.04 }}>{copy.heroTitle}</h1>
          <p style={{ fontSize: 19, lineHeight: 1.55, color: "var(--fg2)", marginTop: 18, maxWidth: 520 }}>{copy.heroDescription}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 26 }}>
            {copy.heroBullets.map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid hsl(215 25% 88% / .7)", background: "rgba(255,255,255,.8)", borderRadius: 16, padding: "12px 16px", fontSize: 14.5, fontWeight: 500, boxShadow: "var(--shadow-sm)", backdropFilter: "blur(4px)" }}>
                <Icon name="check-circle-2" style={{ color: "var(--primary)", flexShrink: 0 }} />
                <span>{b}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
            <button className="btn btn-hero btn-lg">{copy.primaryCta} <Icon name="arrow-right" /></button>
            <button className="btn btn-outline btn-lg">{copy.secondaryCta}</button>
          </div>
          <p className="muted" style={{ fontSize: 14, fontWeight: 500, marginTop: 18 }}>{copy.heroTrust}</p>
        </div>
        <div style={{ position: "relative" }}>
          <div className="blob" style={{ bottom: -24, right: -24, width: 96, height: 96, background: "var(--secondary)" }}></div>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 28, border: "1px solid hsl(215 25% 88% / .7)", background: "rgba(255,255,255,.85)", padding: 12, boxShadow: "var(--shadow-float)", backdropFilter: "blur(12px)" }}>
            <img src={HERO} alt="Students" style={{ width: "100%", maxHeight: 420, objectFit: "cover", borderRadius: 22, display: "block" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, badge, title, description }) {
  return (
    <div className="card feature">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="chip"><Icon name={icon} /></div>
        <span className="pill">{badge}</span>
      </div>
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--fg2)", margin: 0 }}>{description}</p>
      </div>
    </div>
  );
}

function MktFeatures({ copy }) {
  return (
    <section id="features">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">{copy.featuresEyebrow}</div>
          <h2>{copy.featuresTitle}</h2>
          <p>{copy.featuresDescription}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, marginTop: 48 }}>
          {copy.featureCards.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </div>
    </section>
  );
}

function ComparisonPanel({ title, points, tone }) {
  const styles = tone === "rose"
    ? { border: "1px solid hsl(350 70% 80% / .7)", background: "hsl(350 80% 97% / .65)" }
    : { border: "1px solid hsl(187 60% 75% / .7)", background: "hsl(187 70% 96% / .65)" };
  const iconColor = tone === "rose" ? "hsl(350 75% 55%)" : "var(--primary)";
  return (
    <div style={{ borderRadius: 30, padding: 32, boxShadow: "var(--shadow-sm)", ...styles }}>
      <h3 style={{ fontSize: 24, fontWeight: 700 }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22 }}>
        {points.map((p) => (
          <div key={p} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <Icon name="check-circle-2" style={{ color: iconColor, flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0, color: "hsl(215 25% 25%)" }}>{p}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MktComparison({ copy }) {
  return (
    <section id="about">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">{copy.whyEyebrow}</div>
          <h2>{copy.whyTitle}</h2>
          <p>{copy.whyDescription}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 48 }}>
          <ComparisonPanel title={copy.messyTitle} points={copy.messyPoints} tone="rose" />
          <ComparisonPanel title={copy.kibegiWayTitle} points={copy.kibegiWayPoints} tone="teal" />
        </div>
      </div>
    </section>
  );
}

function MktShowcase({ copy }) {
  const b = copy.showcaseBlock;
  return (
    <section>
      <div className="container">
        <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, padding: 36, alignItems: "center", borderRadius: 32 }}>
          <div>
            <div className="eyebrow" style={{ letterSpacing: ".22em" }}>{b.label}</div>
            <h3 style={{ fontSize: 28, fontWeight: 700, marginTop: 14 }}>{b.title}</h3>
            <p style={{ fontSize: 15.5, lineHeight: 1.7, color: "var(--fg2)", marginTop: 12 }}>{b.description}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
              {b.points.map((p) => (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14.5, color: "hsl(215 25% 25%)" }}>
                  <Icon name="check-circle-2" style={{ color: "var(--primary)", width: 16, height: 16 }} /><span>{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderRadius: 28, border: "1px solid hsl(215 25% 88% / .7)", background: "hsl(210 40% 96% / .7)", padding: 20 }}>
            <FolderPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

function FolderPreview() {
  const items = [["Algorithms Notes", "Semester files", 0], ["Past Paper 2024", "Exam prep", 1], ["Lecture Slides", "Semester files", 0]];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".2em", color: "var(--fg2)" }}>Resources</span>
        <span className="pill" style={{ fontSize: 10.5 }}>12 files</span>
      </div>
      {items.map(([name, sub, active]) => (
        <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", borderRadius: 16, padding: 12, boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ borderRadius: 12, padding: 8, background: active ? "hsl(187 85% 43% / .1)" : "var(--muted)", color: active ? "var(--primary)" : "var(--fg2)", display: "flex" }}>
              <Icon name="folder-open" style={{ width: 16, height: 16 }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: 12, color: "var(--fg2)" }}>{sub}</div>
            </div>
          </div>
          <div style={{ width: 64, height: 8, borderRadius: 9999, background: "var(--muted)" }}>
            <div style={{ width: active ? 48 : 36, height: 8, borderRadius: 9999, background: active ? "var(--primary)" : "var(--border)" }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MktFinalCTA({ copy }) {
  return (
    <section style={{ paddingBottom: 96 }}>
      <div className="container" style={{ maxWidth: 980 }}>
        <div className="card" style={{ borderRadius: 34, border: "1px solid hsl(187 85% 43% / .25)", padding: "56px 48px", textAlign: "center", boxShadow: "0 25px 80px -35px rgba(8,47,73,.35)" }}>
          <span className="pill" style={{ textTransform: "uppercase", letterSpacing: ".22em", color: "var(--primary)", fontSize: 11, fontWeight: 700, padding: "5px 16px" }}>{copy.finalCtaEyebrow}</span>
          <h2 style={{ fontWeight: 900, fontSize: 44, marginTop: 16, maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>{copy.finalCtaTitle}</h2>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: "var(--fg2)", marginTop: 16, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>{copy.finalCtaDescription}</p>
          <div style={{ marginTop: 30 }}>
            <button className="btn btn-hero btn-lg">{copy.finalCtaButton} <Icon name="arrow-right" /></button>
          </div>
          <p className="muted" style={{ fontSize: 14, fontWeight: 500, marginTop: 16 }}>{copy.finalCtaHelper}</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 22 }}>
            {copy.finalTrustItems.map((t) => (
              <span key={t} style={{ borderRadius: 9999, border: "1px solid hsl(215 25% 88% / .7)", background: "hsl(210 40% 96% / .7)", padding: "8px 16px", fontSize: 13.5, color: "var(--fg2)" }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MktFooter({ copy }) {
  return (
    <footer style={{ borderTop: "1px solid hsl(215 25% 88% / .7)", background: "rgba(255,255,255,.7)", padding: "48px 0", backdropFilter: "blur(4px)" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 40 }}>
        <div>
          <div className="brand"><img src={LOGO} alt="Kibegi" style={{ width: 40, height: 40 }} /><div><div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>Kibegi</div><div style={{ fontSize: 13, color: "var(--fg2)" }}>{copy.footerTagline}</div></div></div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--fg2)", marginTop: 16, maxWidth: 320 }}>{copy.footerDescription}</p>
        </div>
        <FooterCol title={copy.footerProductTitle} links={copy.footerProductLinks} />
        <FooterCol title={copy.footerCompanyTitle} links={copy.footerCompanyLinks} />
      </div>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, borderTop: "1px solid hsl(215 25% 88% / .7)", marginTop: 36, paddingTop: 24, fontSize: 13.5, color: "var(--fg2)" }}>
        <span>© {new Date().getFullYear()} Kibegi. {copy.footerCopyright}</span>
        <span>{copy.footerPoweredBy} <strong style={{ color: "var(--fg1)" }}>camelTech</strong></span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".2em", color: "var(--fg2)" }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
        {links.map((l) => <a key={l} style={{ fontSize: 14, color: "var(--fg2)", textDecoration: "none", cursor: "pointer" }}>{l}</a>)}
      </div>
    </div>
  );
}

Object.assign(window, { MktNavbar, MktHero, MktFeatures, MktComparison, MktShowcase, MktFinalCTA, MktFooter, Icon });
