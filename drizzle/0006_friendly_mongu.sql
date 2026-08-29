CREATE TABLE `legal_acceptances` (
	`email` text NOT NULL,
	`scope` text NOT NULL,
	`version` text NOT NULL,
	`accepted_at` text NOT NULL,
	PRIMARY KEY(`email`, `scope`, `version`)
);
