ALTER TABLE "contest_members" DROP CONSTRAINT "contest_members_pkey";
ALTER TABLE "contest_members" ADD COLUMN "contest_id" text NOT NULL;
ALTER TABLE "contest_members" ADD CONSTRAINT "contest_members_user_id_contest_id" PRIMARY KEY("user_id","contest_id");