-- CreateTable: SlotService M2M join (AvailabilitySlot <-> Service)
CREATE TABLE `_AvailabilitySlotToService` (
  `A` VARCHAR(191) NOT NULL,
  `B` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`A`, `B`),
  KEY `_AvailabilitySlotToService_B_index` (`B`),
  CONSTRAINT `_AvailabilitySlotToService_A_fkey`
    FOREIGN KEY (`A`) REFERENCES `AvailabilitySlot` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_AvailabilitySlotToService_B_fkey`
    FOREIGN KEY (`B`) REFERENCES `Service` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
