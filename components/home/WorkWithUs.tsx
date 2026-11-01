import PaperReveal from "@/components/sketch/PaperReveal";
import Doodles from "@/components/sketch/Doodles";

const MODELS = [
  {
    name: "Project build", tag: "Fixed scope", icon: "</>",
    lede: "One clear outcome, built and launched end to end.",
    best: "Launching a SaaS product, website, app or CRM / ERP setup.",
    gets: ["Discovery and a written scope", "Design, build and testing", "Launch, handover and training", "A support window after go-live"],
    bill: "Agreed price per milestone",
  },
  {
    name: "Dedicated team", tag: "Most flexible", icon: "◎", featured: true,
    lede: "Engineers, marketers and ops people working as part of your company.",
    best: "Ongoing product work, AI agents and operations that keep evolving.",
    gets: ["A named team that knows your product", "Weekly planning and demos", "Scale the team up or down monthly", "Back-office and support staff if needed"],
    bill: "Monthly, per team member",
  },
  {
    name: "Growth retainer", tag: "Always on", icon: "↗",
    lede: "Marketing, listings and automation that keep demand coming in.",
    best: "Businesses with a product live that need steady, measurable growth.",
    gets: ["SEO, paid and social campaigns", "Marketplace listings and content", "AI-assisted workflows and reporting", "A monthly growth review with us"],
    bill: "Monthly retainer, reviewed quarterly",
  },
];

/** "Ways to work with us": the three engagement models, on a sheet that unfolds from a crumpled ball. */
export default function WorkWithUs() {
  return (
    <section id="work-with-us" className="sec work">
      <Doodles items={[{ kind: "star", left: "5%", top: "8%" }, { kind: "cog", left: "92%", top: "10%", size: 32 }, { kind: "leaf", left: "3%", top: "86%" }]} />
      <div className="wrap work__head" data-reveal>
        <p className="kicker mono"><i />Ways to work with us</p>
        <h2 className="h2">Pick the shape that fits. <span className="soft">Change it as you grow.</span></h2>
        <p className="sub">Every engagement starts with a free consult and a written plan. Keep scrolling to unfold it.</p>
      </div>

      <PaperReveal>
        <div className="sheet">
          <header className="sheet__top" data-paper-item>
            <span className="mono small">Zariva.AI · engagement options</span>
            <span className="stamp">Draft for you</span>
          </header>
          <div className="sheet__grid">
            {MODELS.map(m => (
              <article key={m.name} className={`model${m.featured ? " model--featured" : ""}`} data-paper-item>
                <div className="model__head">
                  <span className="model__icon mono">{m.icon}</span>
                  <span className="model__tag mono small">{m.tag}</span>
                </div>
                <h3>{m.name}</h3>
                <p className="model__lede">{m.lede}</p>
                <p className="model__best"><b>Best for:</b> {m.best}</p>
                <ul>{m.gets.map(g => <li key={g}>{g}</li>)}</ul>
                <p className="model__bill mono small">{m.bill}</p>
                <a className={`btn ${m.featured ? "btn--dark" : "btn--ghost"}`} href="#contact">Start with a free consult <span className="arr">→</span></a>
              </article>
            ))}
          </div>
          <p className="sheet__foot mono small" data-paper-item>Not sure which fits? Tell us what you&apos;re running today and we&apos;ll suggest one.</p>
        </div>
      </PaperReveal>
    </section>
  );
}
