// Dictation feature utilities and helpers

export const DICTATION_CONFIG = {
  autoSave: true,
  autoSaveInterval: 10000, // 10 seconds
  debounceTranslation: 2000, // 2 seconds
  maxTranscriptLength: 50000,
};

export async function saveDictationToFile(text: string, filename: string = "transcript.txt") {
  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function exportAsPDF(title: string, text: string, translation?: string) {
  // Placeholder for PDF export - would use jsPDF or similar
  console.log("PDF export requested for:", title);
}

export function segmentTextForTranslation(text: string, maxChunkSize: number = 500): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}
