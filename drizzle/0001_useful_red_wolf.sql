CREATE TABLE `custom_recipes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`title` text NOT NULL,
	`servings` integer DEFAULT 4 NOT NULL,
	`ingredients` text NOT NULL,
	`directions` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`source_url` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `selected_meals` (
	`email` text NOT NULL,
	`recipe_id` integer NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`email`, `recipe_id`)
);
