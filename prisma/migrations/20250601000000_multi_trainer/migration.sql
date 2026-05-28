-- Add TRAINER to Role enum
ALTER TABLE `User` MODIFY COLUMN `role` ENUM('CLIENT','TRAINER','ADMIN') NOT NULL DEFAULT 'CLIENT';

-- Create TrainerProfile
CREATE TABLE `TrainerProfile` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `displayName` VARCHAR(191) NOT NULL,
  `bio` TEXT NULL,
  `photoUrl` VARCHAR(500) NULL,
  `city` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `status` ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `isFeatured` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `TrainerProfile_userId_key` (`userId`),
  CONSTRAINT `TrainerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- Create Arena
CREATE TABLE `Arena` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `city` VARCHAR(191) NOT NULL,
  `address` VARCHAR(500) NOT NULL,
  `description` TEXT NULL,
  `photoUrl` VARCHAR(500) NULL,
  `status` ENUM('PENDING','APPROVED') NOT NULL DEFAULT 'PENDING',
  `createdById` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `Arena_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- Create Certification
CREATE TABLE `Certification` (
  `id` VARCHAR(191) NOT NULL,
  `trainerId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `issuedBy` VARCHAR(191) NOT NULL,
  `year` INT NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `Certification_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `TrainerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- Create Service
CREATE TABLE `Service` (
  `id` VARCHAR(191) NOT NULL,
  `trainerId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `durationMinutes` INT NOT NULL,
  `price` DECIMAL(10,2) NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `Service_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `TrainerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- Create TrainerArena
CREATE TABLE `TrainerArena` (
  `trainerId` VARCHAR(191) NOT NULL,
  `arenaId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`trainerId`, `arenaId`),
  CONSTRAINT `TrainerArena_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `TrainerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TrainerArena_arenaId_fkey` FOREIGN KEY (`arenaId`) REFERENCES `Arena` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- Create AvailabilitySlot
CREATE TABLE `AvailabilitySlot` (
  `id` VARCHAR(191) NOT NULL,
  `trainerId` VARCHAR(191) NOT NULL,
  `arenaId` VARCHAR(191) NOT NULL,
  `startTime` DATETIME(3) NOT NULL,
  `endTime` DATETIME(3) NOT NULL,
  `status` ENUM('AVAILABLE','BOOKED') NOT NULL DEFAULT 'AVAILABLE',
  `bookingId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `AvailabilitySlot_bookingId_key` (`bookingId`),
  CONSTRAINT `AvailabilitySlot_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `TrainerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AvailabilitySlot_arenaId_fkey` FOREIGN KEY (`arenaId`) REFERENCES `Arena` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `AvailabilitySlot_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- Create Review
CREATE TABLE `Review` (
  `id` VARCHAR(191) NOT NULL,
  `trainerId` VARCHAR(191) NOT NULL,
  `authorId` VARCHAR(191) NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `Review_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `TrainerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Review_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- Update Booking table
ALTER TABLE `Booking`
  ADD COLUMN `trainerId` VARCHAR(191) NULL,
  ADD COLUMN `arenaId` VARCHAR(191) NULL,
  ADD COLUMN `serviceId` VARCHAR(191) NULL,
  ADD COLUMN `availabilitySlotId` VARCHAR(191) NULL,
  ADD CONSTRAINT `Booking_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `TrainerProfile` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_arenaId_fkey` FOREIGN KEY (`arenaId`) REFERENCES `Arena` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Booking_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
