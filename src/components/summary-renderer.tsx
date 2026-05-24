"use client";

import React, { useState } from "react";
import { Check, Copy, Download, FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatSummaryToText } from "@/features/summarization/formatter";

interface SummaryRendererProps {
  content: any;
  type: string;
  className?: string;
  hideActions?: boolean;
}

export function SummaryRenderer({ content, type, className, hideActions = false }: SummaryRendererProps) {
  const [copied, setCopied] = useState(false);

  // Try to parse if it's a string that looks like JSON
  let displayContent = content;
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === "object" && parsed !== null) {
        displayContent = parsed;
      }
    } catch (e) {
      // Not JSON, keep as string
    }
  }

  const copyToClipboard = () => {
    const textToCopy = formatSummaryToText(displayContent, type);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Summary copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const exportToTxt = () => {
    const textToExport = formatSummaryToText(displayContent, type);
    const blob = new Blob([textToExport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type.toLowerCase().replace(/_/g, "-")}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Summary exported as TXT");
  };

  const renderContent = () => {
    if (typeof displayContent === "string") {
      return <div className="whitespace-pre-wrap text-sm leading-relaxed">{displayContent}</div>;
    }

    switch (type) {
      case "EXECUTIVE_SUMMARY":
        return (
          <div className="space-y-4">
            {displayContent.overview && (
              <div>
                <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                  Overview
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">{displayContent.overview}</p>
              </div>
            )}
            {displayContent.keyTakeaways && displayContent.keyTakeaways.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Key Takeaways
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  {displayContent.keyTakeaways.map((item: string, i: number) => (
                    <li key={i} className="pl-1">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {displayContent.nextSteps && displayContent.nextSteps.length > 0 && (
              <div>
                <h4 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                  Next Steps
                </h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
                  {displayContent.nextSteps.map((item: string, i: number) => (
                    <li key={i} className="pl-1">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case "ACTION_ITEMS":
        return (
          <div className="space-y-3">
            {Array.isArray(displayContent) && displayContent.map((item: any, i: number) => (
              <div key={i} className="flex flex-col gap-1 pb-3 border-b border-muted last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-4 w-4 rounded-sm border border-primary/30 flex-shrink-0" />
                  <span className="font-medium text-sm">{item.task}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1 ml-7">
                  {item.assignee && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      {item.assignee}
                    </Badge>
                  )}
                  {item.deadline && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-amber-200 text-amber-700 bg-amber-50">
                      Due: {item.deadline}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case "KEY_DECISIONS":
        return (
          <div className="space-y-4">
            {Array.isArray(displayContent) && displayContent.map((item: any, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30 border border-muted-foreground/10 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/50" />
                <div className="font-semibold text-foreground mb-2 text-sm pl-1">{item.decision}</div>
                <div className="grid grid-cols-1 gap-2 text-xs pl-1">
                  {item.proposedBy && (
                    <div className="flex gap-1.5 items-center">
                      <span className="text-muted-foreground font-medium">Proposed by:</span>
                      <span className="bg-muted px-1.5 py-0.5 rounded">{item.proposedBy}</span>
                    </div>
                  )}
                  {item.rationale && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-medium">Rationale:</span>
                      <span className="text-muted-foreground/80 italic">"{item.rationale}"</span>
                    </div>
                  )}
                  {item.impact && (
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground font-medium">Impact:</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium">{item.impact}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case "MEETING_NOTES":
        return (
          <div className="space-y-6">
            {displayContent.title && (
              <div className="border-b pb-2 mb-4">
                <h3 className="text-lg font-bold text-foreground">{displayContent.title}</h3>
                {displayContent.date && <p className="text-xs text-muted-foreground mt-1">{displayContent.date}</p>}
              </div>
            )}
            
            {displayContent.attendees && displayContent.attendees.length > 0 && (
              <div>
                <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Attendees</h4>
                <div className="flex flex-wrap gap-1.5">
                  {displayContent.attendees.map((attendee: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-[10px] bg-background">{attendee}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {displayContent.topics && displayContent.topics.length > 0 && (
              <div className="space-y-5">
                <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">Discussion Topics</h4>
                {displayContent.topics.map((topic: any, i: number) => (
                  <div key={i} className="space-y-2 group/topic">
                    <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {topic.topic}
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground pl-3.5 border-l border-muted ml-0.5">
                      {topic.discussionPoints && topic.discussionPoints.map((point: string, j: number) => (
                        <li key={j} className="leading-relaxed relative before:content-[''] before:absolute before:-left-[18px] before:top-[9px] before:w-2 before:h-[1px] before:bg-muted">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-[400px] border border-muted-foreground/10 font-mono">
            {JSON.stringify(displayContent, null, 2)}
          </pre>
        );
    }
  };

  return (
    <div className={cn("relative group", className)}>
      {!hideActions && (
        <div className="absolute right-0 top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={copyToClipboard}
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={exportToTxt}
            title="Export as TXT"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className={cn(!hideActions && "pr-0 pt-0")}>
        {renderContent()}
      </div>
    </div>
  );
}
