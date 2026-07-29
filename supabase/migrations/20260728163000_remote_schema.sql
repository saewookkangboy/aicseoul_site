


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."ContactStatus" AS ENUM (
    'new',
    'seen',
    'done'
);


ALTER TYPE "public"."ContactStatus" OWNER TO "postgres";


CREATE TYPE "public"."ContactType" AS ENUM (
    'partnership',
    'education',
    'community',
    'other'
);


ALTER TYPE "public"."ContactType" OWNER TO "postgres";


CREATE TYPE "public"."ContentStatus" AS ENUM (
    'draft',
    'published'
);


ALTER TYPE "public"."ContentStatus" OWNER TO "postgres";


CREATE TYPE "public"."MeetupType" AS ENUM (
    'monthly',
    'class'
);


ALTER TYPE "public"."MeetupType" OWNER TO "postgres";


CREATE TYPE "public"."UserRole" AS ENUM (
    'superadmin',
    'operator'
);


ALTER TYPE "public"."UserRole" OWNER TO "postgres";


CREATE TYPE "public"."UserStatus" AS ENUM (
    'pending',
    'active',
    'disabled'
);


ALTER TYPE "public"."UserStatus" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ArchivePhoto" (
    "id" "text" NOT NULL,
    "imageUrl" "text" NOT NULL,
    "meetupId" "text",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."ArchivePhoto" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ContactSubmission" (
    "id" "text" NOT NULL,
    "type" "public"."ContactType" NOT NULL,
    "name" "text" NOT NULL,
    "org" "text",
    "email" "text" NOT NULL,
    "message" "text" NOT NULL,
    "status" "public"."ContactStatus" DEFAULT 'new'::"public"."ContactStatus" NOT NULL,
    "memo" "text",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE "public"."ContactSubmission" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."InsightPost" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "category" "text" NOT NULL,
    "summary" "text" NOT NULL,
    "body" "text" NOT NULL,
    "thumbnailUrl" "text",
    "author" "text" NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "isFeatured" boolean DEFAULT false NOT NULL,
    "status" "public"."ContentStatus" DEFAULT 'draft'::"public"."ContentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE "public"."InsightPost" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."MediaAsset" (
    "id" "text" NOT NULL,
    "url" "text" NOT NULL,
    "publicId" "text",
    "width" integer,
    "height" integer,
    "alt" "text",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE "public"."MediaAsset" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Meetup" (
    "id" "text" NOT NULL,
    "type" "public"."MeetupType" NOT NULL,
    "title" "text" NOT NULL,
    "date" timestamp(3) without time zone NOT NULL,
    "headcount" integer,
    "summary" "text",
    "testimonials" "jsonb",
    "status" "public"."ContentStatus" DEFAULT 'draft'::"public"."ContentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE "public"."Meetup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."MeetupPhoto" (
    "id" "text" NOT NULL,
    "meetupId" "text" NOT NULL,
    "imageUrl" "text" NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."MeetupPhoto" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."Member" (
    "id" "text" NOT NULL,
    "nameKr" "text" NOT NULL,
    "nameEn" "text" NOT NULL,
    "bio" "text" NOT NULL,
    "photoUrl" "text",
    "linkedinUrl" "text",
    "websiteUrl" "text",
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "isFounder" boolean DEFAULT false NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE "public"."Member" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."SiteSetting" (
    "key" "text" NOT NULL,
    "value" "text" NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE "public"."SiteSetting" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."User" (
    "id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "passwordHash" "text" NOT NULL,
    "name" "text",
    "role" "public"."UserRole" DEFAULT 'operator'::"public"."UserRole" NOT NULL,
    "status" "public"."UserStatus" DEFAULT 'pending'::"public"."UserStatus" NOT NULL,
    "permPeople" boolean DEFAULT false NOT NULL,
    "permMeetups" boolean DEFAULT false NOT NULL,
    "permInsights" boolean DEFAULT false NOT NULL,
    "permContact" boolean DEFAULT false NOT NULL,
    "permSettings" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastLoginAt" timestamp(3) without time zone
);


ALTER TABLE "public"."User" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) NOT NULL,
    "logs" "text",
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applied_steps_count" integer DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."_prisma_migrations" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ArchivePhoto"
    ADD CONSTRAINT "ArchivePhoto_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ContactSubmission"
    ADD CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."InsightPost"
    ADD CONSTRAINT "InsightPost_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."MediaAsset"
    ADD CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."MeetupPhoto"
    ADD CONSTRAINT "MeetupPhoto_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Meetup"
    ADD CONSTRAINT "Meetup_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."Member"
    ADD CONSTRAINT "Member_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."SiteSetting"
    ADD CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key");



ALTER TABLE ONLY "public"."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."_prisma_migrations"
    ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "User_email_key" ON "public"."User" USING "btree" ("email");



ALTER TABLE ONLY "public"."ArchivePhoto"
    ADD CONSTRAINT "ArchivePhoto_meetupId_fkey" FOREIGN KEY ("meetupId") REFERENCES "public"."Meetup"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."MeetupPhoto"
    ADD CONSTRAINT "MeetupPhoto_meetupId_fkey" FOREIGN KEY ("meetupId") REFERENCES "public"."Meetup"("id") ON UPDATE CASCADE ON DELETE CASCADE;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON SCHEMA "public" TO "aic_app";





































































































































































GRANT ALL ON TABLE "public"."ArchivePhoto" TO "anon";
GRANT ALL ON TABLE "public"."ArchivePhoto" TO "authenticated";
GRANT ALL ON TABLE "public"."ArchivePhoto" TO "service_role";
GRANT ALL ON TABLE "public"."ArchivePhoto" TO "aic_app";



GRANT ALL ON TABLE "public"."ContactSubmission" TO "anon";
GRANT ALL ON TABLE "public"."ContactSubmission" TO "authenticated";
GRANT ALL ON TABLE "public"."ContactSubmission" TO "service_role";
GRANT ALL ON TABLE "public"."ContactSubmission" TO "aic_app";



GRANT ALL ON TABLE "public"."InsightPost" TO "anon";
GRANT ALL ON TABLE "public"."InsightPost" TO "authenticated";
GRANT ALL ON TABLE "public"."InsightPost" TO "service_role";
GRANT ALL ON TABLE "public"."InsightPost" TO "aic_app";



GRANT ALL ON TABLE "public"."MediaAsset" TO "anon";
GRANT ALL ON TABLE "public"."MediaAsset" TO "authenticated";
GRANT ALL ON TABLE "public"."MediaAsset" TO "service_role";
GRANT ALL ON TABLE "public"."MediaAsset" TO "aic_app";



GRANT ALL ON TABLE "public"."Meetup" TO "anon";
GRANT ALL ON TABLE "public"."Meetup" TO "authenticated";
GRANT ALL ON TABLE "public"."Meetup" TO "service_role";
GRANT ALL ON TABLE "public"."Meetup" TO "aic_app";



GRANT ALL ON TABLE "public"."MeetupPhoto" TO "anon";
GRANT ALL ON TABLE "public"."MeetupPhoto" TO "authenticated";
GRANT ALL ON TABLE "public"."MeetupPhoto" TO "service_role";
GRANT ALL ON TABLE "public"."MeetupPhoto" TO "aic_app";



GRANT ALL ON TABLE "public"."Member" TO "anon";
GRANT ALL ON TABLE "public"."Member" TO "authenticated";
GRANT ALL ON TABLE "public"."Member" TO "service_role";
GRANT ALL ON TABLE "public"."Member" TO "aic_app";



GRANT ALL ON TABLE "public"."SiteSetting" TO "anon";
GRANT ALL ON TABLE "public"."SiteSetting" TO "authenticated";
GRANT ALL ON TABLE "public"."SiteSetting" TO "service_role";
GRANT ALL ON TABLE "public"."SiteSetting" TO "aic_app";



GRANT ALL ON TABLE "public"."User" TO "anon";
GRANT ALL ON TABLE "public"."User" TO "authenticated";
GRANT ALL ON TABLE "public"."User" TO "service_role";
GRANT ALL ON TABLE "public"."User" TO "aic_app";



GRANT ALL ON TABLE "public"."_prisma_migrations" TO "anon";
GRANT ALL ON TABLE "public"."_prisma_migrations" TO "authenticated";
GRANT ALL ON TABLE "public"."_prisma_migrations" TO "service_role";
GRANT ALL ON TABLE "public"."_prisma_migrations" TO "aic_app";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "aic_app";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "aic_app";































