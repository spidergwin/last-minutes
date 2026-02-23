"use client";

import { useState, useCallback } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useDictationStore } from "@/store/dictation";
import { useTranslate } from "@/hooks";
import { Mic, StopCircle, Copy, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES } from "@/features/translation/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
  const [showBilingual, setShowBilingual] = useState(false);

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
        },
      }
    );
  }, [transcript, targetLanguage, translateMutation]);

  const handleCopy = useCallback(() => {
    const textToCopy = showBilingual ? `${transcript}\n\n${translatedText}` : transcript;
    navigator.clipboard.writeText(textToCopy);
    toast.success("Copied to clipboard");
  }, [transcript, translatedText, showBilingual]);

  const handleDownload = useCallback(() => {
    const element = document.createElement("a");
    const text = showBilingual ? `${transcript}\n\n${translatedText}` : transcript;
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", `transcript-${Date.now()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded");
  }, [transcript, translatedText, showBilingual]);

  if (!isSupported) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Browser Not Supported</h2>
          <p className="text-muted-foreground mt-2">
            Please use a modern browser like Chrome, Edge, or Safari
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dictation Workspace</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              setTranslatedText("");
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-6 p-6">
        {/* Left Panel - Transcription */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Transcript</h2>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  isListening
                    ? "bg-destructive/10 text-destructive animate-pulse"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isListening ? "Listening..." : "Idle"}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="flex-1 overflow-auto p-4 bg-muted/20 scrollbar-thin">
              <p className="font-mono-transcript text-foreground whitespace-pre-wrap">
                {transcript}
                {interimTranscript && (
                  <span className="text-muted-foreground italic">{interimTranscript}</span>
                )}
              </p>
              {!transcript && !interimTranscript && (
                <p className="text-muted-foreground">Start speaking...</p>
              )}
            </div>

            {/* Stats */}
            <div className="border-t border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              <span>{transcript.split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={handleToggleMic}
              className={`btn-mic ${isListening ? "listening" : ""}`}
              title={isListening ? "Stop listening" : "Start listening"}
            >
              {isListening ? (
                <StopCircle className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={!transcript}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>

            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={!transcript}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>

            <Button
              variant="ghost"
              onClick={() => setTranscript("")}
              disabled={!transcript}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Right Panel - Translation */}
        <div className="w-full md:w-96 flex flex-col border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-6">
          <h2 className="text-lg font-semibold mb-4">Translation</h2>

          {/* Language Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Target Language
            </label>
            <select
              value={targetLanguage || ""}
              onChange={(e) => setTargetLanguage(e.target.value || null)}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
            >
              <option value="">Select language...</option>
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, nativeName }]) => (
                <option key={code} value={code}>
                  {name} ({nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Translate Button */}
          <Button
            onClick={handleTranslate}
            disabled={!transcript || !targetLanguage || translateMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium mb-4"
          >
            {translateMutation.isPending ? "Translating..." : "Translate"}
          </Button>

          {/* Translation Display */}
          {translatedText && (
            <div className="flex-1 border border-border rounded-lg overflow-hidden flex flex-col shadow-sm">
              <div className="flex-1 overflow-auto p-4 bg-muted/20 scrollbar-thin">
                <p className="font-mono-transcript text-foreground whitespace-pre-wrap">
                  {translatedText}
                </p>
              </div>
              <div className="border-t border-border bg-card px-4 py-3 text-xs text-muted-foreground">
                Translated to {SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name}
              </div>
            </div>
          )}

          {/* Bilingual Toggle */}
          {translatedText && (
            <Button
              variant="secondary"
              onClick={() => setShowBilingual(!showBilingual)}
              className="mt-4"
            >
              {showBilingual ? "Split View" : "Bilingual View"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
