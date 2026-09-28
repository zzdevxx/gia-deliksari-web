-- ============================================================================
-- Migration: Add audit_log table for sensitive admin/super/kas actions
-- Date: 2026-08-31
-- Purpose: Compliance & forensic trail for who-did-what on the CMS portals.
-- All writes happen via service_role from src/lib/auditLog.ts (never anon).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor_username TEXT,
  actor_roles TEXT[],
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  summary TEXT NOT NULL,
  meta JSONB,
  ip TEXT,
  user_agent TEXT,
  source TEXT NOT NULL DEFAULT 'api',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for common queries: latest first by actor, by action, by target
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON public.audit_log (actor_id, created_at DESC) WHERE actor_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_target ON public.audit_log (target_table, target_id) WHERE target_id IS NOT NULL;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- No anon access. Service-role bypasses RLS by default. /super can SELECT
-- its own entries via a policy below; everyone else sees nothing.
DROP POLICY IF EXISTS "Audit log — super can read" ON public.audit_log;
CREATE POLICY "Audit log — super can read"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = (SELECT auth.uid())
        AND 'super' = ANY(u.roles)
        AND u.active = TRUE
    )
  );

-- Append-only: deny UPDATE / DELETE for all roles (service role still bypasses
-- for maintenance/cleanup if ever needed).
DROP POLICY IF EXISTS "Audit log — append-only" ON public.audit_log;
CREATE POLICY "Audit log — append-only"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (FALSE);

COMMENT ON TABLE public.audit_log IS
  'Append-only audit trail for sensitive actions. Written by service_role via src/lib/auditLog.ts; readable only by super.';
COMMENT ON COLUMN public.audit_log.meta IS
  'Arbitrary JSON metadata. Keep small; no PII.';