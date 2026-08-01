CREATE TYPE "public"."publish_status" AS ENUM('idle', 'publishing', 'published', 'failed');--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "food_type" text DEFAULT 'veg' NOT NULL;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "map_url" text;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "publish_status" "publish_status" DEFAULT 'idle' NOT NULL;--> statement-breakpoint
ALTER TABLE "shops" ADD COLUMN "last_published_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" text;