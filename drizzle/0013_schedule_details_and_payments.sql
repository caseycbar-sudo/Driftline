CREATE TABLE `billing_profiles` (
	`email` text PRIMARY KEY NOT NULL,
	`square_customer_id` text NOT NULL,
	`card_id` text DEFAULT '' NOT NULL,
	`card_brand` text DEFAULT '' NOT NULL,
	`card_last4` text DEFAULT '' NOT NULL,
	`card_exp_month` integer DEFAULT 0 NOT NULL,
	`card_exp_year` integer DEFAULT 0 NOT NULL,
	`autopay_consent_at` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schedule_event_id` integer DEFAULT 0 NOT NULL,
	`customer_email` text NOT NULL,
	`kind` text NOT NULL,
	`description` text NOT NULL,
	`service_cents` integer DEFAULT 0 NOT NULL,
	`grocery_cents` integer DEFAULT 0 NOT NULL,
	`amount_cents` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`idempotency_key` text NOT NULL,
	`square_payment_id` text DEFAULT '' NOT NULL,
	`square_order_id` text DEFAULT '' NOT NULL,
	`square_link_id` text DEFAULT '' NOT NULL,
	`link_url` text DEFAULT '' NOT NULL,
	`receipt_url` text DEFAULT '' NOT NULL,
	`error` text DEFAULT '' NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`paid_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD `street_address` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD `access_notes` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `customer_profiles` ADD `kitchen_notes` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `service_type` text DEFAULT 'meal_prep' NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `guest_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `contact_name` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `contact_phone` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `address` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `access_notes` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `inquiry_id` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `series_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `price_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `grocery_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `schedule_events` ADD `receipt_key` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `payments_idempotency_key` ON `payments` (`idempotency_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `payments_one_visit_charge` ON `payments` (`schedule_event_id`) WHERE `kind` = 'visit_charge';--> statement-breakpoint
CREATE INDEX `payments_customer` ON `payments` (`customer_email`, `created_at`);--> statement-breakpoint
CREATE INDEX `schedule_events_date` ON `schedule_events` (`service_date`, `start_time`);--> statement-breakpoint
CREATE INDEX `schedule_events_chef` ON `schedule_events` (`chef_email`, `service_date`);
