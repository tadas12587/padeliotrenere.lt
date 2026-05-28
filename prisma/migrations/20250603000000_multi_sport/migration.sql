-- Create Sport table
CREATE TABLE `Sport` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `icon` VARCHAR(10) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Sport_name_key` (`name`),
  UNIQUE KEY `Sport_slug_key` (`slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- Create TrainerSport table
CREATE TABLE `TrainerSport` (
  `trainerId` VARCHAR(191) NOT NULL,
  `sportId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`trainerId`, `sportId`),
  CONSTRAINT `TrainerSport_trainerId_fkey` FOREIGN KEY (`trainerId`) REFERENCES `TrainerProfile` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `TrainerSport_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- Create ArenaSport table
CREATE TABLE `ArenaSport` (
  `arenaId` VARCHAR(191) NOT NULL,
  `sportId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`arenaId`, `sportId`),
  CONSTRAINT `ArenaSport_arenaId_fkey` FOREIGN KEY (`arenaId`) REFERENCES `Arena` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ArenaSport_sportId_fkey` FOREIGN KEY (`sportId`) REFERENCES `Sport` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ENGINE=InnoDB;

-- Seed sports
INSERT INTO `Sport` (`id`, `name`, `slug`, `icon`) VALUES
  ('sport_padel', 'Padelis', 'padelis', '🎾'),
  ('sport_tennis', 'Tenisas', 'tenisas', '🎾'),
  ('sport_badminton', 'Badmintonas', 'badmintonas', '🏸'),
  ('sport_tabletennis', 'Stalo tenisas', 'stalo-tenisas', '🏓'),
  ('sport_basketball', 'Krepšinis', 'krepsinis', '🏀'),
  ('sport_football', 'Futbolas', 'futbolas', '⚽'),
  ('sport_volleyball', 'Tinklinis', 'tinklinis', '🏐'),
  ('sport_boxing', 'Boksas', 'boksas', '🥊'),
  ('sport_swimming', 'Plaukimas', 'plaukimas', '🏊'),
  ('sport_yoga', 'Joga', 'joga', '🧘'),
  ('sport_crossfit', 'CrossFit', 'crossfit', '💪'),
  ('sport_running', 'Bėgimas', 'begimas', '🏃'),
  ('sport_golf', 'Golfe', 'golfe', '⛳'),
  ('sport_squash', 'Skvošas', 'skvasas', '🎯'),
  ('sport_handball', 'Rankinis', 'rankinis', '🤾');
