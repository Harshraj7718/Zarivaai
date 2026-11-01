"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SaasDemo, ChatDemo, KanbanDemo, DeployLog } from "./ServiceDemos";
import { SERVICE_EVENT } from "@/lib/events";
import Doodles from "@/components/sketch/Doodles";

type Panel = { tab: string; step: string; title: string; body: string; get: string; link: [string, string]; demo: React.ReactNode };

const Stats = ({ items }: { items: [string, string][] }) => (
  <div className="stats">{items.map(([b, s]) => <div key={s}><b>{b}</b><span className="mono small">{s}</span></div>)}</div>
);
const Exd = () => <span className="mono small exd">Example data</span>;

const PANELS: Panel[] = [
  { tab: "SaaS engineering", step: "SaaS product engineering", title: "Custom platforms built to run your business.",
    body: "Hospital management, real estate and HR tech systems, designed around your workflows and built to scale with you.",
    get: "a product your team and customers use every day, on architecture ready for growth.", link: ["Start a SaaS build", "#contact"],
    demo: <><SaasDemo /><Exd /></> },
  { tab: "AI agency", step: "AI agency", title: "AI agents that work inside your operation.",
    body: "Custom agents and automation that handle support, sales ops and internal workflows around the clock, with your team in the loop.",
    get: "faster replies, fewer manual steps and people free for the work that needs them.", link: ["See the AI agency", "#ai-agency"],
    demo: <><ChatDemo /><Exd /></> },
  { tab: "Digital marketing", step: "Digital marketing", title: "Search and paid campaigns that bring in paying customers.",
    body: "SEO, paid campaigns and performance marketing, measured on leads and revenue rather than clicks.",
    get: "traffic that turns into customers, and reports that show where it came from.", link: ["Plan a campaign", "#contact"],
    demo: <>
      <div className="card chartcard">
        <div className="chartcard__head"><span>Organic + paid leads</span><span className="mono small muted">last 12 weeks</span></div>
        <svg viewBox="0 0 320 130" className="linechart" aria-hidden="true">
          <g className="gridlines"><line x1="0" y1="30" x2="320" y2="30" /><line x1="0" y1="65" x2="320" y2="65" /><line x1="0" y1="100" x2="320" y2="100" /></g>
          <path className="area" d="M0 112 L29 108 L58 104 L87 106 L116 96 L145 90 L174 84 L203 74 L232 66 L261 52 L290 44 L320 30 L320 130 L0 130Z" />
          <path className="line draw" d="M0 112 L29 108 L58 104 L87 106 L116 96 L145 90 L174 84 L203 74 L232 66 L261 52 L290 44 L320 30" />
          <path className="line line--2 draw" d="M0 120 L29 118 L58 116 L87 112 L116 110 L145 106 L174 104 L203 98 L232 94 L261 90 L290 84 L320 78" />
          <circle cx="320" cy="30" r="4" className="endpt" />
        </svg>
        <div className="legend mono small"><span><i className="lg1" />Organic</span><span><i className="lg2" />Paid</span></div>
      </div>
      <Stats items={[["+38%", "qualified leads"], ["−21%", "cost per lead"], ["Top 3", "for 14 keywords"]]} /><Exd />
    </> },
  { tab: "Social media", step: "Social media marketing & management", title: "Content and campaigns on every platform your audience uses.",
    body: "Planning, content, publishing and day-to-day community management, handled by one team that knows your brand.",
    get: "a consistent presence, every week, without managing it yourself.", link: ["Hand over your socials", "#contact"],
    demo: <>
      <div className="card cal">
        <div className="cal__head"><span>Content calendar</span><span className="mono small muted">this week</span></div>
        <div className="cal__grid">
          {[["Mon", [["p-ig", "Reel · launch teaser", "Published"]]], ["Tue", [["p-li", "Case study post", "Published"]]],
            ["Wed", [["p-x", "Thread · 5 tips", "Scheduled"], ["p-ig", "Story poll", "Scheduled"]]], ["Thu", [["p-yt", "Short · product demo", "In review"]]],
            ["Fri", [["p-li", "Founder note", "Drafting"]]]].map(([day, posts]) => (
            <div className="cal__day" key={day as string}><b className="mono small">{day as string}</b>
              {(posts as string[][]).map(([c, t, s]) => <span key={t} className={`post ${c}`}>{t} <em>{s}</em></span>)}
            </div>
          ))}
        </div>
      </div>
      <Stats items={[["5", "platforms"], ["14 posts", "this week"]]} /><Exd />
    </> },
  { tab: "CRM & ERP", step: "CRM & ERP systems", title: "Connected systems built around how your team works.",
    body: "Sales, operations and resourcing in one place, so a won deal becomes an order, an invoice and a task without anyone retyping it.",
    get: "one source of truth from first lead to final invoice.", link: ["Map your systems", "#contact"],
    demo: <><KanbanDemo /><Exd /></> },
  { tab: "Web & app", step: "Web & app development", title: "Websites and web apps, designed, built and shipped.",
    body: "From a landing page that converts to a full product with accounts, payments and an admin panel.",
    get: "a fast, maintainable site or app your team can keep improving.", link: ["Scope your build", "#contact"],
    demo: <>
      <div className="card browser">
        <div className="browser__bar"><i /><i /><i /><span className="mono small">yourbrand.com</span></div>
        <div className="browser__page">
          <div className="sk sk--h" /><div className="sk sk--p" /><div className="sk sk--p sk--short" />
          <div className="sk-row"><div className="sk sk--btn" /><div className="sk sk--btn sk--ghost" /></div>
          <div className="sk-grid"><div className="sk sk--card" /><div className="sk sk--card" /><div className="sk sk--card" /></div>
        </div>
      </div>
      <DeployLog /><Exd />
    </> },
  { tab: "Business operations", step: "Business process operations", title: "Trained teams running your support and back office.",
    body: "Customer support, data entry, order processing and operations, run by people trained on your product and backed by our AI tools.",
    get: "the day-to-day handled, so you can focus on growth.", link: ["Hand off operations", "#contact"],
    demo: <>
      <div className="card queue">
        <div className="queue__head"><span>Support queue</span><span className="mono small muted">today</span></div>
        <ul>
          <li><span className="av">AK</span><span>Refund request · order #4821</span><em className="st st--ok">Resolved</em></li>
          <li><span className="av">RS</span><span>Login issue · enterprise account</span><em className="st st--grow">In progress</em></li>
          <li><span className="av av--ai">AI</span><span>Shipping status · 34 tickets</span><em className="st st--live">Auto-answered</em></li>
          <li><span className="av">MP</span><span>Vendor invoices · 120 entries</span><em className="st st--ok">Processed</em></li>
        </ul>
        <div className="sla"><span className="mono small">Response time target</span><div className="sla__bar"><i style={{ "--v": 94 } as React.CSSProperties} /></div><span className="mono small">94% within 1 h</span></div>
      </div><Exd />
    </> },
  { tab: "Consulting & growth", step: "Consulting & product growth", title: "Strategy, listings and a growth plan you can act on.",
    body: "We find where growth is stuck, list your product where buyers look, and build a plan that takes you from idea to scale.",
    get: "a clear roadmap, owned with you and reviewed every month.", link: ["Book a strategy call", "#contact"],
    demo: <>
      <div className="card roadmap">
        <div className="roadmap__col"><p className="mono small">Now</p><span>Fix onboarding drop-off</span><span>List on 2 marketplaces</span></div>
        <div className="roadmap__col"><p className="mono small">Next</p><span>Launch referral program</span><span>Pricing page test</span></div>
        <div className="roadmap__col"><p className="mono small">Later</p><span>Enter second market</span><span>Partner channel</span></div>
      </div>
      <Stats items={[["3 bottlenecks", "found in week 1"], ["90 days", "plan"]]} /><Exd />
    </> },
];

