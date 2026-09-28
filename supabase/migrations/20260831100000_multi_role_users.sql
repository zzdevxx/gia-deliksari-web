-- ============================================================================
-- Migration: Multi-role per user
-- Date: 2026-08-31
-- Purpose: Convert users.role (single TEXT) to users.roles (TEXT[] array)
-- so a single account can have multiple roles, e.g. ['admin', 'treasurer']
-- for operator accounts that need both Warta CMS + Kas access.
--
-- Roles remain the same: 'super' | 'admin' | 'treasurer'.
-- ============================================================================

-- 1. Add the new roles array column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS roles TEXT[] NOT NULL DEFAULT ARRAY['admin']::TEXT[];

-- 2. Backfill from existing role column
UPDATE public.users SET roles = ARRAY[role] WHERE roles = ARRAY['admin']::TEXT[] OR roles IS NULL;

-- 3. Drop the old CHECK constraint on role (if any) and column
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users
  DROP COLUMN IF EXISTS role;

-- 4. Add a check constraint that all roles are in the allowed set
ALTER TABLE public.users
  ADD CONSTRAINT users_roles_valid CHECK (
    roles <@ ARRAY['super', 'admin', 'treasurer']::TEXT[]
    AND array_length(roles, 1) >= 1
  );

-- 5. Create an index for role lookups (gin)
CREATE INDEX IF NOT EXISTS idx_users_roles_gin
  ON public.users USING gin (roles)
  WHERE active = TRUE;

COMMENT ON COLUMN public.users.roles IS
  'Array of role strings: super, admin, treasurer. A user with multiple roles (e.g. [admin, treasurer]) can access all corresponding portals.';