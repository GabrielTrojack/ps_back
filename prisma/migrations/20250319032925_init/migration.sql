/*
  Warnings:

  - You are about to drop the column `altCorrect` on the `Questao` table. All the data in the column will be lost.
  - You are about to drop the `Resultado` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Resultado" DROP CONSTRAINT "Resultado_assuntoId_fkey";

-- DropForeignKey
ALTER TABLE "Resultado" DROP CONSTRAINT "Resultado_provaId_fkey";

-- AlterTable
ALTER TABLE "Questao" DROP COLUMN "altCorrect";

-- DropTable
DROP TABLE "Resultado";

-- CreateTable
CREATE TABLE "alternativaQuestao" (
    "id" SERIAL NOT NULL,
    "questaoId" INTEGER NOT NULL,
    "alternativaId" INTEGER NOT NULL,

    CONSTRAINT "alternativaQuestao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "alternativaQuestao" ADD CONSTRAINT "alternativaQuestao_alternativaId_fkey" FOREIGN KEY ("alternativaId") REFERENCES "Alternativa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alternativaQuestao" ADD CONSTRAINT "alternativaQuestao_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "Questao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
