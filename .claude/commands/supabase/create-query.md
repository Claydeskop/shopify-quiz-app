# Create Supabase Query
Create optimized Supabase query following project patterns.

## Requirements:
- Use createClientComponentClient
- Include shop_id filtering
- Proper TypeScript types
- Error handling
- RLS policy compliance
- Performance optimized

## Query Pattern:
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient<Database>()

const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('shop_id', shopId)