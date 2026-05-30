-- Add FK from Booking.availabilitySlotId -> AvailabilitySlot.id
-- Column already exists (added in 20250601000000_multi_trainer), just adding index + FK constraint
ALTER TABLE `Booking`
  ADD INDEX `Booking_availabilitySlotId_idx` (`availabilitySlotId`),
  ADD CONSTRAINT `Booking_availabilitySlotId_fkey`
    FOREIGN KEY (`availabilitySlotId`) REFERENCES `AvailabilitySlot` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;
