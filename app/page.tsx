import Nav from "@/components/home/Nav";
import Hero from "@/components/home/Hero";
import Story from "@/components/home/Story";
import Services from "@/components/home/Services";
import AiAgency from "@/components/home/AiAgency";
import WhyUs from "@/components/home/WhyUs";
import GlobalReach from "@/components/home/GlobalReach";
import Process from "@/components/home/Process";
import Contact from "@/components/home/Contact";
import Testimonials from "@/components/home/Testimonials";
import WorkWithUs from "@/components/home/WorkWithUs";
import Industries from "@/components/home/Industries";
import Projects from "@/components/home/Projects";
import Dock from "@/components/home/Dock";
import Reveals from "@/components/home/Reveals";
import DoodleFooter from "@/components/DoodleFooter";
import "@/styles/site.css";
import "@/styles/footer.css";
import "@/styles/sketch.css";
import "@/styles/polish.css";

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <Hero />
        <Industries />
        <Story />
        <Services />
        <AiAgency />
        <WhyUs />
        <GlobalReach />
        <Process />
        <Projects />
        <Testimonials />
        <WorkWithUs />
        <Contact />
      </main>
      <DoodleFooter />
      <Dock />
      <Reveals />
    </>
  );
}
