CREATE TABLE `recipe_overrides` (
	`recipe_id` integer PRIMARY KEY NOT NULL,
	`side` text DEFAULT 'meal-prep' NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`hidden` integer DEFAULT 0 NOT NULL,
	`custom` integer DEFAULT 0 NOT NULL,
	`updated_by` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
