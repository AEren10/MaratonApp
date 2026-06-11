-- Subjects table: one row per ders (e.g. "Türkçe", "AYT Matematik")
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#A0A0B0',
  icon TEXT NOT NULL DEFAULT 'bookOpen',
  question_count INT NOT NULL DEFAULT 0,
  exam TEXT NOT NULL,           -- 'tyt', 'ayt', 'ydt'
  field TEXT,                    -- null for TYT, 'sayisal'/'ea'/'sozel'/'dil' for AYT/YDT
  "group" TEXT,                  -- optional grouping: 'fen', 'sosyal'
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Topics table: one row per konu
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_subjects_exam ON subjects(exam);

-- RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subjects_read" ON subjects FOR SELECT USING (true);
CREATE POLICY "topics_read" ON topics FOR SELECT USING (true);

-- ============================
-- SEED DATA: TYT
-- ============================

-- Türkçe
INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('turkce', 'Türkçe', '#60A5FA', 'bookOpen', 40, 'tyt', null, null, 1);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='turkce'), 'Sözcükte Anlam', 1),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Söz Yorumu', 2),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Deyim ve Atasözleri', 3),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Cümlede Anlam', 4),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Cümle Yorumu', 5),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Paragraf (Ana Düşünce)', 6),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Paragraf (Yardımcı Düşünce)', 7),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Paragraf (Yapı)', 8),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Ses Bilgisi', 9),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Yazım Kuralları', 10),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Noktalama İşaretleri', 11),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Sözcükte Yapı (Kök-Ek)', 12),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Sözcük Türleri', 13),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Fiil Çekimleri', 14),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Cümlenin Ögeleri', 15),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Cümle Türleri', 16),
  ((SELECT id FROM subjects WHERE key='turkce'), 'Anlatım Bozuklukları', 17);

-- Matematik
INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('matematik', 'Matematik', '#F5A623', 'hash', 40, 'tyt', null, null, 2);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='matematik'), 'Temel Kavramlar', 1),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Sayı Basamakları', 2),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Bölme ve Bölünebilme', 3),
  ((SELECT id FROM subjects WHERE key='matematik'), 'EBOB - EKOK', 4),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Rasyonel Sayılar', 5),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Ondalık Sayılar', 6),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Basit Eşitsizlikler', 7),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Mutlak Değer', 8),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Üslü Sayılar', 9),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Köklü Sayılar', 10),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Çarpanlara Ayırma', 11),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Oran - Orantı', 12),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Problemler (Dört İşlem)', 13),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Problemler (Kesir)', 14),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Problemler (Yüzde)', 15),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Problemler (Kar-Zarar)', 16),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Problemler (Hız)', 17),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Problemler (İşçi-Havuz)', 18),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Problemler (Yaş)', 19),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Problemler (Sayı)', 20),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Kümeler', 21),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Fonksiyonlar', 22),
  ((SELECT id FROM subjects WHERE key='matematik'), '1. Dereceden Denklemler', 23),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Permütasyon - Kombinasyon', 24),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Olasılık', 25),
  ((SELECT id FROM subjects WHERE key='matematik'), 'İstatistik (Ortalama, Medyan, Mod)', 26),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Üçgenler', 27),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Eşkenar ve İkizkenar Üçgen', 28),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Dik Üçgen ve Pisagor', 29),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Üçgende Alan', 30),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Açı-Kenar Bağıntıları', 31),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Çokgenler', 32),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Dörtgenler (Paralelkenar, Yamuk)', 33),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Dikdörtgen ve Kare', 34),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Çember ve Daire', 35),
  ((SELECT id FROM subjects WHERE key='matematik'), 'Katı Cisimler (Prizma, Silindir, Koni, Küre)', 36);

