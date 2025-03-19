/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `Dependent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Dependent` ADD COLUMN `cpf` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Dependent_cpf_key` ON `Dependent`(`cpf`);
