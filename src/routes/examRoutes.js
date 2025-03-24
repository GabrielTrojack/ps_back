import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

router.post('/createExam', async (req, res) => {
    const { materiaId } = req.body;
    const usuarioId = req.userId;

    if (!materiaId) {
        return res.status(400).send({ message: "MateriaId é obrigatório" });
    }

    try {
        const materia = await prisma.materia.findUnique({
            where: { id: materiaId },
            include: {
                assuntos: true,
            }
        });

        if (!materia || materia.assuntos.length < 3) {
            return res.status(400).send({ message: "Não há assuntos suficientes para criar a prova" });
        }

        const shuffledAssuntos = materia.assuntos.sort(() => Math.random() - 0.5).slice(0, 3);

        const exam = await prisma.prova.create({
            data: {
                usuarioId,
                materiaId,
                inicioTempo: new Date(),
            }
        });

        const provaAssuntoData = shuffledAssuntos.map((assunto) => ({
            provaId: exam.id,
            assuntoId: assunto.id,
        }));

        await prisma.provaAssunto.createMany({
            data: provaAssuntoData,
        });

        for (let assunto of shuffledAssuntos) {
            const questoes = await prisma.questao.findMany({
                where: { assuntoId: assunto.id },
                take: 7,
                include: {
                    alternativas: {
                        select: {
                            id: true,
                            texto: true,
                            isCorrect: true
                        }
                    }
                }
            });

            const shuffledQuestoes = questoes.sort(() => Math.random() - 0.5).slice(0, 7);

            for (let questao of shuffledQuestoes) {
                await prisma.provaQuestao.create({
                    data: {
                        provaId: exam.id,
                        questaoId: questao.id,
                    }
                });
            }
        }

        const examWithDetails = await prisma.prova.findUnique({
            where: { id: exam.id },
            include: {
                questoes: {
                    include: {
                        questao: {
                            select: {
                                id: true,
                                enunciado: true,
                                alternativas: {
                                    select: {
                                        id: true,
                                        texto: true,
                                        isCorrect: true,
                                    }
                                }
                            }
                        }
                    }
                },
                assuntos: {
                    select: {
                        provaId: true,
                        assuntoId: true,
                    }
                }
            }
        });

        res.status(201).send(examWithDetails);

    } catch (err) {
        console.error("Erro ao criar a prova:", err);
        res.status(500).send({ message: "Erro ao criar a prova", error: err.message });
    }
});


router.get('/getExamQuestions/:examId', async (req, res) => {
    const { examId } = req.params;

    try {
        const examDetails = await prisma.prova.findUnique({
            where: { id: parseInt(examId) },
            include: {
                questoes: {
                    include: {
                        questao: {
                            select: {
                                id: true,
                                enunciado: true,
                                alternativas: {
                                    select: {
                                        id: true,
                                        texto: true,
                                        isCorrect: true
                                    }
                                },
                                assuntoId: true
                            }
                        }
                    }
                }
            }
        });

        if (!examDetails) {
            return res.status(404).send({ message: "Prova não encontrada" });
        }

        res.status(200).send(examDetails.questoes.map(questao => ({
            questaoId: questao.questao.id,
            assuntoId: questao.questao.assuntoId,
            enunciado: questao.questao.enunciado,
            alternativas: questao.questao.alternativas
        })));

    } catch (err) {
        console.error("Erro ao buscar as questões da prova:", err);
        res.status(500).send({ message: "Erro ao buscar as questões da prova", error: err.message });
    }
});

router.get('/getAllMaterias', async (req, res) => {
    try {
        const materias = await prisma.materia.findMany();

        if (!materias || materias.length === 0) {
            return res.status(404).send({ message: "Nenhuma matéria encontrada" });
        }

        res.status(200).send(materias);
    } catch (err) {
        console.error("Erro ao buscar as matérias:", err);
        res.status(500).send({ message: "Erro ao buscar as matérias", error: err.message });
    }
});

router.get('/getAssuntoById/:assuntoId', async (req, res) => {
    const { assuntoId } = req.params;
    try {
        const assunto = await prisma.assunto.findUnique({
            where: { id: parseInt(assuntoId) },
            select: {
                assunto: true,
            }
        });

        if (!assunto) {
            return res.status(404).send({ message: "Nenhum assunto encontrad" });
        }

        res.status(200).send(assunto);
    } catch (err) {
        console.error("Erro ao buscar assunto:", err);
        res.status(500).send({ message: "Erro ao buscar assunto", error: err.message });
    }
});

