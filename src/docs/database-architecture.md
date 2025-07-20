# Shopify Product Finder Quiz App - Database Architecture

## 📋 Overview

Bu doküman, Shopify Product Finder Quiz uygulaması için tasarlanan veritabanı mimarisini detaylandırır. Sistem, Supabase PostgreSQL veritabanı kullanarak quiz oluşturma, kullanıcı yanıtlarını takip etme ve ürün önerilerini yönetme işlevlerini destekler.

## 🏗️ Architecture Principles

### 1. **Minimize Data Duplication**
- Shopify'dan çekilebilecek veriler (collections, products, metafields) veritabanında saklanmaz
- Sadece referans ID'leri tutulur, detaylar runtime'da API'den çekilir

### 2. **Optimize for Performance**  
- Quiz yapısı için JSON fields kullanılır (styles, settings)
- Gerekli indexler tanımlanmıştır
- RLS (Row Level Security) shop bazında isolation sağlar

### 3. **Analytics-First Design**
- Her kullanıcı etkileşimi track edilir
- Conversion funnel analizi için gerekli veriler saklanır
- Günlük summary tablolar performansı artırır

## 📊 Table Structure

### Core Tables

#### 1. `quizzes` - Ana Quiz Konfigürasyonu
```sql
quizzes {
  id: UUID (PK)
  shop_domain: VARCHAR(255) -- "mystore.myshopify.com"
  title: VARCHAR(255)
  description: TEXT
  image_url: TEXT -- CDN'de saklanan custom görsel
  slug: VARCHAR(255) UNIQUE
  is_active: BOOLEAN
  shopify_collection_ids: TEXT[] -- ['123', '456'] Shopify koleksiyon ID'leri
  styles: JSONB -- UI stil ayarları
  settings: JSONB -- Quiz davranış ayarları
}
```

**Key Points:**
- `shop_domain`: RLS için kritik field
- `shopify_collection_ids`: Array olarak saklanır, runtime'da collection detayları çekilir
- `styles`: Tüm CSS/UI konfigürasyonu JSON'da
- `settings`: Progress bar, navigation, randomization etc.

#### 2. `questions` - Sorular
```sql
questions {
  id: UUID (PK)
  quiz_id: UUID (FK -> quizzes.id)
  title: TEXT
  description: TEXT
  image_url: TEXT -- CDN'de saklanan custom görsel
  question_order: INTEGER
  is_required: BOOLEAN
  is_skippable: BOOLEAN
  allow_multiple_selection: BOOLEAN
  auto_advance: BOOLEAN
  show_option_images: BOOLEAN
  styles: JSONB -- Soru seviyesi stil overrides
}
```

**Key Points:**
- `question_order`: Sıralama için kritik
- Boolean fields quiz davranışını kontrol eder
- `styles`: Quiz styles'ı override edebilir

#### 3. `options` - Soru Seçenekleri
```sql
options {
  id: UUID (PK)
  question_id: UUID (FK -> questions.id)
  text: VARCHAR(500)
  image_url: TEXT -- CDN'de saklanan custom görsel
  option_order: INTEGER
  is_default: BOOLEAN
  weight: INTEGER -- Skorlama için
}
```

**Key Points:**
- `weight`: Recommendation algoritmasında kullanılır
- `option_order`: UI'da görünüm sırası
- `is_default`: Pre-selected seçenekler için

#### 4. `option_metafield_rules` - Metafield Eşleştirme Kuralları
```sql
option_metafield_rules {
  id: UUID (PK)
  option_id: UUID (FK -> options.id)
  metafield_namespace: VARCHAR(255) -- 'custom', 'global'
  metafield_key: VARCHAR(255) -- 'color', 'size', 'material'
  operator: VARCHAR(20) -- 'equals', 'contains', 'in_array'
  expected_value: TEXT -- 'red', 'large', '["red","blue"]'
  weight: INTEGER -- Bu kuralın önem derecesi
}
```

**Key Points:**
- Shopify metafield'ları referans eder, value'lar saklamaz
- `operator`: Flexible matching rules
- `expected_value`: JSON string olabilir (array values için)
- `weight`: Multiple metafield matches için scoring

### Session & Response Tables

