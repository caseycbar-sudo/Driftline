-- Fred Meyer (Kroger) connection: a staff member's linked Fred Meyer account for
-- adding groceries to their cart, and the product chosen for each shopping-list item.
CREATE TABLE `kroger_accounts` (
	`email` text PRIMARY KEY NOT NULL,
	`token_box` text NOT NULL,
	`expires_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `grocery_picks` (
	`item_key` text PRIMARY KEY NOT NULL,
	`upc` text NOT NULL,
	`description` text NOT NULL,
	`size` text DEFAULT '' NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`updated_by` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
