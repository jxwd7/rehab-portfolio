import {
  ChangeEvent,
  FormEvent,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Flower2,
  HeartHandshake,
  Leaf,
  Mail,
  Monitor,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Waves,
  X,
} from "lucide-react";
import { siteContent } from "./content";

const asset = (name: string) => `/assets/${name}`;

const serviceIcons: Record<string, LucideIcon> = {
  heart: HeartHandshake,
  flower: Flower2,
  brain: Brain,
  leaf: Leaf,
};

const formInitialState = {
  name: "",
  email: "",
  phone: "",
  service: siteContent.services[0].title,
  contactMethod: siteContent.contact.preferredMethods[0],
  message: "",
  consent: false,
};

type FormState = typeof formInitialState;
type FormErrors = Partial<Record<keyof FormState, string>>;

function scrollToHash(hash: string) {
  const target = document.querySelector(hash);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function App() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <div className="site-shell">
      <SiteHeader onBook={() => setBookingOpen(true)} />
      <main>
        <Hero onBook={() => setBookingOpen(true)} />
        <TrustStrip />
        <PearlJourney />
        <Services onBook={() => setBookingOpen(true)} />
        <Approach />
        <AboutLearning onBook={() => setBookingOpen(true)} />
        <FAQ />
        <Contact onBook={() => setBookingOpen(true)} />
      </main>
      <SiteFooter onPrivacy={() => setPrivacyOpen(true)} />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} onPrivacy={() => setPrivacyOpen(true)} />
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </div>
  );
}

