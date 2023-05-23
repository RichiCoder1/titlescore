-- Migration number: 0000 	 2023-05-22T23:24:59.005Z

CREATE TABLE `contests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT ('') NOT NULL,
	`creator_id` text NOT NULL,
	`starts_at` TEXT NOT NULL,
	`ends_at` TEXT NOT NULL,
	`created_at` TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE `contestants` (
	`contest_id` integer NOT NULL,
	`name` text NOT NULL,
	`stage_name` text NOT NULL,
	`created_at` TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`contest_id`) REFERENCES `contests`(`id`)
);

CREATE TABLE `criteria` (
	`contest_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`weight` integer NOT NULL,
	`created_at` TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`contest_id`) REFERENCES `contests`(`id`)
);

CREATE TABLE `scores` (
	`contest_id` integer NOT NULL,
	`contestant_id` integer NOT NULL,
	`criteria_id` integer NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`comment` text DEFAULT ('') NOT NULL,
	`created_at` TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`contest_id`, `contestant_id`, `criteria_id`),
	FOREIGN KEY (`contest_id`) REFERENCES `contests`(`id`),
	FOREIGN KEY (`criteria_id`) REFERENCES `criteria`(`contest_id`)
);
