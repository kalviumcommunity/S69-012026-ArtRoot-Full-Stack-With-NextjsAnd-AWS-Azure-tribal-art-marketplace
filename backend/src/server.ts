import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

try {
    // Routes - wrapped in try-catch to catch import errors
    const authRoutes = require('./routes/auth').default || require('./routes/auth');
    const artworkRoutes = require('./routes/artworks').default || require('./routes/artworks');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/artworks', artworkRoutes);
    
    console.log('Routes loaded successfully');
} catch (error) {
    console.error('Failed to load routes:', error);
}

app.get('/', (req, res) => {
    res.send('ArtRoot Backend API is running');
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
