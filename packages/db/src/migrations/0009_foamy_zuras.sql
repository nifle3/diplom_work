ALTER TABLE "interview_sessions" ADD COLUMN "current_question_index" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "question_templates" ADD COLUMN "order" integer DEFAULT 0 NOT NULL;