CREATE TABLE `schedule_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`service_date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text DEFAULT '' NOT NULL,
	`household` text NOT NULL,
	`chef` text DEFAULT 'Unassigned' NOT NULL,
	`package_name` text DEFAULT 'Weekly' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
