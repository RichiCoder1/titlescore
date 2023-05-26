CREATE TABLE IF NOT EXISTS "contestants" (
	"id" text PRIMARY KEY NOT NULL,
	"contest_id" text NOT NULL,
	"name" text NOT NULL,
	"stage_name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "contests" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '',
	"creator_id" text NOT NULL,
	"starts_at" date NOT NULL,
	"ends_at" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "criteria" (
	"id" text PRIMARY KEY NOT NULL,
	"contest_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"weight" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "scores" (
	"contest_id" text NOT NULL,
	"contestant_id" text NOT NULL,
	"criteria_id" text NOT NULL,
	"judge_id" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_contest_id_contestant_id_criteria_id" PRIMARY KEY("contest_id","contestant_id","criteria_id");

DO $$ BEGIN
 ALTER TABLE "contestants" ADD CONSTRAINT "contestants_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "criteria" ADD CONSTRAINT "criteria_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "scores" ADD CONSTRAINT "scores_contest_id_contests_id_fk" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "scores" ADD CONSTRAINT "scores_contestant_id_contestants_id_fk" FOREIGN KEY ("contestant_id") REFERENCES "contestants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "scores" ADD CONSTRAINT "scores_criteria_id_criteria_id_fk" FOREIGN KEY ("criteria_id") REFERENCES "criteria"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
