"use client";

import { useState, useCallback, useRef } from "react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const { uploadFiles } = generateReactHelpers<OurFileRouter>();

type UploadState = "idle" | "validating" | "uploading" | "processing" | "completed" | "error";

interface TranscriptionResult {
  id: string;
  text: string;
  words?: Array<{ text: string; start: number; end: number; speaker?: string }>;
  utterances?: Array<{ text: string; start: number; end: number; speaker: string }>;
  audio_duration?: number;
  language_code?: string;
  // Meeting-specific data from AssemblyAI
  segments?: Array<{
    speaker: string;
    text: string;
    start: number;
    end: number;
    confidence?: number;
    words?: Array<{ text: string; start: number; end: number; confidence?: number; speaker?: string }>;
  }>;
  speakers?: string[];
  confidence?: number;
  duration?: number;
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

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
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
      setError(`File too large. Maximum size is 2GB.`);
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

    const waitForResult = selectedFile.size < 5 * 1024 * 1024; // Wait for result for < 5MB

    try {
      // 1. Initiate upload (gets Google Drive resumable URL or R2 presigned URL)
      const initiateRes = await fetch("/api/upload/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
        }),
      });

      const initiateData = await initiateRes.json();
      if (!initiateRes.ok || !initiateData.success) {
        throw new Error(initiateData.error || "Failed to initialize upload.");
      }

      const { uploadUrl, type } = initiateData;
      let { publicUrl } = initiateData;

      // 2. Upload file directly to the provider via PUT request
      if (type === "uploadthing") {
        const res = await uploadFiles("mediaUploader", {
          files: [selectedFile],
          onUploadProgress: ({ progress }: { progress: number }) => setProgress(progress),
        });
        publicUrl = res[0].url;
      } else {
        const putResponseText = await new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhrRef.current = xhr;

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percentage = Math.round((event.loaded * 100) / event.total);
              setProgress(percentage);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(xhr.responseText);
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload."));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload aborted."));
          });

          xhr.open("PUT", uploadUrl, true);
          
          // For Google Drive resumable upload, we don't always need Content-Type in the PUT,
          // but it's safe to add.
          xhr.setRequestHeader("Content-Type", selectedFile.type);
          xhr.send(selectedFile);
        });

        // 3. Handle Google Drive specific logic to get the public URL
        if (type === "drive") {
          try {
            const driveFile = JSON.parse(putResponseText);
            const fileId = driveFile.id;
            
            const publicRes = await fetch("/api/drive/public", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fileId }),
            });
            const publicData = await publicRes.json();
            if (!publicRes.ok || !publicData.success) {
               throw new Error(publicData.error || "Failed to make Drive file public.");
            }
            publicUrl = publicData.publicUrl;
          } catch (e) {
            console.error("Failed to parse drive response or make public:", e);
            throw new Error("Failed to process Google Drive upload.");
          }
        }
      }

      // 4. Submit URL to Transcription API
      setState("processing");
      const submitRes = await fetch("/api/transcription/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio_url: publicUrl,
          language: language || undefined,
          wait: waitForResult,
        }),
      });

      const data = await submitRes.json();

      if (!submitRes.ok || !data.success) {
        setError(data.error || "Transcription submission failed.");
        setState("error");
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
    } catch (err: any) {
      if (err.message !== "Upload aborted.") {
        setError(err.message || "Upload failed. Please check your connection and try again.");
        setState("error");
      }
    }
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
