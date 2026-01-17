import jwt from 'jsonwebtoken';
import User from '../models/User';
import { config } from 'dotenv';
config()

// const response = await fetch('http://localhost:3000/api/books', {
//     method: 'POST',
//     body: JSON.stringify({
//         title, 
//         caption
//     }),
//     headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json'
//     }
// })

export const protectRoute = async(req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password');

        next();


        
    } catch (error) {
        
        res.status(401).json({ message: "Not authorized, token failed" });

    }
}
