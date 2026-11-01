"use client";

import { useEffect, useRef } from "react";
import { initFooter } from "@/lib/engines/footer";
import { selectService } from "@/lib/events";

/** Footer with the zariva wordmark stamped in ink and the crew (Bolt, Dot, Sprout, Byte) living on the letters. */
export default function DoodleFooter() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => (root.current ? initFooter(root.current) : undefined), []);

  const svc = (i: number) => () => selectService(i);
  return (
    <footer className="zf" id="zf" data-play="0" ref={root}>
      <div className="zf-top zf-rise">
        <a className="zf-brand" href="#top" aria-label="Zariva.AI, back to top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="zf-logo zf-logo--dark" src="/assets/zariva-logo-dark.png" alt="zariva.ai" width={130} height={45} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="zf-logo zf-logo--light" src="/assets/zariva-logo.png" alt="" width={130} height={45} />
        </a>
        <p className="zf-blurb">Your technical brand-building partner: software, systems and growth under one roof.</p>
        <nav className="zf-cols" aria-label="Footer">
          <div className="zf-col"><h3 className="zf-coltitle">Services</h3><ul>
            <li><a className="zf-link" href="#services" onClick={svc(0)}><span>SaaS engineering</span></a></li>
            <li><a className="zf-link" href="#ai-agency"><span>AI agency</span></a></li>
            <li><a className="zf-link" href="#services" onClick={svc(2)}><span>Digital marketing</span></a></li>
            <li><a className="zf-link" href="#services" onClick={svc(4)}><span>CRM & ERP</span></a></li>
            <li><a className="zf-link" href="#services" onClick={svc(5)}><span>Web & app dev</span></a></li>
          </ul></div>
          <div className="zf-col"><h3 className="zf-coltitle">Company</h3><ul>
            <li><a className="zf-link" href="/company"><span>How we run</span></a></li>
            <li><a className="zf-link" href="#why-us"><span>Why us</span></a></li>
            <li><a className="zf-link" href="#global"><span>Global reach</span></a></li>
            <li><a className="zf-link" href="#process"><span>Process</span></a></li>
            <li><a className="zf-link" href="#contact"><span>Contact</span></a></li>
          </ul></div>
          <div className="zf-col"><h3 className="zf-coltitle">Get in touch</h3><ul>
            <li><a className="zf-link" href="mailto:hello@zariva.ai"><span>hello@zariva.ai</span></a></li>
            <li><a className="zf-link" href="#contact"><span>Book a strategy call</span></a></li>
          </ul></div>
        </nav>
      </div>

      <div className="zf-world" id="zfWorld">
        <div className="zf-stage">
          <h2 className="sr">Zariva.AI</h2>
          <svg className="zf-svg" id="zfSvg" role="group" aria-label="zariva.ai, meet the crew" />
          <div className="zf-bubbles" id="zfBubbles" aria-live="polite" />
        </div>
        <div className="zf-doodles" id="zfDoodles" aria-hidden="true" />
        <div className="zf-cta">
          <p className="zf-tagline" id="zfTagline">We engineer your software and run your growth, from zero to one and beyond.</p>
          <div className="zf-actions">
            <a className="zf-btn zf-pop is-outline" href="#services"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7 3 12l5 5M16 7l5 5-5 5M14 4l-4 16" /></svg><span>See our services</span></a>
            <a className="zf-btn zf-pop is-solid" href="#contact"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg><span>Get a free consult</span></a>
          </div>
        </div>
      </div>

      <div className="zf-bar zf-rise" style={{ "--d": "120ms" } as React.CSSProperties}>
        <p className="zf-copy">© 2026 Zariva.AI. All rights reserved.</p>
        <ul className="zf-inline">
          <li><a className="zf-link" href="#"><span>Privacy policy</span></a></li>
          <li><a className="zf-link" href="#"><span>Terms of service</span></a></li>
        </ul>
        <button type="button" className="zf-totop" id="zfTop"><span>Back to top</span><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 20 C11 14 12.5 9 12 4 M6 10 C8 8 10 6 12 4 C14 6 16 8 18.5 9.5" /></svg></button>
      </div>
    </footer>
  );
}
