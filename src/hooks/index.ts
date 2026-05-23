"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Transcript, CreateTranscriptInput, UpdateTranscriptInput } from "@/lib/validations";

interface TranslateParams {
  text: string;
  sourceLang: string;
  targetLang: string;
}

export function useTranslate() {
  const mutation = useMutation({
    mutationFn: async (params: TranslateParams) => {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      return response.json();
    },
    onError: () => {
      toast.error("Translation failed");
    },
  });

  return mutation;
}

export function useTranscripts() {
  return useQuery<Transcript[]>({
    queryKey: ["transcripts"],
    queryFn: async () => {
      const response = await fetch("/api/transcripts");
      if (!response.ok) throw new Error("Failed to fetch transcripts");
      const json = await response.json();
      return json.data ?? [];
    },
  });
}

export function useTranscript(id: string) {
  return useQuery<Transcript>({
    queryKey: ["transcript", id],
    queryFn: async () => {
      const response = await fetch(`/api/transcripts/${id}`);
      if (!response.ok) throw new Error("Failed to fetch transcript");
      const json = await response.json();
      return json.data;
    },
    enabled: !!id,
  });
}

export function useCreateTranscript() {
  return useMutation({
    mutationFn: async (data: CreateTranscriptInput) => {
      const response = await fetch("/api/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create transcript");
      }

      return response.json();
    },
  });
}

export function useDeleteTranscript() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transcripts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete transcript");
      }

      return response.json();
    },
  });
}

// ============= Usage Hook =============

interface UsageData {
  usage: {
    monthlyDictationMins: number;
    monthlyUploadMins: number;
    monthlyTranslations: number;
    totalDictationMins: number;
    totalUploadMins: number;
    totalTranslations: number;
  };
  subscription: {
    plan: string;
    status: string;
    trialEndsAt?: string | null;
  };
  monthlyTranscripts: number;
}

export function useUsage() {
  return useQuery<UsageData>({
    queryKey: ["usage"],
    queryFn: async () => {
      const response = await fetch("/api/usage");
      if (!response.ok) throw new Error("Failed to fetch usage");
      return response.json();
    },
  });
}

// ============= Summarize Hook =============

interface SummarizeParams {
  transcriptId: string;
  type: "EXECUTIVE_SUMMARY" | "ACTION_ITEMS" | "KEY_DECISIONS" | "MEETING_NOTES" | "CUSTOM";
  customPrompt?: string;
}

export function useSummarize() {
  return useMutation({
    mutationFn: async (params: SummarizeParams) => {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate summary");
      }

      return response.json();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Summary generated");
    },
  });
}

// ============= Update Transcript Hook =============

interface UpdateTranscriptParams {
  id: string;
  data: UpdateTranscriptInput;
}

export function useUpdateTranscript() {
  return useMutation({
    mutationFn: async ({ id, data }: UpdateTranscriptParams) => {
      const response = await fetch(`/api/transcripts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update transcript");
      }

      return response.json();
    },
  });
}