export default function Services() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const on = (e: Event) => setActive((e as CustomEvent<number>).detail);
    addEventListener(SERVICE_EVENT, on);
    return () => removeEventListener(SERVICE_EVENT, on);
  }, []);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const k = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key];
    if (!k) return;
    e.preventDefault();
    const n = (i + k + PANELS.length) % PANELS.length;
    setActive(n); tabs.current[n]?.focus();
  };

  const p = PANELS[active];
  return (
    <section id="services" className="sec">
      <Doodles items={[{ kind: "cog", left: "86%", top: "5%", size: 34 }, { kind: "bolt", left: "70%", top: "11%" }, { kind: "leaf", left: "2%", top: "40%" }]} />
      <div className="wrap">
        <div data-reveal>
          <p className="kicker mono"><i />Our services</p>
          <h2 className="h2">Everything your business needs <span className="soft">to launch, run and grow.</span></h2>
          <p className="sub">One technical brand-building partner for the systems you run on and the demand that keeps them busy.</p>
        </div>

        <div className="tabs" role="tablist" aria-label="Services" data-reveal>
          {PANELS.map((x, i) => (
            <button key={x.tab} ref={el => { tabs.current[i] = el; }} role="tab" id={`t${i}`} aria-controls="svc-panel"
              aria-selected={active === i} tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={e => onKey(e, i)}>
              {x.tab}
            </button>
          ))}
        </div>

        <div className="panels" data-reveal>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={active} className="panel" role="tabpanel" id="svc-panel" aria-labelledby={`t${active}`}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}>
              <div className="panel__copy">
                <p className="mono small step">{p.step}</p>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <p className="outcome"><b>You get:</b> {p.get}</p>
                <a className="tlink" href={p.link[1]}>{p.link[0]} <span className="arr">→</span></a>
              </div>
              <div className="panel__demo dotted">{p.demo}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
