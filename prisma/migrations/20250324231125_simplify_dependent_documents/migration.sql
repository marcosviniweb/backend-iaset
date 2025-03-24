/*
  Warnings:

  - You are about to drop the column `certidaoNascimentoOuRGCPF` on the `dependent` table. All the data in the column will be lost.
  - You are about to drop the column `comprovanteCasamentoOuUniao` on the `dependent` table. All the data in the column will be lost.
  - You are about to drop the column `comprovanteMatriculaFaculdade` on the `dependent` table. All the data in the column will be lost.
  - You are about to drop the column `documentoAdocao` on the `dependent` table. All the data in the column will be lost.
  - You are about to drop the column `laudoMedicoFilhosDeficientes` on the `dependent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Dependent` DROP COLUMN `certidaoNascimentoOuRGCPF`,
    DROP COLUMN `comprovanteCasamentoOuUniao`,
    DROP COLUMN `comprovanteMatriculaFaculdade`,
    DROP COLUMN `documentoAdocao`,
    DROP COLUMN `laudoMedicoFilhosDeficientes`,
    ADD COLUMN `file` VARCHAR(191) NULL;
