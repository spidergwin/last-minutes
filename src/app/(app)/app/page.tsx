"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useStreamingTranscription } from "@/hooks/useStreamingTranscription";
import { useDictationStore } from "@/store/dictation";
import { useTranslate, useCreateTranscript } from "@/hooks";
import { 
  Mic, 
  StopCircle, 
  Copy, 
  Download, 
  RotateCcw, 
  Languages, 
  Trash2,
  FileText,
  Save,
  Loader2,
  AlertCircle,
  Wand2,
  ChevronDown,
  Clock,
  Waves,
  X
} from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES } from "@/features/translation/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DictationWorkspace() {
  const {
    transcript,
    interimTranscript,
    isListening,
    isProcessing,
    targetLanguage,
    setTargetLanguage,
    reset,
    setTranscript,
    error,
    setError
  } = useDictationStore();

  const { startStreaming, stopStreaming, isSupported, error: streamingError, isConnecting } = useStreamingTranscription();
  const translateMutation = useTranslate();
  const createTranscriptMutation = useCreateTranscript();
  const [translatedText, setTranslatedText] = useState("");
  const [showTranslation, setShowTranslation] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Mount status for hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptEndRef.current && (transcript || interimTranscript)) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, interimTranscript]);

  // Timer for recording duration
  useEffect(() => {
    if (isListening) {
      setElapsedTime(0);
      timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isListening]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;

  const handleToggleMic = useCallback(() => {
    if (isListening) {
      stopStreaming();
    } else {
      startStreaming();
    }
  }, [isListening, startStreaming, stopStreaming]);

  // Keyboard shortcut: Cmd/Ctrl + Space to toggle mic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === "Space") {
        e.preventDefault();
        handleToggleMic();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleMic]);

  const requestPermission = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setError(null);
      toast.success("Microphone permission granted");
    } catch {
      setError("Microphone permission denied. Please enable it in your browser settings.");
      toast.error("Microphone permission denied");
    }
  }, [setError]);

  const handleTranslate = useCallback(async () => {
    if (!transcript || !targetLanguage) {
      toast.error("Enter text and select target language");
      return;
    }
    translateMutation.mutate(
      { text: transcript, sourceLang: "en", targetLang: targetLanguage },
      {
        onSuccess: (data: any) => {
          setTranslatedText(data.data.translatedText);
          setShowTranslation(true);
          toast.success("Translation complete");
        },
      }
    );
  }, [transcript, targetLanguage, translateMutation]);

  const handleSave = useCallback(async () => {
    if (!transcript) {
      toast.error("Nothing to save");
      return;
    }
    try {
      await createTranscriptMutation.mutateAsync({
        title: `Dictation — ${new Date().toLocaleDateString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
        originalText: transcript,
        sourceLanguage: "en",
        fileType: "dictation",
      });
      toast.success("Transcript saved to your library");
    } catch {
      toast.error("Failed to save transcript");
    }
  }, [transcript, createTranscriptMutation]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }, []);

  const handleDownload = useCallback((text: string, filename: string) => {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", `${filename}-${Date.now()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded successfully");
  }, []);

  if (!mounted) {
    return null; // Prevent hydration error by not rendering anything until mounted
  }

  if (!isSupported) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5 shadow-xl">
          <CardContent className="pt-8 pb-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-destructive text-xl font-bold font-[family-name:var(--font-display)]">Browser Not Supported</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Your browser doesn&apos;t support the Web Speech API. Please try Chrome, Edge, or Safari.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-6xl mx-auto">
      {/* Error Banner */}
      <AnimatePresence>
        {(error || streamingError) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-1 pt-1"
          >
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">{error || streamingError}</span>
                <Button size="sm" variant="outline" onClick={requestPermission} className="ml-4 h-7 text-xs bg-destructive/10 border-destructive/20 hover:bg-destructive/20">
                  Grant Permission
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 p-4 pb-0 min-h-0">
        {/* Transcript Panel */}
        <div className="flex-1 flex flex-col min-w-0 rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {/* Transcript Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Transcript</span>
              </div>
              {isListening && (
                <Badge variant="outline" className="text-[11px] px-2 py-0.5 text-red-500 border-red-500/30 bg-red-500/5 gap-1.5 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  REC {formatTime(elapsedTime)}
                </Badge>
              )}
              {isConnecting && (
                <Badge variant="outline" className="text-[11px] px-2 py-0.5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 bg-indigo-500/5 gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Connecting
                </Badge>
              )}
              {isProcessing && !isConnecting && !isListening && (
                <Badge variant="outline" className="text-[11px] px-2 py-0.5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 bg-indigo-500/5 gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Processing
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleCopy(transcript)} disabled={!transcript}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Copy</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleDownload(transcript, "transcript")} disabled={!transcript}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Download</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setTranscript(""); setTranslatedText(""); }} disabled={!transcript}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">Clear</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Transcript Body */}
          <div className="flex-1 overflow-y-auto scrollbar-thin relative">
            {transcript || interimTranscript ? (
              <div className="p-5 text-[15px] leading-[1.8] text-foreground/90">
                {transcript}
                <AnimatePresence>
                  {interimTranscript && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      className="text-indigo-500 dark:text-indigo-400"
                    >
                      {interimTranscript}
                    </motion.span>
                  )}
                </AnimatePresence>
                <div ref={transcriptEndRef} />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                {/* Animated waveform idle indicator */}
                <div className="flex items-end gap-[3px] h-10 mb-5">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-[3px] bg-gradient-to-t from-indigo-500/40 to-violet-500/20 rounded-full animate-wave origin-bottom"
                      style={{
                        height: `${Math.sin(i * 0.5) * 60 + 30}%`,
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: `${1.2 + Math.sin(i * 0.3) * 0.3}s`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground/70 text-sm font-medium">
                  Press the microphone to start recording
                </p>
                <p className="text-muted-foreground/40 text-xs mt-1.5">
                  or use <kbd className="inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">⌘</kbd> + <kbd className="inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">Space</kbd>
                </p>
              </div>
            )}
          </div>

          {/* Transcript Footer — Status + Word Count */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-border/40 bg-muted/10 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="tabular-nums">{wordCount} {wordCount === 1 ? "word" : "words"}</span>
              {transcript && (
                <>
                  <span className="text-border">·</span>
                  <span>English</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isListening && transcript && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-normal">
                  Ready to save
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Translation Panel */}
        <AnimatePresence>
          {showTranslation && translatedText && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden shrink-0"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-indigo-500/5">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-semibold">Translation</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowTranslation(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 text-[14px] leading-[1.8] text-foreground/90 scrollbar-thin">
                {translatedText}
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/40 bg-muted/10">
                <span className="text-xs text-muted-foreground capitalize">
                  {SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name || "Translation"}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => handleCopy(translatedText)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => handleDownload(translatedText, "translation")}>
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Control Bar */}
      <div className="shrink-0 px-4 py-4">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card shadow-lg px-4 py-3">
          {/* Left actions */}
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
                    onClick={() => { reset(); setTranslatedText(""); setShowTranslation(false); }}
                    disabled={!transcript && !isListening}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Reset Workspace</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl gap-2 text-sm"
              onClick={handleSave}
              disabled={!transcript || createTranscriptMutation.isPending}
            >
              {createTranscriptMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>
          </div>

          {/* Center mic button */}
          <div className="flex items-center gap-4">
            {isListening && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-red-500 tabular-nums font-medium">
                <Clock className="h-4 w-4" />
                {formatTime(elapsedTime)}
              </div>
            )}
            <button
              onClick={handleToggleMic}
              className={`relative group flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/30"
                  : "bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-indigo-500/30"
              } shadow-lg active:scale-95`}
            >
              {isListening ? (
                <StopCircle className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
              {isListening && (
                <span className="absolute inset-0 rounded-2xl border-2 border-red-500 animate-ping opacity-20" />
              )}
            </button>
            {isListening && (
              <div className="hidden sm:flex items-end gap-[2px] h-6">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[3px] bg-red-400 rounded-full animate-wave origin-bottom"
                    style={{
                      height: `${Math.random() * 60 + 40}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: `${0.6 + Math.random() * 0.4}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right actions — Translation */}
          <div className="flex items-center gap-2">
            <Select
              value={targetLanguage || ""}
              onValueChange={(value) => setTargetLanguage(value || null)}
            >
              <SelectTrigger className="h-10 w-[140px] rounded-xl text-sm border-border/60 hidden sm:flex">
                <SelectValue placeholder="Language..." />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, nativeName }]) => (
                  <SelectItem key={code} value={code} className="text-sm py-2">
                    {name} <span className="text-muted-foreground text-xs">({nativeName})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              className="h-10 px-4 rounded-xl gap-2 text-sm bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md shadow-indigo-500/15 border-0"
              disabled={!transcript || !targetLanguage || translateMutation.isPending}
              onClick={handleTranslate}
            >
              {translateMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Translate</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
