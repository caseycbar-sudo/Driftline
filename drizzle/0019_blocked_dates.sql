CREATE TABLE `blocked_dates` (
	`date` text PRIMARY KEY NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