function SiteHeader({ onBook }: { onBook: () => void }) {
  const [activeHref, setActiveHref] = useState("#home");

  useEffect(() => {
    const sectionIds = siteContent.nav.map((item) => item.href.slice(1));

    function updateActiveSection() {
      const checkpoint = window.scrollY + 170;
      let current = "#home";
      const orderedSections = sectionIds
        .map((id) => {
          const section = document.getElementById(id);
          return section ? { id, top: section.offsetTop } : null;
        })
        .filter((section): section is { id: string; top: number } => Boolean(section))
        .sort((a, b) => a.top - b.top);

      for (const section of orderedSections) {
        if (section.top <= checkpoint) current = `#${section.id}`;
      }
      setActiveHref(current);
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  return (
    <header className="site-header">
      <button
        className="brand-mark"
        type="button"
        onClick={() => scrollToHash("#home")}
        aria-label="Go to home"
      >
        <img src={asset("brand-shell.png")} alt="" />
        <span>
          <strong>{siteContent.brand.name}</strong>
          <small>{siteContent.brand.descriptor}</small>
        </span>
      </button>
      <nav className="nav-links" aria-label="Primary navigation">
        {siteContent.nav.map((item) => (
          <button
            className={activeHref === item.href ? "active" : ""}
            key={item.href}
            type="button"
            onClick={(event) => {
              event.currentTarget.blur();
              scrollToHash(item.href);
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button className="nav-cta" type="button" onClick={onBook}>
        <CalendarDays size={18} />
        <span>Book</span>
      </button>
    </header>
  );
}

function Hero({ onBook }: { onBook: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const words = siteContent.hero.headlineScript.split("");

  return (
    <section className="hero-section section-anchor" id="home">
      <img className="hero-watercolor" src={asset("watercolor-hero-sea.png")} alt="" />
      <div className="hero-veil" />
      <div className="hero-content">
        <motion.div
          className="hero-copy"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <p className="eyebrow">{siteContent.hero.eyebrow}</p>
          <h1>
            <span>{siteContent.hero.headlineStart}</span>
            <span className="script-line" aria-label={siteContent.hero.headlineScript}>
              {words.map((char, index) => (
                <motion.span
                  aria-hidden="true"
                  key={`${char}-${index}`}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18, rotate: -3 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.45 + index * 0.035, duration: 0.42 }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </span>
          </h1>
          <p className="hero-body">{siteContent.hero.body}</p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={onBook}>
              <CalendarDays size={18} />
              {siteContent.hero.primaryCta}
            </button>
            <button className="ghost-button" type="button" onClick={() => scrollToHash("#contact")}>
              <Send size={18} />
              {siteContent.hero.secondaryCta}
            </button>
          </div>
        </motion.div>
        <OysterHero />
      </div>
      <button
        className="scroll-cue"
        type="button"
        aria-label="Scroll to journey"
        onClick={() => scrollToHash("#journey")}
      >
        <ChevronDown size={24} />
      </button>
    </section>
  );
}

function OysterHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="oyster-stage"
      initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.22, x: -150 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <div className="oyster-layer oyster-bottom-layer">
        <motion.img
          className="oyster-bottom"
          src={asset("oyster-bottom.png")}
          alt=""
          initial={shouldReduceMotion ? false : { y: 26, rotate: 1 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ delay: 0.18, duration: 1.1, ease: "easeOut" }}
        />
      </div>
      <div className="oyster-layer oyster-top-layer">
        <motion.img
          className="oyster-top"
          src={asset("oyster-top.png")}
          alt=""
          initial={shouldReduceMotion ? false : { y: 44, rotate: 7, scaleY: 0.86 }}
          animate={{ y: -28, x: 10, rotate: -16, scaleY: 1 }}
          transition={{ delay: 0.48, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <div className="oyster-layer hero-pearl-layer">
        <motion.img
          className="hero-pearl"
          src={asset("pearl.png")}
          alt=""
          initial={shouldReduceMotion ? false : { scale: 0.2, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.9, ease: "easeOut" }}
        />
      </div>
      <div className="oyster-layer oyster-glow-layer">
        <motion.div
          className="oyster-glow"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.65 }}
          animate={{ opacity: [0.08, 0.26, 0.12], scale: 1 }}
          transition={{ delay: 1.2, duration: 2.5, repeat: Infinity, repeatType: "mirror" }}
        />
      </div>
    </motion.div>
  );
}

function TrustStrip() {
  const icons = [Monitor, ShieldCheck, Waves];

  return (
    <section className="trust-strip" aria-label="Practice trust information">
      {siteContent.trustSignals.map((signal, index) => {
        const Icon = icons[index] ?? ShieldCheck;
        return (
          <Reveal className="trust-item" key={signal.title}>
            <Icon size={28} />
            <span>
              <small>{signal.title}</small>
              <strong>{signal.detail}</strong>
            </span>
          </Reveal>
        );
      })}
    </section>
  );
}

function PearlJourney() {
  return (
    <section className="journey-section section-anchor" id="journey">
      <div className="journey-intro">
        <Reveal>
          <p className="eyebrow">Your journey, gently held</p>
          <h2>Each pearl reveals a part of the work.</h2>
          <p>
            Growth is not forced. It is noticed, protected, and slowly gathered into
            something strong.
          </p>
        </Reveal>
      </div>
      <div className="journey-grid">
        {siteContent.journey.map((step, index) => (
          <JourneyPearl
            key={step.title}
            index={index}
            title={step.title}
            text={step.text}
          />
        ))}
      </div>
    </section>
  );
}

function JourneyPearl({
  index,
  title,
  text,
}: {
  index: number;
  title: string;
  text: string;
}) {
  return (
    <Reveal className="journey-pearl">
      <div className="pearl-art">
        <img src={asset(`pearl-small-${String(index + 1).padStart(2, "0")}.png`)} alt="" />
      </div>
      <div className="journey-card">
        <div className="card-header">
          <span className="card-index">0{index + 1}</span>
          <h3>{title}</h3>
        </div>
        <p>{text}</p>
      </div>
    </Reveal>
  );
}

function Services({ onBook }: { onBook: () => void }) {
  return (
    <section className="services-section section-anchor" id="services">
      <img className="underwater-band" src={asset("underwater-band.png")} alt="" />
      <img className="seaweed seaweed-left" src={asset("seaweed-left.png")} alt="" />
      <img className="seaweed seaweed-right" src={asset("seaweed-right.png")} alt="" />
      <div className="section-heading services-heading">
        <Reveal>
          <p className="eyebrow">How I can support you</p>
          <h2>Counselling that meets you where you are.</h2>
        </Reveal>
      </div>
      <div className="service-grid">
        {siteContent.services.map((service, index) => {
          const Icon = serviceIcons[service.icon] ?? Sparkles;
          return (
            <Reveal className="service-card" key={service.title}>
              <motion.div
                className="service-card-inner"
                whileHover={{ y: -8, rotate: index % 2 === 0 ? -1 : 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 18 }}
              >
                <Icon size={32} />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <div className="service-meta">
                  <span>{service.duration}</span>
                  <strong>{service.price}</strong>
                </div>
              </motion.div>
            </Reveal>
          );
        })}
      </div>
      <div className="center-action">
        <button className="primary-button" type="button" onClick={onBook}>
          <CalendarDays size={18} />
          Book a Session
        </button>
      </div>
    </section>
  );
}

function Approach() {
  return (
    <section className="approach-section section-anchor" id="approach">
      <div className="approach-copy">
        <Reveal>
          <p className="eyebrow">The approach</p>
          <h2>A steady place to breathe, reflect, and begin again.</h2>
          <p>
            Therapy here is spacious, collaborative, and grounded. You are not rushed
            toward a version of healing that does not fit you.
          </p>
        </Reveal>
      </div>
      <div className="approach-grid">
        {siteContent.approach.map((item, index) => (
          <Reveal className="approach-card" key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function AboutLearning({ onBook }: { onBook: () => void }) {
  return (
    <section className="about-learning section-anchor" id="about">
      <div className="learning-panel section-anchor" id="learning">
        <Reveal>
          <BookOpen size={34} />
          <h2>{siteContent.learning.title}</h2>
          <p>{siteContent.learning.body}</p>
          <button className="text-link" type="button" onClick={() => scrollToHash("#faq")}>
            {siteContent.learning.cta}
          </button>
        </Reveal>
        <img src={asset("learning-pearl.png")} alt="" />
      </div>
      <div className="about-panel">
        <Reveal className="portrait-wrap">
          <img src={asset("portrait-illustration.png")} alt="Illustrated portrait of Rehab" />
        </Reveal>
        <Reveal className="about-copy">
          <p className="eyebrow">About Rehab</p>
          <h2>{siteContent.about.title}</h2>
          <p>{siteContent.about.body}</p>
          <ul>
            {siteContent.about.credentials.map((credential) => (
              <li key={credential}>
                <CheckCircle2 size={18} />
                {credential}
              </li>
            ))}
          </ul>
          <button className="ghost-button" type="button" onClick={onBook}>
            <CalendarDays size={18} />
            More about working together
          </button>
        </Reveal>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="faq-section section-anchor" id="faq">
      <Reveal className="section-heading">
        <p className="eyebrow">Questions</p>
        <h2>Before your first session.</h2>
      </Reveal>
      <div className="faq-list">
        {siteContent.faqs.map((item) => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Contact({ onBook }: { onBook: () => void }) {
  return (
    <section className="contact-section section-anchor" id="contact">
      <div className="contact-banner">
        <Reveal>
          <p className="eyebrow">Begin gently</p>
          <h2>{siteContent.contact.title}</h2>
          <p>{siteContent.contact.body}</p>
          <button className="primary-button" type="button" onClick={onBook}>
            <CalendarDays size={18} />
            Open Booking Request
          </button>
        </Reveal>
      </div>
      <div className="contact-grid">
        <Reveal className="contact-details">
          <h3>Let's connect</h3>
          <a href={`mailto:${siteContent.brand.email}`}>
            <Mail size={18} />
            {siteContent.brand.email}
          </a>
          <a href={`tel:${siteContent.brand.phone.replace(/\s+/g, "")}`}>
            <Phone size={18} />
            {siteContent.brand.phone}
          </a>
          <p>
            <Monitor size={18} />
            Telehealth Australia-wide
          </p>
          <p>
            <ShieldCheck size={18} />
            {siteContent.brand.registration}
          </p>
        </Reveal>
        <Reveal className="contact-form-card">
          <BookingForm />
        </Reveal>
      </div>
    </section>
  );
}

function BookingModal({ open, onClose, onPrivacy }: { open: boolean; onClose: () => void; onPrivacy: () => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Booking request"
        >
          <motion.div
            className="booking-modal"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 250 }}
          >
            <button className="close-button" type="button" onClick={onClose} aria-label="Close">
              <X size={22} />
            </button>
            <div className="modal-intro">
              <p className="eyebrow">Booking request</p>
              <h2>Tell me what support would feel helpful.</h2>
            </div>
            <BookingForm onPrivacy={onPrivacy} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function BookingForm({ onPrivacy }: { onPrivacy?: () => void }) {
  const [form, setForm] = useState<FormState>(formInitialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const emailIsValid = useMemo(() => /\S+@\S+\.\S+/.test(form.email), [form.email]);

  // Bot protection: track when the form was loaded
  const formLoadedAt = useRef(Date.now());
  // Honeypot value
  const [honeypot, setHoneypot] = useState("");

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleTextChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    updateField(name as keyof FormState, value as never);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");

    // Client-side validation
    const nextErrors: FormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your name.";
    if (!form.email.trim()) nextErrors.email = "Please enter your email.";
    if (form.email.trim() && !emailIsValid) nextErrors.email = "Please enter a valid email.";
    if (!form.message.trim()) nextErrors.message = "Please share a short message.";
    if (!form.consent) nextErrors.consent = "Please confirm permission to be contacted.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // Submit to backend
    setSubmitting(true);
    try {
      const response = await fetch("/.netlify/functions/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          _hp: honeypot,
          _t: formLoadedAt.current,
        }),
      });

      if (response.status === 429) {
        setServerError("Too many requests. Please wait a few minutes and try again.");
        return;
      }

      if (response.status === 422) {
        const data = await response.json();
        setErrors(data.errors ?? {});
        return;
      }

      if (!response.ok) {
        setServerError("Something went wrong. Please try again or contact us directly.");
        return;
      }

      setSubmitted(true);
    } catch {
      setServerError("Could not connect. Please check your internet and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        className="form-success"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CheckCircle2 size={44} />
        <h3>Thank you.</h3>
        <p>
          Your booking request has been received. Rehab will be in touch within 1–2
          business days via your preferred contact method.
        </p>
        <button className="ghost-button" type="button" onClick={() => { setSubmitted(false); formLoadedAt.current = Date.now(); }}>
          Send another request
        </button>
      </motion.div>
    );
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} noValidate>
      {/* Honeypot — invisible to real users, bots will fill it */}
      <div className="hp-field" aria-hidden="true">
        <label>
          Leave this empty
          <input
            name="_hp"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleTextChange}
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <span className="field-error">{errors.name}</span> : null}
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleTextChange}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <span className="field-error">{errors.email}</span> : null}
        </label>
      </div>
      <div className="form-row">
        <label>
          Phone optional
          <input
            name="phone"
            value={form.phone}
            onChange={handleTextChange}
            placeholder="0488 123 456"
          />
        </label>
        <label>
          Preferred service
          <select name="service" value={form.service} onChange={handleTextChange}>
            {siteContent.services.map((service) => (
              <option key={service.title}>{service.title}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Preferred contact method
        <select name="contactMethod" value={form.contactMethod} onChange={handleTextChange}>
          {siteContent.contact.preferredMethods.map((method) => (
            <option key={method}>{method}</option>
          ))}
        </select>
      </label>
      <label>
        Message
        <textarea
          name="message"
          value={form.message}
          onChange={handleTextChange}
          rows={4}
          placeholder="A few words about what you are hoping for..."
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message ? <span className="field-error">{errors.message}</span> : null}
      </label>
      <label className="consent-line">
        <input
          name="consent"
          type="checkbox"
          checked={form.consent}
          onChange={(event) => updateField("consent", event.target.checked)}
          aria-invalid={Boolean(errors.consent)}
        />
        <span>
          I consent to being contacted about this enquiry. See our{" "}
          <button type="button" className="text-link inline-link" onClick={onPrivacy}>
            Privacy Collection Notice
          </button>.
        </span>
      </label>
      {errors.consent ? <span className="field-error">{errors.consent}</span> : null}

      {serverError ? (
        <div className="server-error" role="alert">
          <ShieldCheck size={16} />
          {serverError}
        </div>
      ) : null}

      <button className="primary-button form-submit" type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <span className="spinner" />
            Sending…
          </>
        ) : (
          <>
            <Send size={18} />
            Send Request
          </>
        )}
      </button>
    </form>
  );
}

function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="modal-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Privacy collection notice"
        >
          <motion.div
            className="booking-modal privacy-modal"
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 24, stiffness: 250 }}
          >
            <button className="close-button" type="button" onClick={onClose} aria-label="Close">
              <X size={22} />
            </button>
            <div className="modal-intro">
              <p className="eyebrow">Privacy</p>
              <h2>Privacy Collection Notice</h2>
            </div>
            <div className="privacy-content">
              <h3>What information we collect</h3>
              <p>
                When you submit a booking request, we collect your name, email address,
                phone number (if provided), preferred service, preferred contact method,
                and the message you share with us.
              </p>

              <h3>Why we collect it</h3>
              <p>
                Your information is collected solely to respond to your enquiry through
                your preferred contact method and to arrange counselling services.
              </p>

              <h3>How we store it</h3>
              <p>
                Your data is stored securely using industry-standard encryption. We use
                Supabase (hosted in Australia where available) with row-level security
                enabled. All data is transmitted over HTTPS.
              </p>

              <h3>Who has access</h3>
              <p>
                Only Rehab (the counsellor and practice owner) has access to your
                booking requests. Your information is never shared with third parties
                for marketing or any other purpose.
              </p>

              <h3>Your rights</h3>
              <p>
                Under the Australian Privacy Principles, you have the right to:
              </p>
              <ul>
                <li>Request access to your personal information</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Withdraw your consent at any time</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{" "}
                <a href={`mailto:${siteContent.brand.email}`}>{siteContent.brand.email}</a>.
              </p>

              <h3>Data retention</h3>
              <p>
                Booking request data is retained only for as long as necessary to
                respond to your enquiry. If you become a client, records will be
                managed in accordance with the ACA Code of Ethics and relevant
                legislation.
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function Reveal({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function SiteFooter({ onPrivacy }: { onPrivacy: () => void }) {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <img src={asset("brand-shell.png")} alt="" />
        <div>
          <strong>{siteContent.brand.name}</strong>
          <span>{siteContent.brand.tagline}</span>
        </div>
      </div>
      <div className="footer-links">
        {siteContent.nav.slice(1).map((item) => (
          <button key={item.href} type="button" onClick={() => scrollToHash(item.href)}>
            {item.label}
          </button>
        ))}
        <button type="button" onClick={onPrivacy}>Privacy</button>
      </div>
      <p>This site is for general information and is not a replacement for professional advice.</p>
    </footer>
  );
}

export default App;
