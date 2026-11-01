"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/** Every [data-reveal] block rises in once as it scrolls into view (ScrollTrigger.batch keeps it to one observer). */
export default function Reveals() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set("[data-reveal]", { y: 36, opacity: 0 });
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", stagger: 0.1, overwrite: true }),
      });
      // re-measure once fonts and images have settled
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      addEventListener("load", refresh);
      return () => removeEventListener("load", refresh);
    });
  });
  return null;
}
