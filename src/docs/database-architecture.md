# Shopify Quiz App - Database Architecture v2.0

## =Ë Overview

Bu doküman, Shopify Product Finder Quiz uygulamas1 için yeniden tasarlanan veritaban1 mimarisini detayland1r1r. Yeni mimari, frontend Quiz Builder ile tam uyumlu olacak _ekilde tasarlanm1_t1r ve Supabase PostgreSQL kullan1r.

## <¯ Design Goals

### 1. **Frontend-Backend Full Compatibility**
- Frontend interface'leri ile veritaban1 _emas1 1:1 uyumlu
- TypeScript tiplerinden dorudan SQL mapping
- API response'lar1 frontend beklentileri ile tam e_le_me

### 2. **Performance Optimized**
- Strategic indexing for quiz loading ve analytics
- JSON fields for flexible configuration
- RLS policies for multi-tenant security

### 3. **Analytics-Ready**
- Complete user journey tracking
- Conversion funnel analysis
- Daily aggregation for dashboard performance

## <× Core Architecture

### Data Flow
```
Frontend Quiz Builder ’ API Route ’ Database Schema ’ Analytics Pipeline
```

### Table Categories
1. **Core Tables**: quizzes, questions, answers
2. **Relationship Tables**: answer_collections, metafield_conditions  
3. **Session Tables**: quiz_sessions, user_responses
4. **Analytics Tables**: product_recommendations, conversion_events, analytics_daily

## =Ê Table Structure

