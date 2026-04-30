import { useState, useEffect, useRef } from "react";

// ─── Shared State Store (simulates a backend) ───────────────────────────────
const INITIAL_COMPLAINTS = [
  {
    id: "CMP-2038",
    userId: "user1",
    raw: "Garbage is not being collected from our colony for 10 days. The bins are overflowing and smell terrible. Dogs are spreading the garbage on the road. Health hazard for children. Request immediate action.",
    title: "Garbage collection failure in Wakad Colony",
    category: "Sanitation",
    location: "Wakad Colony",
    filed: "Mar 9, 2026",
    updated: "Mar 13, 2026",
    citizen: "Rahul Kulkarni",
    status: "Action Taken",
    summary: "Garbage collection services in Wakad Colony have been suspended for 10+ days. Overflowing bins pose health and sanitation risks, especially for children.",
    keyIssues: ["Waste collection suspended 10+ days", "Public health & sanitation risk", "Stray animal activity spreading waste"],
    duplicate: null,
    actionNote: "Sanitation team deployed Mar 13. Weekly schedule restored.",
    timeline: [
      { date: "Mar 13", msg: "Sanitation team deployed. Weekly schedule restored." },
      { date: "Mar 10", msg: "Complaint escalated to Sanitation Department." },
      { date: "Mar 9", msg: "Complaint received and logged." },
    ],
  },
  {
    id: "CMP-2033",
    userId: "user2",
    raw: "Street lights on Baner Road have been off for over a week. Very dangerous at night for pedestrians and motorists.",
    title: "Streetlight outage on Baner Road",
    category: "Electricity",
    location: "Baner Road",
    filed: "Mar 5, 2026",
    updated: "Mar 7, 2026",
    citizen: "Priya Sharma",
    status: "In Progress",
    summary: "Multiple streetlights on Baner Road have been non-functional for 7+ days, creating safety hazards for nighttime road users.",
    keyIssues: ["Safety hazard for pedestrians", "Lights non-functional 7+ days", "No response from MSEDCL"],
    duplicate: null,
    actionNote: "",
    timeline: [
      { date: "Mar 7", msg: "Forwarded to MSEDCL for electrical inspection." },
      { date: "Mar 5", msg: "Complaint received and logged." },
    ],
  },
];

const USERS = {
  user: { id: "user1", name: "Rahul Kulkarni", email: "rahul@citizen.in", role: "user", avatar: "RK", location: "Pimpri, Pune" },
  admin: { id: "admin1", name: "Anjali Deshmukh", email: "admin@pcmc.gov.in", role: "admin", avatar: "AD", dept: "PCMC Policy Intelligence" },
};

const CATEGORIES = ["Road & Infrastructure", "Water & Utilities", "Electricity", "Public Safety", "Sanitation", "Environment", "Other"];

const STATUS_META = {
  "New":          { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  icon: "🔵" },
  "Pending":      { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  icon: "⏳" },
  "In Progress":  { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  icon: "⚙️" },
  "Action Taken": { color: "#34d399", bg: "rgba(52,211,153,0.12)",  icon: "✅" },
  "Duplicate":    { color: "#9ca3af", bg: "rgba(156,163,175,0.12)", icon: "🔗" },
};