-- Fizik (TYT)
INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('fizik', 'Fizik', '#34D399', 'zap', 7, 'tyt', null, 'fen', 3);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='fizik'), 'Fizik Bilimine Giriş', 1),
  ((SELECT id FROM subjects WHERE key='fizik'), 'Madde ve Özellikleri', 2),
  ((SELECT id FROM subjects WHERE key='fizik'), 'Sıvıların Kaldırma Kuvveti', 3),
  ((SELECT id FROM subjects WHERE key='fizik'), 'Basınç', 4),
  ((SELECT id FROM subjects WHERE key='fizik'), 'Sıcaklık ve Isı', 5),
  ((SELECT id FROM subjects WHERE key='fizik'), 'Elektrostatik', 6),
  ((SELECT id FROM subjects WHERE key='fizik'), 'Elektrik Akımı', 7),
  ((SELECT id FROM subjects WHERE key='fizik'), 'Manyetizma', 8),
  ((SELECT id FROM subjects WHERE key='fizik'), 'Dalgalar', 9),
  ((SELECT id FROM subjects WHERE key='fizik'), 'Optik', 10);

-- Kimya (TYT)
INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('kimya', 'Kimya', '#34D399', 'flask', 7, 'tyt', null, 'fen', 4);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='kimya'), 'Kimya Bilimi', 1),
  ((SELECT id FROM subjects WHERE key='kimya'), 'Atom ve Periyodik Sistem', 2),
  ((SELECT id FROM subjects WHERE key='kimya'), 'Kimyasal Türler Arası Etkileşimler', 3),
  ((SELECT id FROM subjects WHERE key='kimya'), 'Maddenin Halleri', 4),
  ((SELECT id FROM subjects WHERE key='kimya'), 'Doğa ve Kimya', 5),
  ((SELECT id FROM subjects WHERE key='kimya'), 'Kimyasal Tepkimeler', 6),
  ((SELECT id FROM subjects WHERE key='kimya'), 'Kimya Her Yerde', 7);

-- Biyoloji (TYT)
INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('biyoloji', 'Biyoloji', '#34D399', 'heart', 6, 'tyt', null, 'fen', 5);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='biyoloji'), 'Canlıların Ortak Özellikleri', 1),
  ((SELECT id FROM subjects WHERE key='biyoloji'), 'Hücre', 2),
  ((SELECT id FROM subjects WHERE key='biyoloji'), 'Canlıların Sınıflandırılması', 3),
  ((SELECT id FROM subjects WHERE key='biyoloji'), 'Mitoz ve Eşeysiz Üreme', 4),
  ((SELECT id FROM subjects WHERE key='biyoloji'), 'Mayoz ve Eşeyli Üreme', 5),
  ((SELECT id FROM subjects WHERE key='biyoloji'), 'Kalıtım', 6),
  ((SELECT id FROM subjects WHERE key='biyoloji'), 'Ekosistem Ekolojisi', 7),
  ((SELECT id FROM subjects WHERE key='biyoloji'), 'Çevre Sorunları', 8);

-- Tarih (TYT)
INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('tarih', 'Tarih', '#A78BFA', 'clock', 5, 'tyt', null, 'sosyal', 6);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='tarih'), 'Tarih Bilimi', 1),
  ((SELECT id FROM subjects WHERE key='tarih'), 'İlk Çağ Uygarlıkları', 2),
  ((SELECT id FROM subjects WHERE key='tarih'), 'İlk Türk Devletleri', 3),
  ((SELECT id FROM subjects WHERE key='tarih'), 'İslam Medeniyeti ve Türk-İslam Devletleri', 4),
  ((SELECT id FROM subjects WHERE key='tarih'), 'Osmanlı Kuruluş ve Yükselme', 5),
  ((SELECT id FROM subjects WHERE key='tarih'), 'Osmanlı Duraklama ve Gerileme', 6),
  ((SELECT id FROM subjects WHERE key='tarih'), 'Osmanlı Son Dönem ve I. Dünya Savaşı', 7),
  ((SELECT id FROM subjects WHERE key='tarih'), 'Kurtuluş Savaşı', 8),
  ((SELECT id FROM subjects WHERE key='tarih'), 'Atatürk İlke ve İnkılapları', 9);

