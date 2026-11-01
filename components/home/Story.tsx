"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const STEPS = ["The first version", "The first customer", "Systems that hold up under real use", "Marketing live on every channel", "Still here after launch"];
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function Story() {
  const win = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(0);
  const [one, setOne] = useState(false);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    const el = win.current;
    if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true, running = false;
    const swap = async (toOne: boolean) => { setFlip(true); await wait(250); if (!alive) return; setOne(toOne); setFlip(false); };
    const run = async () => {
      if (running) return;
      running = true;
      if (reduce) { setDone(STEPS.length); setOne(true); return; }
      while (alive) {
        setDone(0); await swap(false); await wait(1200);
        for (let i = 1; i <= STEPS.length && alive; i++) { setDone(i); await wait(900); }
        if (!alive) return;
        await swap(true); await wait(3600);
      }
    };
    const st = ScrollTrigger.create({ trigger: el, start: "top 80%", once: true, onEnter: run });
    return () => { alive = false; st.kill(); };
  }, []);

  return (
    <section id="story" className="sec">
      <div className="wrap story">
        <div data-reveal>
          <p className="kicker mono"><i />Our story</p>
          <h2 className="h2">Every business starts at zero. <span className="soft">We build the one.</span></h2>
          <div className="story__copy">
            <p>An idea is just an idea until someone builds the thing that makes it real: the first version, the first customer, the first system that doesn&apos;t fall over the moment people actually start using it.</p>
            <p>That gap between 0 and 1 is the hardest part of building anything. Not the vision, the execution. The software, the systems, the team, and the hundred small decisions that turn &ldquo;we should build this&rdquo; into &ldquo;this is running.&rdquo;</p>
            <p>Zariva.AI exists for that gap. We build the platform, wire the systems, launch the marketing and keep showing up after launch, so your zero becomes a one, and your one becomes something bigger.</p>
          </div>
          <a className="tlink" href="#services">See how we get you there <span className="arr">→</span></a>
        </div>

        <div className={`win zo${one ? " one" : ""}`} ref={win} data-reveal>
          <div className="win__bar mono small"><span>zariva · zero to one</span><span className="dots">− □ ×</span></div>
          <div className="zo__stage">
            <div className="zo__num" aria-hidden="true"><span className={`zo__digit${flip ? " out" : ""}`}>{one ? "1" : "0"}</span><i className="zo__dot" /></div>
            <p className="zo__label">{one ? "A running business" : "An idea"}</p>
          </div>
          <div className="zo__track"><i style={{ "--z": done / STEPS.length } as React.CSSProperties} /></div>
          <ol className="zo__list">{STEPS.map((s, i) => <li key={s} className={i < done ? "done" : ""}>{s}</li>)}</ol>
          <div className="win__foot mono small"><span>0 · an idea</span><span>1 · a running business</span></div>
        </div>
      </div>
    </section>
  );
}
