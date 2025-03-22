/*
  Warnings:

  - The `selectedAlt` column on the `ProvaQuestao` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ProvaQuestao" DROP COLUMN "selectedAlt",
ADD COLUMN     "selectedAlt" INTEGER;
