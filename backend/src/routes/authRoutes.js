import express from 'express'
import User from '../models/User.js';
const router = express.Router();
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';

config()

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

router.post("/register", async (req, res) => {
    try {

        const { username, email, password, profileImage } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        if (username.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters long" });
        }

        // const existingEmail = await User.findOne({ email });

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }




        const randomUserProfileImage = `https://robohash.org/${username}`;

        const user = await User.create({
            username,
            email,
            password,
            profileImage: randomUserProfileImage || profileImage
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            user,
            token
        });

    } catch (error) {

        console.log("Error in user registration", error);
        res.status(500).json({
            message: "Server Error"
        })

    }
})
router.post("/login", async (req, res) => {
    // res.send("Dwaipayan");

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            user,
            token
        });

    } catch (error) {

        console.log("Error in user login", error);
        res.status(500).json({
            message: "Server Error"
        })
    }

})


export default router