-- Coğrafya (TYT)
INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('cografya', 'Coğrafya', '#A78BFA', 'globe', 5, 'tyt', null, 'sosyal', 7);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='cografya'), 'Doğal Sistemler', 1),
  ((SELECT id FROM subjects WHERE key='cografya'), 'Dünya''nın Şekli ve Hareketleri', 2),
  ((SELECT id FROM subjects WHERE key='cografya'), 'Harita Bilgisi', 3),
  ((SELECT id FROM subjects WHERE key='cografya'), 'İklim Bilgisi', 4),
  ((SELECT id FROM subjects WHERE key='cografya'), 'Yerin Şekillenmesi (İç Kuvvetler)', 5),
  ((SELECT id FROM subjects WHERE key='cografya'), 'Yerin Şekillenmesi (Dış Kuvvetler)', 6),
  ((SELECT id FROM subjects WHERE key='cografya'), 'Nüfus ve Göç', 7),
  ((SELECT id FROM subjects WHERE key='cografya'), 'Yerleşme', 8),
  ((SELECT id FROM subjects WHERE key='cografya'), 'Türkiye''nin Fiziki Coğrafyası', 9),
  ((SELECT id FROM subjects WHERE key='cografya'), 'Türkiye''nin Beşeri Coğrafyası', 10);

-- Felsefe (TYT)
INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('felsefe', 'Felsefe', '#A78BFA', 'layers', 5, 'tyt', null, 'sosyal', 8);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='felsefe'), 'Felsefeye Giriş', 1),
  ((SELECT id FROM subjects WHERE key='felsefe'), 'Bilgi Felsefesi', 2),
  ((SELECT id FROM subjects WHERE key='felsefe'), 'Varlık Felsefesi', 3),
  ((SELECT id FROM subjects WHERE key='felsefe'), 'Ahlak Felsefesi', 4),
  ((SELECT id FROM subjects WHERE key='felsefe'), 'Din Felsefesi', 5);

-- Din Kültürü (TYT)
INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('din', 'Din Kültürü', '#A78BFA', 'star', 5, 'tyt', null, 'sosyal', 9);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='din'), 'Bilgi ve İnanç', 1),
  ((SELECT id FROM subjects WHERE key='din'), 'İbadetler', 2),
  ((SELECT id FROM subjects WHERE key='din'), 'Hz. Muhammed''in Hayatı', 3),
  ((SELECT id FROM subjects WHERE key='din'), 'Kur''an ve Yorumu', 4),
  ((SELECT id FROM subjects WHERE key='din'), 'Yaşayan Dinler', 5),
  ((SELECT id FROM subjects WHERE key='din'), 'Ahlak ve Değerler', 6);

