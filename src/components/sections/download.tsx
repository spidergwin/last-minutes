"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Download() {
  return (
    <section className="py-24 relative overflow-hidden bg-muted/30 border-y border-border/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-background to-background" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10">
                  Mobile App
                </Badge>
                <Badge variant="outline" className="px-2 py-0.5 text-[10px] uppercase tracking-wider border-amber-500/30 text-amber-600 dark:text-amber-500">
                  Coming Soon
                </Badge>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-display)] leading-tight">
                Capture thoughts <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                  wherever you go
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg">
                Get the Last Minutes mobile app to record meetings, dictate on the move, and sync seamlessly with your desktop workspace. Your AI assistant, now in your pocket.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-6 rounded-2xl bg-background hover:bg-muted/50 border-border/50 shadow-sm flex items-center gap-3 w-full sm:w-auto"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.9 8.2c-.2-.2-.5-.4-.7-.4-.3-.1-.5-.1-.8-.1-.4 0-.8.1-1.2.3-.3.2-.6.5-.7.9-.2.4-.2.8-.2 1.3 0 .5 0 .9.2 1.3.1.4.4.7.7.9.4.2.8.3 1.2.3.3 0 .6-.1.8-.1.2-.1.5-.2.7-.4V10h-1.5v-1.2h2.9v4h-1.1v-.6c-.2.2-.5.4-.8.5-.3.1-.7.2-1.1.2-.6 0-1.1-.1-1.6-.4-.4-.3-.8-.7-1-1.2-.3-.5-.4-1.1-.4-1.8 0-.7.1-1.3.4-1.8.3-.5.6-.9 1-1.2.5-.3 1-.4 1.6-.4.4 0 .9.1 1.2.2.3.1.6.3.8.5L12.9 8.2zM21.7 17.5c-.3.5-.7 1-1.3 1.3-.6.3-1.2.5-1.9.5H8.7c-.7 0-1.3-.2-1.9-.5-.6-.3-1-.8-1.3-1.3-.3-.6-.5-1.2-.5-1.9V8.4c0-.7.2-1.3.5-1.9.3-.6.7-1 1.3-1.3.6-.3 1.2-.5 1.9-.5h9.8c.7 0 1.3.2 1.9.5.6.3 1 .8 1.3 1.3.3.6.5 1.2.5 1.9v7.2c.1.7-.1 1.3-.4 1.9z" />
                    <path d="M18.8 6.5h-9.9c-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5v10.1c0 .2.1.4.2.5.1.1.3.2.5.2h9.9c.2 0 .4-.1.5-.2.1-.1.2-.3.2-.5V7.2c0-.2-.1-.4-.2-.5-.1-.1-.3-.2-.5-.2z" opacity=".2" />
                    <path d="M11 11.5c0-.3 0-.5.1-.7.1-.2.3-.4.5-.5.2-.1.4-.2.7-.2.3 0 .5.1.8.2.2.1.4.3.5.5v2.8c-.1.2-.3.4-.5.5-.2.1-.5.2-.8.2-.3 0-.5-.1-.7-.2-.2-.1-.4-.3-.5-.5-.1-.2-.1-.4-.1-.7v-1.6z" />
                    <path d="M14.8 14.8c-.2.2-.4.4-.7.5-.3.1-.6.2-1 .2-.4 0-.7-.1-1-.2-.3-.1-.5-.3-.7-.5l.7-1c.1.1.3.3.5.3.2.1.4.1.6.1.2 0 .4 0 .5-.1.1-.1.2-.2.2-.3 0-.1 0-.2-.1-.3-.1-.1-.2-.2-.4-.2l-.6-.2c-.3-.1-.5-.2-.7-.4-.2-.2-.3-.5-.3-.8 0-.3.1-.6.3-.9.2-.2.5-.4.8-.5.3-.1.6-.2.9-.2.3 0 .6.1.8.2.3.1.5.3.7.5l-.7 1c-.1-.1-.3-.2-.4-.3-.2-.1-.4-.1-.5-.1-.2 0-.3 0-.4.1-.1.1-.2.2-.2.3 0 .1 0 .2.1.3.1.1.3.2.5.2l.6.2c.3.1.6.3.8.4.2.2.3.5.3.9 0 .3-.1.6-.3.9z" />
                  </svg>
                  <div className="flex flex-col items-start -mt-0.5">
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wide">Get it on</span>
                    <span className="text-sm font-bold leading-none mt-0.5">Google Play</span>
                  </div>
                </a>
              </Button>
              
              <Button
                size="lg"
                className="h-14 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-md flex items-center gap-3 w-full sm:w-auto"
                asChild
              >
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.15 2.95.92 3.78 2.29-3.21 1.94-2.58 6.44.88 7.82-.76 1.48-1.57 2.76-3.31 2.9zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <div className="flex flex-col items-start -mt-0.5">
                    <span className="text-[10px] uppercase text-zinc-400 dark:text-zinc-500 font-semibold tracking-wide">Download on the</span>
                    <span className="text-sm font-bold leading-none mt-0.5">App Store</span>
                  </div>
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative mx-auto w-full max-w-[260px] md:max-w-[280px]"
          >
            <div className="relative rounded-[2.5rem] border-[8px] border-zinc-900 dark:border-zinc-800 bg-background shadow-2xl overflow-hidden aspect-[9/19]">
              {/* iPhone Notch */}
              <div className="absolute top-0 inset-x-0 h-6 bg-zinc-900 dark:bg-zinc-800 rounded-b-3xl w-[120px] mx-auto z-20" />
              
              {/* Screen Content Mockup */}
              <div className="absolute inset-0 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
                <Image 
                  src="/app-image.png" 
                  alt="App Mockup" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            
            {/* Decorative background blobs */}
            <div className="absolute top-1/4 -right-12 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full -z-10" />
            <div className="absolute bottom-1/4 -left-12 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
