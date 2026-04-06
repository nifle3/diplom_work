CREATE TABLE "report_statuses" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(20) NOT NULL,
	CONSTRAINT "report_statuses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "report_status_log" ADD COLUMN "status_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "report_status_log" ADD CONSTRAINT "report_status_log_status_id_report_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."report_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_status_log" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "active_interview_session_id";