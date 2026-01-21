import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import artworkRoutes from './routes/artworks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);

app.get('/', (req, res) => {
    res.send('ArtRoot Backend API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
