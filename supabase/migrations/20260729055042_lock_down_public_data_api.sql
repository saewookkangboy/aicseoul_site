-- Lock PostgREST Data API for Prisma-only access (Auth.js + Prisma).
-- anon/authenticated lose table privileges; RLS enabled without policies
-- blocks Data API even if grants are re-added. aic_app bypasses RLS for Prisma.

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON ROUTINES FROM anon, authenticated;

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Member" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Meetup" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MeetupPhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ArchivePhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."InsightPost" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ContactSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SiteSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MediaAsset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Prisma connects as aic_app (not table owner); without BYPASSRLS, empty RLS denies all.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'aic_app') THEN
    ALTER ROLE aic_app BYPASSRLS;
  END IF;
END
$$;
