-- MySQL schema for cPanel import (phpMyAdmin)
-- Matches prisma/schema.prisma (minimal subset to start)

CREATE TABLE IF NOT EXISTS `User` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(32) NOT NULL DEFAULT 'USER',
  `companyName` varchar(191) DEFAULT NULL,
  `tenantId` varchar(191) DEFAULT NULL,
  `isTrial` tinyint(1) NOT NULL DEFAULT 0,
  `trialEndsAt` datetime DEFAULT NULL,
  `twoFactorEnabled` tinyint(1) NOT NULL DEFAULT 0,
  `twoFactorSecret` varchar(191) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_tenantId_idx` (`tenantId`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Client` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `website` varchar(191) NOT NULL,
  `status` varchar(32) NOT NULL,
  `nextReport` varchar(191) NOT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `tenantId` varchar(191) DEFAULT NULL,
  `companyName` varchar(191) DEFAULT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `Client_tenantId_idx` (`tenantId`),
  KEY `Client_userId_idx` (`userId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Client_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Report` (
  `id` varchar(191) NOT NULL,
  `clientName` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `date` varchar(191) NOT NULL,
  `status` varchar(32) NOT NULL,
  `platform` varchar(64) NOT NULL,
  `tenantId` varchar(191) DEFAULT NULL,
  `companyName` varchar(191) DEFAULT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `Report_tenantId_idx` (`tenantId`),
  KEY `Report_userId_idx` (`userId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `Report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Template` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `isCustom` tinyint(1) NOT NULL DEFAULT 1,
  `lastModified` varchar(191) DEFAULT NULL,
  `tenantId` varchar(191) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `Template_tenantId_idx` (`tenantId`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Invoice` (
  `id` varchar(191) NOT NULL,
  `clientName` varchar(191) NOT NULL,
  `amount` int NOT NULL,
  `date` varchar(191) NOT NULL,
  `dueDate` varchar(191) NOT NULL,
  `status` varchar(32) NOT NULL,
  `items` json NOT NULL,
  `tenantId` varchar(191) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `Invoice_tenantId_idx` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Integration` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `provider` varchar(64) NOT NULL,
  `status` varchar(32) NOT NULL,
  `lastSync` varchar(191) DEFAULT NULL,
  `description` varchar(191) NOT NULL,
  `tenantId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Integration_tenantId_idx` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `OAuthToken` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `provider` varchar(64) NOT NULL,
  `scope` varchar(191) NOT NULL,
  `data` text NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `OAuthToken_userId_idx` (`userId`),
  CONSTRAINT `OAuthToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `AuditLog` (
  `id` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `details` json NOT NULL,
  `ip` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `AuditLog_userId_idx` (`userId`),
  CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ScheduledReport` (
  `id` varchar(191) NOT NULL,
  `clientId` varchar(191) NOT NULL,
  `clientName` varchar(191) NOT NULL,
  `frequency` varchar(32) NOT NULL,
  `dayOfWeek` int DEFAULT NULL,
  `dayOfMonth` int DEFAULT NULL,
  `time` varchar(16) NOT NULL,
  `recipients` json NOT NULL,
  `templateId` varchar(191) DEFAULT NULL,
  `nextRun` datetime DEFAULT NULL,
  `lastRun` datetime DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `tenantId` varchar(191) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ScheduledReport_tenantId_idx` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Subscription` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `plan` varchar(64) NOT NULL,
  `status` varchar(64) NOT NULL,
  `billingCycle` varchar(64) DEFAULT NULL,
  `trialEndsAt` datetime DEFAULT NULL,
  `trialDaysRemaining` int DEFAULT NULL,
  `expiresAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Subscription_userId_key` (`userId`),
  CONSTRAINT `Subscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
