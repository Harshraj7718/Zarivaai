"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TestimonialsSection, type Testimonial } from "@/components/ui/testimonials-2";

// SAMPLE quotes from fictional clients — replace with real, approved client testimonials before launch.
const QUOTES: Testimonial[] = [
  { quote: "We went from a spreadsheet to a live hospital management platform in one quarter, and the team is still with us every sprint.",
    highlight: "live hospital management platform", name: "Ananya Rao", role: "Operations Director, a multi-specialty clinic group (example)", initials: "AR" },
  { quote: "Their AI support agent answers most of our customer questions before anyone on our team is awake.",
    highlight: "AI support agent", name: "Daniel Brooks", role: "Founder, a US e-commerce brand (example)", initials: "DB" },
  { quote: "One partner for the CRM, the ERP and the marketing. Our sales data finally matches our invoices.",
    highlight: "One partner", name: "Sofia Lindqvist", role: "COO, a European B2B software company (example)", initials: "SL" },
  { quote: "They found three bottlenecks in our funnel in the first week and fixed two of them by the end of the month.",
    highlight: "three bottlenecks", name: "Omar Haddad", role: "Managing Partner, a Gulf real estate firm (example)", initials: "OH" },
];

export default function Testimonials() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [hold, setHold] = useState(false);
  const go = (n: number) => { setDir(n > i || (i === QUOTES.length - 1 && n === 0) ? 1 : -1); setI((n + QUOTES.length) % QUOTES.length); };

  useEffect(() => {
    if (hold || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => { setDir(1); setI(x => (x + 1) % QUOTES.length); }, 6500);
    return () => clearTimeout(t);
  }, [i, hold]);

  return (
    <section id="testimonials" className="sec testi">
      <div className="wrap">
        <div className="testi__head" data-reveal>
          <p className="kicker mono"><i />What clients say</p>
          <h2 className="h2">Built with us, <span className="soft">in their own words.</span></h2>
        </div>

        <div className="testi__stage" data-reveal onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)}
          onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
          <div className="testi__card" aria-live="polite" aria-roledescription="carousel">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <motion.div key={i} custom={dir}
                initial={{ opacity: 0, x: dir * 40, rotate: dir * 1.5 }} animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0, x: dir * -40, rotate: dir * -1.5 }}
                transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}>
                <TestimonialsSection {...QUOTES[i]} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="testi__controls">
            <button className="testi__btn" aria-label="Previous testimonial" onClick={() => go(i - 1)}>←</button>
            <div className="testi__dots" role="tablist" aria-label="Choose a testimonial">
              {QUOTES.map((q, k) => (
                <button key={q.name} role="tab" aria-selected={k === i} aria-label={`Testimonial ${k + 1}: ${q.name}`} onClick={() => go(k)} />
              ))}
            </div>
            <button className="testi__btn" aria-label="Next testimonial" onClick={() => go(i + 1)}>→</button>
          </div>
          <p className="mono small testi__note">Example testimonials · fictional clients</p>
        </div>
      </div>
    </section>
  );
}
