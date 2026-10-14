CREATE TABLE `auth_passwords` (
	`email` text PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`salt` text NOT NULL,
	`iterations` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `auth_sessions` ADD `method` text DEFAULT '' NOT NULL;