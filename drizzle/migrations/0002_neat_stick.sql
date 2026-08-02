ALTER TYPE "public"."analytics_event_type" ADD VALUE 'like_click';--> statement-breakpoint
CREATE TABLE "daily_item_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"date" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"unique_views" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_shop_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shop_id" uuid NOT NULL,
	"date" date NOT NULL,
	"menu_views" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"qr_scans" integer DEFAULT 0 NOT NULL,
	"share_clicks" integer DEFAULT 0 NOT NULL,
	"like_clicks" integer DEFAULT 0 NOT NULL,
	"whatsapp_clicks" integer DEFAULT 0 NOT NULL,
	"direction_clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_unique_visitors" (
	"shop_id" uuid NOT NULL,
	"date" date NOT NULL,
	"visitor_id" text NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_unique_visitors_shop_id_date_visitor_id_pk" PRIMARY KEY("shop_id","date","visitor_id")
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "visitor_id" text;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN "dedup_key" text;--> statement-breakpoint
ALTER TABLE "daily_item_stats" ADD CONSTRAINT "daily_item_stats_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_item_stats" ADD CONSTRAINT "daily_item_stats_item_id_menu_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_shop_stats" ADD CONSTRAINT "daily_shop_stats_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_unique_visitors" ADD CONSTRAINT "daily_unique_visitors_shop_id_shops_id_fk" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "daily_item_stats_item_date_idx" ON "daily_item_stats" USING btree ("item_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_shop_stats_shop_date_idx" ON "daily_shop_stats" USING btree ("shop_id","date");