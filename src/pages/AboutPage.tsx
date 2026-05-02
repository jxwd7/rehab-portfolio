import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import InfiniteGallery from "@/components/ui/3d-gallery-photography";
import { siteContent } from "../content";

const asset = (name: string) => `/assets/${name}`;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [query]);

  return matches;
}

function AboutReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-110px" }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function AboutGallery() {
  const shouldReduceMotion = useReducedMotion();
  const isNarrow = useMediaQuery("(max-width: 900px)");
  const useStaticGallery = shouldReduceMotion || isNarrow;

  if (useStaticGallery) {
    return (
      <div className="about-static-gallery">
        {siteContent.aboutPage.galleryImages.slice(0, 4).map((image, index) => (
          <motion.img
            key={image.src}
            src={image.src}
            alt={image.alt}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08, duration: 0.55 }}
          />
        ))}
      </div>
    );
  }

  return (
    <InfiniteGallery
      images={siteContent.aboutPage.galleryImages}
      speed={0.85}
      visibleCount={10}
      className="about-gallery-canvas"
      fadeSettings={{
        fadeIn: { start: 0.04, end: 0.18 },
        fadeOut: { start: 0.62, end: 0.72 },
      }}
      blurSettings={{
        blurIn: { start: 0, end: 0.1 },
        blurOut: { start: 0.58, end: 0.72 },
        maxBlur: 5,
      }}
    />
  );
}

export default function AboutPage({
  onBook,
  onHome,
}: {
  onBook: () => void;
  onHome: () => void;
}) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  return (
    <main className="about-page">
      <section className="about-page-hero">
        <div className="about-page-shell">
          <button className="about-back-link" type="button" onClick={onHome}>
            <ArrowLeft size={18} />
            Home
          </button>
          <div className="about-page-hero-grid">
            <AboutReveal className="about-page-hero-copy">
              <p className="eyebrow">{siteContent.aboutPage.hero.eyebrow}</p>
              <h1>{siteContent.aboutPage.hero.title}</h1>
              <div className="about-hero-tags" aria-label="Practice credentials">
                <span>{siteContent.aboutPage.hero.subtitle}</span>
                <span>{siteContent.aboutPage.hero.telehealth}</span>
              </div>
              <p>{siteContent.aboutPage.hero.body}</p>
              <div className="about-page-cta">
                <span>{siteContent.aboutPage.hero.ctaSubtext}</span>
                <button className="primary-button" type="button" onClick={onBook}>
                  <CalendarDays size={18} />
                  {siteContent.aboutPage.hero.cta}
                </button>
              </div>
            </AboutReveal>
            <AboutReveal className="about-portrait-card">
              <img src={asset("portrait-illustration.png")} alt="Illustration of Rehab Khan" />
              <div>
                <strong>Rehab Khan</strong>
                <span>{siteContent.brand.registration}</span>
              </div>
            </AboutReveal>
          </div>
        </div>
      </section>

      <section className="about-experience">
        <div className="about-gallery-column">
          <div className="about-gallery-sticky">
            <AboutGallery />
            <div className="about-gallery-caption">
              <Sparkles size={18} />
              <span>Scroll gently through the practice story.</span>
            </div>
          </div>
        </div>

        <div className="about-story-panels">
          {siteContent.aboutPage.sections.map((section) => (
            <AboutReveal className="about-story-card" key={section.eyebrow}>
              <p className="eyebrow">{section.eyebrow}</p>
              <h2>{section.title}</h2>
              {section.kicker ? <strong>{section.kicker}</strong> : null}
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </AboutReveal>
          ))}
        </div>
      </section>

      <section className="about-areas-section">
        <AboutReveal className="section-heading">
          <p className="eyebrow">Clinical focus</p>
          <h2>{siteContent.aboutPage.areasTitle}</h2>
          <p>{siteContent.aboutPage.areasIntro}</p>
        </AboutReveal>
        <div className="about-areas-grid">
          {siteContent.aboutPage.areas.map((area) => (
            <AboutReveal className="about-area-card" key={area.title}>
              <CheckCircle2 size={20} />
              <h3>{area.title}</h3>
              <p>{area.text}</p>
            </AboutReveal>
          ))}
        </div>
        <AboutReveal className="about-areas-closing">
          <ShieldCheck size={22} />
          <p>{siteContent.aboutPage.areasClosing}</p>
        </AboutReveal>
      </section>

      <section className="about-final-cta">
        <AboutReveal>
          <p className="eyebrow">{siteContent.aboutPage.hero.ctaSubtext}</p>
          <h2>Begin with a private telehealth consultation.</h2>
          <button className="primary-button" type="button" onClick={onBook}>
            <CalendarDays size={18} />
            {siteContent.aboutPage.hero.cta}
          </button>
        </AboutReveal>
      </section>
    </main>
  );
}
