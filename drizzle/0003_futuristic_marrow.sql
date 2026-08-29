ALTER TABLE `schedule_events` ADD `customer_email` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `dishes` text DEFAULT '[]' NOT NULL;