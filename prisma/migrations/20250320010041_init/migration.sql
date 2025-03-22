-- CreateTable
CREATE TABLE "ProvaAssunto" (
    "provaId" INTEGER NOT NULL,
    "assuntoId" INTEGER NOT NULL,

    CONSTRAINT "ProvaAssunto_pkey" PRIMARY KEY ("provaId","assuntoId")
);

-- AddForeignKey
ALTER TABLE "ProvaAssunto" ADD CONSTRAINT "ProvaAssunto_provaId_fkey" FOREIGN KEY ("provaId") REFERENCES "Prova"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvaAssunto" ADD CONSTRAINT "ProvaAssunto_assuntoId_fkey" FOREIGN KEY ("assuntoId") REFERENCES "Assunto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
