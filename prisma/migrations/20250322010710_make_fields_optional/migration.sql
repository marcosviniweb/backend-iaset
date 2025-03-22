/*
  Warnings:

  - Made the column `firstAccess` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `email` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `birthDay` DATETIME(3) NULL,
    MODIFY `firstAccess` BOOLEAN NOT NULL DEFAULT true;
