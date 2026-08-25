CREATE TABLE `customer_profiles` (
	`email` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`household_size` integer DEFAULT 1 NOT NULL,
	`service_for` text DEFAULT 'My household' NOT NULL,
	`dietary_needs` text DEFAULT '' NOT NULL,
	`favorite_foods` text DEFAULT '' NOT NULL,
	`foods_to_avoid` text DEFAULT '' NOT NULL,
	`preferred_package` text DEFAULT 'Weekly' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
