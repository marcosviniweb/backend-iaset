-- CreateTable
CREATE TABLE `Dependent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `relationship` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `certidaoNascimentoOuRGCPF` VARCHAR(191) NULL,
    `comprovanteCasamentoOuUniao` VARCHAR(191) NULL,
    `documentoAdocao` VARCHAR(191) NULL,
    `comprovanteMatriculaFaculdade` VARCHAR(191) NULL,
    `laudoMedicoFilhosDeficientes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Dependent` ADD CONSTRAINT `Dependent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
