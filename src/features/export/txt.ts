import { Transcript, Summary } from "@prisma/client";

export function exportAsTxt(transcript: Transcript, summaries?: Summary[]): string {
  let content = `${transcript.title}\n`;
  content += `${"=".repeat(transcript.title.length)}\n\n`;
  
  content += `Date: ${transcript.createdAt.toDateString()}\n`;
  content += `Duration: ${Math.round(transcript.duration / 60)} minutes\n`;
  content += `Word Count: ${transcript.wordCount}\n\n`;

  if (summaries && summaries.length > 0) {
    content += `--- SUMMARIES ---\n\n`;
    summaries.forEach((s) => {
      content += `[${s.type}]\n`;
      // Very basic serialization for TXT format
      if (s.metadata) {
        content += JSON.stringify(s.metadata, null, 2);
      } else {
        content += s.content;
      }
      content += `\n\n`;
    });
  }

  content += `--- TRANSCRIPT ---\n\n`;
  content += transcript.originalText;

  if (transcript.translatedText) {
    content += `\n\n--- TRANSLATION (${transcript.targetLanguage}) ---\n\n`;
    content += transcript.translatedText;
  }

  return content;
}
