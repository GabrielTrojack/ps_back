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
        // Busca a matéria e seus assuntos
        const materia = await prisma.materia.findUnique({
            where: { id: materiaId },
            include: {
                assuntos: true,  // Inclui os assuntos relacionados à matéria
            }
        });

        // Verifica se a matéria foi encontrada e se possui pelo menos 3 assuntos
        if (!materia || materia.assuntos.length < 3) {
            return res.status(400).send({ message: "Não há assuntos suficientes para criar a prova" });
        }

        // Embaralha os assuntos e seleciona 3 deles
        const shuffledAssuntos = materia.assuntos.sort(() => Math.random() - 0.5).slice(0, 3);

        // Cria a prova no banco de dados
        const exam = await prisma.prova.create({
            data: {
                usuarioId,
                materiaId,
                inicioTempo: new Date(),
            }
        });

        // Cria as questões para a prova
        for (let assunto of shuffledAssuntos) {
            // Seleciona 7 questões do assunto atual
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

            // Embaralha as questões e seleciona as 7 primeiras
            const shuffledQuestoes = questoes.sort(() => Math.random() - 0.5).slice(0, 7);

            // Adiciona as questões à prova
            for (let questao of shuffledQuestoes) {
                await prisma.provaQuestao.create({
                    data: {
                        provaId: exam.id,
                        questaoId: questao.id,
                    }
                });
            }
        }

        // Aqui estamos incluindo os detalhes das questões e assuntos associados à prova
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
                        provaId: true,  // Incluindo provaId da tabela ProvaAssunto
                        assuntoId: true,  // Incluindo assuntoId da tabela ProvaAssunto
                    }
                }
            }
        });

        // Responde com sucesso sem detalhes das questões ou assuntos
        res.status(201).send({ message: "Prova criada com sucesso" });

    } catch (err) {
        console.error("Erro ao criar a prova:", err);
        res.status(500).send({ message: "Erro ao criar a prova", error: err.message });
    }
});

router.get('/getExamQuestions/:examId', async (req, res) => {
    const { examId } = req.params;

    try {
        // Buscar a prova com o ID fornecido e incluir as questões e alternativas associadas
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

        // Verifica se a prova existe
        if (!examDetails) {
            return res.status(404).send({ message: "Prova não encontrada" });
        }

        // Responde com os detalhes da prova, incluindo as questões e alternativas
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
        // Buscar todas as matérias no banco de dados
        const materias = await prisma.materia.findMany();

        // Verifica se há matérias
        if (!materias || materias.length === 0) {
            return res.status(404).send({ message: "Nenhuma matéria encontrada" });
        }

        // Responde com a lista de matérias
        res.status(200).send(materias);
    } catch (err) {
        console.error("Erro ao buscar as matérias:", err);
        res.status(500).send({ message: "Erro ao buscar as matérias", error: err.message });
    }
});

export default router;
