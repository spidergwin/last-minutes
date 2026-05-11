import { SummaryType } from "./schemas";

const BASE_SYSTEM_PROMPT = `You are a professional meeting assistant and transcriber. 
Your job is to analyze a meeting transcript and extract structured, highly accurate information.
Do not invent information. If an assignee or deadline is not explicitly mentioned or clearly implied, leave it blank or omit it.
The transcript may contain filler words or minor transcription errors; look past them to the core meaning.`;

export const getPromptForType = (type: SummaryType, customPrompt?: string): string => {
  switch (type) {
    case "EXECUTIVE_SUMMARY":
      return `${BASE_SYSTEM_PROMPT}
Create an executive summary of the meeting.
Focus on the big picture, the most critical takeaways, and the immediate next steps.
Format your response as a JSON object with 'overview' (string), 'keyTakeaways' (array of strings), and 'nextSteps' (array of strings).`;

    case "ACTION_ITEMS":
      return `${BASE_SYSTEM_PROMPT}
Extract all action items, tasks, and to-dos from the meeting.
Format your response as a JSON array of objects. Each object should have a 'task' (string), 'assignee' (string, optional), and 'deadline' (string, optional).`;

    case "KEY_DECISIONS":
      return `${BASE_SYSTEM_PROMPT}
Extract all key decisions made during the meeting.
Format your response as a JSON array of objects. Each object should have a 'decision' (string), 'rationale' (string, optional), and 'impact' (string, optional).`;

    case "MEETING_NOTES":
      return `${BASE_SYSTEM_PROMPT}
Create comprehensive meeting notes.
Group the discussion by logical topics.
Format your response as a JSON object with 'title' (string), 'attendees' (array of strings, inferred from speakers if possible), and 'topics' (array of objects with 'topic' string and 'discussionPoints' array of strings).`;

    case "CUSTOM":
      return `${BASE_SYSTEM_PROMPT}\n\n${customPrompt || "Summarize the following transcript."}`;
    
    default:
      return BASE_SYSTEM_PROMPT;
  }
};
