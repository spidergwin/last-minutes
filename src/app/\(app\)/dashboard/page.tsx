"use client";

import { useTranscripts } from "@/hooks";
import Link from "next/link";
import { FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardPage() {
  const { data: transcripts = [] } = useTranscripts();
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transcript?")) return;

    try {
      const response = await fetch(`/api/transcripts/${id}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Transcript deleted");
        queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Transcripts</h1>
          <Link
            href="/app"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            New Dictation
          </Link>
        </div>

        {transcripts.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-600 mb-2">No transcripts yet</h2>
            <p className="text-slate-500 mb-6">Start dictating or upload audio to create transcripts</p>
            <Link
              href="/app"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Begin Dictation
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {transcripts.map((transcript: any) => (
              <div
                key={transcript.id}
                className="bg-white p-6 rounded-lg border border-slate-200 flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900">{transcript.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {new Date(transcript.createdAt).toLocaleDateString()} •{" "}
                    {transcript.wordCount} words
                  </p>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                    {transcript.originalText}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(transcript.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
