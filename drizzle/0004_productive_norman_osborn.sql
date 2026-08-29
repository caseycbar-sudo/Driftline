CREATE TABLE `staff_profiles` (
	`email` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `chef_email` text DEFAULT '' NOT NULL;