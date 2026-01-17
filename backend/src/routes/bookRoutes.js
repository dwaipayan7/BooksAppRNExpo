import express from 'express'
import Book from '../models/Book.js';
import cloudinary from '../lib/cloudinary.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {

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

router.get("/", protectRoute, async (req, res) => {

    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find().sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage");

        const total = await Book.countDocuments();

        return res.send({
            books,
            currentPage: page,
            totalBooks: total,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {

        return res.status(500).json({ message: "Server Error", error: error.message });


    }
});


router.get("/user", protectRoute, async (req, res) => {

    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 })


        return res.send({
            books
        });

    } catch (error) {

        return res.status(500).json({ message: "Server Error", error: error.message });


    }
});


router.delete("/:id", protectRoute, async (req, res) => {
    try {

        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this book" });
        }

        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.log("Error deleting image from Cloudinary", error);

            }
        }

        return res.status(200).json({ message: "Book deleted successfully" });

    } catch (error) {

        return res.status(500).json({ message: "Server Error", error: error.message });
    }
});


export default router;