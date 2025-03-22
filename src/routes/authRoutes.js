import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../prismaClient.js'

const router = express.Router()

router.post('/register', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).send({ message: "Nome de usuário e senha obrigatórios" });
    }

    const hashedPassword = bcrypt.hashSync(password, 8)

    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword
            }
        })

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (err) {
        console.error(err)
        res.status(500).send({ message: "Erro interno" });
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).send({ message: "Nome de usuário e senha obrigatórios" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (!user) {
            return res.status(401).send({ message: "Nome de usuário ou senha inválidos" });
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password)
        if (!passwordIsValid) {
            return res.status(401).send({ message: "Nome de usuário ou senha inválidos" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token })
    } catch (err) {
        console.error(err)
        res.status(500).send({ message: "Erro interno" });
    }
})

export default router
