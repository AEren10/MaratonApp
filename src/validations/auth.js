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

export const trialSubjectSchema = z.object({
  subject: z.string().min(1),
  correct_count: z.number().int().min(0).max(120),
  wrong_count: z.number().int().min(0).max(120),
  empty_count: z.number().int().min(0).max(120),
});

export const trialEntrySchema = z.object({
  name: z.string().min(1, "Deneme adi girin").max(100),
  trial_date: z.string().min(1),
  exam_type: z.enum(["tyt", "ayt_say", "ayt_ea", "ayt_soz", "lgs", "branch"]),
  total_net: z.number().min(-200).max(500),
  subjects: z.array(trialSubjectSchema).min(1),
});

export const studyLogSchema = z.object({
  subject: z.string().min(1),
  topic: z.string().min(1),
  questionCount: z.number().int().min(0).max(1000).optional(),
  correctCount: z.number().int().min(0).max(1000).optional(),
  duration: z.number().int().min(1).max(720),
  notes: z.string().max(140).optional(),
}).refine(
  (d) => !d.correctCount || !d.questionCount || d.correctCount <= d.questionCount,
  { message: "Doğru sayısı soru sayısından büyük olamaz", path: ["correctCount"] },
);

export const userTaskSchema = z.object({
  subject: z.string().min(1, "Ders seçmelisin"),
  topic: z.string().optional(),
  questionCount: z.number().int().min(0).max(500).optional(),
  targetMinutes: z.number().int().min(0).max(720).optional(),
  note: z.string().max(140).optional(),
});
