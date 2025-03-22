/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `ProvaQuestao` table. All the data in the column will be lost.
  - You are about to drop the column `selectedAlt` on the `ProvaQuestao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProvaQuestao" DROP COLUMN "isCorrect",
DROP COLUMN "selectedAlt";
