"use client";

import React, { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Users, Settings, LogOut, Mic, Menu, X, Loader2, ShieldAlert } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => {
    if (!isPending) {
      if (!session) {
        router.push("/signin");
      } else if ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN") {
        toast.error("You don't have permission to access the admin area");
        router.push("/dashboard");
      }
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out");
      router.push("/signin");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const navItems = [
    { href: "/admin", icon: BarChart3, label: "Dashboard" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/transcripts", icon: Mic, label: "Transcripts" },
    { href: "/admin/subscriptions", icon: BarChart3, label: "Subscriptions" },
    { href: "/admin/audit-logs", icon: ShieldAlert, label: "Audit Logs" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN")) {
    return null;
  }

  const SidebarContent = () => (
    <>
      <Link href="/admin" className="flex items-center gap-2 text-2xl font-bold mb-12" onClick={() => setMobileOpen(false)}>
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20">
          <Mic className="size-5" />
        </div>
        <span className="font-[family-name:var(--font-display)]">Admin Area</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium" 
                  : "hover:bg-accent hover:text-accent-foreground font-medium"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-amber-600 dark:text-amber-400" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-border space-y-4">
        <div className="flex items-center justify-between px-4">
          <span className="text-sm font-medium text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-2.5 h-auto font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <Link href="/admin" className="flex items-center gap-2 text-xl font-bold">
          <div className="p-1 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <Mic className="size-4" />
          </div>
          <span className="font-[family-name:var(--font-display)]">Admin Area</span>
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 flex flex-col p-6">
            <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-card border-r border-border p-6 sticky top-0 h-screen flex-col">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
