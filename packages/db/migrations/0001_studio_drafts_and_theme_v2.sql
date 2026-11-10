CREATE TABLE "profile_drafts" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"document" jsonb NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"published_revision" integer,
	"base_fingerprint" text NOT NULL,
	"updated_by_user_id" uuid,
	"last_published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_favorites" (
	"user_id" uuid NOT NULL,
	"theme_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "theme_favorites_user_id_theme_id_pk" PRIMARY KEY("user_id","theme_id")
);
--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "appearance" jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "theme_overrides" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "category" text DEFAULT 'custom' NOT NULL;--> statement-breakpoint
ALTER TABLE "themes" ADD COLUMN "author" text;--> statement-breakpoint
ALTER TABLE "profile_drafts" ADD CONSTRAINT "profile_drafts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_drafts" ADD CONSTRAINT "profile_drafts_updated_by_user_id_users_id_fk" FOREIGN KEY ("updated_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_favorites" ADD CONSTRAINT "theme_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "theme_favorites" ADD CONSTRAINT "theme_favorites_theme_id_themes_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "theme_favorites_theme_id_index" ON "theme_favorites" USING btree ("theme_id");