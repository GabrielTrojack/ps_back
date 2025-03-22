-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materia" (
    "id" SERIAL NOT NULL,
    "materia" TEXT NOT NULL,

    CONSTRAINT "Materia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assunto" (
    "id" SERIAL NOT NULL,
    "materiaId" INTEGER NOT NULL,

    CONSTRAINT "Assunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Questao" (
    "id" SERIAL NOT NULL,
    "assuntoId" INTEGER NOT NULL,
    "enunciado" TEXT NOT NULL,
    "image" TEXT,
    "altCorrect" TEXT NOT NULL,

    CONSTRAINT "Questao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alternativa" (
    "id" SERIAL NOT NULL,
    "questaoId" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "Alternativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prova" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "materiaId" INTEGER NOT NULL,
    "inicioTempo" TIMESTAMP(3) NOT NULL,
    "fimTempo" TIMESTAMP(3),

    CONSTRAINT "Prova_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvaQuestao" (
    "id" SERIAL NOT NULL,
    "provaId" INTEGER NOT NULL,
    "questaoId" INTEGER NOT NULL,
    "selectedAlt" TEXT,
    "isCorrect" BOOLEAN,

    CONSTRAINT "ProvaQuestao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resultado" (
    "id" SERIAL NOT NULL,
    "provaId" INTEGER NOT NULL,
    "assuntoId" INTEGER NOT NULL,
    "acertos" INTEGER NOT NULL,

    CONSTRAINT "Resultado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Assunto" ADD CONSTRAINT "Assunto_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Questao" ADD CONSTRAINT "Questao_assuntoId_fkey" FOREIGN KEY ("assuntoId") REFERENCES "Assunto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternativa" ADD CONSTRAINT "Alternativa_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "Questao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prova" ADD CONSTRAINT "Prova_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prova" ADD CONSTRAINT "Prova_materiaId_fkey" FOREIGN KEY ("materiaId") REFERENCES "Materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvaQuestao" ADD CONSTRAINT "ProvaQuestao_provaId_fkey" FOREIGN KEY ("provaId") REFERENCES "Prova"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvaQuestao" ADD CONSTRAINT "ProvaQuestao_questaoId_fkey" FOREIGN KEY ("questaoId") REFERENCES "Questao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resultado" ADD CONSTRAINT "Resultado_provaId_fkey" FOREIGN KEY ("provaId") REFERENCES "Prova"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resultado" ADD CONSTRAINT "Resultado_assuntoId_fkey" FOREIGN KEY ("assuntoId") REFERENCES "Assunto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
