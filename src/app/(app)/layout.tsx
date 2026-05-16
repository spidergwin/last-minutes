"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { useUsage } from "@/hooks";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transcripts": "Transcripts",
  "/app": "Dictation Workspace",
  "/upload": "Upload & Transcribe",
  "/meetings": "Meetings",
  "/settings": "Settings",
  "/settings/billing": "Billing",
  "/settings/integrations": "Integrations",
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: usageData } = useUsage();

  // Match route titles, including dynamic routes
  let pageTitle = routeTitles[pathname] || "Workspace";
  if (pathname.startsWith("/transcripts/") && pathname !== "/transcripts") {
    pageTitle = "Transcript";
  } else if (pathname.startsWith("/dashboard/") && pathname !== "/dashboard") {
    pageTitle = "Transcript";
  }

  const planName = usageData?.subscription?.plan
    ? usageData.subscription.plan.charAt(0) + usageData.subscription.plan.slice(1).toLowerCase()
    : "Free";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-border" />
            <h1 className="text-sm font-semibold text-foreground font-[family-name:var(--font-display)]">
              {pageTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs font-normal bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              {planName} Plan
            </Badge>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 min-w-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
