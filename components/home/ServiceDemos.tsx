"use client";

import { useEffect, useState } from "react";

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
const reduced = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- SaaS: product switcher ---------------- */
const SAAS = [
  { label: "Hospital", title: "MediCore · Hospital management", nav: ["Dashboard", "Patients", "OPD", "Pharmacy", "Billing", "Staff"],
    kpis: [["184", "Beds occupied"], ["326", "OPD today"], ["₹4.2L", "Billed today"]],
    rows: [["Ward B · 3 discharges pending", "Due 2 pm", "grow"], ["Pharmacy · stock synced", "Live", "live"], ["Dr. Mehra · 14 appointments", "On time", "ok"]] },
  { label: "Real estate", title: "Estatly · Real estate CRM", nav: ["Dashboard", "Listings", "Leads", "Site visits", "Bookings", "Brokers"],
    kpis: [["62", "Active listings"], ["148", "New leads"], ["9", "Bookings"]],
    rows: [["Tower C · 2BHK site visit", "Today 4 pm", "grow"], ["Lead routing to brokers", "Live", "live"], ["Booking #218 · documents", "Verified", "ok"]] },
  { label: "HR tech", title: "Peoplely · HR tech suite", nav: ["Dashboard", "Employees", "Hiring", "Attendance", "Payroll", "Reviews"],
    kpis: [["412", "Employees"], ["18", "Open roles"], ["97%", "Attendance"]],
    rows: [["Payroll run · October", "Ready", "ok"], ["Attendance sync · 3 offices", "Live", "live"], ["6 interviews scheduled", "This week", "grow"]] },
];
export function SaasDemo() {
  const [i, setI] = useState(0);
  const d = SAAS[i];
  return (
    <>
      <div className="chips" role="group" aria-label="Product type">
        {SAAS.map((s, k) => <button key={s.label} className="chip-btn" aria-pressed={i === k} onClick={() => setI(k)}>{s.label}</button>)}
      </div>
      <div className="app card">
        <aside className="app__side mono small">{d.nav.map((n, k) => <span key={n} className={k === 0 ? "on" : ""}>{n}</span>)}</aside>
        <div className="app__main" key={i}>
          <p className="app__title">{d.title}</p>
          <div className="kpis">{d.kpis.map(([v, l]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}</div>
          <div className="rows">{d.rows.map(([t, s, c]) => <div key={t}><span>{t}</span><em className={`st st--${c}`}>{s}</em></div>)}</div>
        </div>
      </div>
    </>
  );
}

/* ---------------- AI agency: support chat ---------------- */
const CHAT: [string, string][] = [
  ["user", "Hi, my order #4821 says delivered but I haven’t received it."],
  ["tool", "looked up order #4821 · courier scan: left at reception"],
  ["ai", "Sorry about that. The courier marked it as left at your building reception at 11:40 today. Could you check there? If it isn’t there, I’ll raise a trace right away."],
  ["user", "Found it at reception. Thanks!"],
  ["ai", "Great, glad it turned up. I’ve closed this ticket. Anything else I can help with?"],
  ["tool", "ticket resolved · logged to CRM · no human needed"],
];
export function ChatDemo() {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    let alive = true;
    (async () => {
      if (reduced()) { setShown(CHAT.length); return; }
      while (alive) {
        setShown(0);
        for (let k = 0; k < CHAT.length && alive; k++) {
          if (CHAT[k][0] === "ai") { setTyping(true); await wait(1100); setTyping(false); }
          if (!alive) return;
          setShown(k + 1);
          await wait(CHAT[k][0] === "tool" ? 900 : 1500);
        }
        await wait(4000);
      }
    })();
    return () => { alive = false; };
  }, []);
  return (
    <div className="chat card">
      <div className="chat__head mono small"><span>Support agent</span><span className="live"><i />Online</span></div>
      <div className="chat__body">
        {CHAT.slice(0, shown).map(([who, text], k) => <div key={k} className={`bub bub--${who}`}>{text}</div>)}
        {typing && <div className="typing"><i /><i /><i /></div>}
      </div>
    </div>
  );
}

/* ---------------- CRM & ERP: deal moves to won, ERP syncs ---------------- */
const SYNC = ["Deal won → sales order created in ERP", "Invoice drafted · awaiting finance approval", "Onboarding tasks assigned to delivery team"];
export function KanbanDemo() {
  const [won, setWon] = useState(false);
  const [logs, setLogs] = useState(0);
  useEffect(() => {
    let alive = true;
    (async () => {
      if (reduced()) { setWon(true); setLogs(SYNC.length); return; }
      while (alive) {
        setWon(false); setLogs(0); await wait(1200);
        if (!alive) return;
        setWon(true);
        for (let k = 1; k <= SYNC.length && alive; k++) { await wait(800); setLogs(k); }
        await wait(3500);
      }
    })();
    return () => { alive = false; };
  }, []);
  const card = <div className={`kc kc--move${won ? " won" : ""}`}>Sunrise Hospitals<span className="mono small">₹18L</span></div>;
  return (
    <>
      <div className="card kanban">
        <div className="kanban__col"><p className="mono small">Lead · 12</p><div className="kc">Apex Clinics</div><div className="kc">Northgate Realty</div></div>
        <div className="kanban__col"><p className="mono small">Qualified · 7</p><div className="kc">Brightpath HR</div></div>
        <div className="kanban__col"><p className="mono small">Proposal · 4</p>{!won && card}</div>
        <div className="kanban__col kanban__col--won"><p className="mono small">Won · 3</p>{won && card}<div className="kc">Metro Builders</div></div>
      </div>
      <ol className="sync mono small">{SYNC.map((s, k) => <li key={s} className={k < logs ? "on" : ""}>{s}</li>)}</ol>
    </>
  );
}

/* ---------------- Web & app: deploy log types out ---------------- */
const DEPLOY = ["$ zariva deploy --prod", "✓ build passed · 41 s", "✓ 128 tests green", "✓ live at yourbrand.com · score 98"];
export function DeployLog() {
  const [text, setText] = useState("");
  useEffect(() => {
    let alive = true;
    (async () => {
      if (reduced()) { setText(DEPLOY.join("\n")); return; }
      while (alive) {
        let out = "";
        for (const line of DEPLOY) {
          for (let k = 1; k <= line.length; k++) { if (!alive) return; setText(out + line.slice(0, k)); await wait(22); }
          out += line + "\n"; setText(out); await wait(400);
        }
        await wait(3500);
      }
    })();
    return () => { alive = false; };
  }, []);
  return <div className="term card"><p className="mono">{text}</p></div>;
}
