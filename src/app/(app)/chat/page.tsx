"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, Loader2, Sparkles, Bot, User,
  ExternalLink, Menu, Plus, MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranscripts } from "@/hooks";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import {
  PromptInput,
  type PromptInputMessage,
  PromptInputTextarea,
  PromptInputSubmit,
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

function ChatInterface() {
  const searchParams = useSearchParams();
  const transcriptId = searchParams.get("transcriptId");
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  // Auto-generate title for new chats based on first message
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

  // Reset chat when transcript changes
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

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-7xl mx-auto rounded-2xl overflow-hidden bg-background shadow-2xl shadow-amber-500/5 border border-border/60">
      
      {/* Inner Sidebar for Transcripts */}
      {sidebarOpen && (
        <div className="w-72 border-r bg-card/50 flex flex-col shrink-0 transition-all duration-300">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold font-[family-name:var(--font-display)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Chat History
            </h3>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => router.push("/chat")}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 flex flex-col gap-1">
              <Button 
                variant={!transcriptId ? "secondary" : "ghost"} 
                className="w-full justify-start font-normal h-10 px-3"
                onClick={() => router.push("/chat")}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
              <div className="my-2 px-3 pt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Meeting Transcripts
              </div>
              {isLoadingTranscripts ? (
                <div className="px-3 py-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : transcripts.map((t: any) => (
                <Button
                  key={t.id}
                  variant={transcriptId === t.id ? "secondary" : "ghost"}
                  className={`w-full justify-start h-auto py-2.5 px-3 text-left ${transcriptId === t.id ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-100' : ''}`}
                  onClick={() => router.push(`/chat?transcriptId=${t.id}`)}
                >
                  <FileText className={`w-4 h-4 mr-3 shrink-0 ${transcriptId === t.id ? 'text-amber-600' : 'text-muted-foreground'}`} />
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <span className="truncate text-sm font-medium">{t.title}</span>
                    <span className="truncate text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0 bg-background relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-4 sm:p-5 border-b bg-card/80 backdrop-blur-xl z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full shrink-0 hover:bg-muted" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-4 h-4" />
            </Button>
            
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            
            <div className="min-w-0">
              <h2 className="text-lg font-bold truncate tracking-tight font-[family-name:var(--font-display)]">
                {transcriptId 
                  ? (isLoadingTranscript ? "Loading context..." : transcript?.title || "Meeting Chat")
                  : customTitle}
              </h2>
              {transcriptId && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isLoadingTranscript ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
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
        </div>

        {/* Chat Conversation Area */}
        <div className="flex flex-col h-full overflow-hidden">
          <Conversation className="flex-1 bg-muted/5">
            <ConversationContent className="p-4 sm:p-6">
              {messages.length === 0 ? (
                transcriptId ? (
                  <div className="max-w-2xl mx-auto bg-card border border-border/60 rounded-2xl p-6 text-center shadow-sm fade-up mt-8 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-600 shadow-sm relative">
                      <FileText className="w-10 h-10" />
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 border-[3px] border-card flex items-center justify-center text-white">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-2">
                      {isLoadingTranscript ? "Loading Context..." : transcript?.title}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto mb-8">
                      The AI has read this entire transcript and is ready to answer questions, extract action items, or summarize key points.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Summarize key points', 'What were the action items?', 'Did anyone mention a deadline?'].map((suggestion, i) => (
                        <Button
                          key={i}
                          variant="secondary"
                          size="sm"
                          className="rounded-full bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-xs shadow-sm"
                          onClick={() => sendMessage({ text: suggestion })}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <ConversationEmptyState
                    icon={
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mb-6 text-amber-600 shadow-sm mx-auto">
                        <Sparkles className="w-10 h-10" />
                      </div>
                    }
                    title="How can I help you today?"
                    description="Upload files, select a past meeting from the sidebar, or simply ask a question to get started."
                  />
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
                                <FileText className="h-4 w-4 text-amber-600" />
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
          <div className="p-3 sm:p-5 border-t bg-card/80 backdrop-blur-xl shrink-0">
            <PromptInput
              onSubmit={handleSubmit}
              className="max-w-4xl mx-auto w-full relative"
              globalDrop
              multiple
            >
              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                value={text}
                placeholder={transcriptId ? `Ask about ${transcript?.title || 'this meeting'}...` : "Message AI Assistant..."}
                className="pr-12 text-[15px] resize-none"
              />
              <PromptInputSubmit
                status={status === "streaming" || status === "submitted" ? "streaming" : "ready"}
                disabled={!text.trim() && (status !== "streaming" && status !== "submitted")}
                className="absolute bottom-2 right-2 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-md rounded-full"
              />
            </PromptInput>
            <div className="text-center mt-3">
              <p className="text-[10px] text-muted-foreground/60 font-medium tracking-wide uppercase">AI can make mistakes. Verify important information.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-8rem)] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
      <ChatInterface />
    </Suspense>
  );
}
