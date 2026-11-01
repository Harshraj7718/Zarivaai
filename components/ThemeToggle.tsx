"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Theme = "light" | "dark";

const current = (): Theme => {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/**
 * Light / dark switch. Starts from the visitor's saved choice or their system setting,
 * saves the choice, and keeps in sync if another control (like the menu's switch) changes the theme.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null); // null until mounted, so server and client markup match

  useEffect(() => {
    setTheme(current());
    const sync = () => setTheme(current());
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    return () => { obs.disconnect(); mq.removeEventListener("change", sync); };
  }, []);

  const toggle = () => {
    const next: Theme = current() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("zariva-theme", next); } catch {}
    setTheme(next);
  };

  const dark = theme === "dark";
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      title={dark ? "Light mode" : "Dark mode"}
    >
      <motion.svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"
        animate={{ rotate: dark ? -40 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        {/* sun rays shrink away in dark mode */}
        <motion.g className="theme-toggle__rays" animate={{ scale: dark ? 0 : 1, opacity: dark ? 0 : 1 }}
          style={{ originX: "12px", originY: "12px" }} transition={{ duration: 0.25 }}>
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
        </motion.g>
        <mask id="theme-toggle-moon">
          <rect width="24" height="24" fill="#fff" />
          <motion.circle r="5.5" fill="#000" animate={{ cx: dark ? 16.5 : 26, cy: dark ? 8 : 2 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} />
        </mask>
        <motion.circle className="theme-toggle__body" cx="12" cy="12" mask="url(#theme-toggle-moon)"
          animate={{ r: dark ? 8 : 5 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} />
      </motion.svg>
    </button>
  );
}
