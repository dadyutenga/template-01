// Kibegi App — screens
const { useState: useStateS } = React;

function LoginScreen({ onLogin, lang, setLang }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative" }}>
      <div style={{ position: "absolute", top: 18, right: 20 }}>
        <button className="icon-btn" onClick={() => setLang(lang === "en" ? "sw" : "en")} style={{ fontSize: 20, background: "rgba(255,255,255,.7)" }}>{lang === "en" ? "🇹🇿" : "🇺🇸"}</button>
      </div>
      <div className="card fade-in" style={{ width: "100%", maxWidth: 440, padding: "36px 36px 30px", borderRadius: 24, boxShadow: "var(--shadow-xl)" }}>
        <div style={{ textAlign: "center" }}>
          <img src={LOGO_APP} alt="Kibegi" style={{ width: 52, height: 52, margin: "0 auto" }} />
          <h2 style={{ fontSize: 28, fontWeight: 700, marginTop: 14 }}>{lang === "en" ? "Welcome back" : "Karibu tena"}</h2>
          <p className="muted" style={{ fontSize: 15, marginTop: 6 }}>{lang === "en" ? "Sign in to your digital school bag" : "Ingia kwenye mfuko wako wa shule wa kidijitali"}</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label={lang === "en" ? "Email" : "Barua pepe"} type="email" placeholder="asha@university.ac.tz" defaultValue="asha.mwangi@udsm.ac.tz" />
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>{lang === "en" ? "Password" : "Nenosiri"}</label>
              <a style={{ fontSize: 13, color: "var(--primary)", cursor: "pointer" }}>{lang === "en" ? "Forgot password?" : "Umesahau?"}</a>
            </div>
            <input type="password" defaultValue="kibegi123" style={inputStyle} />
          </div>
          <button type="submit" className="btn btn-hero" style={{ height: 48, marginTop: 4 }}>{lang === "en" ? "Sign In" : "Ingia"}</button>
          <p className="muted" style={{ fontSize: 13.5, textAlign: "center", margin: 0 }}>
            {lang === "en" ? "Don't have an account? " : "Huna akaunti? "}
            <a style={{ color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}>{lang === "en" ? "Sign up" : "Jisajili"}</a>
          </p>
        </form>
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", height: 46, border: "1px solid var(--border)", borderRadius: 12, padding: "0 14px", fontSize: 16, fontFamily: "inherit", color: "var(--fg1)", boxSizing: "border-box", background: "#fff" };
function Field({ label, type, placeholder, defaultValue }) {
  return (
    <div>
      <label style={{ fontSize: 14, fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
      <input type={type} placeholder={placeholder} defaultValue={defaultValue} style={inputStyle} />
    </div>
  );
}

function DashboardScreen({ user, lang, onTab }) {
  const t = (en, sw) => lang === "en" ? en : sw;
  const stats = [
    { title: t("My Files", "Faili Zangu"), value: 24, hint: t("Stored study materials", "Vifaa vilivyohifadhiwa"), icon: "file-text", tint: "hsl(187 85% 43% / .1)", color: "var(--primary)", tab: "files" },
    { title: t("My Classes", "Madarasa Yangu"), value: 5, hint: t("Joined communities", "Jumuiya ulizojiunga"), icon: "graduation-cap", tint: "hsl(258 70% 60% / .12)", color: "hsl(258 55% 50%)", tab: "classes" },
    { title: t("Shared With Me", "Zilizoshirikiwa Nami"), value: 12, hint: t("Incoming resources", "Rasilimali zinazoingia"), icon: "share-2", tint: "hsl(160 70% 45% / .12)", color: "hsl(160 60% 32%)", tab: "files" },
  ];
  const today = [
    { title: "Operating Systems", desc: t("Class scheduled today", "Somo limepangwa leo"), meta: "10:00 AM – 11:30 AM", tone: "class", icon: "calendar-days" },
    { title: "Database Notes — Week 6.pdf", desc: t("Shared by James Mollel", "Imeshirikiwa na James Mollel"), meta: t("2h ago", "Saa 2 zilizopita"), tone: "share", icon: "share-2" },
  ];
  const files = [
    ["Algorithms — Past Paper 2024.pdf", t("Shared file", "Faili iliyoshirikiwa"), "James M.", "2h", "PDF"],
    ["Operating Systems — Lecture 6.pptx", t("Your upload", "Upakiaji wako"), "You", "5h", "PPTX"],
    ["Calculus II Revision Pack.pdf", t("Your upload", "Upakiaji wako"), "You", "1d", "PDF"],
    ["Networks Lab Manual.docx", t("Shared file", "Faili iliyoshirikiwa"), "Asha N.", "2d", "DOCX"],
  ];
  const classes = [
    ["Operating Systems 2026", 48, "OS26X", true],
    ["Data Structures", 36, "DS204", true],
    ["Calculus II", 52, "MTH22", false],
  ];
  const days = [["Mon", 2], ["Tue", 1], ["Wed", 3], ["Thu", 0], ["Fri", 2], ["Sat", 0], ["Sun", 0]];
  const todayIdx = 2;
  return (
    <div className="app-container screen fade-in">
      {/* greeting */}
      <section className="card" style={{ padding: 28 }}>
        <span className="pill">{t("Student Control Center", "Kituo cha Mwanafunzi")}</span>
        <h1 style={{ fontSize: 34, fontWeight: 900, marginTop: 12 }}>{t("Good morning", "Habari za asubuhi")}, {user.name.split(" ")[0]} 👋</h1>
        <p className="muted" style={{ marginTop: 6, fontSize: 15 }}>24 {t("files", "faili")} · 5 {t("classes", "madarasa")} · 1 {t("scheduled today", "limepangwa leo")}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 22 }}>
          <button className="btn btn-hero btn-md" style={{ justifyContent: "flex-start", borderRadius: 16, height: 56 }} onClick={() => onTab("upload")}><AIcon name="upload" /> {t("Upload File", "Pakia Faili")}</button>
          <button className="btn btn-outline btn-md" style={{ justifyContent: "flex-start", borderRadius: 16, height: 56 }} onClick={() => onTab("classes")}><AIcon name="users" /> {t("Join Class", "Jiunge na Darasa")}</button>
          <button className="btn btn-outline btn-md" style={{ justifyContent: "flex-start", borderRadius: 16, height: 56 }} onClick={() => onTab("schedule")}><AIcon name="calendar-days" /> {t("Create Timetable", "Unda Ratiba")}</button>
        </div>
      </section>

      {/* today + timetable */}
      <section style={{ display: "grid", gridTemplateColumns: "1.25fr 0.75fr", gap: 20, marginTop: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <CardHead title={t("Today", "Leo")} desc={t("See what matters today before you dive into your files.", "Ona kinachohitaji umakini leo.")} icon="bell-ring" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            {today.map((it) => (
              <div key={it.title} style={{ display: "flex", gap: 14, alignItems: "flex-start", border: "1px solid hsl(215 25% 88% / .7)", background: "hsl(210 40% 96% / .6)", borderRadius: 16, padding: 16 }}>
                <div style={{ borderRadius: 14, padding: 11, display: "flex", background: it.tone === "class" ? "hsl(187 85% 43% / .1)" : "hsl(160 70% 45% / .12)", color: it.tone === "class" ? "var(--primary)" : "hsl(160 60% 32%)" }}><AIcon name={it.icon} /></div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{it.title}</div>
                  <div className="muted" style={{ fontSize: 14, marginTop: 3 }}>{it.desc}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".14em", color: "var(--fg3)", marginTop: 7 }}>{it.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <CardHead title={t("Timetable", "Ratiba")} desc={t("A compact view of your week.", "Muonekano mfupi wa wiki yako.")} icon="clock-3" />
          <div style={{ borderRadius: 18, border: "1px solid hsl(187 85% 43% / .15)", background: "hsl(187 85% 43% / .05)", padding: 16, marginTop: 16 }}>
            <div className="eyebrow">{t("Next up", "Kinachofuata")}</div>
            <div style={{ fontWeight: 600, fontSize: 17, marginTop: 6 }}>Operating Systems</div>
            <div className="muted" style={{ fontSize: 14, marginTop: 2 }}>10:00 AM – 11:30 AM</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 7, marginTop: 14 }}>
            {days.map(([d, n], i) => (
              <div key={d} style={{ borderRadius: 12, border: "1px solid " + (i === todayIdx ? "hsl(187 85% 43% / .2)" : "hsl(215 25% 88% / .7)"), background: i === todayIdx ? "hsl(187 85% 43% / .1)" : "hsl(210 40% 96% / .6)", padding: "10px 4px", textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--fg2)" }}>{d}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 6 }}>{n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* stats */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 20 }}>
        {stats.map((s) => (
          <button key={s.title} className="stat-card" onClick={() => onTab(s.tab)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".18em", color: "var(--fg2)" }}>{s.title}</div>
                <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>{s.value}</div>
                <div className="muted" style={{ fontSize: 14, marginTop: 4 }}>{s.hint}</div>
              </div>
              <div style={{ borderRadius: 14, padding: 11, display: "flex", background: s.tint, color: s.color, boxShadow: "var(--shadow-sm)" }}><AIcon name={s.icon} /></div>
            </div>
          </button>
        ))}
      </section>

      {/* recent files + classes */}
      <section style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 20, marginTop: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <CardHeadAction title={t("Recent Files", "Faili za Hivi Karibuni")} action={t("View All", "Tazama Zote")} onAction={() => onTab("files")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            {files.map(([name, src, who, ago, ext]) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, border: "1px solid hsl(215 25% 88% / .7)", background: "hsl(210 40% 96% / .5)", borderRadius: 16, padding: 14 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                  <div className="chip"><AIcon name="file-text" /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 230 }}>{name}</div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{src} · {who} · {ago}</div>
                  </div>
                </div>
                <span className="tag">{ext}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <CardHeadAction title={t("Your Classes", "Madarasa Yako")} action={t("See Classes", "Tazama")} onAction={() => onTab("classes")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            {classes.map(([name, members, code, verified]) => (
              <div key={name} style={{ border: "1px solid hsl(215 25% 88% / .7)", background: "hsl(210 40% 96% / .5)", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{name}</div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>{members} {t("members", "wanachama")}</div>
                  </div>
                  <span className="pill" style={{ letterSpacing: ".05em" }}>{code}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: "var(--fg3)" }}>{verified ? t("Verified class", "Imethibitishwa") : t("Study group", "Kikundi")}</span>
                  <button className="btn btn-outline btn-sm" onClick={() => onTab("classes")}>{t("Open", "Fungua")}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function CardHead({ title, desc, icon }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
      <div>
        <h3 style={{ fontSize: 20 }}>{title}</h3>
        <p className="muted" style={{ fontSize: 14, marginTop: 5, lineHeight: 1.5, maxWidth: 320 }}>{desc}</p>
      </div>
      <div className="chip"><AIcon name={icon} /></div>
    </div>
  );
}
function CardHeadAction({ title, action, onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <h3 style={{ fontSize: 20 }}>{title}</h3>
      <button className="btn btn-ghost btn-sm" onClick={onAction} style={{ color: "var(--fg2)" }}>{action} <AIcon name="arrow-right" /></button>
    </div>
  );
}

Object.assign(window, { LoginScreen, DashboardScreen });
