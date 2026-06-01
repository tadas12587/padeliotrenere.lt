CREATE TABLE `SeoSetting` (
  `id` VARCHAR(191) NOT NULL,
  `pageSlug` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NULL,
  `description` TEXT NULL,
  `ogImageUrl` VARCHAR(191) NULL,
  `keywords` TEXT NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `SeoSetting_pageSlug_key` (`pageSlug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `GlobalSeoSetting` (
  `id` VARCHAR(191) NOT NULL DEFAULT 'global',
  `siteName` VARCHAR(191) NOT NULL DEFAULT 'Padėlio Treneris',
  `siteUrl` VARCHAR(191) NULL,
  `defaultOgImage` VARCHAR(191) NULL,
  `twitterHandle` VARCHAR(191) NULL,
  `facebookUrl` VARCHAR(191) NULL,
  `instagramUrl` VARCHAR(191) NULL,
  `googleSiteVerification` VARCHAR(191) NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
