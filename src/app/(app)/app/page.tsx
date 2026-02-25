"use client";

import { useState, useCallback } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useDictationStore } from "@/store/dictation";
import { useTranslate } from "@/hooks";
import { 
  Mic, 
  StopCircle, 
  Copy, 
  Download, 
  RotateCcw, 
  Languages, 
  Trash2, 
  Settings2,
  FileText,
  Save,
  ChevronRight,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES } from "@/features/translation/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DictationWorkspace() {
  const {
    transcript,
    interimTranscript,
    isListening,
    targetLanguage,
    setTargetLanguage,
    reset,
    setTranscript,
  } = useDictationStore();

  const { startListening, stopListening, isSupported } = useSpeechRecognition();
  const translateMutation = useTranslate();
  const [translatedText, setTranslatedText] = useState("");
  const [activeTab, setActiveTab] = useState("transcript");

  const handleToggleMic = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleTranslate = useCallback(async () => {
    if (!transcript || !targetLanguage) {
      toast.error("Enter text and select target language");
      return;
    }

    translateMutation.mutate(
      {
        text: transcript,
        sourceLang: "en",
        targetLang: targetLanguage,
      },
      {
        onSuccess: (data: any) => {
          setTranslatedText(data.data.translatedText);
          setActiveTab("translation");
          toast.success("Translation complete");
        },
      }
    );
  }, [transcript, targetLanguage, translateMutation]);

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

  if (!isSupported) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Info className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Browser Not Supported</CardTitle>
            <CardDescription>
              Your current browser does not support the Web Speech API. 
              Please use a modern browser like Chrome, Edge, or Safari for the best experience.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-[calc(100vh-10rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dictation Workspace</h2>
          <p className="text-muted-foreground">Convert your voice to text and translate in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => {
                  reset();
                  setTranslatedText("");
                }}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Workspace</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Transcript
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Main Workspace */}
        <div className="lg:col-span-8 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="transcript" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Transcript
                </TabsTrigger>
                <TabsTrigger value="translation" disabled={!translatedText} className="gap-2">
                  <Languages className="h-4 w-4" />
                  Translation
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Badge variant={isListening ? "destructive" : "secondary"} className={isListening ? "animate-pulse px-3 py-1" : "px-3 py-1"}>
                  <div className={`mr-2 h-2 w-2 rounded-full ${isListening ? "bg-white" : "bg-muted-foreground"}`} />
                  {isListening ? "Listening..." : "Idle"}
                </Badge>
              </div>
            </div>

            <TabsContent value="transcript" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
              <Card className="flex-1 flex flex-col border-muted shadow-sm overflow-hidden">
                <CardContent className="flex-1 p-6 overflow-auto bg-muted/5 font-mono-transcript whitespace-pre-wrap leading-relaxed">
                  {transcript}
                  <AnimatePresence>
                    {interimTranscript && (
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-muted-foreground/60 italic"
                      >
                        {interimTranscript}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!transcript && !interimTranscript && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                      <Mic className="h-12 w-12" />
                      <p>Click the microphone to start speaking...</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t bg-muted/30 px-6 py-3 justify-between">
                  <div className="text-xs text-muted-foreground font-medium">
                    {transcript.split(/\s+/).filter(Boolean).length} words
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(transcript)} disabled={!transcript}>
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(transcript, "transcript")} disabled={!transcript}>
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="translation" className="flex-1 flex flex-col mt-0 data-[state=inactive]:hidden">
              <Card className="flex-1 flex flex-col border-muted shadow-sm overflow-hidden">
                <CardContent className="flex-1 p-6 overflow-auto bg-blue-500/5 font-mono-transcript whitespace-pre-wrap leading-relaxed">
                  {translatedText}
                </CardContent>
                <CardFooter className="border-t bg-muted/30 px-6 py-3 justify-between">
                  <div className="text-xs text-muted-foreground font-medium">
                    {SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name || "Translation"}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleCopy(translatedText)}>
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(translatedText, "translation")}>
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center gap-4 bg-background border rounded-full px-6 py-3 shadow-xl ring-1 ring-muted">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full text-muted-foreground hover:text-foreground"
                      onClick={() => setTranscript("")}
                      disabled={!transcript}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Clear Transcript</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <button
                onClick={handleToggleMic}
                className={`relative group flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/40" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/40"
                } shadow-lg active:scale-95`}
              >
                {isListening ? (
                  <StopCircle className="h-8 w-8 text-white" />
                ) : (
                  <Mic className="h-8 w-8 text-white" />
                )}
                {isListening && (
                  <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20" />
                )}
              </button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <Settings2 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Dictation Settings</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Languages className="h-5 w-5 text-blue-600" />
                Translation Settings
              </CardTitle>
              <CardDescription>Select your target language and translate your transcript.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Language</label>
                <Select
                  value={targetLanguage || ""}
                  onValueChange={(value) => setTargetLanguage(value || null)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select language..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, nativeName }]) => (
                      <SelectItem key={code} value={code}>
                        {name} <span className="text-muted-foreground ml-1">({nativeName})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold"
                disabled={!transcript || !targetLanguage || translateMutation.isPending}
                onClick={handleTranslate}
              >
                {translateMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Translating...
                  </div>
                ) : (
                  <>
                    Translate Text
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-muted bg-muted/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Toggle Recording</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>Space
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Translate Text</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>T
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Clear Transcript</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>⌫
                </kbd>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
