"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

// Dynamically import Joyride to avoid SSR issues
const Joyride = dynamic(() => import("react-joyride") as any, { ssr: false }) as any;

export function OnboardingTour() {
  const [run, setRun] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();

  const steps: any[] = [
    {
      target: "body",
      content: "Welcome to Last Minutes! Let's take a quick tour of your new dictation workspace.",
      placement: "center",
      disableBeacon: true,
    },
    {
      target: "#sidebar-nav-dictation",
      content: "Here is your Dictation Workspace. This is where you can record audio in real-time.",
      placement: "right",
    },
    {
      target: "#dictation-mic-button",
      content: "Click this button or use Cmd/Ctrl + Space to start recording your dictation. It supports multi-language and speaker diarization.",
      placement: "top",
    },
    {
      target: "#dictation-language-selector",
      content: "Select the language you will be speaking in before you start recording.",
      placement: "top",
    },
    {
      target: "#sidebar-nav-upload",
      content: "Have pre-recorded audio or video? You can upload files here for batch transcription.",
      placement: "right",
    },
    {
      target: "#sidebar-nav-transcripts",
      content: "All your saved transcripts are securely stored in your library here.",
      placement: "right",
    },
    {
      target: "#sidebar-nav-settings",
      content: "Finally, customize your default language and account preferences in Settings. Enjoy!",
      placement: "right",
    },
  ];

  useEffect(() => {
    setIsMounted(true);
    
    // Check if the tour has been completed from our API
    const checkTourStatus = async () => {
      try {
        const response = await fetch("/api/user/preferences");
        if (response.ok) {
          const { data } = await response.json();
          // Only run if not completed AND we are on a main app page
          if (!data.tourCompleted && (pathname === "/dashboard" || pathname === "/app")) {
            // Slight delay to allow DOM to render
            setTimeout(() => setRun(true), 1000);
          }
        }
      } catch (error) {
        console.error("Failed to check tour status:", error);
      }
    };

    checkTourStatus();
  }, [pathname]);

  const handleJoyrideCallback = async (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = ["finished", "skipped"];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      // Save completion status to API
      try {
        await fetch("/api/user/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tourCompleted: true }),
        });
      } catch (error) {
        console.error("Failed to save tour completion:", error);
      }
    }
  };

  if (!isMounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: theme === "dark" ? "#1e293b" : "#ffffff",
          backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.5)",
          primaryColor: "#f59e0b",
          textColor: theme === "dark" ? "#f8fafc" : "#0f172a",
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "#f59e0b",
          borderRadius: "8px",
          color: "#fff",
        },
        buttonBack: {
          color: theme === "dark" ? "#94a3b8" : "#64748b",
        },
        buttonSkip: {
          color: theme === "dark" ? "#94a3b8" : "#64748b",
        },
      }}
    />
  );
}
