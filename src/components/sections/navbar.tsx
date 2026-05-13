"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Mic, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { mainNav } from "@/data/navigation";
import { siteConfig } from "@/data/site";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-shadow">
            <Mic className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight font-[family-name:var(--font-display)]">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {mainNav.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/signin" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              Sign In
            </Button>
          </Link>
          <Link href="/signup" className="hidden sm:inline-flex">
            <Button
              size="sm"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 border-0"
            >
              Get Started
            </Button>
          </Link>

          {/* Mobile Menu — Sheet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] flex flex-col">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                    <Mic className="w-3.5 h-3.5 text-white" />
                  </div>
                  {siteConfig.name}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Speech-to-text, simplified.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col justify-between flex-1 mt-4">
                <div className="flex flex-col gap-1">
                  {mainNav.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-base font-medium py-3 px-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="flex flex-col gap-2 pt-6 border-t">
                  <Link href="/signin" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
