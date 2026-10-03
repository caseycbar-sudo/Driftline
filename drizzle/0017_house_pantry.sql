-- What each household already has in the pantry after a visit, so the next
-- shopping list doesn't buy it again.
CREATE TABLE `customer_pantry` (
	`email` text NOT NULL,
	`item_key` text NOT NULL,
	`name` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`email`, `item_key`)
);