-- ============================
-- SEED DATA: AYT SAYISAL
-- ============================

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_matematik', 'Matematik', '#F5A623', 'hash', 40, 'ayt', 'sayisal', null, 10);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Fonksiyonlar', 1),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Polinomlar', 2),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), '2. Dereceden Denklemler', 3),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Parabol', 4),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Eşitsizlikler', 5),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Mutlak Değer', 6),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Trigonometri (Temel)', 7),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Trigonometri (Dönüşüm Formülleri)', 8),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Trigonometri (Toplam-Fark)', 9),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Karmaşık Sayılar', 10),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Logaritma', 11),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Diziler ve Seriler', 12),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Limit', 13),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Türev (Kavram)', 14),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Türev (Uygulamalar)', 15),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Türev (Maks-Min Problemleri)', 16),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'İntegral (Belirsiz)', 17),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'İntegral (Belirli)', 18),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'İntegral (Alan-Hacim)', 19),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Analitik Geometri (Doğru)', 20),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Analitik Geometri (Çember)', 21),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Analitik Geometri (Konikler)', 22),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Matrisler', 23),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Determinant', 24),
  ((SELECT id FROM subjects WHERE key='ayt_matematik'), 'Özel Tanımlı Fonksiyonlar', 25);

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_fizik', 'Fizik', '#34D399', 'zap', 14, 'ayt', 'sayisal', null, 11);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Vektörler', 1),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Kuvvet ve Hareket', 2),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Newton''un Hareket Yasaları', 3),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Enerji ve Momentum', 4),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Tork ve Denge', 5),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Düzgün Çembersel Hareket', 6),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Basit Harmonik Hareket', 7),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Dalga Mekaniği', 8),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Elektrik Alan ve Potansiyel', 9),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Manyetik Alan ve Kuvvet', 10),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Elektromanyetik İndüksiyon', 11),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Alternatif Akım', 12),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Modern Fizik', 13),
  ((SELECT id FROM subjects WHERE key='ayt_fizik'), 'Atom Fiziği ve Radyoaktivite', 14);

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_kimya', 'Kimya', '#34D399', 'flask', 13, 'ayt', 'sayisal', null, 12);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Mol Kavramı', 1),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Kimyasal Hesaplamalar', 2),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Gazlar', 3),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Çözeltiler ve Derişim', 4),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Kimyasal Tepkimelerde Enerji', 5),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Tepkime Hızları', 6),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Kimyasal Denge', 7),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Asitler ve Bazlar', 8),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Çözünürlük Dengesi', 9),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Elektrokimya', 10),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Organik Kimya (Temel)', 11),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Organik Kimya (Fonksiyonel Gruplar)', 12),
  ((SELECT id FROM subjects WHERE key='ayt_kimya'), 'Organik Kimya (Tepkimeler)', 13);

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_biyoloji', 'Biyoloji', '#34D399', 'heart', 13, 'ayt', 'sayisal', null, 13);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Nükleik Asitler ve Protein Sentezi', 1),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Enzimler', 2),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Hücre Zarından Madde Geçişi', 3),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Fotosentez', 4),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Kemosentez', 5),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Hücresel Solunum', 6),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Bitki Biyolojisi', 7),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Sinir Sistemi', 8),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Endokrin Sistem', 9),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Duyu Organları', 10),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Destek ve Hareket Sistemi', 11),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Sindirim Sistemi', 12),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Dolaşım ve Bağışıklık Sistemi', 13),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Solunum Sistemi', 14),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Boşaltım Sistemi', 15),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Üreme Sistemi ve Embriyonik Gelişim', 16),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Genetik Mühendisliği ve Biyoteknoloji', 17),
  ((SELECT id FROM subjects WHERE key='ayt_biyoloji'), 'Komünite ve Popülasyon Ekolojisi', 18);

