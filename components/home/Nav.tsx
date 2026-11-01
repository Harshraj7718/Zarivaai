"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { selectService } from "@/lib/events";
import ThemeToggle from "@/components/ThemeToggle";

const toggleTheme = () => {
  const dark = getComputedStyle(document.documentElement).colorScheme === "dark";
  const next = dark ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("zariva-theme", next); } catch {}
};

export default function Nav() {
  const [open, setOpen] = useState(false);
  const crawl = useRef<HTMLDivElement>(null);

  // scroll progress bar under the header
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      crawl.current?.style.setProperty("--p", String(max > 0 ? scrollY / max : 0));
    };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", onKey);
    return () => { removeEventListener("scroll", onScroll); removeEventListener("keydown", onKey); };
  }, []);

  const close = () => setOpen(false);

  return (
    <header className="nav">
      <a className="nav__logo" href="#top" aria-label="Zariva.AI home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/zariva-logo.png" alt="zariva.ai" width={110} height={38} />
      </a>
      <div className="nav__links">
        <a href="#services">Services</a><a href="#ai-agency">AI Agency</a><a href="#why-us">Why us</a>
        <a href="#global">Global</a><a href="#work-with-us">Work with us</a><a href="/company">Company map</a>
      </div>
      <div className="nav__crawl" ref={crawl} aria-hidden="true" />
      <nav className="nav__right" aria-label="Primary">
        <div className="nav__cell nav__cell--theme"><ThemeToggle /></div>
        <button className="nav__cell" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(o => !o)}>
          Menu <span className="plus">+</span>
        </button>
        <a className="nav__cell hide-sm" href="#contact">Contact</a>
        <a className="nav__cell nav__cell--dark" href="#contact">Get a free consult <span className="arr">→</span></a>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            className="menu" id="menu"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="menu__grid">
              <div><p>Services</p>
                <a href="#services" onClick={() => { selectService(0); close(); }}>SaaS engineering</a>
                <a href="#services" onClick={() => { selectService(1); close(); }}>AI agency</a>
                <a href="#services" onClick={() => { selectService(2); close(); }}>Digital marketing</a>
                <a href="#services" onClick={() => { selectService(4); close(); }}>CRM & ERP</a>
                <a href="#services" onClick={() => { selectService(5); close(); }}>Web & app development</a>
              </div>
              <div><p>Company</p>
                <a href="/company">Company map</a><a href="#story" onClick={close}>Our story</a>
                <a href="#why-us" onClick={close}>Why us</a><a href="#process" onClick={close}>Process</a><a href="#contact" onClick={close}>Contact</a>
              </div>
              <div><p>Get in touch</p>
                <a href="mailto:hello@zariva.ai">hello@zariva.ai</a><a href="#contact" onClick={close}>Book a strategy call</a>
                <button className="linkish" onClick={toggleTheme}>Switch light / dark</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
