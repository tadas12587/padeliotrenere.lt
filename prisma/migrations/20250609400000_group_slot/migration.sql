ALTER TABLE `AvailabilitySlot` ADD COLUMN `maxParticipants` INT NULL;
CREATE INDEX `AvailabilitySlot_maxParticipants_idx` ON `AvailabilitySlot` (`maxParticipants`);
