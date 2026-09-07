import { z } from "zod";

// Tek e-posta kuralı — tüm ekranlar bunu kullansın.
// ForgotPassword ve EditEmail elle `includes("@")` yapıyordu ve "a@" gibi
// girdileri geçiriyordu; kullanıcı sıfırlama e-postasının neden gelmediğini
// anlayamıyordu.
export const emailSchema = z.object({
  email: z.string().email("Geçerli bir e-posta gir"),
});

export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta gir"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Adın en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta gir"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

export const trialSubjectSchema = z.object({
  subject: z.string().min(1),
  correct_count: z.number().int().min(0).max(120),
  wrong_count: z.number().int().min(0).max(120),
  empty_count: z.number().int().min(0).max(120),
});

export const trialEntrySchema = z.object({
  name: z.string().min(1, "Deneme adı gir").max(100),
  trial_date: z.string().min(1),
  exam_type: z.enum(["TYT", "AYT", "AYT_SAY", "AYT_EA", "AYT_SOZ", "LGS", "BRANCH"]),
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

/**
 * Zod hatasını ekranların kullandığı { alan: mesaj } şekline çevirir.
 *
 * Auth ekranları elle doğruluyordu ve `email.includes("@")` gibi zayıf
 * kontroller "a@" gibi girdileri geçiriyordu. AGENTS.md zaten Zod diyor;
 * şemalar yazılıydı ama hiçbir ekran kullanmıyordu.
 *
 *   const { ok, errors } = validate(loginSchema, { email, password });
 */
export function validate(schema, values) {
  const res = schema.safeParse(values);
  if (res.success) return { ok: true, errors: {}, data: res.data };
  const errors = {};
  for (const issue of res.error.issues) {
    const key = issue.path[0];
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return { ok: false, errors, data: null };
}
