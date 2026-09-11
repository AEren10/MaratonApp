import { z } from "zod";

// Profil Düzenle ekranı elle kontrol ediyordu (sadece "isim boş mu?").
// AGENTS.md Zod diyor; diğer ekranlar zaten validate() kullanıyor.
export const editProfileSchema = z.object({
  name: z.string().trim().min(2, "Adın en az 2 karakter olmalı").max(50),
});
