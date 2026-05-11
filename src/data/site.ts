export const siteConfig = {
  name: "Last Minutes",
  tagline: "Capture Every Spoken Word",
  description:
    "Professional-grade speech-to-text platform with deep support for Nigerian languages. Transcribe, translate, summarize, and export — powered by AI.",
  url: "https://lastminutes.app",
  ogImage: "/og.png",
  creator: "Last Minutes Team",
  keywords: [
    "speech to text",
    "transcription",
    "Nigerian languages",
    "Hausa",
    "Yoruba",
    "Igbo",
    "Pidgin English",
    "meeting notes",
    "AI summarization",
    "voice to text",
  ],
  social: {
    twitter: "https://twitter.com/lastminutesapp",
    linkedin: "https://linkedin.com/company/lastminutes",
  },
} as const;

export type SiteConfig = typeof siteConfig;
