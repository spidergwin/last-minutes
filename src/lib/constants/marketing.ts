import { Mic, Shield, Globe, Sparkles } from "lucide-react";

export const MARKETING_CONTENT = {
  hero: {
    badge: {
      text: "AI-Powered Transcription v2.0",
      color: "blue",
    },
    title: {
      main: "Speak. Translate.",
      highlight: "Capture Ideas.",
    },
    description: "Professional speech-to-text transcription with real-time translation into Nigerian languages and beyond. Built for speed, accuracy, and clarity.",
    cta: {
      primary: {
        text: "Start Free Dictation",
        href: "/app",
      },
      secondary: {
        text: "Explore Features",
        href: "#features",
      },
    },
  },
  features: {
    tagline: "Everything you need to capture ideas",
    description: "Our advanced AI handles the complex heavy lifting, allowing you to focus on your thoughts.",
    items: [
      {
        title: "Real-time Dictation",
        description: "Capture your voice instantly with state-of-the-art accuracy. Supports multiple accents and dialects.",
        icon: Mic,
        className: "md:col-span-2",
        gradient: "from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900",
      },
      {
        title: "Secure Processing",
        description: "Your data is encrypted and processed with the highest privacy standards.",
        icon: Shield,
        gradient: "from-blue-100/20 to-neutral-100 dark:from-blue-900/20 dark:to-neutral-900",
      },
      {
        title: "Multilingual Support",
        description: "Speak in English and translate to Hausa, Yoruba, Igbo, or Pidgin instantly.",
        icon: Globe,
        gradient: "from-neutral-100 to-purple-100/20 dark:from-neutral-800 dark:to-purple-900/20",
      },
      {
        title: "Smart Formatting",
        description: "AI-driven punctuation and paragraphing to make your transcripts professional.",
        icon: Sparkles,
        className: "md:col-span-2",
        gradient: "from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900",
      },
    ],
  },
  languages: {
    title: "Native Language Support",
    items: [
      { name: "Hausa", flag: "🇳🇬" },
      { name: "Yoruba", flag: "🇳🇬" },
      { name: "Igbo", flag: "🇳🇬" },
      { name: "Pidgin", flag: "🇳🇬" },
      { name: "English", flag: "🇬🇧" },
      { name: "French", flag: "🇫🇷" },
      { name: "Spanish", flag: "🇪🇸" },
    ],
  },
  ctaSection: {
    title: "Ready to transcend limits?",
    description: "Experience the future of transcription today. Start your journey with Last Minutes for free.",
    buttonText: "Get Started Now",
    buttonHref: "/signup",
  },
  footer: {
    description: "Breaking barriers between speech and text. The ultimate transcription platform for the modern era.",
    links: [
      {
        title: "Product",
        items: [
          { name: "Features", href: "#features" },
          { name: "Pricing", href: "#pricing" },
          { name: "Security", href: "#security" },
        ],
      },
      {
        title: "Legal",
        items: [
          { name: "Privacy Policy", href: "/privacy" },
          { name: "Terms of Service", href: "/terms" },
          { name: "Cookie Policy", href: "/cookies" },
        ],
      },
    ],
    copyright: "© 2026 Last Minutes. Engineered with precision.",
  },
  pricing: {
    title: "Simple, transparent pricing",
    description: "Choose the plan that's right for you. No hidden fees.",
    items: [
      {
        name: "Starter",
        price: "Free",
        description: "Perfect for quick thoughts and simple notes.",
        features: [
          "15 minutes per month",
          "Basic transcription",
          "English support only",
          "Community access",
        ],
        cta: "Get Started",
        popular: false,
      },
      {
        name: "Pro",
        price: "$19",
        period: "/mo",
        description: "For professionals who need more power.",
        features: [
          "Unlimited transcription",
          "Real-time translation",
          "All Nigerian languages",
          "Priority support",
          "Export to Word/PDF",
        ],
        cta: "Go Pro",
        popular: true,
      },
      {
        name: "Enterprise",
        price: "Custom",
        description: "Built for teams and large organizations.",
        features: [
          "SSO & SAML",
          "Custom API access",
          "Dedicated account manager",
          "SLA guarantees",
          "On-premise options",
        ],
        cta: "Contact Sales",
        popular: false,
      },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    items: [
      {
        question: "How accurate is the transcription?",
        answer: "Our AI model boasts over 98% accuracy for clear audio. It is specifically trained on various accents, including Nigerian English and Pidgin.",
      },
      {
        question: "Can I translate in real-time?",
        answer: "Yes, the Pro plan allows you to speak in one language and see the translation in real-time in another supported language.",
      },
      {
        question: "Is my data secure?",
        answer: "Absolutely. We use industry-standard AES-256 encryption for all data at rest and TLS for data in transit. Your recordings are your own.",
      },
      {
        question: "Do you support offline use?",
        answer: "Currently, Last Minutes requires an internet connection for our advanced AI processing. We are working on a lightweight mobile app for basic offline notes.",
      },
    ],
  },
};
