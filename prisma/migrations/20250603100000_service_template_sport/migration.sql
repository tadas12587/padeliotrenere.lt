ALTER TABLE `ServiceTemplate`
  ADD COLUMN `sportId` VARCHAR(191) NULL,
  ADD CONSTRAINT `ServiceTemplate_sportId_fkey`
    FOREIGN KEY (`sportId`) REFERENCES `Sport`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX `ServiceTemplate_sportId_idx` ON `ServiceTemplate`(`sportId`);
