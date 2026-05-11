"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, Users, Settings, LogOut, Mic } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border p-6 sticky top-0 h-screen flex flex-col">
        <Link href="/admin" className="flex items-center gap-2 text-2xl font-bold mb-12">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white">
            <Mic className="size-5" />
          </div>
          <span>Admin</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {[
            { href: "/admin", icon: BarChart3, label: "Dashboard" },
            { href: "/admin/users", icon: Users, label: "Users" },
            { href: "/admin/settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
