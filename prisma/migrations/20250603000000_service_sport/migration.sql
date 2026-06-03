ALTER TABLE `Service`
  ADD COLUMN `sportId` VARCHAR(191) NULL,
  ADD CONSTRAINT `Service_sportId_fkey`
    FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX `Service_sportId_idx` ON `Service`(`sportId`);
