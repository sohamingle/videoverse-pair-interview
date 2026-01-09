CREATE TABLE "sitemap_metadata" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"publication_date" timestamp NOT NULL,
	"keywords" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sitemap_metadata" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sitemap_metadata" ADD CONSTRAINT "sitemap_metadata_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;