"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDictationStore } from "@/store/dictation";

const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    : null;

export function useSpeechRecognition() {
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(null);
  const {
    setIsListening,
    setTranscript,
    setInterimTranscript,
    appendTranscript,
    setError,
    language,
  } = useDictationStore();

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.language = language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          appendTranscript(transcript);
        } else {
          interimTranscript += transcript;
        }
      }

      setInterimTranscript(interimTranscript);
    };

    recognition.onerror = (event: any) => {
      setError(`Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [language, setIsListening, setTranscript, setInterimTranscript, appendTranscript, setError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [setIsListening]);

  const abortListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  }, [setIsListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    startListening,
    stopListening,
    abortListening,
    isSupported: !!SpeechRecognition,
  };
}
