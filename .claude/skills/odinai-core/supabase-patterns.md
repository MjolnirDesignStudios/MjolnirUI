---
name: supabase-patterns
description: Use when working with Supabase database operations, RLS policies, schema design, or AI agent data patterns for MjolnirUI.
---

# Supabase Postgres Patterns — MjolnirUI

## Schema Design Principles

### Always Use RLS
Every table MUST have Row Level Security enabled. Policies:
- `service_role` gets full access (for NextAuth adapter, webhooks, server actions)
- Users can only read their own data via `auth.uid() = id`
- Never expose `service_role` key to the client

### Standard User Table Pattern
```sql
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'base', 'pro', 'elite')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Auto-updating Timestamps
```sql
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER <table>_updated_at
  BEFORE UPDATE ON public.<table>
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
```

## Query Patterns

### Server-Side (API Routes, Webhooks)
Always use `supabaseAdmin` (service role key):
```typescript
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const { data } = await supabaseAdmin.from('users').select('tier').eq('id', userId).single();
```

### Client-Side (Components)
Use anon key client — RLS restricts access:
```typescript
import { supabase } from '@/lib/supabaseClient';
```

## AI Agent Best Practices (from Supabase docs)

### Vector Storage
- Use pgvector extension for embedding storage
- Semantic search, keyword search, and hybrid search patterns
- Store embeddings alongside structured data in same database

### Indexing Strategy
- Index foreign keys (`userId`, `stripe_customer_id`)
- Index columns used in WHERE clauses
- Use partial indexes for tier-specific queries:
  ```sql
  CREATE INDEX idx_pro_users ON users(id) WHERE tier IN ('pro', 'elite');
  ```

### Edge Functions
- Use for embedding generation with open-source models
- Deploy close to database for minimal latency
- Rate limit at the Edge Function level

## MjolnirUI Specific Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| users | Auth + tier + Stripe data | ✅ |
| accounts | OAuth provider links (NextAuth) | ✅ |
| sessions | Session tokens (NextAuth) | ✅ |
| verification_tokens | Email verification (NextAuth) | ✅ |
| components (future) | Component registry metadata | ✅ |
| user_favorites (future) | Saved/favorited components | ✅ |
