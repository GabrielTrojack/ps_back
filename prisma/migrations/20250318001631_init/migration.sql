/*
  Warnings:

  - Changed the type of `altCorrect` on the `Questao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Questao" DROP COLUMN "altCorrect",
ADD COLUMN     "altCorrect" INTEGER NOT NULL;