#### 5. `quiz_sessions` - Kullanıcı Oturumları
```sql
quiz_sessions {
  id: UUID (PK)
  quiz_id: UUID (FK -> quizzes.id)
  session_token: VARCHAR(255) UNIQUE -- Frontend generates
  shopify_customer_id: VARCHAR(255) -- Optional, logged-in users
  customer_email: VARCHAR(255) -- Optional
  user_agent: TEXT
  ip_address: INET
  referrer: TEXT
  utm_source/medium/campaign: VARCHAR(255) -- Marketing attribution
  is_completed: BOOLEAN
  started_at: TIMESTAMP
  completed_at: TIMESTAMP
}
```

**Key Points:**
- `session_token`: Frontend-generated unique ID
- UTM fields: Marketing campaign tracking
- `shopify_customer_id`: Connect to Shopify customer data when available

#### 6. `quiz_responses` - Kullanıcı Cevapları
```sql
quiz_responses {
  id: UUID (PK)
  session_id: UUID (FK -> quiz_sessions.id)
  question_id: UUID (FK -> questions.id)
  option_id: UUID (FK -> options.id)
  response_time_ms: INTEGER -- UX analytics
  was_skipped: BOOLEAN
}
```

**Key Points:**
- UNIQUE constraint: `(session_id, question_id, option_id)`
- `response_time_ms`: User engagement metrics
- Multiple responses per question allowed (if `allow_multiple_selection`)

### Recommendation & Analytics Tables

#### 7. `product_recommendations` - Önerilen Ürünler
```sql
product_recommendations {
  id: UUID (PK)
  session_id: UUID (FK -> quiz_sessions.id)
  shopify_product_id: VARCHAR(255) -- Shopify product referansı
  shopify_variant_id: VARCHAR(255) -- Specific variant
  match_score: DECIMAL(5,2) -- 0-100 matching score
  recommendation_order: INTEGER -- Display order
  algorithm_version: VARCHAR(50) -- A/B testing için
  matching_details: JSONB -- Debug/analysis için hangi kurallar match etti
}
```

**Key Points:**
- Product detayları Shopify'dan çekilir, sadece ID'ler saklanır
- `match_score`: Algorithm output, sorting için
- `matching_details`: Transparency ve debugging için
- `algorithm_version`: A/B testing ve iterasyon için

#### 8. `conversion_tracking` - Dönüşüm Takibi
```sql
conversion_tracking {
  id: UUID (PK)
  session_id: UUID (FK -> quiz_sessions.id)
  recommendation_id: UUID (FK -> product_recommendations.id)
  event_type: VARCHAR(50) -- Event taxonomy
  shopify_product_id: VARCHAR(255)
  shopify_variant_id: VARCHAR(255)
  shopify_order_id: VARCHAR(255) -- Purchase events için
  quantity: INTEGER
  revenue: DECIMAL(10,2)
  event_data: JSONB -- Additional metadata
}
```

