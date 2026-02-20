"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Transcript, CreateTranscriptInput } from "@/lib/validations";

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
      return response.json();
    },
  });
}

export function useTranscript(id: string) {
  return useQuery<Transcript>({
    queryKey: ["transcript", id],
    queryFn: async () => {
      const response = await fetch(`/api/transcripts/${id}`);
      if (!response.ok) throw new Error("Failed to fetch transcript");
      return response.json();
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
