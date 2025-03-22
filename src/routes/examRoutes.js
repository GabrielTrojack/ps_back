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

        res.status(201).send({ message: "Prova criada com sucesso" });

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
                                }
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

export default router;