**Event Types:**
- `recommendation_view`: Recommendation sonuçları gösterildi
- `product_click`: Specific ürüne tıklandı
- `add_to_cart`: Sepete eklendi
- `purchase`: Satın alındı (Shopify webhook'dan)

#### 9. `analytics_summary` - Günlük Özet İstatistikler
```sql
analytics_summary {
  id: UUID (PK)
  quiz_id: UUID (FK -> quizzes.id)
  date: DATE
  total_starts: INTEGER
  total_completions: INTEGER
  completion_rate: DECIMAL(5,2)
  avg_completion_time_seconds: INTEGER
  total_recommendation_views: INTEGER
  total_product_clicks: INTEGER
  total_add_to_carts: INTEGER
  total_purchases: INTEGER
  total_revenue: DECIMAL(10,2)
  click_through_rate: DECIMAL(5,2)
  add_to_cart_rate: DECIMAL(5,2)
  purchase_rate: DECIMAL(5,2)
}
```

**Key Points:**
- Daily aggregation table
- Günlük cron job ile populate edilir
- Dashboard performansını artırır
- Historical trend analysis için

## 🔄 Business Logic Flow

### 1. Quiz Creation Flow
```
1. Admin creates quiz with title, description, collections
2. Add questions with text/images
3. Add options with text/images  
4. Define metafield rules for each option
5. Configure styles and settings
6. Activate quiz
```

### 2. User Quiz Taking Flow  
```
1. User visits quiz URL (slug-based)
2. Create quiz_session with session_token
3. Display questions sequentially
4. Save each response to quiz_responses
5. Calculate recommendations based on metafield rules
6. Save recommendations to product_recommendations
7. Mark session as completed
8. Track user interactions with conversion_tracking
```

### 3. Recommendation Algorithm
```javascript
// Pseudo-code for recommendation logic
function calculateRecommendations(sessionId) {
  // 1. Get user responses
  const responses = getSessionResponses(sessionId);
  
  // 2. Get quiz collections
  const quiz = getQuizWithCollections(responses.quiz_id);
  
  // 3. Fetch products from Shopify
  const products = await shopify.getProductsByCollections(quiz.shopify_collection_ids);
  
  // 4. Score each product
  const scoredProducts = products.map(product => {
    let score = 0;
    
    responses.forEach(response => {
      const rules = getMetafieldRules(response.option_id);
      
      rules.forEach(rule => {
        const productMetafield = product.metafields.find(m => 
          m.namespace === rule.metafield_namespace && 
          m.key === rule.metafield_key
        );
        
        if (productMetafield && matchesRule(productMetafield.value, rule)) {
          score += rule.weight * response.option.weight;
        }
      });
    });
    
    return { product, score };
  });
  
  // 5. Sort by score and save recommendations
  return scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // Top 10
    .map((item, index) => ({
      shopify_product_id: item.product.id,
      match_score: item.score,
      recommendation_order: index + 1
    }));
}
```

## 🔗 External API Integrations

### Shopify Admin API Calls
```javascript
// Collections
GET /admin/api/2023-10/collections.json

// Products by collection
GET /admin/api/2023-10/collections/{collection_id}/products.json

// Product metafields
GET /admin/api/2023-10/products/{product_id}/metafields.json

// Customer data (for logged-in users)
GET /admin/api/2023-10/customers/{customer_id}.json
```

### CDN/File Storage
- Quiz, question, option images → Upload to CDN (Vercel, Cloudinary etc.)
- Store only CDN URLs in database
- Shopify product images → Use Shopify CDN URLs directly

## 📈 Performance Considerations

### Indexing Strategy
```sql
-- Critical indexes for quiz loading
CREATE INDEX idx_quizzes_shop_domain ON quizzes(shop_domain);
CREATE INDEX idx_quizzes_slug ON quizzes(slug);
CREATE INDEX idx_questions_quiz_order ON questions(quiz_id, question_order);

-- Analytics indexes
CREATE INDEX idx_quiz_sessions_date ON quiz_sessions(started_at);
CREATE INDEX idx_conversion_tracking_event_type ON conversion_tracking(event_type);

-- GIN index for array searches
CREATE INDEX idx_quizzes_collections ON quizzes USING gin(shopify_collection_ids);
```

### Query Optimization
- Use `complete_quiz_structure` view for frontend quiz loading
- Implement pagination for analytics dashboards
- Cache Shopify API responses (Redis recommended)
- Batch Shopify API calls where possible

### RLS (Row Level Security)
```sql
-- Shop isolation
CREATE POLICY "shop_isolation" ON quizzes
  FOR ALL USING (shop_domain = current_setting('app.shop_domain', true));

-- Public access for active quizzes
CREATE POLICY "public_quiz_access" ON quizzes
  FOR SELECT USING (is_active = true);
```

## 🚀 Deployment Considerations

### Supabase Setup
1. Create project and database
2. Run schema SQL scripts
3. Configure RLS policies
4. Set environment variables

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SHOPIFY_APP_API_KEY=
SHOPIFY_APP_SECRET=
SHOPIFY_SCOPES="read_products,read_collections,read_customers"
```

### Monitoring & Observability
- Database performance metrics
- Shopify API rate limits
- Quiz completion rates
- Conversion tracking accuracy

## 🔮 Future Enhancements

### Phase 2 Features
- A/B testing for quiz flows
- Advanced segmentation rules
- Email capture and follow-up
- Multi-language support
- Custom CSS injection

### Analytics Enhancements
- Heat mapping for questions
- Drop-off analysis
- Cohort analysis
- Revenue attribution

### Performance Optimizations
- GraphQL for Shopify queries
- Redis caching layer
- CDN for static assets
- Database read replicas

---

## 📝 Notes for Development

### Critical Database Operations
1. **Quiz Creation**: Always create questions and options in transaction
2. **Session Management**: Handle session timeouts and cleanup
3. **Analytics Aggregation**: Daily cron jobs for summary tables
4. **Rate Limiting**: Implement for Shopify API calls

### Testing Strategy
- Unit tests for recommendation algorithm
- Integration tests for Shopify API calls
- Load testing for quiz taking flow
- E2E tests for complete user journey

### Security Considerations
- Validate all user inputs
- Sanitize image uploads
- Rate limit quiz submissions
- Monitor for abuse patterns