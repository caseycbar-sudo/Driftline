CREATE TABLE `session_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_email` text NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`recipe_ids` text DEFAULT '[]' NOT NULL,
	`dishes` text DEFAULT '[]' NOT NULL,
	`people` integer DEFAULT 2 NOT NULL,
	`package_name` text DEFAULT '' NOT NULL,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`windows` text DEFAULT '[]' NOT NULL,
	`access_notes` text DEFAULT '' NOT NULL,
	`kitchen_notes` text DEFAULT '' NOT NULL,
	`policy_accepted_at` text DEFAULT '' NOT NULL,
	`admin_note` text DEFAULT '' NOT NULL,
	`suggested_times` text DEFAULT '[]' NOT NULL,
	`schedule_event_id` integer DEFAULT 0 NOT NULL,
	`reminded_at` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD `no_allergies` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `chef_response` text DEFAULT 'accepted' NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `request_id` integer DEFAULT 0 NOT NULL;