import express from 'express'
import cors from 'cors'
import authRoutes from './src/routes/authRoutes.js'
import bookRoutes from './src/routes/bookRoutes.js'
import { connectDB } from './src/lib/db.js';

const app = express();
connectDB();

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes)


app.listen(3000, () => {
    console.log(`Server Running on PORT 3000`);

});