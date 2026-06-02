ALTER TABLE `GlobalSeoSetting`
  ADD COLUMN `logoUrl`         VARCHAR(500) NULL,
  ADD COLUMN `faviconUrl`      VARCHAR(500) NULL,
  ADD COLUMN `tagline`         VARCHAR(300) NULL,
  ADD COLUMN `phone`           VARCHAR(50)  NULL,
  ADD COLUMN `email`           VARCHAR(200) NULL,
  ADD COLUMN `address`         VARCHAR(300) NULL,
  ADD COLUMN `youtubeUrl`      VARCHAR(500) NULL,
  ADD COLUMN `heroTitle`       VARCHAR(200) NULL,
  ADD COLUMN `heroSubtitle`    VARCHAR(500) NULL,
  ADD COLUMN `maintenanceMode` BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN `maintenanceMsg`  VARCHAR(500) NULL;
