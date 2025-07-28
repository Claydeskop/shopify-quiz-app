-- Shopify Quiz App - Complete Database Schema (Supabase Compatible)
-- Frontend-Backend tam uyumlu veritabanı şeması

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Remove problematic database setting
-- ALTER DATABASE postgres SET "app.shop_domain" TO '';

-- 1. QUIZZES - Ana quiz yapılandırması
CREATE TABLE quizzes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    shop_domain VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quiz_type VARCHAR(50) DEFAULT 'product_finder',
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    
    -- Frontend settings mapping
    show_start_button BOOLEAN DEFAULT true,
    internal_quiz_title TEXT,
    internal_quiz_description TEXT,
    
    -- UI ve stil ayarları
    styles JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    
    -- Shopify collection referansları
    shopify_collection_ids TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. QUESTIONS - Quiz soruları
CREATE TABLE questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    
    -- Frontend Question interface mapping
    text TEXT NOT NULL,
    show_answers BOOLEAN DEFAULT true,
    allow_multiple_selection BOOLEAN DEFAULT false,
    show_answer_images BOOLEAN DEFAULT true,
    question_media TEXT, -- CDN URL
    
    -- UI ve sıralama
    question_order INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    is_skippable BOOLEAN DEFAULT false,
    auto_advance BOOLEAN DEFAULT false,
    
    -- Stil overrides
    styles JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ANSWERS (OPTIONS) - Soru cevapları/seçenekleri  
CREATE TABLE answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    
    -- Frontend Answer interface mapping
    text VARCHAR(500) NOT NULL,
    answer_media TEXT, -- CDN URL
    redirect_to_link BOOLEAN DEFAULT false,
    redirect_url TEXT,
    
    -- UI ve skorlama
    answer_order INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT false,
    weight INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ANSWER_COLLECTIONS - Answer ile Collection ilişkisi
CREATE TABLE answer_collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    shopify_collection_id VARCHAR(255) NOT NULL,
    collection_order INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(answer_id, shopify_collection_id)
);

-- 5. METAFIELD_CONDITIONS - Metafield eşleştirme kuralları
CREATE TABLE metafield_conditions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    
    -- Metafield referansı
    metafield_namespace VARCHAR(255) NOT NULL,
    metafield_key VARCHAR(255) NOT NULL,
    metafield_name VARCHAR(255),
    metafield_type VARCHAR(50),
    
    -- Eşleştirme kuralı
    operator VARCHAR(20) DEFAULT 'equals', -- 'equals', 'not_equals', 'contains', 'in_array'
    expected_value TEXT NOT NULL,
    weight INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. QUIZ_SESSIONS - Kullanıcı oturumları
CREATE TABLE quiz_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    
    -- Session tracking
    session_token VARCHAR(255) UNIQUE NOT NULL,
    shopify_customer_id VARCHAR(255),
    customer_email VARCHAR(255),
    
    -- Browser/device info
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    
    -- Marketing attribution
    utm_source VARCHAR(255),
    utm_medium VARCHAR(255),
    utm_campaign VARCHAR(255),
    
    -- Session lifecycle
    is_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    total_score INTEGER DEFAULT 0
);

-- 7. USER_RESPONSES - Kullanıcı cevapları
CREATE TABLE user_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    
    -- Analytics
    response_time_ms INTEGER,
    was_skipped BOOLEAN DEFAULT false,
    responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: Her session/question/answer kombinasyonu bir kez
    UNIQUE(session_id, question_id, answer_id)
);

-- 8. PRODUCT_RECOMMENDATIONS - Öneri sonuçları
CREATE TABLE product_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    
    -- Shopify product referansları
    shopify_product_id VARCHAR(255) NOT NULL,
    shopify_variant_id VARCHAR(255),
    
    -- Öneri detayları
    match_score DECIMAL(5,2) NOT NULL,
    recommendation_order INTEGER NOT NULL,
    algorithm_version VARCHAR(50) DEFAULT 'v1.0',
    
    -- Debug ve analiz için
    matching_details JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CONVERSION_EVENTS - Dönüşüm takibi
CREATE TABLE conversion_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES product_recommendations(id) ON DELETE SET NULL,
    
    -- Event details
    event_type VARCHAR(50) NOT NULL, -- 'view', 'click', 'add_to_cart', 'purchase'
    shopify_product_id VARCHAR(255),
    shopify_variant_id VARCHAR(255),
    shopify_order_id VARCHAR(255),
    
    -- Commerce data
    quantity INTEGER DEFAULT 1,
    revenue DECIMAL(10,2),
    
    -- Additional metadata
    event_data JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ANALYTICS_DAILY - Günlük özet istatistikler
CREATE TABLE analytics_daily (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Traffic metrics
    total_starts INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    avg_completion_time_seconds INTEGER DEFAULT 0,
    
    -- Engagement metrics
    total_recommendation_views INTEGER DEFAULT 0,
    total_product_clicks INTEGER DEFAULT 0,
    total_add_to_carts INTEGER DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    
    -- Revenue metrics
    total_revenue DECIMAL(10,2) DEFAULT 0,
    
    -- Conversion rates
    click_through_rate DECIMAL(5,2) DEFAULT 0,
    add_to_cart_rate DECIMAL(5,2) DEFAULT 0,
    purchase_rate DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(quiz_id, date)
);

