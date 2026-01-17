import express from 'express'
import { Book } from '../models/Book.js';
import cloudinary from '../lib/cloudinary.js';
import Book from '../models/Book.js';
import { protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/", protectRoute ,async (req, res) => {

    try {

        const { title, caption, image, rating, } = req.body;

        if (!title || !caption || !image || !rating) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: "books_app"
        });

        const imageUrl = uploadResponse.secure_url;

        const book = await Book.create({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id
        });

        return res.status(201).json({
            success: true,
            book
        });

    } catch (error) {

        res.status(500).json({ message: "Server Error", error: error.message });

    }

})


//pagination 

router.get("/", protectRoute,  async (req, res) => {
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find().sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "username profileImage");
        
        res.send(books);

    } catch (error) {
        
        return res.status(500).json({ message: "Server Error", error: error.message });
        

    }
})


export default router;