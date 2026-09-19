ALTER TABLE `private_chef_inquiries` ADD `inquiry_type` text DEFAULT 'private_chef' NOT NULL;--> statement-breakpoint
ALTER TABLE `private_chef_inquiries` ADD `zip` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `private_chef_inquiries` ADD `package_name` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `private_chef_inquiries` ADD `service_for` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `private_chef_inquiries` ADD `source_hash` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `private_chef_inquiries` ADD `notified_at` text DEFAULT '' NOT NULL;