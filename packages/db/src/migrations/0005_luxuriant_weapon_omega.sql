ALTER TABLE "categories" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "id" DROP IDENTITY;--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "deleted_at";