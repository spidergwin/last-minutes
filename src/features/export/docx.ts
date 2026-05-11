import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { Transcript, Summary } from "@prisma/client";

export async function exportAsDocx(transcript: Transcript, summaries?: Summary[]): Promise<Buffer> {
  const children: any[] = [
    new Paragraph({
      text: transcript.title,
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Date: ${transcript.createdAt.toDateString()}`, bold: true }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Duration: ${Math.round(transcript.duration / 60)} minutes`, bold: true }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Word Count: ${transcript.wordCount}`, bold: true }),
      ],
    }),
    new Paragraph({ text: "" }), // Spacing
  ];

  if (summaries && summaries.length > 0) {
    children.push(
      new Paragraph({
        text: "AI Summaries",
        heading: HeadingLevel.HEADING_2,
      })
    );

    summaries.forEach((s) => {
      children.push(
        new Paragraph({
          text: s.type.replace(/_/g, " "),
          heading: HeadingLevel.HEADING_3,
        })
      );
      
      // Basic formatting for the summary content
      const contentLines = s.content.split('\n');
      contentLines.forEach(line => {
        if (line.trim()) {
          children.push(new Paragraph({ text: line }));
        }
      });
      children.push(new Paragraph({ text: "" }));
    });
  }

  children.push(
    new Paragraph({
      text: "Transcript",
      heading: HeadingLevel.HEADING_2,
    })
  );

  const segments = (transcript as any).segments;
  if (segments && Array.isArray(segments) && segments.length > 0) {
    segments.forEach((seg) => {
      const speakerPrefix = seg.speaker ? `Speaker ${seg.speaker}: ` : "";
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: speakerPrefix, bold: true, color: "005599" }),
            new TextRun({ text: seg.text }),
          ],
        })
      );
    });
  } else {
    // Fallback if no segments
    const lines = transcript.originalText.split('\n');
    lines.forEach(line => {
      if (line.trim()) children.push(new Paragraph({ text: line }));
    });
  }

  if (transcript.translatedText) {
    children.push(new Paragraph({ text: "" }));
    children.push(
      new Paragraph({
        text: `Translation (${transcript.targetLanguage})`,
        heading: HeadingLevel.HEADING_2,
      })
    );
    const tLines = transcript.translatedText.split('\n');
    tLines.forEach(line => {
      if (line.trim()) children.push(new Paragraph({ text: line }));
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
