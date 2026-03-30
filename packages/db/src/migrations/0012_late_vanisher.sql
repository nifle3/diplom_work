CREATE TABLE "interview_session_statuses" (
	"id" integer PRIMARY KEY NOT NULL,
	"status" varchar(20) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD COLUMN "status_id" integer;--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_status_id_interview_session_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."interview_session_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_sessions" DROP COLUMN "status";