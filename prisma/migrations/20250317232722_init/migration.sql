/*
  Warnings:

  - Added the required column `assunto` to the `Assunto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assunto" ADD COLUMN     "assunto" TEXT NOT NULL;