### 1. `quizzes` - Ana Quiz Konfigürasyonu
```sql
quizzes {
  id: UUID (PK)
  shop_domain: VARCHAR(255) -- RLS isolation
  title: VARCHAR(255) -- QuizData.title
  description: TEXT -- QuizData.description
  quiz_type: VARCHAR(50) -- QuizData.quizType
  slug: VARCHAR(255) UNIQUE
  is_active: BOOLEAN
  
  -- Frontend mapping
  show_start_button: BOOLEAN -- QuizData.showStartButton
  internal_quiz_title: TEXT -- QuizData.internalQuizTitle
  internal_quiz_description: TEXT -- QuizData.internalQuizDescription
  
  -- Configuration
  styles: JSONB -- UI customization
  settings: JSONB -- Behavior settings
  shopify_collection_ids: TEXT[] -- Related collections
  
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**Key Features:**
- Direct mapping to frontend `QuizData` interface
- JSON fields for flexible configuration
- Array field for collection references

### 2. `questions` - Quiz Sorular1
```sql
questions {
  id: UUID (PK)
  quiz_id: UUID (FK -> quizzes.id)
  
  -- Frontend Question interface mapping
  text: TEXT -- Question.text
  show_answers: BOOLEAN -- Question.showAnswers
  allow_multiple_selection: BOOLEAN -- Question.allowMultipleSelection
  show_answer_images: BOOLEAN -- Question.showAnswerImages
  question_media: TEXT -- Question.questionMedia (CDN URL)
  
  -- UI and ordering
  question_order: INTEGER
  is_required: BOOLEAN
  is_skippable: BOOLEAN
  auto_advance: BOOLEAN
  styles: JSONB -- Question-level style overrides
  
  created_at: TIMESTAMP
}
```

**Frontend Compatibility:**
- Complete `Question` interface mapping
- All boolean flags preserved
- Media URL storage for CDN integration

### 3. `answers` - Soru Cevaplar1
```sql
answers {
  id: UUID (PK)
  question_id: UUID (FK -> questions.id)
  
  -- Frontend Answer interface mapping
  text: VARCHAR(500) -- Answer.text
  answer_media: TEXT -- Answer.answerMedia (CDN URL)
  redirect_to_link: BOOLEAN -- Answer.redirectToLink
  redirect_url: TEXT -- Answer.redirectUrl
  
  -- UI and scoring
  answer_order: INTEGER
  is_default: BOOLEAN
  weight: INTEGER -- For recommendation algorithm
  
  created_at: TIMESTAMP
}
```

**New Features:**
- `redirect_to_link` and `redirect_url` support
- Direct mapping to `Answer` interface
- Scoring weight for recommendations

### 4. `answer_collections` - Answer-Collection 0li_kisi
```sql
answer_collections {
  id: UUID (PK)
  answer_id: UUID (FK -> answers.id)
  shopify_collection_id: VARCHAR(255) -- Shopify collection reference
  collection_order: INTEGER -- Display order
  
  created_at: TIMESTAMP
  
  UNIQUE(answer_id, shopify_collection_id)
}
```

**Purpose:**
- Maps to frontend `Answer.relatedCollections`
- Many-to-many relationship between answers and collections
- Ordered collection associations

### 5. `metafield_conditions` - Metafield E_le_tirme
```sql
metafield_conditions {
  id: UUID (PK)
  answer_id: UUID (FK -> answers.id)
  
  -- Metafield reference
  metafield_namespace: VARCHAR(255) -- 'custom', 'global'
  metafield_key: VARCHAR(255) -- 'color', 'size'
  metafield_name: VARCHAR(255) -- Display name
  metafield_type: VARCHAR(50) -- 'single_line_text_field'
  
  -- Matching rule
  operator: VARCHAR(20) -- 'equals', 'not_equals'
  expected_value: TEXT -- Match value
  weight: INTEGER -- Rule importance
  
  created_at: TIMESTAMP
}
```

**Frontend Mapping:**
- Direct mapping to `Answer.metafieldConditions`
- Support for complex metafield matching
- Weighted scoring for recommendation algorithm

### 6. `quiz_sessions` - Kullan1c1 Oturumlar1
```sql
quiz_sessions {
  id: UUID (PK)
  quiz_id: UUID (FK -> quizzes.id)
  
  -- Session tracking
  session_token: VARCHAR(255) UNIQUE -- Frontend generated
  shopify_customer_id: VARCHAR(255) -- Logged-in users
  customer_email: VARCHAR(255)
  
  -- Analytics data
  user_agent: TEXT
  ip_address: INET
  referrer: TEXT
  utm_source/medium/campaign: VARCHAR(255)
  
  -- Lifecycle
  is_completed: BOOLEAN
  started_at: TIMESTAMP
  completed_at: TIMESTAMP
  total_score: INTEGER
}
```

### 7. `user_responses` - Kullan1c1 Cevaplar1
```sql
user_responses {
  id: UUID (PK)
  session_id: UUID (FK -> quiz_sessions.id)
  question_id: UUID (FK -> questions.id)
  answer_id: UUID (FK -> answers.id)
  
  -- Analytics
  response_time_ms: INTEGER
  was_skipped: BOOLEAN
  responded_at: TIMESTAMP
  
  UNIQUE(session_id, question_id, answer_id)
}
```

### 8. `product_recommendations` - Öneri Sonuçlar1
```sql
product_recommendations {
  id: UUID (PK)
  session_id: UUID (FK -> quiz_sessions.id)
  
  -- Shopify references
  shopify_product_id: VARCHAR(255)
  shopify_variant_id: VARCHAR(255)
  
  -- Recommendation data
  match_score: DECIMAL(5,2) -- 0-100 score
  recommendation_order: INTEGER
  algorithm_version: VARCHAR(50)
  matching_details: JSONB -- Debug info
  
  created_at: TIMESTAMP
}
```

### 9. `conversion_events` - Dönü_üm Takibi
```sql
conversion_events {
  id: UUID (PK)
  session_id: UUID (FK -> quiz_sessions.id)
  recommendation_id: UUID (FK -> product_recommendations.id)
  
  -- Event data
  event_type: VARCHAR(50) -- 'view', 'click', 'add_to_cart', 'purchase'
  shopify_product_id: VARCHAR(255)
  shopify_variant_id: VARCHAR(255)
  shopify_order_id: VARCHAR(255)
  
  -- Commerce data
  quantity: INTEGER
  revenue: DECIMAL(10,2)
  event_data: JSONB
  
  created_at: TIMESTAMP
}
```

### 10. `analytics_daily` - Günlük 0statistikler
```sql
analytics_daily {
  id: UUID (PK)
  quiz_id: UUID (FK -> quizzes.id)
  date: DATE
  
  -- Traffic metrics
  total_starts: INTEGER
  total_completions: INTEGER
  completion_rate: DECIMAL(5,2)
  avg_completion_time_seconds: INTEGER
  
  -- Engagement metrics
  total_recommendation_views: INTEGER
  total_product_clicks: INTEGER
  total_add_to_carts: INTEGER
  total_purchases: INTEGER
  total_revenue: DECIMAL(10,2)
  
  -- Conversion rates
  click_through_rate: DECIMAL(5,2)
  add_to_cart_rate: DECIMAL(5,2)
  purchase_rate: DECIMAL(5,2)
  
  UNIQUE(quiz_id, date)
}
```

## = Security & Performance

### Row Level Security (RLS)
```sql
-- Shop isolation for all administrative tables
CREATE POLICY "shop_isolation_quizzes" ON quizzes
    FOR ALL USING (shop_domain = current_setting('app.shop_domain', true));

