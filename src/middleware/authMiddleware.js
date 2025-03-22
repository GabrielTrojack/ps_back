import jwt from 'jsonwebtoken'

function authMiddleware(req, res, next) {
    const token = req.headers['authorization']

    if (!token) { return res.status(401).json({ message: "Token não inserido" }) }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) { return res.status(401).json({ message: "Token invalido" }) }

        req.userId = decoded.id
        next()
    })
}

export default authMiddleware