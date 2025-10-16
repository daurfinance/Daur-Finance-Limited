CREATE TABLE `cardAuthorizations` (
	`id` varchar(64) NOT NULL,
	`cardId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`stripeAuthorizationId` varchar(255) NOT NULL,
	`amount` varchar(100) NOT NULL,
	`currency` varchar(10) DEFAULT 'USD',
	`merchantName` varchar(255),
	`merchantCategory` varchar(100),
	`status` enum('pending','approved','declined') DEFAULT 'pending',
	`approved` boolean DEFAULT false,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `cardAuthorizations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cards` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`stripeCardId` varchar(255) NOT NULL,
	`last4` varchar(4),
	`brand` varchar(50),
	`status` enum('active','inactive','canceled') DEFAULT 'active',
	`cardholderName` varchar(255),
	`expiryMonth` int,
	`expiryYear` int,
	`spendingLimit` varchar(100),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exchangeRates` (
	`id` varchar(64) NOT NULL,
	`fromCurrency` varchar(10) NOT NULL,
	`toCurrency` varchar(10) NOT NULL,
	`rate` varchar(100) NOT NULL,
	`source` varchar(100) DEFAULT 'coingecko',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `exchangeRates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`type` enum('deposit','withdrawal','transfer','card_payment','card_refund') NOT NULL,
	`amount` varchar(100) NOT NULL,
	`currency` varchar(10) DEFAULT 'USDT',
	`status` enum('pending','completed','failed','canceled') DEFAULT 'pending',
	`fromAddress` varchar(255),
	`toAddress` varchar(255),
	`txHash` varchar(255),
	`stripeTransactionId` varchar(255),
	`description` text,
	`metadata` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`address` varchar(255) NOT NULL,
	`privateKeyEncrypted` text NOT NULL,
	`network` varchar(50) NOT NULL DEFAULT 'tron',
	`balance` varchar(100) DEFAULT '0',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `telegramId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `telegramUsername` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `kycStatus` enum('pending','verified','rejected') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `users` ADD `kycDocuments` text;