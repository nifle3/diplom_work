ALTER TABLE "achievements" ADD COLUMN "formula" text DEFAULT 'false' NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "achievements" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;