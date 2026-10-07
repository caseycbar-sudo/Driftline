ALTER TABLE `billing_profiles` ADD `environment` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `card_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `payments` ADD `environment` text DEFAULT '' NOT NULL;