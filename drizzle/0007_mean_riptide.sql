CREATE TABLE `visit_completions` (
	`schedule_event_id` integer PRIMARY KEY NOT NULL,
	`customer_email` text NOT NULL,
	`chef_email` text NOT NULL,
	`counters_clean` integer DEFAULT false NOT NULL,
	`sink_clean` integer DEFAULT false NOT NULL,
	`trash_handled` integer DEFAULT false NOT NULL,
	`appliances_off` integer DEFAULT false NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`completed_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visit_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schedule_event_id` integer NOT NULL,
	`customer_email` text NOT NULL,
	`chef_email` text NOT NULL,
	`photo_type` text NOT NULL,
	`dish_title` text DEFAULT '' NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`created_at` text NOT NULL
);
