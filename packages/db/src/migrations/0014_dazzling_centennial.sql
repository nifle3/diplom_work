CREATE TABLE "interview_session_status_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"status_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_status_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "interview_sessions" DROP CONSTRAINT "interview_sessions_status_id_interview_session_statuses_id_fk";
--> statement-breakpoint
ALTER TABLE "interview_session_status_log" ADD CONSTRAINT "interview_session_status_log_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."interview_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_session_status_log" ADD CONSTRAINT "interview_session_status_log_status_id_interview_session_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."interview_session_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_status_log" ADD CONSTRAINT "report_status_log_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_sessions" DROP COLUMN "status_id";--> statement-breakpoint
ALTER TABLE "interview_sessions" DROP COLUMN "finished_at";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN "status";