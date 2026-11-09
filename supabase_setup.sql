-- ============================================================================
-- MASSIVE DARKNESS 2 — REGISTRO DE CAMPANHA (SUPABASE CLOUD SYNC)
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/zlsnqewkhaaubqbbbclf/sql
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'heavenfall',
  current_mission TEXT NOT NULL DEFAULT 'A',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  state JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Habilita Row Level Security (RLS) com acesso público para leitura e gravação pelo Dashboard
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read campaigns" ON public.campaigns;
CREATE POLICY "Public read campaigns"
  ON public.campaigns FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public insert campaigns" ON public.campaigns;
CREATE POLICY "Public insert campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public update campaigns" ON public.campaigns;
CREATE POLICY "Public update campaigns"
  ON public.campaigns FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public delete campaigns" ON public.campaigns;
CREATE POLICY "Public delete campaigns"
  ON public.campaigns FOR DELETE
  USING (true);
