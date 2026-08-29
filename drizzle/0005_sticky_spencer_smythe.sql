CREATE TABLE `chef_time_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chef_email` text NOT NULL,
	`schedule_event_id` integer DEFAULT 0 NOT NULL,
	`activity_type` text NOT NULL,
	`label` text NOT NULL,
	`started_at` text NOT NULL,
	`ended_at` text DEFAULT '' NOT NULL,
	`mileage_hundredths` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `chef_pay_cents` integer DEFAULT 0 NOT NULL;