CREATE TABLE `private_chef_inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`preferred_date` text NOT NULL,
	`guest_count` integer DEFAULT 2 NOT NULL,
	`location` text NOT NULL,
	`occasion` text DEFAULT '' NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`admin_notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
