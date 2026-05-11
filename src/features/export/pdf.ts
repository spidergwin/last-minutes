import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Transcript, Summary } from "@prisma/client";

export async function exportAsPdf(transcript: Transcript, summaries?: Summary[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  let y = height - 50;
  const margin = 50;
  const maxWidth = width - 2 * margin;

  const drawText = (text: string, font: any, size: number, color = rgb(0, 0, 0)) => {
    // Very simple text wrapping
    const words = text.split(' ');
    let line = '';
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const textWidth = font.widthOfTextAtSize(testLine, size);
      
      if (textWidth > maxWidth && line !== '') {
        page.drawText(line, { x: margin, y, size, font, color });
        y -= size + 5;
        line = word + ' ';
        
        // Add new page if we run out of space
        if (y < margin) {
          page = pdfDoc.addPage();
          y = height - 50;
        }
      } else {
        line = testLine;
      }
    }
    
    if (line.trim()) {
      page.drawText(line, { x: margin, y, size, font, color });
      y -= size + 10;
    }
  };

  // Title
  drawText(transcript.title, timesRomanBoldFont, 24);
  y -= 10;

  // Metadata
  drawText(`Date: ${transcript.createdAt.toDateString()}`, timesRomanFont, 12);
  drawText(`Duration: ${Math.round(transcript.duration / 60)} minutes`, timesRomanFont, 12);
  drawText(`Word Count: ${transcript.wordCount}`, timesRomanFont, 12);
  y -= 20;

  // Summaries
  if (summaries && summaries.length > 0) {
    drawText('AI Summaries', timesRomanBoldFont, 18);
    y -= 5;
    
    for (const s of summaries) {
      drawText(s.type.replace(/_/g, " "), timesRomanBoldFont, 14);
      
      // PDF-lib doesn't handle newlines in drawText automatically well, so split
      const lines = s.content.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          drawText(line.trim(), timesRomanFont, 12);
        }
      }
      y -= 10;
    }
  }

  // Transcript
  drawText('Transcript', timesRomanBoldFont, 18);
  y -= 5;

  const segments = (transcript as any).segments;
  if (segments && Array.isArray(segments) && segments.length > 0) {
    for (const seg of segments) {
      const speakerPrefix = seg.speaker ? `Speaker ${seg.speaker}: ` : "";
      if (speakerPrefix) {
        drawText(speakerPrefix, timesRomanBoldFont, 12, rgb(0, 0.3, 0.6));
      }
      drawText(seg.text, timesRomanFont, 12);
    }
  } else {
    const lines = transcript.originalText.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        drawText(line.trim(), timesRomanFont, 12);
      }
    }
  }

  return await pdfDoc.save();
}
