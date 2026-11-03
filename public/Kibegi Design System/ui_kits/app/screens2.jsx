// Kibegi App — Files, Classes, and placeholder screens
function FilesScreen({ lang, onTab }) {
  const t = (en, sw) => lang === "en" ? en : sw;
  const [filter, setFilter] = React.useState("all");
  const tabs = [["all", t("All Files", "Zote")], ["mine", t("My Uploads", "Zangu")], ["shared", t("Shared", "Zilizoshirikiwa")]];
  const all = [
    ["Algorithms — Past Paper 2024.pdf", "PDF", "shared", "James Mollel", "2h", "1.2 MB"],
    ["Operating Systems — Lecture 6.pptx", "PPTX", "mine", "You", "5h", "4.8 MB"],
    ["Calculus II Revision Pack.pdf", "PDF", "mine", "You", "1d", "880 KB"],
    ["Networks Lab Manual.docx", "DOCX", "shared", "Asha Njau", "2d", "2.1 MB"],
    ["Database Notes — Week 6.pdf", "PDF", "shared", "James Mollel", "2d", "640 KB"],
    ["Discrete Math Tutorial.pdf", "PDF", "mine", "You", "3d", "1.5 MB"],
  ];
  const extColor = { PDF: "var(--destructive)", PPTX: "var(--secondary)", DOCX: "var(--primary)" };
  const shown = all.filter((f) => filter === "all" || f[2] === filter);
  return (
    <div className="app-container screen fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
        <div>
          <span className="pill">{t("Library", "Maktaba")}</span>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginTop: 10 }}>{t("Your Files", "Faili Zako")}</h1>
          <p className="muted" style={{ marginTop: 4 }}>{t("All your study materials, organized by class and subject.", "Vifaa vyako vyote, vimepangwa kwa darasa na somo.")}</p>
        </div>
        <button className="btn btn-hero btn-md" onClick={() => onTab("upload")}><AIcon name="cloud-upload" /> {t("Upload File", "Pakia Faili")}</button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 22 }}>
        {tabs.map(([k, label]) => (
          <button key={k} className={"btn btn-sm " + (filter === k ? "btn-hero" : "btn-outline")} onClick={() => setFilter(k)}>{label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 18 }}>
        {shown.map(([name, ext, kind, who, ago, size]) => (
          <div key={name} className="card" style={{ padding: 18, borderRadius: 22, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ borderRadius: 14, padding: 12, background: "hsl(187 85% 43% / .1)", color: "var(--primary)", display: "flex" }}><AIcon name="file-text" /></div>
              <span className="tag" style={{ color: extColor[ext] || "var(--fg2)", background: "hsl(210 40% 96%)" }}>{ext}</span>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.4 }}>{name}</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>{who} · {ago} · {size}</div>
            </div>
            <div style={{ display: "flex", gap: 8, borderTop: "1px solid hsl(215 25% 88% / .6)", paddingTop: 12 }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }}><AIcon name="eye" /> {t("Open", "Fungua")}</button>
              <button className="btn btn-outline btn-sm" style={{ width: 38, padding: 0 }}><AIcon name="share-2" /></button>
              <button className="btn btn-outline btn-sm" style={{ width: 38, padding: 0 }}><AIcon name="download" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassesScreen({ lang, onTab }) {
  const t = (en, sw) => lang === "en" ? en : sw;
  const classes = [
    ["Operating Systems 2026", "OS26X", 48, 132, true, "var(--primary)"],
    ["Data Structures & Algorithms", "DS204", 36, 89, true, "hsl(258 55% 50%)"],
    ["Calculus II", "MTH22", 52, 64, false, "var(--secondary)"],
    ["Computer Networks", "NET31", 41, 77, true, "hsl(160 60% 38%)"],
  ];
  return (
    <div className="app-container screen fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14 }}>
        <div>
          <span className="pill">{t("Communities", "Jumuiya")}</span>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginTop: 10 }}>{t("Your Classes", "Madarasa Yako")}</h1>
          <p className="muted" style={{ marginTop: 4 }}>{t("Subjects and study groups you've joined this semester.", "Masomo na vikundi ulivyojiunga semester hii.")}</p>
        </div>
        <button className="btn btn-hero btn-md" onClick={() => onTab("classes")}><AIcon name="plus" /> {t("Join Class", "Jiunge")}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18, marginTop: 22 }}>
        {classes.map(([name, code, members, files, verified, color]) => (
          <div key={code} className="card" style={{ padding: 22, borderRadius: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><AIcon name="graduation-cap" /></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{name}</div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                    {verified && <AIcon name="badge-check" style={{ width: 14, height: 14, color: "var(--accent)" }} />}
                    {verified ? t("Verified class", "Imethibitishwa") : t("Study group", "Kikundi cha masomo")}
                  </div>
                </div>
              </div>
              <span className="pill" style={{ letterSpacing: ".05em" }}>{code}</span>
            </div>
            <div style={{ display: "flex", gap: 22, marginTop: 18 }}>
              <Stat n={members} label={t("Members", "Wanachama")} icon="users" />
              <Stat n={files} label={t("Files", "Faili")} icon="folder-open" />
            </div>
            <button className="btn btn-outline btn-sm btn-block" style={{ marginTop: 16 }} onClick={() => onTab("files")}>{t("Open Class", "Fungua Darasa")} <AIcon name="arrow-right" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
function Stat({ n, label, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <AIcon name={icon} style={{ width: 16, height: 16, color: "var(--fg3)" }} />
      <span style={{ fontWeight: 700 }}>{n}</span>
      <span className="muted" style={{ fontSize: 13 }}>{label}</span>
    </div>
  );
}

function PlaceholderScreen({ tab, lang, onTab }) {
  const t = (en, sw) => lang === "en" ? en : sw;
  const map = {
    schedule: ["calendar-days", t("Timetable", "Ratiba"), t("Your weekly class schedule lives here.", "Ratiba yako ya wiki inakaa hapa.")],
    upload: ["cloud-upload", t("Upload a File", "Pakia Faili"), t("Drop notes, past papers, and handouts to your class library.", "Weka notes, past papers na handouts.")],
    marketplace: ["shopping-bag", t("Marketplace", "Soko"), t("Buy and sell study resources with other students.", "Nunua na uuze rasilimali za masomo.")],
    profile: ["user", t("Your Profile", "Wasifu Wako"), t("Manage your account, avatar, and preferences.", "Simamia akaunti yako na mapendeleo.")],
    notifications: ["bell", t("Notifications", "Arifa"), t("Class updates, shared files, and reminders.", "Taarifa za darasa, faili na vikumbusho.")],
    friends: ["users", t("Friends", "Marafiki"), t("Connect with classmates and share resources.", "Ungana na wanafunzi wenzako.")],
    sharing: ["share-2", t("Sharing", "Kushiriki"), t("Files you've shared and received.", "Faili ulizoshiriki na kupokea.")],
    trash: ["trash-2", t("Trash", "Takataka"), t("Recently deleted files, recoverable for 30 days.", "Faili zilizofutwa hivi karibuni.")],
    settings: ["settings", t("Settings", "Mipangilio"), t("Theme, language, privacy, and account settings.", "Mandhari, lugha, faragha na akaunti.")],
  };
  const [icon, title, desc] = map[tab] || ["sparkles", tab, ""];
  return (
    <div className="app-container screen fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: "hsl(187 85% 43% / .1)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
          <AIcon name={icon} style={{ width: 30, height: 30 }} />
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, marginTop: 18 }}>{title}</h2>
        <p className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>{desc}</p>
        <button className="btn btn-hero btn-md" style={{ marginTop: 20 }} onClick={() => onTab("dashboard")}><AIcon name="home" /> {t("Back to Dashboard", "Rudi Dashibodi")}</button>
      </div>
    </div>
  );
}

Object.assign(window, { FilesScreen, ClassesScreen, PlaceholderScreen });