-- INDEXES
-- Performance critical indexes
CREATE INDEX idx_quizzes_shop_domain ON quizzes(shop_domain);
CREATE INDEX idx_quizzes_slug ON quizzes(slug);
CREATE INDEX idx_quizzes_active ON quizzes(is_active);
CREATE INDEX idx_questions_quiz_order ON questions(quiz_id, question_order);
CREATE INDEX idx_answers_question_order ON answers(question_id, answer_order);
CREATE INDEX idx_answer_collections_answer_id ON answer_collections(answer_id);
CREATE INDEX idx_metafield_conditions_answer_id ON metafield_conditions(answer_id);
CREATE INDEX idx_quiz_sessions_token ON quiz_sessions(session_token);
CREATE INDEX idx_quiz_sessions_quiz_id ON quiz_sessions(quiz_id);
CREATE INDEX idx_user_responses_session_id ON user_responses(session_id);
CREATE INDEX idx_product_recommendations_session_id ON product_recommendations(session_id);
CREATE INDEX idx_conversion_events_session_id ON conversion_events(session_id);
CREATE INDEX idx_conversion_events_type ON conversion_events(event_type);
CREATE INDEX idx_analytics_daily_quiz_date ON analytics_daily(quiz_id, date);

-- GIN indexes for JSON and array fields
CREATE INDEX idx_quizzes_collections_gin ON quizzes USING gin(shopify_collection_ids);
CREATE INDEX idx_quizzes_styles_gin ON quizzes USING gin(styles);
CREATE INDEX idx_product_recommendations_details_gin ON product_recommendations USING gin(matching_details);

-- ROW LEVEL SECURITY (Simplified for Supabase)
-- Enable RLS on all tables
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE metafield_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- Simplified RLS policies for Supabase
-- Admin access: Allow all operations for authenticated admin users
CREATE POLICY "admin_access_quizzes" ON quizzes
    FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "admin_access_questions" ON questions
    FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "admin_access_answers" ON answers
    FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "admin_access_answer_collections" ON answer_collections
    FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "admin_access_metafield_conditions" ON metafield_conditions
    FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "admin_access_quiz_sessions" ON quiz_sessions
    FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "admin_access_user_responses" ON user_responses
    FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "admin_access_product_recommendations" ON product_recommendations
    FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "admin_access_conversion_events" ON conversion_events
    FOR ALL 
    USING (auth.role() = 'authenticated');

CREATE POLICY "admin_access_analytics_daily" ON analytics_daily
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- Public access policies for quiz taking (anon users)
CREATE POLICY "public_quiz_read" ON quizzes
    FOR SELECT 
    USING (is_active = true);

CREATE POLICY "public_questions_read" ON questions
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM quizzes q 
            WHERE q.id = questions.quiz_id 
            AND q.is_active = true
        )
    );

CREATE POLICY "public_answers_read" ON answers
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM questions q
            JOIN quizzes qz ON q.quiz_id = qz.id
            WHERE q.id = answers.question_id 
            AND qz.is_active = true
        )
    );

CREATE POLICY "public_answer_collections_read" ON answer_collections
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM answers a
            JOIN questions q ON a.question_id = q.id  
            JOIN quizzes qz ON q.quiz_id = qz.id
            WHERE a.id = answer_collections.answer_id 
            AND qz.is_active = true
        )
    );

CREATE POLICY "public_metafield_conditions_read" ON metafield_conditions
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM answers a
            JOIN questions q ON a.question_id = q.id  
            JOIN quizzes qz ON q.quiz_id = qz.id
            WHERE a.id = metafield_conditions.answer_id 
            AND qz.is_active = true
        )
    );

-- Allow anonymous users to create sessions and responses
CREATE POLICY "public_quiz_sessions_insert" ON quiz_sessions
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "public_user_responses_insert" ON user_responses
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "public_product_recommendations_insert" ON product_recommendations
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "public_conversion_events_insert" ON conversion_events
    FOR INSERT 
    WITH CHECK (true);

-- TRIGGERS
-- Updated_at trigger for quizzes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quizzes_updated_at 
    BEFORE UPDATE ON quizzes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- COMMENTS
COMMENT ON TABLE quizzes IS 'Ana quiz konfigürasyonu - frontend QuizData interface ile tam uyumlu';
COMMENT ON TABLE questions IS 'Quiz soruları - frontend Question interface ile tam uyumlu';
COMMENT ON TABLE answers IS 'Soru cevapları - frontend Answer interface ile tam uyumlu';
COMMENT ON TABLE answer_collections IS 'Answer-Collection ilişkisi - frontend Answer.relatedCollections';
COMMENT ON TABLE metafield_conditions IS 'Metafield eşleştirme kuralları - frontend Answer.metafieldConditions';
COMMENT ON TABLE quiz_sessions IS 'Kullanıcı quiz oturumları';
COMMENT ON TABLE user_responses IS 'Kullanıcı cevapları';
COMMENT ON TABLE product_recommendations IS 'Öneri algoritması sonuçları';
COMMENT ON TABLE conversion_events IS 'Dönüşüm ve etkileşim takibi';
COMMENT ON TABLE analytics_daily IS 'Günlük özet istatistikler';

-- Column comments for key mappings
COMMENT ON COLUMN questions.show_answers IS 'Frontend Question.showAnswers';
COMMENT ON COLUMN questions.allow_multiple_selection IS 'Frontend Question.allowMultipleSelection';
COMMENT ON COLUMN questions.show_answer_images IS 'Frontend Question.showAnswerImages';
COMMENT ON COLUMN questions.question_media IS 'Frontend Question.questionMedia';
COMMENT ON COLUMN answers.answer_media IS 'Frontend Answer.answerMedia';
COMMENT ON COLUMN answers.redirect_to_link IS 'Frontend Answer.redirectToLink';
COMMENT ON COLUMN answers.redirect_url IS 'Frontend Answer.redirectUrl';