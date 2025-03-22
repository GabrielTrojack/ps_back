/*
  Warnings:

  - You are about to drop the `alternativaQuestao` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "alternativaQuestao" DROP CONSTRAINT "alternativaQuestao_alternativaId_fkey";

-- DropForeignKey
ALTER TABLE "alternativaQuestao" DROP CONSTRAINT "alternativaQuestao_questaoId_fkey";

-- DropTable
DROP TABLE "alternativaQuestao";
