"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";

/**
 * A lanyard ID card hanging from a strap. Drag it and it swings back on a spring (the strap follows);
 * click to flip it over. `front` and `back` are the two faces. A separate button flips it for keyboards.
 */
export default function Lanyard({ front, back, label }: { front: React.ReactNode; back: React.ReactNode; label: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const strap = useRef<SVGPathElement>(null);
  const strapShade = useRef<SVGPathElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [canSway, setCanSway] = useState(false);

  // card offset from its resting spot, springy so it swings back
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 140, damping: 9, mass: 0.8 });
  const sy = useSpring(y, { stiffness: 160, damping: 12, mass: 0.8 });
  const rotate = useTransform(sx, [-260, 0, 260], [22, 0, -22]); // a pendulum leans away from the pull
  const flip = useMotionValue(0);
  const flipSpring = useSpring(flip, { stiffness: 120, damping: 16 });
  const rotateY = useTransform(flipSpring, v => `${v}deg`);

  useEffect(() => { setCanSway(!matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);

  // the strap is a curve from the hook (top centre) down to the card's clip; it sags as the card swings
  useEffect(() => {
    const draw = () => {
      const st = stage.current; if (!st) return;
      const w = st.clientWidth, hookX = w / 2, hookY = 0;
      const cx = w / 2 + sx.get(), cy = 150 + sy.get();
      const midX = (hookX + cx) / 2 - sx.get() * 0.25, midY = (hookY + cy) / 2 + 20;
      const d = `M${hookX - 12} ${hookY} Q${midX - 10} ${midY} ${cx - 9} ${cy} L${cx + 9} ${cy} Q${midX + 10} ${midY} ${hookX + 12} ${hookY} Z`;
      strap.current?.setAttribute("d", d);
      strapShade.current?.setAttribute("d", `M${hookX} ${hookY} Q${midX} ${midY} ${cx} ${cy}`);
    };
    draw();
    const a = sx.on("change", draw), b = sy.on("change", draw);
    addEventListener("resize", draw);
    return () => { a(); b(); removeEventListener("resize", draw); };
  }, [sx, sy]);

  // a gentle idle sway so it feels like it's really hanging; paused while the card is held
  const sway = useRef<ReturnType<typeof animate> | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const startSway = () => {
    if (!canSway) return;
    sway.current?.stop();
    sway.current = animate(x, [0, 10, -8, 5, 0], { duration: 4.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.4 });
  };
  useEffect(() => {
    startSway();
    return () => { sway.current?.stop(); clearTimeout(resumeTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSway]);

  const toggle = () => { const next = !flipped; setFlipped(next); flip.set(next ? 180 : 0); };

  // pointer drag: the target follows the pointer, the spring makes the card swing after it; a tap flips
  const drag = useRef<{ id: number; sx: number; sy: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest("a, button")) return;
    sway.current?.stop(); // the hand takes over from the idle sway
    clearTimeout(resumeTimer.current);
    drag.current = { id: e.pointerId, sx: e.clientX, sy: e.clientY, moved: false };
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx, dy = e.clientY - d.sy;
    if (Math.hypot(dx, dy) > 5) d.moved = true;
    x.set(Math.max(-240, Math.min(240, dx)));
    y.set(Math.max(-40, Math.min(140, dy)));
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.moved) toggle();
    x.set(0); y.set(0); // let go: it swings back on the spring
    resumeTimer.current = setTimeout(startSway, 2200); // and drifts back into its idle sway once settled
  };

  return (
    <div className="lanyard">
      <div className="lanyard__stage" ref={stage}>
        <svg className="lanyard__strap" aria-hidden="true">
          <path ref={strap} className="lanyard__band" />
          <path ref={strapShade} className="lanyard__stitch" />
        </svg>
        <span className="lanyard__hook" aria-hidden="true" />
        <motion.div
          className="lanyard__card-wrap"
          style={{ x: sx, y: sy, rotate }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <span className="lanyard__clip" aria-hidden="true" />
          <motion.div className="lanyard__card" style={{ rotateY }} aria-label={label}>
            <div className="lanyard__face lanyard__face--front" aria-hidden={flipped}>{front}</div>
            <div className="lanyard__face lanyard__face--back" aria-hidden={!flipped}>{back}</div>
          </motion.div>
        </motion.div>
      </div>
      <button type="button" className="lanyard__flip mono small" onClick={toggle} aria-pressed={flipped}>
        ↻ {flipped ? "Show the project" : "Flip card"} <span className="lanyard__hint">· or drag it</span>
      </button>
    </div>
  );
}
