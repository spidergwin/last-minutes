"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Loader2, Sparkles, Bot, User,
  ExternalLink, Menu, Plus, MessageSquare, Paperclip, Mic, Search, Zap, HelpCircle, Gift, Settings
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranscripts } from "@/hooks";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Thread } from "@/components/assistant-ui/thread";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
function ChatInterface() {
  const searchParams = useSearchParams();
  const transcriptId = searchParams.get("transcriptId");
  const router = useRouter();
  const { data: session } = useSession();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState<string>("New Chat");
  const [text, setText] = useState<string>("");

  const { data: transcripts = [], isLoading: isLoadingTranscripts } = useTranscripts();
  
  const { data: transcript, isLoading: isLoadingTranscript } = useQuery({
    queryKey: ["transcript", transcriptId],
    queryFn: async () => {
      if (!transcriptId) return null;
      const res = await fetch(`/api/transcripts/${transcriptId}`);
      if (!res.ok) throw new Error("Failed to load transcript");
      const { data } = await res.json();
      return data;
    },
    enabled: !!transcriptId,
  });

  const runtime = useChatRuntime({
    transport: new AssistantChatTransport({
      api: "/api/chat",
      body: transcriptId ? { transcriptId } : undefined,
    }),
  });

  useEffect(() => {
    setCustomTitle("New Chat");
  }, [transcriptId]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full w-full">
      <div className="p-4 border-b flex items-center justify-between shrink-0">
        <h3 className="font-semibold text-sm">Projects ({transcripts.length})</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="w-full justify-start font-normal h-12 px-3 border-dashed"
            onClick={() => {
              router.push("/chat");
              setSheetOpen(false);
            }}
          >
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm font-medium">New Project</span>
              <span className="text-[10px] text-muted-foreground">...</span>
            </div>
          </Button>

          {isLoadingTranscripts ? (
            <div className="px-3 py-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          ) : transcripts.map((t: any) => (
            <Button
              key={t.id}
              variant={transcriptId === t.id ? "secondary" : "outline"}
              className={`w-full justify-start h-auto py-3 px-3 text-left ${transcriptId === t.id ? 'bg-accent/50' : 'bg-transparent hover:bg-accent/30'}`}
              onClick={() => {
                router.push(`/chat?transcriptId=${t.id}`);
                setSheetOpen(false);
              }}
            >
              <div className="flex flex-col min-w-0 overflow-hidden w-full">
                <div className="flex justify-between items-center w-full mb-0.5">
                  <span className="truncate text-sm font-medium pr-2">{t.title}</span>
                  <div className="w-3 h-3 rounded border opacity-30 shrink-0" />
                </div>
                <span className="truncate text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      
      {/* Custom Top Header mapping exactly to design */}
      <header className="flex-none h-16 border-b flex items-center justify-between px-6 bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-full shrink-0">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 flex flex-col">
              <SheetTitle className="sr-only">Chat History</SheetTitle>
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold truncate max-w-[200px] md:max-w-[400px] font-[family-name:var(--font-display)]">
              {transcriptId 
                ? (isLoadingTranscript ? "Loading..." : transcript?.title || "Meeting Chat")
                : customTitle}
            </h1>
            {transcriptId && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
                <span className="relative flex h-2 w-2">
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isLoadingTranscript ? 'bg-primary animate-pulse' : 'bg-primary'}`}></span>
                </span>
                Context Linked
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {transcriptId && (
            <Link href={`/transcripts/${transcriptId}`}>
              <Button variant="outline" size="sm" className="gap-2 rounded-full h-8">
                <ExternalLink className="h-3 w-3" />
                <span className="hidden sm:inline">View Source</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 min-w-0 bg-background h-full">
          <AssistantRuntimeProvider runtime={runtime}>
            <Thread />
          </AssistantRuntimeProvider>
        </div>

        {/* Desktop Sidebar for Transcripts (Right side) */}
        <div className="hidden md:flex w-72 border-l bg-card/10 flex-col shrink-0 h-full">
          <SidebarContent />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ChatInterface />
    </Suspense>
  );
}

function MoreHorizontal(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}
