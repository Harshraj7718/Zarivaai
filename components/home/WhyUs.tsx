"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const REASONS = [
  { h: "One partner, full stack", p: "From SaaS builds to daily marketing ops, one team handles the technology and the growth.", tag: "</>", color: "lime", tilt: -1.2 },
  { h: "AI-first execution", p: "We bring automation and AI agents into the workflow, not just the pitch deck.", tag: "✦", color: "brand", tilt: 1 },
  { h: "Dedicated teams", p: "A consistent team that knows your product, not a rotating freelancer pool.", tag: "◎", color: "peach", tilt: -0.6 },
  { h: "Built to scale", p: "Architecture and operations designed for where your business is headed, not just where it is today.", tag: "↗", color: "lemon", tilt: 1.2 },
  { h: "Global, remote-first", p: "Clients across the USA, Europe and beyond, with one way of working in every time zone.", tag: "◍", color: "mint", tilt: -1 },
];

/** "Why Zariva.AI" as a board of sticky notes. All five are visible at once; on desktop you can drag them around. */
export default function WhyUs() {
  const board = useRef<HTMLDivElement>(null);
  const [canDrag, setCanDrag] = useState(false);
  const [top, setTop] = useState<number | null>(null); // the note being handled sits above the others

  useEffect(() => {
    setCanDrag(matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <section id="why-us" className="sec why">
      <div className="wrap">
        <div className="why__head" data-reveal>
          <div>
            <p className="kicker mono"><i />Why Zariva.AI</p>
            <h2 className="h2">Why teams choose Zariva.AI. <span className="soft">One partner for the build and the growth.</span></h2>
          </div>
          {canDrag && <p className="why__hint mono small">Drag the notes around ↘</p>}
        </div>

        <div className="notes" ref={board} data-reveal>
          {REASONS.map((r, i) => (
            <motion.article
              key={r.h}
              className={`note note--${r.color}`}
              style={{ rotate: r.tilt, zIndex: top === i ? 5 : 1 }}
              drag={canDrag}
              dragConstraints={board}
              dragElastic={0.18}
              dragMomentum={false}
              onDragStart={() => setTop(i)}
              onPointerDown={() => setTop(i)}
              whileHover={{ rotate: 0, y: -6, scale: 1.02 }}
              whileDrag={{ scale: 1.06, rotate: r.tilt * -1.5, boxShadow: "10px 16px 0 rgba(0,34,0,.22)" }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
            >
              <span className="note__tape" aria-hidden="true" />
              <span className="note__tag mono">{r.tag}</span>
              <h3 className="note__h">{r.h}</h3>
              <svg className="note__scribble" viewBox="0 0 120 10" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 6 C18 2 30 9 46 5 S74 2 90 6 S110 8 118 4" />
              </svg>
              <p className="note__p">{r.p}</p>
              <span className="note__n mono">#{i + 1}</span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
