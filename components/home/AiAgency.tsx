"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STEPS = [
  { b: "Custom AI agents for support, sales and ops", s: "Agents trained on your product and policies, handing anything sensitive to a person." },
  { b: "Workflow automation that connects your tools", s: "Forms, CRM, chat, billing and spreadsheets talking to each other without copy and paste." },
  { b: "AI-assisted content, campaigns and listings", s: "Drafts for posts, ads and product listings in your voice, ready for your review." },
  { b: "Data-driven dashboards for faster decisions", s: "The numbers that matter, refreshed automatically and explained in plain language." },
];
const META = [
  ["zariva agent · support", "Sensitive cases go to a person"],
  ["zariva agent · workflow", "Runs on every new lead"],
  ["zariva agent · content", "Nothing publishes without approval"],
  ["zariva agent · insights", "Refreshed every morning"],
];

function Approve({ label }: { label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button className={`btn btn--dark approve${done ? " done" : ""}`} type="button" onClick={() => setDone(true)}>
      {done ? "Approved ✓" : <>{label} <span className="arr">→</span></>}
    </button>
  );
}

function Flow() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(4); return; }
    const t = setInterval(() => setN(x => (x + 1) % 5), 900);
    return () => clearInterval(t);
  }, []);
  const nodes = [["Trigger", "Web form"], ["Enrich", "AI scoring"], ["Sync", "CRM"], ["Notify", "Sales chat"]];
  return (
    <div className="flow">
      {nodes.map(([k, v], i) => (
        <span key={k} style={{ display: "contents" }}>
          {i > 0 && <i className="flow__wire" />}
          <div className={`flow__node${i < n ? " on" : ""}`}><span>{k}</span>{v}</div>
        </span>
      ))}
    </div>
  );
}

const SCENES = [
  <>
    <div className="msg"><div className="msg__who"><span className="av">NR</span><b>Neha Rao</b><span className="mono small muted t">09:12</span></div><p>Can I move my clinic subscription to annual billing and get last month refunded?</p></div>
    <ul className="steps-log"><li>checked plan · Clinic Pro, monthly</li><li>annual switch allowed · refund needs finance approval</li><li>drafted reply · routed refund to a person</li></ul>
    <div className="draft"><div className="draft__top mono small"><span>Reply drafted</span><span className="stamp">Needs you</span></div><p>Hi Neha, I&apos;ve switched you to annual billing from your next cycle. For last month&apos;s refund, I&apos;ve passed it to our finance team, and they&apos;ll confirm within one working day.</p></div>
    <Approve label="Approve and send" />
  </>,
  <>
    <p className="mono small muted">New lead from your website</p>
    <Flow />
    <ul className="steps-log"><li>Lead: Sunrise Hospitals · 240 beds · fit 91</li><li>Deal created in CRM · owner assigned</li><li>Sales team pinged with a call brief</li></ul>
    <p className="insight">Before: 4 manual steps and a spreadsheet. Now: done in 6 seconds.</p>
  </>,
  <>
    <p className="mono small muted">Marketplace listing · draft 2 of 3</p>
    <div className="listing"><div className="listing__img" /><div><h4>MediCore HMS · Cloud hospital software</h4><p>Run OPD, wards, pharmacy and billing from one dashboard. Set up in a week, with training for your staff.</p></div></div>
    <div className="tagrow"><span>Hospital software</span><span>Clinic billing</span><span>OPD management</span></div>
    <div className="draft"><div className="draft__top mono small"><span>Also drafted</span><span className="stamp">Review</span></div><p>3 LinkedIn posts · 2 search ads · 1 email to past enquiries, all in your brand voice.</p></div>
    <Approve label="Approve all" />
  </>,
  <>
    <div className="dash"><div><span>Revenue</span><b>₹38.4L</b><em>+12% MoM</em></div><div><span>New leads</span><b>412</b><em>+18%</em></div><div><span>Tickets solved</span><b>1,240</b><em>82% by AI</em></div></div>
    <svg className="spark" viewBox="0 0 300 70" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60 L30 55 L60 58 L90 46 L120 48 L150 38 L180 40 L210 28 L240 30 L270 18 L300 10" /></svg>
    <p className="insight">Leads from search grew fastest this month. Shifting 10% of paid budget there could add about 30 leads.</p>
  </>,
];

export default function AiAgency() {
  const [i, setI] = useState(0);
  return (
    <section id="ai-agency" className="sec">
      <div className="wrap">
        <div data-reveal>
          <p className="kicker mono"><i />AI agency</p>
          <h2 className="h2">Put AI to work <span className="soft">across your business.</span></h2>
          <p className="sub">We don&apos;t just talk about AI. We build the agents that run inside your operation, from the first customer reply to internal reporting.</p>
        </div>
        <div className="ap" data-reveal>
          <div className="ap__steps" role="tablist" aria-label="AI capabilities">
            {STEPS.map((s, k) => (
              <button key={s.b} role="tab" aria-selected={i === k} onClick={() => setI(k)}><b>{s.b}</b><span>{s.s}</span></button>
            ))}
          </div>
          <div className="relative ap__winwrap">
          <div className="win ap__win">
            <div className="win__bar mono small"><span>{META[i][0]}</span><span className="live"><i />Running</span></div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={i} className="ap__body" aria-live="polite"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                {SCENES[i]}
              </motion.div>
            </AnimatePresence>
            <div className="win__foot mono small"><span>Example data</span><span>{META[i][1]}</span></div>
          </div>
          </div>
        </div>
        <a className="tlink" href="#contact">Explore AI agency <span className="arr">→</span></a>
      </div>
    </section>
  );
}
