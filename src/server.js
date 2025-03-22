import express from 'express'
import authRoutes from './routes/authRoutes.js'
import authMiddleware from './middleware/authMiddleware.js'
import authExam from './routes/examRoutes.js'
import cors from "cors";

const app = express()
const PORT = process.env.PORT || 3333
        
app.use(cors())

app.use(express.json())

app.use('/auth', authRoutes)
app.use('/exam', authMiddleware ,authExam)


app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})
