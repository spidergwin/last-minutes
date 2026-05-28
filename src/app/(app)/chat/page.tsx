"use client";

import { useChat } from "@ai-sdk/react";
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

import {
  PromptInput,
  type PromptInputMessage,
  PromptInputTextarea,
  PromptInputSubmit,
  usePromptInputAttachments
} from "@/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";

// A small component to render the attach buttons inside the PromptInput context
function ChatInputActions() {
  const attachments = usePromptInputAttachments();

  return (
    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
      <button 
        type="button" 
        onClick={() => attachments.openFileDialog()}
        className="flex items-center gap-1.5 hover:text-foreground transition-colors"
      >
        <Paperclip className="w-3.5 h-3.5" />
        Attach
      </button>
      <button type="button" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
        <Mic className="w-3.5 h-3.5" />
        Voice Message
      </button>
      <button type="button" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
        <Search className="w-3.5 h-3.5" />
        Browse Prompts
      </button>
    </div>
  );
}

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

  const { messages, status, sendMessage, setMessages } = useChat({
    onError: (error) => toast.error(error.message || "Failed to send message"),
  });

  useEffect(() => {
    if (!transcriptId && messages.length > 0) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      if (firstUserMsg && customTitle === "New Chat") {
        const textPart = firstUserMsg.parts?.find(p => p.type === 'text');
        if (textPart && textPart.type === 'text') {
          const generatedTitle = textPart.text.length > 40 ? textPart.text.substring(0, 40) + "..." : textPart.text;
          setCustomTitle(generatedTitle);
        }
      }
    }
  }, [messages, transcriptId, customTitle]);

  useEffect(() => {
    setMessages([]);
    setCustomTitle("New Chat");
  }, [transcriptId, setMessages]);

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim() || message.files?.length) {
      sendMessage({
        text: message.text || "Sent with attachments",
        files: message.files,
      }, {
        body: { transcriptId }
      });
      setText("");
    }
  };

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
          {/* Chat Conversation Area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <Conversation className="flex-1">
              <ConversationContent className="p-4 sm:p-6 lg:px-24">
                {messages.length === 0 ? (
                  transcriptId ? (
                    <div className="max-w-2xl mx-auto text-center fade-up mt-12 mb-8">
                      <h3 className="text-4xl font-bold mb-4 tracking-tight">
                        {isLoadingTranscript ? "Loading Context..." : transcript?.title}
                      </h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-10">
                        The AI has read this transcript. Not sure where to start?
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {['Summarize key points', 'List action items', 'Identify decisions made', 'Draft a follow-up email'].map((suggestion, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            className="h-14 justify-between px-5 rounded-xl hover:bg-accent/50 border-border/60"
                            onClick={() => sendMessage({ text: suggestion })}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-sm">{suggestion}</span>
                            </div>
                            <Plus className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-3xl mx-auto w-full text-center fade-up mt-16 mb-8 px-4">
                      <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">Welcome to Last Minutes</h1>
                      <p className="text-muted-foreground mb-12 max-w-lg mx-auto">
                        Get started by assigning a task and Chat can do the rest. Not sure where to start?
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <Button variant="outline" className="h-16 justify-between px-5 rounded-2xl hover:bg-accent/50 border-border/60 shadow-sm" onClick={() => sendMessage({ text: "Write meeting minutes" })}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-[15px]">Write minutes</span>
                          </div>
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        
                        <Button variant="outline" className="h-16 justify-between px-5 rounded-2xl hover:bg-accent/50 border-border/60 shadow-sm" onClick={() => sendMessage({ text: "Extract action items" })}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-[15px]">Extract actions</span>
                          </div>
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        
                        <Button variant="outline" className="h-16 justify-between px-5 rounded-2xl hover:bg-accent/50 border-border/60 shadow-sm" onClick={() => sendMessage({ text: "Summarize decisions" })}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-accent-foreground">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-[15px]">Summarize decisions</span>
                          </div>
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        
                        <Button variant="outline" className="h-16 justify-between px-5 rounded-2xl hover:bg-accent/50 border-border/60 shadow-sm" onClick={() => sendMessage({ text: "Draft follow-up email" })}>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-foreground">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-[15px]">Draft email</span>
                          </div>
                          <Plus className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  messages.map((message) => (
                    <Message from={message.role} key={message.id}>
                      <MessageContent>
                        {message.parts?.map((part, i) => {
                          switch (part.type) {
                            case "text":
                              return (
                                <MessageResponse key={`${message.id}-${i}`}>
                                  {part.text}
                                </MessageResponse>
                              );
                            case "file":
                              return (
                                <div key={`${message.id}-${i}`} className="flex items-center gap-2 p-2 mt-2 rounded-lg bg-background/50 border border-border text-xs backdrop-blur-sm">
                                  <FileText className="h-4 w-4 text-primary" />
                                  <span className="truncate max-w-[150px] font-medium text-foreground">Attached Document</span>
                                </div>
                              );
                            default:
                              return null;
                          }
                        })}
                      </MessageContent>
                    </Message>
                  ))
                )}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            {/* Input Area */}
            <div className="p-4 sm:p-6 shrink-0 bg-transparent flex flex-col items-center w-full max-w-4xl mx-auto">
              <PromptInput
                onSubmit={handleSubmit}
                className="w-full relative shadow-md rounded-2xl border border-border bg-card focus-within:ring-1 focus-within:ring-ring transition-all flex flex-col overflow-hidden"
                globalDrop
                multiple
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              >
                <PromptInputTextarea
                  onChange={(e) => setText(e.target.value)}
                  value={text}
                  placeholder={transcriptId ? `Ask about ${transcript?.title || 'this meeting'}...` : "Summarize the latest..."}
                  className="pr-12 text-[15px] resize-none min-h-[80px] p-4 bg-transparent border-0 focus-visible:ring-0 shadow-none pb-12"
                />
                
                <div className="absolute bottom-0 left-0 w-full p-3 flex items-center justify-between">
                  <ChatInputActions />
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-medium">20 / 3,000</span>
                    <PromptInputSubmit
                      status={status === "streaming" || status === "submitted" ? "streaming" : "ready"}
                      disabled={!text.trim() && (status !== "streaming" && status !== "submitted")}
                      className="bg-transparent hover:bg-accent text-foreground shadow-none rounded-lg h-8 w-8"
                    />
                  </div>
                </div>
              </PromptInput>
              
              <div className="text-center mt-4">
                <p className="text-[11px] text-muted-foreground/70 font-medium">
                  Last Minutes may generate inaccurate information about people, places, or facts. Model: Last Minutes AI v1.3
                </p>
              </div>
            </div>
          </div>
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
