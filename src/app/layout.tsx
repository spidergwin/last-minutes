import type { Metadata } from "next";
import { DM_Sans, Instrument_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Last Minutes — AI-Powered Speech-to-Text for Nigeria",
  description:
    "Professional-grade transcription with deep support for Nigerian languages. Real-time streaming, AI summaries, and multi-format exports.",
  keywords: [
    "speech to text",
    "transcription",
    "Nigerian languages",
    "Hausa",
    "Yoruba",
    "Igbo",
    "meeting notes",
    "AI summarization",
  ],
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' fill='%237c3aed'>🎙️</text></svg>",
        sizes: "any",
      },
    ],
  },
  openGraph: {
    title: "Last Minutes — AI-Powered Speech-to-Text for Nigeria",
    description:
      "Professional-grade transcription with deep support for Nigerian languages.",
    type: "website",
    locale: "en_NG",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${instrumentSans.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
