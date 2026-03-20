ALTER TABLE "question_templates"
ADD COLUMN "order" integer DEFAULT 0 NOT NULL;

WITH ranked_questions AS (
	SELECT
		"id",
		ROW_NUMBER() OVER (PARTITION BY "scenario_id" ORDER BY "id") - 1 AS position
	FROM "question_templates"
)
UPDATE "question_templates" AS qt
SET "order" = ranked_questions.position
FROM ranked_questions
WHERE qt."id" = ranked_questions."id";

ALTER TABLE "interview_sessions"
ADD COLUMN "current_question_index" integer DEFAULT 0 NOT NULL;
