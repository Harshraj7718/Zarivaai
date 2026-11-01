"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Floating "Get a free consult" pill: shows after the hero, hides near the contact section. */
export default function Dock() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => {
      const hero = document.getElementById("top"), contact = document.getElementById("contact");
      if (!hero || !contact) return;
      setShow(hero.getBoundingClientRect().bottom < 0 && contact.getBoundingClientRect().top > innerHeight * 0.6);
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="dock show" initial={{ y: 80, x: "-50%", opacity: 0 }} animate={{ y: 0, x: "-50%", opacity: 1 }} exit={{ y: 80, x: "-50%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}>
          <span>From zero to one</span><a href="#contact">Get a free consult <span className="arr">→</span></a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
