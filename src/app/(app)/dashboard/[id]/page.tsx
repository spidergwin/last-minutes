"use client";

import { use, useState, useCallback } from "react";
import { useTranscript, useDeleteTranscript, useSummarize, useUpdateTranscript } from "@/hooks";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { SUPPORTED_LANGUAGES } from "@/features/translation/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Copy,
  Download,
  Trash2,
  FileText,
  Clock,
  Languages,
  Sparkles,
  Loader2,
  Pencil,
  Check,
  X,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function TranscriptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: transcript, isLoading, error } = useTranscript(id);
  const deleteMutation = useDeleteTranscript();
  const summarizeMutation = useSummarize();
  const updateMutation = useUpdateTranscript();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [summaryType, setSummaryType] = useState<string>("EXECUTIVE_SUMMARY");
  const [summaryResult, setSummaryResult] = useState<any>(null);

  const handleCopy = useCallback(() => {
    if (transcript?.originalText) {
      navigator.clipboard.writeText(transcript.originalText);
      toast.success("Copied to clipboard");
    }
  }, [transcript]);

  const handleDownload = useCallback(() => {
    if (!transcript) return;
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(transcript.originalText)
    );
    element.setAttribute("download", `${transcript.title}-${Date.now()}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Downloaded");
  }, [transcript]);

  const handleExport = useCallback(
    (format: string) => {
      if (!transcript) return;
      window.open(`/api/export/${transcript.id}?format=${format}`, "_blank");
    },
    [transcript]
  );

  const handleDelete = async () => {
    if (!transcript) return;
    if (!confirm("Are you sure you want to delete this transcript?")) return;
    try {
      await deleteMutation.mutateAsync(transcript.id);
      toast.success("Transcript deleted");
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      router.push("/dashboard");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSaveTitle = async () => {
    if (!transcript || !editTitle.trim()) return;
    try {
      await updateMutation.mutateAsync({
        id: transcript.id,
        data: { title: editTitle.trim() },
      });
      queryClient.invalidateQueries({ queryKey: ["transcript", id] });
      setIsEditingTitle(false);
      toast.success("Title updated");
    } catch {
      toast.error("Failed to update title");
    }
  };

  const handleSummarize = async () => {
    if (!transcript) return;
    try {
      const result = await summarizeMutation.mutateAsync({
        transcriptId: transcript.id,
        type: summaryType as any,
      });
      setSummaryResult(result.data?.result || result.data);
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !transcript) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <FileText className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Transcript not found</p>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="h-9 text-lg font-bold w-64"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveTitle}>
                  <Check className="h-4 w-4 text-emerald-600" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditingTitle(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-display)]">
                  {transcript.title}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setEditTitle(transcript.title);
                    setIsEditingTitle(true);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
              <Clock className="h-3.5 w-3.5" />
              {format(new Date(transcript.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800/30"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Transcript Text */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <CardTitle className="text-base">Transcript</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs font-normal">
                  <Languages className="mr-1 h-3 w-3" />
                  {SUPPORTED_LANGUAGES[transcript.sourceLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name || "English"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-[15px] leading-[1.8] text-foreground/90 whitespace-pre-wrap">
                  {transcript.originalText}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Summary Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <CardTitle className="text-base">AI Summary</CardTitle>
              </div>
              <CardDescription>Generate an AI-powered summary of this transcript.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Select value={summaryType} onValueChange={setSummaryType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXECUTIVE_SUMMARY">Executive Summary</SelectItem>
                    <SelectItem value="ACTION_ITEMS">Action Items</SelectItem>
                    <SelectItem value="KEY_DECISIONS">Key Decisions</SelectItem>
                    <SelectItem value="MEETING_NOTES">Meeting Notes</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSummarize}
                  disabled={summarizeMutation.isPending}
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0"
                >
                  {summarizeMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate
                </Button>
              </div>
              {summaryResult && (
                <div className="rounded-lg border bg-muted/20 p-4">
                  <pre className="text-sm whitespace-pre-wrap text-foreground/90 font-sans">
                    {typeof summaryResult === "string"
                      ? summaryResult
                      : JSON.stringify(summaryResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar — Metadata & Export */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Metadata */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <CardTitle className="text-base">Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Words", value: transcript.wordCount?.toLocaleString() || "0" },
                {
                  label: "Duration",
                  value: transcript.duration
                    ? `${Math.floor(transcript.duration / 60)}m ${transcript.duration % 60}s`
                    : "—",
                },
                {
                  label: "Language",
                  value:
                    SUPPORTED_LANGUAGES[transcript.sourceLanguage as keyof typeof SUPPORTED_LANGUAGES]?.name || transcript.sourceLanguage,
                },
                { label: "Type", value: transcript.fileType || "dictation" },
                {
                  label: "Created",
                  value: format(new Date(transcript.createdAt), "MMM d, yyyy"),
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium capitalize">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Export */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <CardTitle className="text-base">Export</CardTitle>
              </div>
              <CardDescription>Download in your preferred format.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Plain Text", format: "txt" },
                  { label: "PDF", format: "pdf" },
                  { label: "Word", format: "docx" },
                  { label: "JSON", format: "json" },
                  { label: "SRT", format: "srt" },
                  { label: "VTT", format: "vtt" },
                ].map(({ label, format }) => (
                  <Button
                    key={format}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => handleExport(format)}
                  >
                    <Download className="mr-1.5 h-3 w-3" />
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