router.put('/updateFimTempo/:provaId', async (req, res) => {
    const { provaId } = req.params;
    const { fimTempo } = req.body;
  
    if (!fimTempo) {
      return res.status(400).send({ message: 'Tempo final é obrigatório' });
    }
  
    try {
          const updatedProva = await prisma.prova.update({
        where: { id: parseInt(provaId) },
        data: { fimTempo: new Date(fimTempo) },
      });
  
      res.status(200).send({ message: 'fimTempo atualizado com sucesso', prova: updatedProva });
    } catch (err) {
      console.error("Erro ao atualizar fimTempo:", err);
      res.status(500).send({ message: 'Erro ao atualizar fimTempo', error: err.message });
    }
  });

  router.get('/getProvaDuration/:provaId', async (req, res) => {
    const { provaId } = req.params;
  
    try {
      const prova = await prisma.prova.findUnique({
        where: { id: parseInt(provaId) },
        select: {
          inicioTempo: true,
          fimTempo: true,
        },
      });
  
      if (!prova) {
        return res.status(404).send({ message: "Prova não encontrada" });
      }
  
      if (!prova.fimTempo) {
        return res.status(400).send({ message: "fimTempo não está definido" });
      }
  
      const inicioTempo = new Date(prova.inicioTempo);
      const fimTempo = new Date(prova.fimTempo);
  
      const durationInMilliseconds = fimTempo - inicioTempo; 
  
      const durationInMinutes = durationInMilliseconds / (1000 * 60);
  
      res.status(200).send({ durationInMinutes });
  
    } catch (err) {
      console.error("Erro ao calcular duração da prova:", err);
      res.status(500).send({ message: "Erro ao calcular a duração da prova", error: err.message });
    }
  });

  router.put('/updateAcertos/:provaId', async (req, res) => {
    const { provaId } = req.params;
    const { acertosPorAssunto } = req.body;
  
    if (!acertosPorAssunto || Object.keys(acertosPorAssunto).length === 0) {
      return res.status(400).send({ message: "Acertos por assunto são obrigatórios" });
    }
  
    try {
      const updatePromises = Object.entries(acertosPorAssunto).map(([assuntoId, acertos]) => {
        return prisma.provaAssunto.update({
          where: {
            provaId_assuntoId: {
              provaId: parseInt(provaId),
              assuntoId: parseInt(assuntoId),
            },
          },
          data: {
            acertos: parseInt(acertos),
          },
        });
      });
  
      await Promise.all(updatePromises);
  
      res.status(200).send({ message: "Acertos atualizados com sucesso" });
    } catch (err) {
      console.error("Erro ao atualizar acertos:", err);
      res.status(500).send({ message: "Erro ao atualizar acertos", error: err.message });
    }
  });

  router.get('/getAcertosPorProva/:provaId', async (req, res) => {
    const { provaId } = req.params;
  
    try {
      const provaAssuntos = await prisma.provaAssunto.findMany({
        where: { provaId: parseInt(provaId) },
        include: {
          assunto: { select: { id: true, assunto: true } },
        },
      });
  
      if (!provaAssuntos || provaAssuntos.length === 0) {
        return res.status(404).send({ message: "Nenhum assunto encontrado para esta prova" });
      }
  
      const resultado = provaAssuntos.map((item) => ({
        assuntoId: item.assunto.id,
        nomeAssunto: item.assunto.assunto,
        acertos: item.acertos || 0,
      }));
  
      res.status(200).send(resultado);
  
    } catch (err) {
      console.error("Erro ao buscar os acertos:", err);
      res.status(500).send({ message: "Erro ao buscar os acertos", error: err.message });
    }
  });


  
  router.get('/getUserProvas', async (req, res) => {
    const usuarioId = req.userId;
  
    try {
      const provas = await prisma.prova.findMany({
        where: {
          usuarioId: usuarioId,
        },
        include: {
          assuntos: {
            select: {
              assuntoId: true,
              acertos: true,
            }
          },
          materia: {
            select: {
              materia: true,
            }
          },
        },
        orderBy: {
          inicioTempo: 'desc',
        },
      });
  
      if (!provas || provas.length === 0) {
        return res.status(200).send([]);
      }
  
      const resultado = provas.map((prova) => {
        const totalAcertos = prova.assuntos.reduce((total, assunto) => total + (assunto.acertos || 0), 0);
        return {
          provaId: prova.id,
          inicioTempo: prova.inicioTempo,
          totalAcertos,
          materia: prova.materia.materia,
        };
      });
  
      res.status(200).send(resultado);
  
    } catch (err) {
      console.error("Erro ao buscar as provas do usuário:", err);
      res.status(500).send({ message: "Erro ao buscar as provas", error: err.message });
    }
  });
    

router.get('/getUserName', async (req, res) => {
    const userId = req.userId;
  
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
        }
      });
  
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
  
      res.status(200).json({ username: user.username });
  
    } catch (err) {
      console.error('Erro ao buscar o nome do usuário:', err);
      res.status(500).json({ message: 'Erro interno', error: err.message });
    }
  });
    

  

export default router;
