CREATE TABLE IF NOT EXISTS "karwei"."review" (
	"id" text PRIMARY KEY NOT NULL,
	"reviewer_id" text NOT NULL,
	"target_user_id" text NOT NULL,
	"post_id" text NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "karwei"."post" ADD COLUMN "dummy" text;--> statement-breakpoint
ALTER TABLE "karwei"."post" ADD COLUMN "status" text DEFAULT 'open' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "karwei"."review" ADD CONSTRAINT "review_reviewer_id_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "karwei"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "karwei"."review" ADD CONSTRAINT "review_target_user_id_user_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "karwei"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "karwei"."review" ADD CONSTRAINT "review_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "karwei"."post"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
