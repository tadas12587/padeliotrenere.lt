-- CreateTable ServiceTemplate
CREATE TABLE `ServiceTemplate` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AlterTable Service: add new columns
ALTER TABLE `Service` ADD COLUMN `templateId` VARCHAR(191) NULL;
ALTER TABLE `Service` ADD COLUMN `type` ENUM('INDIVIDUAL', 'GROUP') NOT NULL DEFAULT 'INDIVIDUAL';
ALTER TABLE `Service` ADD COLUMN `maxParticipants` INT NULL;
ALTER TABLE `Service` ADD COLUMN `priceType` ENUM('TOTAL', 'PER_PERSON') NULL;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_templateId_fkey`
  FOREIGN KEY (`templateId`) REFERENCES `ServiceTemplate`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