-- ============================
-- SEED DATA: AYT EA
-- ============================

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_edebiyat', 'Türk Dili ve Edebiyatı', '#60A5FA', 'bookOpen', 24, 'ayt', 'ea', null, 14);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Güzel Sanatlar ve Edebiyat', 1),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Coşku ve Heyecana Bağlı Metinler (Şiir)', 2),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Olay Çevresinde Gelişen Metinler (Hikaye)', 3),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Olay Çevresinde Gelişen Metinler (Roman)', 4),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Olay Çevresinde Gelişen Metinler (Tiyatro)', 5),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Öğretici Metinler', 6),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'İslamiyet Öncesi Türk Edebiyatı', 7),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'İslamiyet Etkisindeki Türk Edebiyatı (Divan)', 8),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Halk Edebiyatı', 9),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Tanzimat Dönemi Edebiyatı', 10),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Servetifünun Edebiyatı', 11),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Fecr-i Ati Edebiyatı', 12),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Milli Edebiyat Dönemi', 13),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Cumhuriyet Dönemi Türk Edebiyatı', 14),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat'), 'Dünya Edebiyatı', 15);

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_ea_matematik', 'Matematik', '#F5A623', 'hash', 40, 'ayt', 'ea', null, 15);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Fonksiyonlar', 1),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Polinomlar', 2),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), '2. Dereceden Denklemler', 3),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Parabol', 4),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Eşitsizlikler', 5),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Mutlak Değer', 6),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Trigonometri (Temel)', 7),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Trigonometri (Dönüşüm Formülleri)', 8),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Karmaşık Sayılar', 9),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Logaritma', 10),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Diziler ve Seriler', 11),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Limit', 12),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Türev (Kavram)', 13),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Türev (Uygulamalar)', 14),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'İntegral (Belirsiz)', 15),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'İntegral (Belirli)', 16),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Analitik Geometri (Doğru)', 17),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Analitik Geometri (Çember)', 18),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Matrisler', 19),
  ((SELECT id FROM subjects WHERE key='ayt_ea_matematik'), 'Determinant', 20);

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_tarih_ea', 'Tarih', '#A78BFA', 'clock', 10, 'ayt', 'ea', null, 16);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_tarih_ea'), 'İlk Çağ Tarihi Derinleştirme', 1),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_ea'), 'Orta Çağ Türk-İslam Tarihi', 2),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_ea'), 'Osmanlı Yükselme - Duraklama', 3),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_ea'), 'Osmanlı Gerileme - Çöküş', 4),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_ea'), 'I. Dünya Savaşı ve Milli Mücadele', 5),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_ea'), 'Cumhuriyet Dönemi', 6),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_ea'), 'II. Dünya Savaşı Sonrası', 7),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_ea'), 'Çağdaş Türk ve Dünya Tarihi', 8);

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_cografya_ea', 'Coğrafya', '#A78BFA', 'globe', 6, 'ayt', 'ea', null, 17);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_cografya_ea'), 'Türkiye''nin Jeopolitik Konumu', 1),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_ea'), 'Bölgeler Coğrafyası', 2),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_ea'), 'Ekonomik Coğrafya', 3),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_ea'), 'Küresel Ortam', 4),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_ea'), 'Çevre ve Toplum', 5),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_ea'), 'Doğal Afetler', 6);

