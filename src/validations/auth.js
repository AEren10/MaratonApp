import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Gecerli bir e-posta girin"),
  password: z.string().min(6, "Sifre en az 6 karakter olmali"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Isim en az 2 karakter olmali"),
  email: z.string().email("Gecerli bir e-posta girin"),
  password: z.string().min(6, "Sifre en az 6 karakter olmali"),
});

export const trialEntrySchema = z.object({
  name: z.string().min(1, "Deneme adi girin"),
  date: z.string(),
  subjects: z.record(
    z.object({
      correct: z.number().min(0),
      wrong: z.number().min(0),
      empty: z.number().min(0),
    })
  ),
});

export const studyLogSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().optional(),
  questionCount: z.number().min(0).optional(),
  correctCount: z.number().min(0).optional(),
  duration: z.number().min(0).optional(),
  note: z.string().optional(),
});
