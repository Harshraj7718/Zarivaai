"use client";

import { useEffect } from "react";
import { initCompanyMap } from "@/lib/engines/company";
import ThemeToggle from "@/components/ThemeToggle";

/** The brain-shaped company map: departments as lobes, jobs/agents/tools as neurons, drill down to each job's rules. */
export default function CompanyMap() {
  useEffect(() => initCompanyMap(), []);

  return (
    <>
      <header className="top">
        <div className="top__left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a className="top__logo" href="/" aria-label="Zariva.AI home"><img src="/assets/zariva-logo.png" alt="zariva.ai" width={96} height={33} /></a>
          <span className="top__crumb">/ Company map</span>
        </div>
        <ol className="stepper" id="stepper" aria-label="How to read the map">
          <li data-s="1"><b>1</b>Pick a department</li>
          <li data-s="2"><b>2</b>Open a job</li>
          <li data-s="3"><b>3</b>Read the rules it follows</li>
        </ol>
        <div className="top__right">
          <span className="sample mono"><i />Sample data</span>
          <a className="top__site mono" href="/">zariva.ai</a>
          <span className="top__theme"><ThemeToggle /></span>
          <a className="top__cta" href="/#contact">Book a call <span aria-hidden="true">↗</span></a>
        </div>
      </header>

      <main className="layout">
        <section className="stage" aria-label="Company map">
          <button className="whole" id="wholeBtn" hidden>Whole company</button>
          <svg id="map" role="group" aria-label="Interactive map of departments, jobs, AI agents and tools">
            <defs>
              <radialGradient id="glow"><stop offset="0" stopColor="#79D900" stopOpacity=".18" /><stop offset="1" stopColor="#79D900" stopOpacity="0" /></radialGradient>
            </defs>
            <circle id="glowDisc" r="230" fill="url(#glow)" />
            <g id="mesh" aria-hidden="true" />
            <g id="edges" />
            <g id="pulses" />
            <g id="nodes" />
          </svg>
          <div className="tip" id="tip" role="tooltip" hidden><b id="tipName" /><span id="tipType" className="mono" /></div>
          <p className="hint mono" id="hint">Tap a department to open it</p>
          <div className="switcher" id="switcher" hidden>
            <button id="prevDept" aria-label="Previous department">‹</button>
            <span id="switchName" />
            <button id="nextDept" aria-label="Next department">›</button>
          </div>
        </section>
        <aside className="side" id="side" aria-live="polite" data-lenis-prevent />
      </main>

      <dialog className="memory" id="memory" aria-labelledby="memTitle">
        <div className="memory__head"><p className="mono kick">Shared by every agent</p><button className="x" id="memClose" aria-label="Close">×</button></div>
        <h2 id="memTitle">Company memory</h2>
        <p className="muted">Every job on the map reads from and writes to the same memory, so a support reply knows about last week&apos;s invoice and a campaign knows what the sales team promised.</p>
        <ul id="memList" />
        <p className="foot mono">Sample data. Names, counts and outputs are illustrative.</p>
      </dialog>
    </>
  );
}
