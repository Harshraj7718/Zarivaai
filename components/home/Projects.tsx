import Lanyard from "@/components/sketch/Lanyard";

const SITE = "https://haxxed.vercel.app/";

/** "Our projects": live client work, shown on a lanyard ID card (front: the project, back: Zariva). */
export default function Projects() {
  const front = (
    <div className="idcard">
      <div className="idcard__slot" aria-hidden="true" />
      <div className="idcard__top mono small"><span>Project 01</span><span className="idcard__live"><i />Live</span></div>
      <h3 className="idcard__name">HAXXED</h3>
      <p className="idcard__sub">Grooming Co. · D2C hair styling</p>
      <div className="idcard__preview">
        <div className="idcard__bar" aria-hidden="true"><i /><i /><i /><span>haxxed.vercel.app</span></div>
        <div className="idcard__screen">
          {/* a live, scaled-down view of the real site; pointer-events off so the card can still be dragged */}
          <iframe src={SITE} title="HAXXED Grooming Co. website preview" loading="lazy" tabIndex={-1}
            sandbox="allow-scripts allow-same-origin" referrerPolicy="no-referrer" />
        </div>
      </div>
      <a className="idcard__link" href={SITE} target="_blank" rel="noopener noreferrer">Visit site <span aria-hidden="true">↗</span></a>
    </div>
  );

  const back = (
    <div className="idcard idcard--back">
      <div className="idcard__slot" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="idcard__logo" src="/assets/zariva-logo.png" alt="Zariva.AI" width={180} height={62} />
      <p className="idcard__built mono small">Built by Zariva.AI</p>
      <p className="idcard__motto">We engineer your software.<br />We run your growth.</p>
      <div className="idcard__barcode" aria-hidden="true">
        {Array.from({ length: 34 }, (_, i) => <i key={i} style={{ width: [1, 3, 2, 1, 4, 2][i % 6] }} />)}
      </div>
      <p className="idcard__id mono small">ZRV · 2026 · 001</p>
    </div>
  );

  return (
    <section id="projects" className="sec projects">
      <div className="wrap projects__grid">
        <div className="projects__copy" data-reveal>
          <p className="kicker mono"><i />Our projects</p>
          <h2 className="h2">Work we&apos;ve shipped. <span className="soft">Live and running.</span></h2>
          <p className="sub">A look at what we build. Pick up the card, give it a swing, or flip it over.</p>
          <article className="project-row">
            <span className="project-row__n mono">01</span>
            <div>
              <h3>HAXXED Grooming Co.</h3>
              <p>A direct-to-consumer brand for clean, water-soluble hair styling made for Indian hair, heat and humidity.</p>
              <a className="tlink" href={SITE} target="_blank" rel="noopener noreferrer">haxxed.vercel.app <span className="arr">↗</span></a>
            </div>
          </article>
          <p className="projects__more mono small">More case studies coming soon</p>
        </div>
        <div data-reveal>
          <Lanyard front={front} back={back} label="HAXXED project card. Front: website preview. Back: Zariva.AI." />
        </div>
      </div>
    </section>
  );
}