-- Public access for active quizzes
CREATE POLICY "public_quiz_access" ON quizzes
    FOR SELECT USING (is_active = true);
```

### Critical Indexes
```sql
-- Performance indexes
CREATE INDEX idx_quizzes_shop_domain ON quizzes(shop_domain);
CREATE INDEX idx_questions_quiz_order ON questions(quiz_id, question_order);
CREATE INDEX idx_answers_question_order ON answers(question_id, answer_order);

-- Analytics indexes
CREATE INDEX idx_quiz_sessions_token ON quiz_sessions(session_token);
CREATE INDEX idx_conversion_events_type ON conversion_events(event_type);

-- JSON indexes
CREATE INDEX idx_quizzes_collections_gin ON quizzes USING gin(shopify_collection_ids);
```

## = API Integration

### Save Quiz Flow
```typescript
// Frontend ’ API ’ Database mapping
const quizData = {
  title: "Product Finder Quiz",
  description: "Find your perfect product",
  showStartButton: true,
  questions: [...],
  answers: [...]
};

// API saves to:
// 1. quizzes table
// 2. questions table  
// 3. answers table
// 4. answer_collections table
// 5. metafield_conditions table
```

### Quiz Loading Flow
```sql
-- Single query to load complete quiz structure
SELECT 
  q.*,
  json_agg(DISTINCT questions.*) as questions,
  json_agg(DISTINCT answers.*) as answers
FROM quizzes q
LEFT JOIN questions ON q.id = questions.quiz_id
LEFT JOIN answers ON questions.id = answers.question_id
WHERE q.slug = $1 AND q.is_active = true
GROUP BY q.id;
```

## =È Analytics Pipeline

### Real-time Tracking
1. **Session Start**: Create `quiz_sessions` record
2. **Each Response**: Insert into `user_responses`
3. **Quiz Complete**: Generate `product_recommendations`
4. **User Interactions**: Track in `conversion_events`

### Daily Aggregation
```sql
-- Cron job to populate analytics_daily
INSERT INTO analytics_daily (quiz_id, date, total_starts, ...)
SELECT 
  quiz_id,
  DATE(started_at),
  COUNT(*) as total_starts,
  ...
FROM quiz_sessions
WHERE DATE(started_at) = CURRENT_DATE - INTERVAL '1 day'
GROUP BY quiz_id, DATE(started_at);
```

## =€ Deployment Guide

### 1. Database Setup
```bash
# Run the schema creation
psql -h [supabase-url] -d postgres -f database-schema.sql
```

### 2. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### 3. API Route Updates
Update `src/app/api/quiz/save/route.ts` to use new schema:
- Map to new table names (`answers` instead of `options`)
- Handle `answer_collections` and `metafield_conditions`
- Support new fields (`redirect_to_link`, `show_answers`)

## <¯ Frontend Integration Benefits

### 1. **Type Safety**
```typescript
// Direct interface mapping
interface Question {
  showAnswers: boolean; //  maps to questions.show_answers
  allowMultipleSelection: boolean; //  maps to questions.allow_multiple_selection
}
```

### 2. **No Data Transformation**
- Frontend sends data ’ API saves directly
- Database loads data ’ Frontend renders directly
- Zero mapping overhead

### 3. **Feature Complete**
-  All frontend features supported
-  Redirect functionality
-  Collection relationships
-  Metafield conditions
-  Media URL storage

## =. Future Enhancements

### Phase 2 Features
- Multi-language support (i18n tables)
- A/B testing framework
- Advanced analytics dashboard
- Email capture integration
- Custom CSS injection

### Performance Optimizations
- Read replicas for analytics
- Redis caching layer
- CDN integration for media
- Database connection pooling

---

## =Ý Migration Notes

### From Old Schema
1. Backup existing data (if any)
2. Drop old tables (keeping shops)
3. Run new schema creation
4. Update API routes to use new table names
5. Test complete flow

### Validation Checklist
- [ ] Quiz creation works with all fields
- [ ] Question ordering preserved
- [ ] Answer media URLs saved
- [ ] Collection relationships created
- [ ] Metafield conditions saved
- [ ] RLS policies working
- [ ] Analytics tracking functional