-- ============================
-- SEED DATA: AYT SÖZEL
-- ============================

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_edebiyat_soz', 'Türk Dili ve Edebiyatı', '#60A5FA', 'bookOpen', 24, 'ayt', 'sozel', null, 18);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Güzel Sanatlar ve Edebiyat', 1),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Coşku ve Heyecana Bağlı Metinler (Şiir)', 2),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Olay Çevresinde Gelişen Metinler (Hikaye)', 3),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Olay Çevresinde Gelişen Metinler (Roman)', 4),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Olay Çevresinde Gelişen Metinler (Tiyatro)', 5),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Öğretici Metinler', 6),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'İslamiyet Öncesi Türk Edebiyatı', 7),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'İslamiyet Etkisindeki Türk Edebiyatı (Divan)', 8),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Halk Edebiyatı', 9),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Tanzimat Dönemi Edebiyatı', 10),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Servetifünun Edebiyatı', 11),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Fecr-i Ati Edebiyatı', 12),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Milli Edebiyat Dönemi', 13),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Cumhuriyet Dönemi Türk Edebiyatı', 14),
  ((SELECT id FROM subjects WHERE key='ayt_edebiyat_soz'), 'Dünya Edebiyatı', 15);

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_tarih_soz', 'Tarih', '#A78BFA', 'clock', 10, 'ayt', 'sozel', null, 19);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_tarih_soz'), 'İlk Çağ Tarihi Derinleştirme', 1),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_soz'), 'Orta Çağ Türk-İslam Tarihi', 2),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_soz'), 'Osmanlı Yükselme - Duraklama', 3),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_soz'), 'Osmanlı Gerileme - Çöküş', 4),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_soz'), 'I. Dünya Savaşı ve Milli Mücadele', 5),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_soz'), 'Cumhuriyet Dönemi', 6),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_soz'), 'II. Dünya Savaşı Sonrası', 7),
  ((SELECT id FROM subjects WHERE key='ayt_tarih_soz'), 'Çağdaş Türk ve Dünya Tarihi', 8);

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_cografya_soz', 'Coğrafya', '#A78BFA', 'globe', 24, 'ayt', 'sozel', null, 20);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_cografya_soz'), 'Türkiye''nin Jeopolitik Konumu', 1),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_soz'), 'Bölgeler Coğrafyası', 2),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_soz'), 'Ekonomik Coğrafya (Tarım)', 3),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_soz'), 'Ekonomik Coğrafya (Sanayi)', 4),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_soz'), 'Ekonomik Coğrafya (Enerji)', 5),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_soz'), 'Küresel Ortam', 6),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_soz'), 'Çevre ve Toplum', 7),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_soz'), 'Ulaşım', 8),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_soz'), 'Ticaret ve Turizm', 9),
  ((SELECT id FROM subjects WHERE key='ayt_cografya_soz'), 'Doğal Afetler', 10);

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ayt_felsefe_soz', 'Felsefe Grubu', '#A78BFA', 'layers', 24, 'ayt', 'sozel', null, 21);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ayt_felsefe_soz'), 'Bilgi Felsefesi (İleri)', 1),
  ((SELECT id FROM subjects WHERE key='ayt_felsefe_soz'), 'Varlık Felsefesi (İleri)', 2),
  ((SELECT id FROM subjects WHERE key='ayt_felsefe_soz'), 'Ahlak Felsefesi (İleri)', 3),
  ((SELECT id FROM subjects WHERE key='ayt_felsefe_soz'), 'Sanat Felsefesi', 4),
  ((SELECT id FROM subjects WHERE key='ayt_felsefe_soz'), 'Siyaset Felsefesi', 5),
  ((SELECT id FROM subjects WHERE key='ayt_felsefe_soz'), 'Bilim Felsefesi', 6),
  ((SELECT id FROM subjects WHERE key='ayt_felsefe_soz'), 'Mantık (Kavram, Önerme, Çıkarım)', 7),
  ((SELECT id FROM subjects WHERE key='ayt_felsefe_soz'), 'Psikolojiye Giriş', 8),
  ((SELECT id FROM subjects WHERE key='ayt_felsefe_soz'), 'Psikoloji Akımları', 9),
  ((SELECT id FROM subjects WHERE key='ayt_felsefe_soz'), 'Sosyolojiye Giriş', 10),
  ((SELECT id FROM subjects WHERE key='ayt_felsefe_soz'), 'Toplumsal Yapı ve Kurumlar', 11);

-- ============================
-- SEED DATA: YDT (Dil)
-- ============================

INSERT INTO subjects (key, label, color, icon, question_count, exam, field, "group", sort_order)
VALUES ('ydt_ingilizce', 'İngilizce', '#2DD4BF', 'globe', 80, 'ydt', 'dil', null, 22);

INSERT INTO topics (subject_id, name, sort_order) VALUES
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Tenses (Zamanlar)', 1),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Modals', 2),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Passives', 3),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Conditionals', 4),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Relative Clauses', 5),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Reported Speech', 6),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Causatives', 7),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Gerunds & Infinitives', 8),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Conjunctions & Transitions', 9),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Prepositions', 10),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Noun Clauses', 11),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Adjective Clauses', 12),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Adverbial Clauses', 13),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Quantifiers & Determiners', 14),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Vocabulary in Context', 15),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Cloze Test', 16),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Translation (İng → Tr)', 17),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Translation (Tr → İng)', 18),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Paragraph Completion', 19),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Dialogue Completion', 20),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Irrelevant Sentence', 21),
  ((SELECT id FROM subjects WHERE key='ydt_ingilizce'), 'Reading Comprehension', 22);