let complaintIdCounter = 2042;

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080a0f; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 4px; }
  .pproot { font-family: 'Plus Jakarta Sans', sans-serif; background: #080a0f; min-height: 100vh; color: #dde2f0; }

  /* Login */
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #080a0f; position: relative; overflow: hidden; }
  .login-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 80% 80%, rgba(16,185,129,0.07) 0%, transparent 60%); pointer-events: none; }
  .login-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
  .login-card { background: #0d1017; border: 1px solid #1a2030; border-radius: 20px; padding: 44px 40px; width: 420px; position: relative; z-index: 1; box-shadow: 0 32px 80px rgba(0,0,0,0.5); }
  .login-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; }
  .login-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg,#6366f1,#10b981); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .login-logo-text { font-size: 18px; font-weight: 800; color: #dde2f0; letter-spacing: -0.02em; }
  .login-logo-sub { font-size: 11px; color: #3d4a6a; letter-spacing: 0.1em; text-transform: uppercase; }
  .login-title { font-size: 22px; font-weight: 800; color: #dde2f0; margin-bottom: 6px; letter-spacing: -0.02em; }
  .login-sub { font-size: 13px; color: #4a566e; margin-bottom: 28px; }
  .role-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
  .role-tab { padding: 10px; border-radius: 10px; border: 1px solid #1a2030; background: #080a0f; color: #4a566e; font-size: 13px; font-weight: 600; cursor: pointer; text-align: center; transition: all 0.15s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .role-tab.active-citizen { border-color: #6366f1; background: rgba(99,102,241,0.1); color: #818cf8; }
  .role-tab.active-admin { border-color: #10b981; background: rgba(16,185,129,0.1); color: #34d399; }
  .login-field { margin-bottom: 16px; }
  .login-label { font-size: 11px; font-weight: 700; color: #4a566e; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 7px; }
  .login-input { width: 100%; background: #080a0f; border: 1px solid #1a2030; border-radius: 9px; padding: 11px 14px; color: #dde2f0; font-size: 14px; outline: none; transition: border-color 0.15s; font-family: 'Plus Jakarta Sans', sans-serif; }
  .login-input:focus { border-color: #6366f1; }
  .login-btn { width: 100%; padding: 13px; border-radius: 10px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; margin-top: 8px; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity 0.15s; letter-spacing: 0.02em; }
  .login-btn:hover { opacity: 0.9; }
  .login-hint { font-size: 12px; color: #2a3348; margin-top: 18px; text-align: center; }
  .login-hint b { color: #3d4a6a; }
  .login-err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #f87171; font-size: 12px; padding: 9px 12px; border-radius: 8px; margin-bottom: 14px; }

  /* App shell */
  .app-shell { display: flex; height: 100vh; overflow: hidden; }
  .sidebar { width: 234px; background: #0b0d14; border-right: 1px solid #141926; display: flex; flex-direction: column; flex-shrink: 0; overflow: hidden; }
  .sidebar-top { padding: 22px 20px 18px; border-bottom: 1px solid #141926; }
  .s-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 0; }
  .s-logo-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }
  .s-logo-name { font-size: 15px; font-weight: 800; letter-spacing: -0.02em; }
  .s-logo-role { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 1px; }
  .sidebar-nav { padding: 14px 10px; flex: 1; }
  .nav-section { font-size: 10px; color: #2a3348; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 0 10px 8px; margin-top: 10px; }
  .nav-item { display: flex; align-items: center; gap: 9px; padding: 9px 12px; border-radius: 9px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.12s; color: #4a566e; border: none; background: transparent; width: 100%; text-align: left; font-family: 'Plus Jakarta Sans', sans-serif; }
  .nav-item:hover { background: #141926; color: #8892aa; }
  .nav-item.active-u { background: rgba(99,102,241,0.1); color: #818cf8; }
  .nav-item.active-a { background: rgba(16,185,129,0.1); color: #34d399; }
  .nav-icon { font-size: 15px; width: 20px; text-align: center; }
  .sidebar-bottom { border-top: 1px solid #141926; padding: 14px 16px; }
  .user-chip { display: flex; align-items: center; gap: 10px; }
  .avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
  .user-chip-name { font-size: 13px; font-weight: 700; color: #8892aa; line-height: 1.2; }
  .user-chip-sub { font-size: 11px; color: #2a3348; }
  .logout-btn { margin-left: auto; background: transparent; border: none; color: #2a3348; cursor: pointer; font-size: 12px; padding: 4px 6px; border-radius: 5px; transition: color 0.12s; font-family: inherit; }
  .logout-btn:hover { color: #f87171; }

  /* Content */
  .content { flex: 1; overflow: auto; background: #080a0f; }
  .page { padding: 28px 32px; max-width: 900px; }
  .page-wide { padding: 0; max-width: none; display: flex; height: 100%; }

  /* Page headers */
  .ph { margin-bottom: 26px; }
  .ph-title { font-size: 22px; font-weight: 800; color: #dde2f0; letter-spacing: -0.02em; }
  .ph-sub { font-size: 13px; color: #3d4a6a; margin-top: 4px; }

  /* Stat cards */
  .stat-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 28px; }
  .stat-card { background: #0d1017; border: 1px solid #141926; border-radius: 12px; padding: 18px 20px; }
  .stat-num { font-size: 30px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
  .stat-lbl { font-size: 11px; color: #3d4a6a; margin-top: 4px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600; }

  /* Complaint cards */
  .c-card { background: #0d1017; border: 1px solid #141926; border-radius: 11px; padding: 16px 18px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
  .c-card:hover { border-color: #1e2a40; background: #0f1219; }
  .c-card.selected-u { border-color: rgba(99,102,241,0.5) !important; background: rgba(99,102,241,0.04) !important; }
  .c-card.selected-a { border-color: rgba(16,185,129,0.5) !important; background: rgba(16,185,129,0.04) !important; }
  .c-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .c-title { font-size: 14px; font-weight: 700; color: #dde2f0; margin-bottom: 4px; line-height: 1.4; }
  .c-meta { font-size: 11px; color: #3d4a6a; font-family: 'JetBrains Mono', monospace; }

  /* Status badge */
  .sbadge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0; }

  /* Detail panel */
  .detail-wrap { flex: 1; overflow: auto; padding: 26px 28px; }
  .detail-head { padding-bottom: 20px; margin-bottom: 22px; border-bottom: 1px solid #141926; }
  .detail-id { font-size: 11px; color: #3d4a6a; letter-spacing: 0.1em; font-family: 'JetBrains Mono', monospace; margin-bottom: 8px; text-transform: uppercase; }
  .detail-title { font-size: 18px; font-weight: 800; color: #dde2f0; letter-spacing: -0.02em; margin-bottom: 8px; line-height: 1.3; }
  .detail-meta { font-size: 12px; color: #3d4a6a; }
  .detail-section { margin-bottom: 22px; }
  .ds-title { font-size: 11px; font-weight: 700; color: #3d4a6a; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
  .raw-box { background: #0b0d14; border: 1px solid #141926; border-radius: 9px; padding: 14px 16px; font-size: 13px; color: #6b7a96; line-height: 1.75; font-style: italic; }
  .summary-box { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.18); border-radius: 9px; padding: 14px 16px; font-size: 13px; color: #c4cce0; line-height: 1.75; }
  .summary-box-a { background: rgba(16,185,129,0.05); border: 1px solid rgba(16,185,129,0.18); border-radius: 9px; padding: 14px 16px; font-size: 13px; color: #c4cce0; line-height: 1.75; }
  .issue-tag { display: inline-flex; align-items: center; gap: 5px; background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); color: #fbbf24; font-size: 12px; font-weight: 600; padding: 4px 11px; border-radius: 20px; margin: 0 6px 6px 0; }
  .dup-alert { background: rgba(156,163,175,0.07); border: 1px solid rgba(156,163,175,0.18); border-radius: 9px; padding: 12px 16px; font-size: 13px; color: #9ca3af; display: flex; align-items: center; gap: 9px; }

  /* Timeline */
  .timeline { border-left: 2px solid #141926; padding-left: 18px; margin-top: 4px; }
  .tl-item { margin-bottom: 15px; position: relative; }
  .tl-dot { position: absolute; left: -23px; top: 5px; width: 8px; height: 8px; border-radius: 50%; border: 2px solid #080a0f; }
  .tl-date { font-size: 11px; color: #3d4a6a; margin-bottom: 3px; font-family: 'JetBrains Mono', monospace; }
  .tl-msg { font-size: 13px; color: #8892aa; line-height: 1.5; }

  /* Info grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .info-cell { background: #0b0d14; border-radius: 8px; padding: 11px 13px; }
  .info-k { font-size: 10px; color: #3d4a6a; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px; }
  .info-v { font-size: 13px; color: #8892aa; font-weight: 600; }

  /* Forms */
  .form-card { background: #0d1017; border: 1px solid #141926; border-radius: 14px; padding: 28px; max-width: 580px; }
  .form-label { font-size: 11px; font-weight: 700; color: #4a566e; letter-spacing: 0.08em; text-transform: uppercase; display: block; margin-bottom: 7px; }
  .form-input { width: 100%; background: #080a0f; border: 1px solid #141926; border-radius: 8px; padding: 10px 13px; color: #dde2f0; font-size: 14px; outline: none; transition: border-color 0.15s; margin-bottom: 18px; font-family: 'Plus Jakarta Sans', sans-serif; }
  .form-input:focus { border-color: #6366f1; }
  .form-textarea { width: 100%; background: #080a0f; border: 1px solid #141926; border-radius: 8px; padding: 10px 13px; color: #dde2f0; font-size: 14px; outline: none; resize: vertical; min-height: 100px; margin-bottom: 18px; font-family: 'Plus Jakarta Sans', sans-serif; transition: border-color 0.15s; }
  .form-textarea:focus { border-color: #6366f1; }
  .form-select { width: 100%; background: #080a0f; border: 1px solid #141926; border-radius: 8px; padding: 10px 13px; color: #dde2f0; font-size: 14px; outline: none; margin-bottom: 18px; font-family: 'Plus Jakarta Sans', sans-serif; }

  /* Buttons */
  .btn-primary { background: #6366f1; color: #fff; border: none; border-radius: 9px; padding: 11px 22px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity 0.15s; letter-spacing: 0.02em; }
  .btn-primary:hover { opacity: 0.85; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-green { background: #10b981; color: #fff; border: none; border-radius: 9px; padding: 11px 22px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity 0.15s; }
  .btn-green:hover { opacity: 0.85; }
  .btn-green:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-ghost { background: transparent; border: 1px solid #141926; color: #4a566e; border-radius: 9px; padding: 11px 22px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.15s; }
  .btn-ghost:hover { border-color: #1e2a40; color: #8892aa; }
  .btn-danger { background: transparent; border: 1px solid rgba(248,113,113,0.25); color: #f87171; border-radius: 9px; padding: 11px 22px; font-weight: 700; font-size: 13px; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
  .btn-back { background: transparent; border: none; color: #3d4a6a; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; padding: 0 0 20px; display: flex; align-items: center; gap: 6px; }
  .btn-back:hover { color: #6b7a96; }

  /* Action note box */
  .action-done-box { background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); border-radius: 9px; padding: 13px 16px; font-size: 13px; color: #6ee7b7; line-height: 1.6; }

  /* Success screen */
  .success-screen { text-align: center; padding: 60px 32px; }
  .success-icon { font-size: 52px; margin-bottom: 18px; }

  /* Admin split layout */
  .admin-list-col { width: 340px; border-right: 1px solid #141926; display: flex; flex-direction: column; overflow: hidden; flex-shrink: 0; }
  .admin-list-stats { display: grid; grid-template-columns: repeat(4,1fr); background: #0b0d14; border-bottom: 1px solid #141926; }
  .als-cell { padding: 13px 0; text-align: center; }
  .als-n { font-size: 20px; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
  .als-l { font-size: 9px; color: #2a3348; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 700; margin-top: 2px; }
  .admin-filter-row { display: flex; gap: 6px; padding: 12px 14px; border-bottom: 1px solid #141926; overflow-x: auto; flex-shrink: 0; }
  .filter-pill { background: #0b0d14; border: 1px solid #141926; color: #4a566e; border-radius: 20px; padding: 5px 12px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.12s; }
  .filter-pill:hover { border-color: #1e2a40; color: #6b7a96; }
  .filter-pill.fp-active { border-color: #10b981; background: rgba(16,185,129,0.1); color: #34d399; }
  .admin-list-scroll { flex: 1; overflow: auto; padding: 12px; }
  .admin-detail-col { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
  .admin-detail-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #2a3348; }
  .spinning { display: inline-block; animation: spin 0.8s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .new-dot { width: 7px; height: 7px; border-radius: 50%; background: #60a5fa; display: inline-block; margin-right: 5px; animation: pulse 1.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  .processing-bar { display: flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #818cf8; margin-bottom: 14px; }
`;

// ─── Status Badge ─────────────────────────────────────────────────────────────
function SBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META["New"];
  return (
    <span className="sbadge" style={{ color: m.color, background: m.bg }}>
      {m.icon} {status}
    </span>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [role, setRole] = useState("citizen");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const CREDS = {
    citizen: { email: "rahul@citizen.in", pass: "citizen123" },
    admin:   { email: "admin@pcmc.gov.in", pass: "admin123" },
  };

  const handle = () => {
    const c = CREDS[role];
    if (email === c.email && pass === c.pass) {
      onLogin(role === "citizen" ? "user" : "admin");
    } else {
      setErr("Invalid credentials. Check hint below.");
    }
  };

  const fillDemo = () => {
    const c = CREDS[role];
    setEmail(c.email);
    setPass(c.pass);
    setErr("");
  };

  return (
    <div className="login-wrap">
      <div className="login-bg" />
      <div className="login-grid" />
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">⚖️</div>
          <div>
            <div className="login-logo-text">PolicyPulse</div>
            <div className="login-logo-sub">AI Policy Intelligence System</div>
          </div>
        </div>
        <div className="login-title">Welcome back</div>
        <div className="login-sub">Sign in to continue to your dashboard</div>

        <div className="role-tabs">
          <button
            className={`role-tab ${role === "citizen" ? "active-citizen" : ""}`}
            onClick={() => { setRole("citizen"); setErr(""); setEmail(""); setPass(""); }}
          >👤 Citizen</button>
          <button
            className={`role-tab ${role === "admin" ? "active-admin" : ""}`}
            onClick={() => { setRole("admin"); setErr(""); setEmail(""); setPass(""); }}
          >🔮 Admin</button>
        </div>

        {err && <div className="login-err">{err}</div>}

        <div className="login-field">
          <label className="login-label">Email</label>
          <input className="login-input" placeholder={role === "citizen" ? "rahul@citizen.in" : "admin@pcmc.gov.in"} value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="login-field">
          <label className="login-label">Password</label>
          <input className="login-input" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handle()} />
        </div>

        <button
          className="login-btn"
          style={{ background: role === "citizen" ? "#6366f1" : "#10b981", color: "#fff" }}
          onClick={handle}
        >
          Sign in as {role === "citizen" ? "Citizen" : "Admin"} →
        </button>

        <div className="login-hint" style={{ marginTop: 16 }}>
          <span style={{ cursor: "pointer", textDecoration: "underline", color: "#3d4a6a" }} onClick={fillDemo}>
            Use demo credentials
          </span>
          {email && <> · <b>{email}</b></>}
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ user, navItems, activeNav, setActiveNav, onLogout }) {
  const isAdmin = user.role === "admin";
  const accent = isAdmin ? "#10b981" : "#6366f1";
  const activeClass = isAdmin ? "active-a" : "active-u";

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="s-logo">
          <div className="s-logo-icon" style={{ background: isAdmin ? "linear-gradient(135deg,#10b981,#6366f1)" : "linear-gradient(135deg,#6366f1,#818cf8)" }}>
            {isAdmin ? "🔮" : "⚖️"}
          </div>
          <div>
            <div className="s-logo-name" style={{ color: accent }}>PolicyPulse</div>
            <div className="s-logo-role" style={{ color: isAdmin ? "#1d4e3a" : "#2d2f6a" }}>
              {isAdmin ? "Admin Command" : "Citizen Portal"}
            </div>
          </div>
        </div>
      </div>
      <div className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeNav === item.id ? activeClass : ""}`}
            onClick={() => setActiveNav(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            background: "transparent", border: "1px solid #1a2030", borderRadius: 9,
            color: "#4a566e", fontSize: 12, fontWeight: 700, padding: "9px 12px",
            cursor: "pointer", fontFamily: "inherit", marginBottom: 12,
            letterSpacing: "0.04em", transition: "all 0.15s",
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "#f87171"; e.currentTarget.style.color = "#f87171"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "#1a2030"; e.currentTarget.style.color = "#4a566e"; }}
        >
          <span>←</span> Back to Login
        </button>
        <div className="user-chip">
          <div className="avatar" style={{ background: isAdmin ? "linear-gradient(135deg,#10b981,#6366f1)" : "linear-gradient(135deg,#6366f1,#818cf8)", color: "#fff" }}>
            {user.avatar}
          </div>
          <div>
            <div className="user-chip-name">{user.name}</div>
            <div className="user-chip-sub">{isAdmin ? user.dept : user.location}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── User Dashboard ───────────────────────────────────────────────────────────
function UserDashboard({ complaints, onNewComplaint, onLogout }) {
  const [nav, setNav] = useState("mycomplaints");
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: "", category: "", location: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const user = USERS.user;

  // Only this user's complaints
  const myComplaints = complaints.filter(c => c.userId === user.id);
  const active = myComplaints.filter(c => c.status !== "Action Taken" && c.status !== "Duplicate").length;
  const resolved = myComplaints.filter(c => c.status === "Action Taken").length;

  // Sync selected if complaint updated
  useEffect(() => {
    if (selected) {
      const fresh = complaints.find(c => c.id === selected.id);
      if (fresh) setSelected(fresh);
    }
  }, [complaints]);

  const handleSubmit = () => {
    if (!form.title || !form.category || !form.description) return;
    const newC = {
      id: `CMP-${complaintIdCounter++}`,
      userId: user.id,
      raw: form.description,
      title: form.title,
      category: form.category,
      location: form.location || "Not specified",
      filed: "Mar 19, 2026",
      updated: "Mar 19, 2026",
      citizen: user.name,
      status: "New",
      summary: null,
      keyIssues: null,
      duplicate: null,
      actionNote: "",
      timeline: [{ date: "Mar 19", msg: "Complaint received and is pending review." }],
    };
    onNewComplaint(newC);
    setSubmitted(true);
  };

  const navItems = [
    { id: "mycomplaints", label: "My Complaints", icon: "📋" },
    { id: "file", label: "File Complaint", icon: "✍️" },
  ];

  return (
    <div className="app-shell">
      <Sidebar user={user} navItems={navItems} activeNav={nav} setActiveNav={(id) => { setNav(id); setSelected(null); setSubmitted(false); }} onLogout={onLogout} />
      <div className="content">
        {/* My Complaints */}
        {nav === "mycomplaints" && !selected && (
          <div className="page">
            <div className="ph">
              <div className="ph-title">My Complaints</div>
              <div className="ph-sub">Track status of your submitted civic complaints</div>
            </div>
            <div className="stat-row">
              <div className="stat-card">
                <div className="stat-num" style={{ color: "#60a5fa" }}>{myComplaints.length}</div>
                <div className="stat-lbl">Total Filed</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: "#fbbf24" }}>{active}</div>
                <div className="stat-lbl">Active</div>
              </div>
              <div className="stat-card">
                <div className="stat-num" style={{ color: "#34d399" }}>{resolved}</div>
                <div className="stat-lbl">Resolved</div>
              </div>
            </div>

            {myComplaints.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 0", color: "#2a3348" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "#3d4a6a" }}>No complaints yet</div>
                <div style={{ fontSize: 13 }}>File your first complaint using the sidebar.</div>
              </div>
            ) : (
              myComplaints.map(c => (
                <div key={c.id} className={`c-card ${selected?.id === c.id ? "selected-u" : ""}`} onClick={() => setSelected(c)}>
                  <div className="c-row">
                    <div>
                      <div className="c-title">{c.title}</div>
                      <div className="c-meta">{c.id} · {c.category} · Filed {c.filed}</div>
                    </div>
                    <SBadge status={c.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Complaint Detail */}
        {nav === "mycomplaints" && selected && (
          <div className="page">
            <button className="btn-back" onClick={() => setSelected(null)}>← Back to complaints</button>
            <div className="detail-head">
              <div className="detail-id">{selected.id} · {selected.category}</div>
              <div className="c-row">
                <div className="detail-title">{selected.title}</div>
                <SBadge status={selected.status} />
              </div>
              <div className="detail-meta">📍 {selected.location} · Filed {selected.filed} · Last updated {selected.updated}</div>
            </div>

            <div className="detail-section">
              <div className="info-grid">
                {[["Filed", selected.filed], ["Last Updated", selected.updated], ["Category", selected.category], ["Location", selected.location]].map(([k, v]) => (
                  <div key={k} className="info-cell"><div className="info-k">{k}</div><div className="info-v">{v}</div></div>
                ))}
              </div>
            </div>

            {selected.summary && (
              <div className="detail-section">
                <div className="ds-title">Summary (AI Processed)</div>
                <div className="summary-box">{selected.summary}</div>
              </div>
            )}

            {selected.status === "Action Taken" && selected.actionNote && (
              <div className="detail-section">
                <div className="ds-title">Action Taken by Authority</div>
                <div className="action-done-box">✅ {selected.actionNote}</div>
              </div>
            )}

            {selected.status === "Duplicate" && selected.duplicate && (
              <div className="detail-section">
                <div className="ds-title">Status Note</div>
                <div className="dup-alert">🔗 Your complaint has been merged with {selected.duplicate} which covers the same issue.</div>
              </div>
            )}

            <div className="detail-section">
              <div className="ds-title">Activity Timeline</div>
              <div className="timeline">
                {selected.timeline.map((t, i) => (
                  <div key={i} className="tl-item">
                    <div className="tl-dot" style={{ background: i === 0 ? "#6366f1" : "#1e2a40" }} />
                    <div className="tl-date">{t.date}</div>
                    <div className="tl-msg">{t.msg}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* File Complaint */}
        {nav === "file" && !submitted && (
          <div className="page">
            <div className="ph">
              <div className="ph-title">File a New Complaint</div>
              <div className="ph-sub">Submit your civic issue to the relevant authority</div>
            </div>
            <div className="form-card">
              <label className="form-label">Complaint Title</label>
              <input className="form-input" placeholder="e.g. Broken footpath near school..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="Ward, Sector, Landmark..." value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Describe the issue in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <button className="btn-primary" onClick={handleSubmit} disabled={!form.title || !form.category || !form.description}>
                Submit Complaint →
              </button>
            </div>
          </div>
        )}

        {nav === "file" && submitted && (
          <div className="page">
            <div className="success-screen">
              <div className="success-icon">✅</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#34d399", marginBottom: 8 }}>Complaint Filed Successfully</div>
              <div style={{ fontSize: 13, color: "#3d4a6a", maxWidth: 360, margin: "0 auto 24px", lineHeight: 1.7 }}>
                Your complaint has been received and will appear in the Admin dashboard for review. You can track its status in "My Complaints".
              </div>
              <button className="btn-primary" onClick={() => { setNav("mycomplaints"); setSubmitted(false); setForm({ title: "", category: "", location: "", description: "" }); }}>
                Track My Complaints
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ complaints, onUpdateComplaint, onLogout }) {
  const [nav, setNav] = useState("complaints");
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [actionNote, setActionNote] = useState("");

  const user = USERS.admin;

  // Sync selected
  useEffect(() => {
    if (selected) {
      const fresh = complaints.find(c => c.id === selected.id);
      if (fresh) { setSelected(fresh); setActionNote(fresh.actionNote || ""); }
    }
  }, [complaints]);

  const filtered = filter === "All" ? complaints : complaints.filter(c => c.status === filter);

  const counts = {
    New: complaints.filter(c => c.status === "New").length,
    "In Progress": complaints.filter(c => c.status === "In Progress").length,
    "Action Taken": complaints.filter(c => c.status === "Action Taken").length,
    Duplicate: complaints.filter(c => c.status === "Duplicate").length,
  };

  const callClaude = async (prompt) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.map(b => b.text || "").join("") || "";
  };

  const processAI = async (c) => {
    setLoading(true);
    setLoadingStep("Summarizing complaint...");
    try {
      const raw = await callClaude(
        `You are an AI assistant for a civic complaint management system. Analyze this raw complaint and return ONLY valid JSON (no markdown, no backticks):
{"summary":"2-3 sentence plain English summary","keyIssues":["issue1","issue2","issue3"],"possibleDuplicate":false}

Raw complaint: "${c.raw}"`
      );
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      const updates = {
        summary: parsed.summary,
        keyIssues: parsed.keyIssues,
        status: "In Progress",
        updated: "Mar 19, 2026",
        timeline: [
          { date: "Mar 19", msg: "AI analysis complete. Key issues identified. Routed to relevant department." },
          ...(c.timeline || []),
        ],
      };
      onUpdateComplaint(c.id, updates);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setLoadingStep("");
  };

  const markActionTaken = async (c) => {
    setLoading(true);
    setLoadingStep("Updating record...");
    await new Promise(r => setTimeout(r, 600));
    const note = actionNote.trim() || "Issue reviewed and resolved by the concerned department.";
    onUpdateComplaint(c.id, {
      status: "Action Taken",
      actionNote: note,
      updated: "Mar 19, 2026",
      timeline: [
        { date: "Mar 19", msg: `Action taken: ${note}` },
        ...(c.timeline || []),
      ],
    });
    setLoading(false);
    setLoadingStep("");
  };

  const markDuplicate = (c) => {
    onUpdateComplaint(c.id, {
      status: "Duplicate",
      updated: "Mar 19, 2026",
      timeline: [
        { date: "Mar 19", msg: "Marked as duplicate. Merged with existing complaint tracking." },
        ...(c.timeline || []),
      ],
    });
  };

  const navItems = [
    { id: "complaints", label: "All Complaints", icon: "📂" },
    { id: "analytics", label: "Overview", icon: "📊" },
  ];

  return (
    <div className="app-shell">
      <Sidebar user={user} navItems={navItems} activeNav={nav} setActiveNav={(id) => { setNav(id); setSelected(null); }} onLogout={onLogout} />
      <div className="content" style={{ display: "flex", flexDirection: "column" }}>
        {nav === "complaints" && (
          <div className="page-wide" style={{ flex: 1, overflow: "hidden" }}>
            {/* Left: List */}
            <div className="admin-list-col">
              <div className="admin-list-stats">
                {[["New", "#60a5fa"], ["Active", "#fbbf24"], ["Done", "#34d399"], ["Dup", "#9ca3af"]].map(([label, color], i) => {
                  const val = [counts.New, counts["In Progress"], counts["Action Taken"], counts.Duplicate][i];
                  return (
                    <div key={label} className="als-cell">
                      <div className="als-n" style={{ color }}>{val}</div>
                      <div className="als-l">{label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="admin-filter-row">
                {["All", "New", "In Progress", "Action Taken", "Duplicate"].map(f => (
                  <button key={f} className={`filter-pill ${filter === f ? "fp-active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
                ))}
              </div>
              <div className="admin-list-scroll">
                {filtered.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#2a3348", fontSize: 13 }}>No complaints found</div>
                )}
                {filtered.map(c => (
                  <div
                    key={c.id}
                    className={`c-card ${selected?.id === c.id ? "selected-a" : ""}`}
                    onClick={() => { setSelected(c); setActionNote(c.actionNote || ""); }}
                  >
                    <div className="c-row" style={{ marginBottom: 6 }}>
                      <div className="c-meta">{c.status === "New" && <span className="new-dot" />}{c.id} · {c.filed}</div>
                      <SBadge status={c.status} />
                    </div>
                    <div className="c-title">{c.title}</div>
                    <div className="c-meta" style={{ marginTop: 4 }}>👤 {c.citizen} · {c.category}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Detail */}
            <div className="admin-detail-col">
              {!selected ? (
                <div className="admin-detail-empty">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#2a3348", marginBottom: 6 }}>Select a complaint</div>
                  <div style={{ fontSize: 13 }}>Click any complaint to review and process it.</div>
                </div>
              ) : (
                <div className="detail-wrap">
                  {/* Header */}
                  <div className="detail-head">
                    <div className="detail-id">{selected.id} · {selected.category} · {selected.filed}</div>
                    <div className="c-row">
                      <div className="detail-title">{selected.title}</div>
                      <SBadge status={selected.status} />
                    </div>
                    <div className="detail-meta">👤 {selected.citizen} · 📍 {selected.location}</div>
                  </div>

                  {/* Raw */}
                  <div className="detail-section">
                    <div className="ds-title">Raw Complaint</div>
                    <div className="raw-box">"{selected.raw}"</div>
                  </div>

                  {/* AI Processing */}
                  {loading && (
                    <div className="processing-bar">
                      <span className="spinning">⚙️</span> {loadingStep}
                    </div>
                  )}

                  {!selected.summary && !loading && (
                    <div className="detail-section">
                      <div className="ds-title">AI Analysis</div>
                      <p style={{ fontSize: 13, color: "#3d4a6a", marginBottom: 12, lineHeight: 1.7 }}>
                        Process this complaint with AI to generate a summary, extract key issues, and detect potential duplicates.
                      </p>
                      <button className="btn-green" onClick={() => processAI(selected)} disabled={loading}>
                        ⚡ Process with AI
                      </button>
                    </div>
                  )}

                  {selected.summary && (
                    <>
                      <div className="detail-section">
                        <div className="ds-title">AI Summary</div>
                        <div className="summary-box-a">{selected.summary}</div>
                      </div>
                      <div className="detail-section">
                        <div className="ds-title">Key Issues Identified</div>
                        <div>{selected.keyIssues?.map(issue => (
                          <span key={issue} className="issue-tag">⚠ {issue}</span>
                        ))}</div>
                      </div>
                    </>
                  )}

                  {/* Duplicate */}
                  {selected.duplicate && (
                    <div className="detail-section">
                      <div className="ds-title">Duplicate Detection</div>
                      <div className="dup-alert">
                        🔗 Similar complaint detected: <strong style={{ color: "#c4cce0", marginLeft: 4 }}>{selected.duplicate}</strong>. Consider merging.
                      </div>
                      {selected.status !== "Duplicate" && (
                        <button className="btn-danger" style={{ marginTop: 10 }} onClick={() => markDuplicate(selected)}>
                          Mark as Duplicate
                        </button>
                      )}
                    </div>
                  )}

                  {/* Action */}
                  {selected.status !== "Duplicate" && (
                    <div className="detail-section">
                      <div className="ds-title">
                        {selected.status === "Action Taken" ? "Action Record" : "Mark Action Taken"}
                      </div>
                      {selected.status === "Action Taken" ? (
                        <div className="action-done-box">✅ {selected.actionNote || "Action has been taken on this complaint."}</div>
                      ) : (
                        <>
                          <textarea
                            className="form-textarea"
                            placeholder="Describe the action taken (this will be visible to the citizen)..."
                            value={actionNote}
                            onChange={e => setActionNote(e.target.value)}
                            style={{ marginBottom: 12 }}
                          />
                          <button className="btn-green" onClick={() => markActionTaken(selected)} disabled={loading}>
                            ✓ Mark Action Taken & Notify Citizen
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="detail-section">
                    <div className="ds-title">Activity Timeline</div>
                    <div className="timeline">
                      {(selected.timeline || []).map((t, i) => (
                        <div key={i} className="tl-item">
                          <div className="tl-dot" style={{ background: i === 0 ? "#10b981" : "#1e2a40" }} />
                          <div className="tl-date">{t.date}</div>
                          <div className="tl-msg">{t.msg}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {nav === "analytics" && (
          <div className="page">
            <div className="ph">
              <div className="ph-title">System Overview</div>
              <div className="ph-sub">Complaint pipeline analytics across all departments</div>
            </div>
            <div className="stat-row" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
              {[["Total", complaints.length, "#818cf8"], ["New", counts.New, "#60a5fa"], ["In Progress", counts["In Progress"], "#fbbf24"], ["Resolved", counts["Action Taken"], "#34d399"]].map(([l, n, c]) => (
                <div key={l} className="stat-card">
                  <div className="stat-num" style={{ color: c }}>{n}</div>
                  <div className="stat-lbl">{l}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#0d1017", border: "1px solid #141926", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #141926", fontSize: 12, fontWeight: 700, color: "#3d4a6a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Recent Complaints
              </div>
              {complaints.slice(0, 6).map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid #0f1219" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#8892aa", marginBottom: 2 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: "#2a3348", fontFamily: "JetBrains Mono, monospace" }}>{c.id} · {c.citizen}</div>
                  </div>
                  <SBadge status={c.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null); // null = login screen
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);

  const handleNewComplaint = (c) => {
    setComplaints(prev => [c, ...prev]);
  };

  const handleUpdateComplaint = (id, updates) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="pproot">
        {!role && <LoginScreen onLogin={setRole} />}
        {role === "user" && (
          <UserDashboard
            complaints={complaints}
            onNewComplaint={handleNewComplaint}
            onLogout={() => setRole(null)}
          />
        )}
        {role === "admin" && (
          <AdminDashboard
            complaints={complaints}
            onUpdateComplaint={handleUpdateComplaint}
            onLogout={() => setRole(null)}
          />
        )}
      </div>
    </>
  );
}
