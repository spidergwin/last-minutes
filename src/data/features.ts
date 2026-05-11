export const featuresContent = {
  badge: "Capabilities",
  title: "Everything you need to capture ideas",
  description:
    "From live dictation to batch file processing, Last Minutes handles your entire transcription workflow with professional-grade accuracy.",
  items: [
    {
      title: "Real-Time Streaming",
      description:
        "Speak and see words appear instantly. Powered by Deepgram's Nova-3 engine for ultra-low latency streaming transcription.",
      icon: "Mic" as const,
      accent: "from-indigo-500 to-violet-500",
      span: "md:col-span-2",
    },
    {
      title: "File Transcription",
      description:
        "Upload audio or video files and get professional transcripts with speaker diarization and timestamps.",
      icon: "FileAudio" as const,
      accent: "from-violet-500 to-purple-500",
      span: "md:col-span-1",
    },
    {
      title: "AI Summarization",
      description:
        "Generate executive summaries, action items, and meeting notes from any transcript with one click.",
      icon: "Sparkles" as const,
      accent: "from-amber-500 to-orange-500",
      span: "md:col-span-1",
    },
    {
      title: "Nigerian Language Support",
      description:
        "First-class support for Hausa, Yoruba, Igbo, Pidgin, Edo, Efik, Tiv, and Fulfulde — plus 10+ international languages.",
      icon: "Globe" as const,
      accent: "from-emerald-500 to-teal-500",
      span: "md:col-span-2",
    },
  ],
};

export const benefitsContent = {
  title: "Built for professionals",
  items: [
    {
      step: "01",
      title: "Secure & Private",
      description:
        "All data encrypted in transit and at rest. Your transcripts stay private with enterprise-grade security.",
      icon: "Shield" as const,
    },
    {
      step: "02",
      title: "Multi-Format Export",
      description:
        "Download your transcripts as TXT, DOCX, PDF, SRT, VTT, or JSON — ready for any workflow.",
      icon: "Download" as const,
    },
    {
      step: "03",
      title: "Smart Translation",
      description:
        "Translate transcripts across 18+ languages with OpenAI-powered contextual accuracy.",
      icon: "Languages" as const,
    },
  ],
};
