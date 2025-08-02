-- Quiz settings güncellemeleri için veritabanı migrasyonu

-- 1. Slug kolonunu kaldır (eğer varsa)
ALTER TABLE quizzes DROP COLUMN IF EXISTS slug;

-- 2. Yeni kolonları ekle
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS auto_transition BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS selected_collections JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS quiz_image TEXT;

-- 3. Answer tablosuna yeni alanları ekle
ALTER TABLE answers 
ADD COLUMN IF NOT EXISTS related_products JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS related_tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS related_categories JSONB DEFAULT '[]'::jsonb;

-- 4. Mevcut kayıtları güncelle (null değerleri düzelt)
UPDATE quizzes 
SET auto_transition = false 
WHERE auto_transition IS NULL;

UPDATE quizzes 
SET selected_collections = '[]'::jsonb 
WHERE selected_collections IS NULL;

UPDATE answers 
SET related_products = '[]'::jsonb 
WHERE related_products IS NULL;

UPDATE answers 
SET related_tags = '[]'::jsonb 
WHERE related_tags IS NULL;

UPDATE answers 
SET related_categories = '[]'::jsonb 
WHERE related_categories IS NULL;

-- 5. İndeks ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_quizzes_auto_transition ON quizzes(auto_transition);
CREATE INDEX IF NOT EXISTS idx_quizzes_selected_collections ON quizzes USING GIN(selected_collections);
CREATE INDEX IF NOT EXISTS idx_answers_related_products ON answers USING GIN(related_products);
CREATE INDEX IF NOT EXISTS idx_answers_related_tags ON answers USING GIN(related_tags);
CREATE INDEX IF NOT EXISTS idx_answers_related_categories ON answers USING GIN(related_categories);

-- 6. Kolonları NOT NULL yap (quiz_image hariç - nullable)
ALTER TABLE quizzes 
ALTER COLUMN auto_transition SET NOT NULL,
ALTER COLUMN selected_collections SET NOT NULL;

ALTER TABLE answers 
ALTER COLUMN related_products SET NOT NULL,
ALTER COLUMN related_tags SET NOT NULL,
ALTER COLUMN related_categories SET NOT NULL;