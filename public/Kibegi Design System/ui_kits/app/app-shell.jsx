// Kibegi App — shell components (top nav, slide-in sidebar, bottom nav)
const LOGO_APP = "../../assets/kibegi-logo.png";
function AIcon({ name, style }) { return <i data-lucide={name} style={style}></i>; }

function AppTopNav({ user, onMenu, onTab, lang, setLang, theme, setTheme }) {
  return (
    <nav className="topnav">
      <div className="app-container topnav-inner">
        <button className="menu-btn" onClick={onMenu}>
          <AIcon name="menu" />
          <span className="brandtxt"><b>Kibegi</b><small>{user.role}</small></span>
        </button>
        <div className="searchbar">
          <AIcon name="search" />
          <input placeholder={lang === "en" ? "Search files, users, classes…" : "Tafuta faili, watumiaji, madarasa…"} />
        </div>
        <div className="topnav-right">
          <button className="icon-btn" title="Theme" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            <AIcon name={theme === "light" ? "moon" : "sun"} />
          </button>
          <button className="icon-btn" title="Language" onClick={() => setLang(lang === "en" ? "sw" : "en")} style={{ fontSize: 20 }}>
            {lang === "en" ? "🇹🇿" : "🇺🇸"}
          </button>
          <button className="icon-btn" title="Notifications" onClick={() => onTab("notifications")}>
            <AIcon name="bell" />
            <span className="badge-dot">3</span>
          </button>
          <div className="avatar" onClick={() => onTab("profile")}>{user.initials}</div>
        </div>
      </div>
    </nav>
  );
}

function AppSidebar({ open, onClose, user, onTab, onLogout, lang }) {
  const menu = [
    ["home", lang === "en" ? "Home" : "Nyumbani", "dashboard"],
    ["folder-open", lang === "en" ? "Files" : "Faili", "files"],
    ["graduation-cap", lang === "en" ? "Classes" : "Madarasa", "classes"],
    ["users", lang === "en" ? "Friends" : "Marafiki", "friends"],
    ["share-2", lang === "en" ? "Sharing" : "Kushiriki", "sharing"],
    ["calendar-days", lang === "en" ? "Schedule" : "Ratiba", "schedule"],
    ["trash-2", lang === "en" ? "Trash" : "Takataka", "trash"],
    ["settings", lang === "en" ? "Settings" : "Mipangilio", "settings"],
  ];
  const info = [
    ["info", lang === "en" ? "About" : "Kuhusu Kibegi"],
    ["book-open", lang === "en" ? "How to Use" : "Jinsi ya Kutumia"],
    ["shield-check", lang === "en" ? "Privacy" : "Faragha"],
    ["mail", lang === "en" ? "Contact Us" : "Wasiliana Nasi"],
  ];
  const go = (tab) => { if (tab) onTab(tab); onClose(); };
  return (
    <React.Fragment>
      <div className={"overlay" + (open ? " open" : "")} onClick={onClose}></div>
      <aside className={"sheet" + (open ? " open" : "")}>
        <div className="sheet-head">
          <div className="avatar" style={{ width: 46, height: 46, fontSize: 16 }}>{user.initials}</div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22 }}>Kibegi</div>
            <div style={{ fontSize: 13, color: "var(--fg2)" }}>{user.name}</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div className="sheet-sec">
            <h5>Menu</h5>
            {menu.map(([icon, label, tab]) => (
              <div key={label} className="sheet-link" onClick={() => go(tab)}>
                <span className="l"><AIcon name={icon} />{label}</span>
                <AIcon name="chevron-right" style={{ width: 16, height: 16 }} />
              </div>
            ))}
          </div>
          <div className="divider"></div>
          <div className="sheet-sec">
            <h5>{lang === "en" ? "Information" : "Taarifa"}</h5>
            {info.map(([icon, label]) => (
              <div key={label} className="sheet-link" onClick={onClose}>
                <span className="l"><AIcon name={icon} />{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="divider"></div>
        <div style={{ padding: 16 }}>
          <button className="btn btn-ghost btn-block" style={{ justifyContent: "flex-start", color: "var(--destructive)", height: 44 }} onClick={onLogout}>
            <AIcon name="log-out" /> {lang === "en" ? "Log out" : "Toka"}
          </button>
        </div>
      </aside>
    </React.Fragment>
  );
}

function AppBottomNav({ tab, onTab, lang }) {
  const items = [
    ["graduation-cap", lang === "en" ? "Classes" : "Madarasa", "classes"],
    ["calendar-days", lang === "en" ? "Schedule" : "Ratiba", "schedule"],
    ["home", lang === "en" ? "Home" : "Nyumbani", "dashboard", true],
    ["shopping-bag", lang === "en" ? "Market" : "Soko", "marketplace"],
    ["user", lang === "en" ? "Profile" : "Wasifu", "profile"],
  ];
  return (
    <nav className="bottomnav">
      <div className="bottomnav-inner">
        {items.map(([icon, label, t, center]) => center ? (
          <button key={t} className="bn-center" onClick={() => onTab(t)} title={label}><AIcon name={icon} /></button>
        ) : (
          <button key={t} className={"bn-item" + (tab === t ? " active" : "")} onClick={() => onTab(t)}>
            <AIcon name={icon} /><span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

Object.assign(window, { AppTopNav, AppSidebar, AppBottomNav, AIcon, LOGO_APP });
