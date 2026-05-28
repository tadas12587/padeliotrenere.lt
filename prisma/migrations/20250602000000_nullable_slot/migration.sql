-- Make Booking.slotId nullable to support multi-trainer availability slot bookings
ALTER TABLE `Booking` MODIFY COLUMN `slotId` VARCHAR(191) NULL;
