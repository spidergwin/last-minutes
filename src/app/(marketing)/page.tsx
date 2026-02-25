"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Mic, 
  FileUp, 
  Languages, 
  Globe, 
  Zap, 
  Shield, 
  Sparkles,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const features = [
    {
      title: "Live Dictation",
      description: "Speak directly into your browser with real-time speech-to-text transcription.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 items-center justify-center"><Mic className="w-10 h-10 text-blue-500" /></div>,
      icon: <Zap className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2",
    },
    {
      title: "File Transcription",
      description: "Upload audio and video files for professional transcription.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 items-center justify-center"><FileUp className="w-10 h-10 text-purple-500" /></div>,
      icon: <FileUp className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Real-Time Translation",
      description: "Instantly translate transcripts into multiple languages.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 items-center justify-center"><Languages className="w-10 h-10 text-green-500" /></div>,
      icon: <Languages className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Nigerian Languages",
      description: "Full support for Hausa, Yoruba, Igbo, and Nigerian Pidgin.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 items-center justify-center"><Globe className="w-10 h-10 text-amber-500" /></div>,
      icon: <Globe className="h-4 w-4 text-neutral-500" />,
      className: "md:col-span-2",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Last Minutes</span>
          </div>
          
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#languages" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Languages
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4 py-1 px-4 text-sm font-medium border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Next Generation Transcription
              </Badge>
              <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                Capture Every <br />
                <span className="text-blue-600 italic">Spoken Word</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Professional-grade speech-to-text with specialized support for Nigerian languages. 
                Translate, edit, and organize your ideas in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/app">
                  <Button size="lg" className="h-12 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    Start Dictating Now <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                    See Features
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Animated waveform background */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-24 flex justify-center items-center gap-1.5 h-24 relative"
          >
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 bg-blue-500/40 rounded-full animate-wave"
                style={{
                  height: `${((i * 11) % 70) + 30}%`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for professionals who need accuracy, speed, and versatility in their transcription workflow.
            </p>
          </div>
          
          <BentoGrid className="max-w-4xl mx-auto">
            {features.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={item.className}
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Secure & Private</h3>
              <p className="text-muted-foreground">Your data is encrypted and handled with the highest security standards. We respect your privacy.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Detailed Analytics</h3>
              <p className="text-muted-foreground">Track your word count, speaking speed, and productivity over time with our built-in dashboard.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Instant Export</h3>
              <p className="text-muted-foreground">Export your transcripts in various formats including PDF, Word, and SRT for video captions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section id="languages" className="py-24 bg-muted/50 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-12">Global reach, local focus</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "English", "French", "Spanish", "German", "Portuguese", "Italian", "Chinese",
              "Hausa", "Yoruba", "Igbo", "Pidgin", "Swahili", "Arabic"
            ].map((lang) => (
              <Badge key={lang} variant="outline" className="text-lg py-2 px-6 rounded-xl hover:bg-blue-500 hover:text-white transition-all cursor-default">
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600 dark:bg-blue-700" />
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to capture your thoughts?</h2>
          <p className="text-xl mb-10 text-blue-100 opacity-90">
            Join thousands of professionals using Last Minutes to streamline their transcription and translation workflow.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-bold shadow-xl hover:scale-105 transition-transform">
              Get Started for Free
            </Button>
          </Link>
          <p className="mt-6 text-blue-200 text-sm">No credit card required for the free tier.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <Mic className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold tracking-tight">Last Minutes</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Empowering communication through advanced AI transcription and translation technologies.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-muted-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-muted-foreground text-xs">
            <p>&copy; {new Date().getFullYear()} Last Minutes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
