// A quiet strip under the hero: the industries Zariva.AI builds for, drawn from the services on this page.
const ITEMS: { name: string; icon: React.ReactNode }[] = [
  { name: "Healthcare", icon: <><path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z" /><path d="M9.5 12h5M12 9.5v5" /></> },
  { name: "Real estate", icon: <><path d="M3 11 12 4l9 7" /><path d="M5.5 9.5V20h13V9.5" /><path d="M10 20v-5h4v5" /></> },
  { name: "HR & people", icon: <><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9.5" r="2.4" /><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5" /></> },
  { name: "E-commerce", icon: <><path d="M4 5h2l2 10h10l2-7H7.2" /><circle cx="10" cy="19" r="1.4" /><circle cx="17" cy="19" r="1.4" /></> },
  { name: "B2B SaaS", icon: <><rect x="3.5" y="4.5" width="17" height="12" rx="2" /><path d="M8 20h8M12 16.5V20" /><path d="m9.5 9-2 1.5 2 1.5M14.5 9l2 1.5-2 1.5" /></> },
  { name: "Professional services", icon: <><rect x="3.5" y="7.5" width="17" height="12" rx="2" /><path d="M9 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5v2" /><path d="M3.5 12.5h17" /></> },
];

export default function Industries() {
  return (
    <section className="industries" aria-label="Industries we build for">
      <div className="industries__in" data-reveal>
        <p className="industries__label mono">INDUSTRIES WE BUILD FOR</p>
        <ul className="industries__list">
          {ITEMS.map(it => (
            <li key={it.name}><svg viewBox="0 0 24 24" aria-hidden="true">{it.icon}</svg>{it.name}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
