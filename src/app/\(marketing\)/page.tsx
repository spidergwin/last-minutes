import Link from "next/link";
import { ArrowRight, Mic, FileUp, Languages, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">Last Minutes</div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition">
              Features
            </a>
            <a href="#languages" className="text-slate-600 hover:text-slate-900 transition">
              Languages
            </a>
            <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition">
              Pricing
            </a>
          </div>
          <div className="flex gap-4">
            <Link
              href="/signin"
              className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
            Speak. Translate.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Capture Ideas
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Professional speech-to-text transcription with real-time translation into Nigerian
            languages and beyond.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition transform hover:scale-105"
          >
            Start Free Dictation <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Animated waveform background */}
        <div className="mt-20 flex justify-center items-center gap-1 h-32 relative">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-wave"
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.1}ms`,
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Mic,
                title: "Live Dictation",
                description:
                  "Speak directly into your browser with real-time speech-to-text transcription",
              },
              {
                icon: FileUp,
                title: "File Transcription",
                description: "Upload audio and video files for professional transcription",
              },
              {
                icon: Languages,
                title: "Real-Time Translation",
                description: "Instantly translate transcripts into multiple languages",
              },
              {
                icon: Globe,
                title: "Nigerian Languages",
                description: "Full support for Hausa, Yoruba, Igbo, and Nigerian Pidgin",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-8 border border-slate-200 rounded-lg hover:shadow-lg transition"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section id="languages" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Supported Languages
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {[
              "English",
              "French",
              "Spanish",
              "Hausa",
              "Yoruba",
              "Igbo",
              "Pidgin",
            ].map((lang) => (
              <div
                key={lang}
                className="p-4 bg-white rounded-lg text-center font-semibold text-slate-700 border border-slate-200 hover:border-blue-400 transition"
              >
                {lang}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals using Last Minutes for transcription and translation.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-slate-100 font-semibold text-lg transition transform hover:scale-105"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Last Minutes</h3>
              <p className="text-slate-400">Professional speech-to-text and translation.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2026 Last Minutes. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
