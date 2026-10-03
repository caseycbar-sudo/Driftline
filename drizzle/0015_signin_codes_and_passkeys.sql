-- Sign-in by 6-digit code (sent with the email link), Face ID / passkeys, and Google.
ALTER TABLE `auth_tokens` ADD `code_hash` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `auth_tokens` ADD `attempts` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE TABLE `passkeys` (
	`credential_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`public_key` text NOT NULL,
	`counter` integer DEFAULT 0 NOT NULL,
	`transports` text DEFAULT '' NOT NULL,
	`device` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`last_used_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `passkeys_email_idx` ON `passkeys` (`email`);
--> statement-breakpoint
CREATE TABLE `auth_challenges` (
	`id_hash` text PRIMARY KEY NOT NULL,
	`challenge` text NOT NULL,
	`purpose` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`return_to` text DEFAULT '/' NOT NULL,
	`expires_at` text NOT NULL
);
