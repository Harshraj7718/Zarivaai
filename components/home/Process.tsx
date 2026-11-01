"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Crew from "@/components/sketch/Crew";

const STEPS = [
  ["Discover", "We map your business, your systems and where growth is stuck."],
  ["Design & build", "Platforms, CRM/ERP and AI agents built around your real workflow."],
  ["Launch & market", "Marketing, listings and campaigns go live across your channels."],
  ["Grow & support", "Ongoing operations, consulting and optimisation to keep scaling."],
];

/** The four steps, with a progress line scrubbed to the scroll position by ScrollTrigger. */
export default function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const line = root.current!.querySelector(".process__line i");
    const steps = gsap.utils.toArray<HTMLElement>(".process article", root.current);
    gsap.fromTo(line, { scaleX: 0 }, {
      scaleX: 1, ease: "none", transformOrigin: "left",
      scrollTrigger: {
        trigger: ".process", start: "top 75%", end: "bottom 45%", scrub: 0.6,
        onUpdate: self => steps.forEach((s, i) => s.classList.toggle("on", self.progress >= i / steps.length + 0.05)),
      },
    });
    gsap.from(steps, { y: 30, opacity: 0, stagger: 0.12, duration: 0.7, ease: "power3.out", scrollTrigger: { trigger: ".process", start: "top 80%" } });
  }, { scope: root });

  return (
    <section id="process" className="sec" ref={root}>
      <div className="wrap">
        <div data-reveal>
          <p className="kicker mono"><i />How we work</p>
          <h2 className="h2">From idea <span className="soft">to running business.</span></h2>
        </div>
        <div className="process">
          <div className="process__line"><i /></div>
          <Crew kind="sprout" size={52} says="Growth takes time. Mine took three sprints." style={{ right: -6, top: -50 }} bubbleLeft />
          {STEPS.map(([h, p], i) => (
            <article key={h}><span className="process__n mono">{String(i + 1).padStart(2, "0")}</span><h3>{h}</h3><p>{p}</p></article>
          ))}
        </div>
      </div>
    </section>
  );
}
