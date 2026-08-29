ALTER TABLE `staff_profiles` ADD `phone` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD `job_title` text DEFAULT 'Chef' NOT NULL;--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD `hire_date` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD `emergency_contact` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD `food_handler_expires` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD `food_manager_expires` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `staff_profiles` ADD `admin_notes` text DEFAULT '' NOT NULL;