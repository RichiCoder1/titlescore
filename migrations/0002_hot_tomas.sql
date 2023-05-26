ALTER TABLE "scores" ALTER COLUMN "score" DROP NOT NULL;
ALTER TABLE "scores" ALTER COLUMN "comment" DROP NOT NULL;
ALTER TABLE "scores" ADD COLUMN "submitted_at" timestamp;