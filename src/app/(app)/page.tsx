"use client";

import { useState, useCallback } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useDictationStore } from "@/store/dictation";
import { useTranslate } from "@/hooks";
import { Mic, StopCircle, Copy, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES } from "@/features/translation/utils";

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
        onSuccess: (data) => {
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
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Browser Not Supported</h2>
          <p className="text-slate-600 mt-2">
            Please use a modern browser like Chrome, Edge, or Safari
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dictation Workspace</h1>
        <button
          onClick={() => {
            reset();
            setTranslatedText("");
          }}
          className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-6 p-6">
        {/* Left Panel - Transcription */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Transcript</h2>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  isListening
                    ? "bg-red-100 text-red-700 animate-pulse"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {isListening ? "Listening..." : "Idle"}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col border border-slate-200 rounded-lg overflow-hidden">
            <div className="flex-1 overflow-auto p-4 bg-slate-50 scrollbar-thin">
              <p className="font-mono-transcript text-slate-900 whitespace-pre-wrap">
                {transcript}
                {interimTranscript && (
                  <span className="text-slate-400 italic">{interimTranscript}</span>
                )}
              </p>
              {!transcript && !interimTranscript && (
                <p className="text-slate-400">Start speaking...</p>
              )}
            </div>

            {/* Stats */}
            <div className="border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
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

            <button
              onClick={handleCopy}
              disabled={!transcript}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>

            <button
              onClick={handleDownload}
              disabled={!transcript}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            <button
              onClick={() => setTranscript("")}
              disabled={!transcript}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right Panel - Translation */}
        <div className="w-96 flex flex-col border-l border-slate-200 pl-6">
          <h2 className="text-lg font-semibold mb-4">Translation</h2>

          {/* Language Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Target Language
            </label>
            <select
              value={targetLanguage || ""}
              onChange={(e) => setTargetLanguage(e.target.value || null)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <button
            onClick={handleTranslate}
            disabled={!transcript || !targetLanguage || translateMutation.isPending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-medium transition mb-4"
          >
            {translateMutation.isPending ? "Translating..." : "Translate"}
          </button>

          {/* Translation Display */}
          {translatedText && (
            <div className="flex-1 border border-slate-200 rounded-lg overflow-hidden flex flex-col">
              <div className="flex-1 overflow-auto p-4 bg-slate-50 scrollbar-thin">
                <p className="font-mono-transcript text-slate-900 whitespace-pre-wrap">
                  {translatedText}
                </p>
              </div>
              <div className="border-t border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                Translated to {SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name}
              </div>
            </div>
          )}

          {/* Bilingual Toggle */}
          {translatedText && (
            <button
              onClick={() => setShowBilingual(!showBilingual)}
              className="mt-4 px-3 py-2 text-sm bg-slate-100 rounded hover:bg-slate-200 transition font-medium"
            >
              {showBilingual ? "Split View" : "Bilingual View"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
