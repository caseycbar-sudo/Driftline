CREATE TABLE `request_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`request_id` integer NOT NULL,
	`sender` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	`read_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `request_messages_request_idx` ON `request_messages` (`request_id`);