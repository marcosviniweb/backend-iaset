/*
  Warnings:

  - A unique constraint covering the columns `[matricula]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `endereco` VARCHAR(191) NULL,
    ADD COLUMN `lotacao` VARCHAR(191) NULL,
    ADD COLUMN `matricula` VARCHAR(191) NULL,
    ADD COLUMN `rg` VARCHAR(191) NULL,
    ADD COLUMN `vinculo` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_matricula_key` ON `User`(`matricula`);
