export const siteContent = {
  brand: {
    name: "Pearls of Peace",
    descriptor: "Counselling",
    tagline: "Empathy. Healing. Growth.",
    registration: "ACA Registered Counsellor - Reg. No. R83180",
    email: "hello@pearlsofpeace.com.au",
    phone: "0488 123 456",
  },
  nav: [
    { label: "Home", href: "#home" },
    { label: "Journey", href: "#journey" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Approach", href: "#approach" },
    { label: "Learning", href: "#learning" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    eyebrow: "Trauma-informed telehealth counselling Australia-wide",
    headlineStart: "From within,",
    headlineScript: "healing begins.",
    body:
      "A gentle, culturally aware space to be seen, heard, and supported as you move toward steadiness, connection, and growth.",
    primaryCta: "Book a Session",
    secondaryCta: "Get in Touch",
  },
  trustSignals: [
    {
      title: "Telehealth counselling",
      detail: "Australia-wide",
    },
    {
      title: "ACA registered",
      detail: "Reg. No. R83180",
    },
    {
      title: "Languages",
      detail: "English, Hindi, Urdu, Arabic",
    },
  ],
  journey: [
    {
      title: "Life Brings Challenges",
      text: "Sometimes something tiny can feel overwhelming.",
    },
    {
      title: "You Are Gently Held",
      text: "A safe space to be seen, heard, and supported.",
    },
    {
      title: "Healing Takes Time",
      text: "Together, we nurture understanding and strength.",
    },
    {
      title: "Growth From Within",
      text: "You emerge more resilient, connected, and whole.",
    },
  ],
  services: [
    {
      icon: "heart",
      title: "Individual Counselling",
      description: "Support for anxiety, trauma, relationships, stress, and life changes.",
      duration: "50 mins",
      price: "$80",
    },
    {
      icon: "flower",
      title: "Grief & Loss Support",
      description: "Gentle, compassionate care while you move through loss.",
      duration: "50 mins",
      price: "$80",
    },
    {
      icon: "brain",
      title: "Anger Management",
      description: "Develop healthier ways to respond, repair, and rebuild balance.",
      duration: "50 mins",
      price: "$80",
    },
    {
      icon: "leaf",
      title: "Positive Lifestyle & Emotional Wellbeing",
      description: "Build self-esteem, confidence, resilience, and emotional clarity.",
      duration: "50 mins",
      price: "$80",
    },
    {
      icon: "users",
      title: "Couples Counselling",
      description: "Strengthen connection, communication, and shared understanding.",
      duration: "50 mins",
      price: "$80",
    },
  ],
  approach: [
    {
      title: "Person-centred",
      text: "Your pace, your values, and your lived experience guide the work.",
    },
    {
      title: "Trauma-informed",
      text: "Sessions are grounded in safety, choice, collaboration, and care.",
    },
    {
      title: "Inclusive",
      text: "Culturally sensitive support for adults and couples from diverse backgrounds.",
    },
  ],
  about: {
    title: "Hi, I'm Rehab",
    body:
      "I'm an ACA-registered counsellor offering warm, compassionate, and culturally sensitive support. I believe in the power of empathy and connection to help you navigate life's challenges and move toward a more meaningful life.",
    credentials: [
      "Master of Counselling",
      "ACA Reg. No. R83180",
      "Trauma-informed and person-centred practice",
      "English, Hindi, Urdu, and Arabic",
    ],
  },
  learning: {
    title: "Learning & Resources",
    body:
      "Explore grounded reflections on mental health, relationships, grief, resilience, and emotional wellbeing.",
    cta: "Visit Learning Page",
  },
  faqs: [
    {
      question: "Are sessions online?",
      answer:
        "Yes. Pearls of Peace offers telehealth counselling for clients across Australia.",
    },
    {
      question: "How long is a session?",
      answer: "Standard sessions run for 50 minutes.",
    },
    {
      question: "What does a session cost?",
      answer: "The current session fee is $80.",
    },
    {
      question: "What can I talk about?",
      answer:
        "You can bring anxiety, trauma, grief, relationship stress, anger, self-esteem, life transitions, or anything else affecting your wellbeing.",
    },
  ],
  contact: {
    title: "Ready to take the next step?",
    body:
      "Share a few details and this preview will show the booking request flow. A live form service can be connected later.",
    preferredMethods: ["Email", "Phone", "Either"],
  },
};

export type Service = (typeof siteContent.services)[number];
