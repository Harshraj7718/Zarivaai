"use client";

import { useState } from "react";
import Crew from "@/components/sketch/Crew";
import Doodles from "@/components/sketch/Doodles";
import Eyes from "@/components/sketch/Eyes";

const SERVICES = ["SaaS product engineering", "AI agents & automation", "Digital marketing", "Social media management", "CRM & ERP systems", "Web & app development", "Business process operations", "Consulting & product growth", "Not sure yet"];
const MARQUEE = ["SaaS engineering", "AI agents", "CRM & ERP", "Digital marketing", "Social media", "Web & app", "Business operations", "Consulting & growth"];

export default function Contact() {
  const [hint, setHint] = useState("Opens your email app with the details filled in.");
  const [invalid, setInvalid] = useState<{ name?: boolean; email?: boolean }>({});

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const data = new FormData(f);
    const name = String(data.get("name") || "").trim(), email = String(data.get("email") || "").trim();
    const emailOk = !!email && (f.elements.namedItem("email") as HTMLInputElement).checkValidity();
    setInvalid({ name: !name, email: !emailOk });
    if (!name || !emailOk) { setHint("Add your name and a valid work email so we can reply."); return; }
    const service = String(data.get("service"));
    const body = `Name: ${name}\nEmail: ${email}\nService: ${service}\n\n${String(data.get("msg") || "").trim()}`;
    setHint("Opening your email app with your request…");
    location.href = `mailto:hello@zariva.ai?subject=${encodeURIComponent("Free consult: " + service)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact" className="sec final">
      <Doodles items={[{ kind: "leaf", left: "4%", top: "10%" }, { kind: "star", left: "42%", top: "16%", size: 24 }, { kind: "code", left: "8%", top: "78%" }, { kind: "bolt", left: "47%", top: "70%" }]} />
      <div className="wrap final__grid">
        <div data-reveal>
          <p className="kicker mono"><i />Contact</p>
          <div className="final__title">
            <h2 className="final__h">Ready to build what&apos;s next?</h2>
            <Eyes size={130} className="eyes--contact" label="Eyes watching you fill in the form" />
          </div>
          <p className="sub">Tell us what you&apos;re running today, and we&apos;ll show you what Zariva.AI can take off your plate.</p>
          <div className="cta-row">
            <a className="btn btn--dark" href="mailto:hello@zariva.ai?subject=Strategy%20call">Book a strategy call <span className="arr">→</span></a>
            <a className="btn btn--ghost" href="#services">See our services</a>
          </div>
          <p className="micro mono">Or write to <a href="mailto:hello@zariva.ai">hello@zariva.ai</a></p>
        </div>
        <div className="relative" data-reveal>
        <Crew kind="byte" size={66} says="Ship it! (After the tests pass.)" style={{ right: 34, top: -62 }} bubbleLeft />
        <form className="win consult" noValidate onSubmit={submit}>
          <div className="win__bar mono small"><span>Free consult</span><span className="dots">− □ ×</span></div>
          <div className="consult__body">
            <label>Your name<input name="name" required autoComplete="name" aria-invalid={invalid.name || undefined} /></label>
            <label>Work email<input name="email" type="email" required autoComplete="email" aria-invalid={invalid.email || undefined} /></label>
            <label>What do you need help with?
              <select name="service" defaultValue={SERVICES[0]}>{SERVICES.map(s => <option key={s}>{s}</option>)}</select>
            </label>
            <label>What are you running today?<textarea name="msg" rows={3} placeholder="A few lines about your business and what's stuck" /></label>
            <button className="btn btn--dark" type="submit">Send request <span className="arr">→</span></button>
            <p className="micro mono">{hint}</p>
          </div>
        </form>
        </div>
      </div>
      <div className="marquee mono" aria-hidden="true">
        <div className="marquee__track">{[...MARQUEE, ...MARQUEE].map((m, i) => <span key={i}>{m}</span>)}</div>
      </div>
    </section>
  );
}
