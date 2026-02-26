ALTER TABLE "scripts" ALTER COLUMN "category_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scripts" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scripts" ALTER COLUMN "context" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "scripts" ADD COLUMN "isDraft" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "scripts" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "scripts" ADD COLUMN "draft_over_at" timestamp;