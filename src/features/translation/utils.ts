export const SUPPORTED_LANGUAGES = {
  en: { name: "English", nativeName: "English" },
  fr: { name: "French", nativeName: "Français" },
  es: { name: "Spanish", nativeName: "Español" },
  ha: { name: "Hausa", nativeName: "Hausa" },
  yo: { name: "Yoruba", nativeName: "Yorùbá" },
  ig: { name: "Igbo", nativeName: "Igbo" },
  pid: { name: "Nigerian Pidgin", nativeName: "Naija Pidgin" },
} as const;

export const NIGERIAN_LANGUAGES = ["ha", "yo", "ig", "pid"] as const;

export function isNigerianLanguage(langCode: string): boolean {
  return (NIGERIAN_LANGUAGES as readonly string[]).includes(langCode);
}

export function getLanguageName(code: string, native: boolean = false): string {
  const lang = SUPPORTED_LANGUAGES[code as keyof typeof SUPPORTED_LANGUAGES];
  return lang ? (native ? lang.nativeName : lang.name) : code;
}

export function languageNameToCode(name: string): string | null {
  for (const [code, lang] of Object.entries(SUPPORTED_LANGUAGES)) {
    if (lang.name === name || lang.nativeName === name) {
      return code;
    }
  }
  return null;
}

export class TranslationError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: string
  ) {
    super(message);
    this.name = "TranslationError";
  }
}

export async function detectLanguage(_text: string): Promise<string> {
  // Placeholder - would implement language detection
  // For now, return English as default
  return "en";
}
