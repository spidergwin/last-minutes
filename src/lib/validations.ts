import { z } from "zod";

// ============= Auth Schemas =============

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;

// ============= Transcript Schemas =============

export const createTranscriptSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  originalText: z.string().min(1, "Text is required"),
  sourceLanguage: z.string().default("en"),
  targetLanguage: z.string().optional(),
  fileUrl: z.string().url().optional(),
  fileType: z.enum(["audio", "video", "dictation"]).default("dictation"),
});

export const updateTranscriptSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  originalText: z.string().min(1).optional(),
  targetLanguage: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export type CreateTranscriptInput = z.infer<typeof createTranscriptSchema>;
export type UpdateTranscriptInput = z.infer<typeof updateTranscriptSchema>;

// ============= File Upload Schemas =============

export const fileUploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File, "Must be a file"),
  targetLanguage: z.string().optional(),
});

export const fileValidation = {
  maxSize: 100 * 1024 * 1024, // 100MB
  allowedAudioTypes: ["audio/mpeg", "audio/wav", "audio/mp4"],
  allowedVideoTypes: ["video/mp4", "video/webm"],
  getAllowedTypes() {
    return [...this.allowedAudioTypes, ...this.allowedVideoTypes];
  },
};

// ============= Translation Schemas =============

export const translateSchema = z.object({
  text: z.string().min(1, "Text is required"),
  sourceLang: z.string().default("en"),
  targetLang: z.string(),
});

export const batchTranslateSchema = z.object({
  texts: z.array(z.string()).min(1),
  sourceLang: z.string().default("en"),
  targetLang: z.string(),
});

export type TranslateInput = z.infer<typeof translateSchema>;
export type BatchTranslateInput = z.infer<typeof batchTranslateSchema>;

// ============= Language Meta =============

export const SUPPORTED_LANGUAGES = {
  en: "English",
  fr: "French",
  es: "Spanish",
  ha: "Hausa",
  yo: "Yoruba",
  ig: "Igbo",
  pid: "Nigerian Pidgin",
} as const;

export const NIGERIAN_LANGUAGES = ["ha", "yo", "ig", "pid"] as const;

// ============= API Response Schemas =============

export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type APIResponse<T = any> = z.infer<typeof apiResponseSchema> & {
  data?: T;
};
