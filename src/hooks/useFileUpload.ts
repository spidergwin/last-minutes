"use client";

import { useState, useCallback, useRef } from "react";

type UploadState = "idle" | "validating" | "uploading" | "processing" | "completed" | "error";

interface TranscriptionResult {
  id: string;
  text: string;
  words?: Array<{ text: string; start: number; end: number; speaker?: string }>;
  utterances?: Array<{ text: string; start: number; end: number; speaker: string }>;
  audio_duration?: number;
  language_code?: string;
}

interface UseFileUploadReturn {
  state: UploadState;
  progress: number;
  error: string | null;
  result: TranscriptionResult | null;
  jobId: string | null;
  selectFile: (file: File) => void;
  selectedFile: File | null;
  upload: (language?: string) => Promise<void>;
  reset: () => void;
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mp4",
  "audio/m4a",
  "audio/x-m4a",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
  "audio/aac",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export function useFileUpload(): UseFileUploadReturn {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    // Abort any in-progress upload
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    // Clear polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setState("idle");
    setProgress(0);
    setError(null);
    setResult(null);
    setJobId(null);
    setSelectedFile(null);
  }, []);

  const selectFile = useCallback((file: File) => {
    setError(null);
    setState("validating");

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      setState("error");
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.has(file.type)) {
      setError(`Unsupported file type: ${file.type || "unknown"}. Please upload an audio or video file.`);
      setState("error");
      return;
    }

    setSelectedFile(file);
    setState("idle");
  }, []);

  const pollForResult = useCallback(async (id: string) => {
    setState("processing");

    const poll = async () => {
      try {
        const response = await fetch(`/api/transcription/upload?jobId=${id}`);
        if (!response.ok) throw new Error("Failed to check status");

        const data = await response.json();

        if (data.data?.completed) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setResult(data.data);
          setState("completed");
        } else if (data.data?.status === "error" || data.error) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setError(data.error || data.data?.error || "Transcription failed");
          setState("error");
        }
        // else still processing, continue polling
      } catch (err) {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        setError("Failed to check transcription status");
        setState("error");
      }
    };

    // Poll every 3 seconds
    pollingRef.current = setInterval(poll, 3000);
    // Also do an immediate check
    poll();
  }, []);

  const upload = useCallback(async (language?: string) => {
    if (!selectedFile) {
      setError("No file selected");
      setState("error");
      return;
    }

    setState("uploading");
    setProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (language) formData.append("language", language);
    // For short files (< 5MB), wait for result directly
    const waitForResult = selectedFile.size < 5 * 1024 * 1024;
    if (waitForResult) formData.append("wait", "true");

    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      });

      xhr.addEventListener("load", () => {
        xhrRef.current = null;
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 400) {
            setError(data.error || "Upload failed");
            setState("error");
            resolve();
            return;
          }

          if (data.data) {
            // Direct result (waited for completion)
            setResult(data.data);
            setState("completed");
          } else if (data.jobId) {
            // Need to poll for result
            setJobId(data.jobId);
            pollForResult(data.jobId);
          }
        } catch {
          setError("Failed to process server response");
          setState("error");
        }
        resolve();
      });

      xhr.addEventListener("error", () => {
        xhrRef.current = null;
        setError("Upload failed. Please check your connection and try again.");
        setState("error");
        resolve();
      });

      xhr.addEventListener("abort", () => {
        xhrRef.current = null;
        setState("idle");
        resolve();
      });

      xhr.open("POST", "/api/transcription/upload");
      xhr.send(formData);
    });
  }, [selectedFile, pollForResult]);

  return {
    state,
    progress,
    error,
    result,
    jobId,
    selectFile,
    selectedFile,
    upload,
    reset,
  };
}
