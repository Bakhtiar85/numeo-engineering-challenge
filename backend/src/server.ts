// backend\src\server.ts

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('transcription', async (data: { text: string }) => {
        console.log('Recieved Text:', data.text);

        try {
            const translatedText = `[Translated] ${data.text}`;
            socket.emit('transcription', {
                message: 'Translation successful',
                code: 200,
                data: translatedText,
                error: null,
            });
        } catch (error) {
            console.error('Error processing transcription:', error);
            socket.emit('transcription', {
                message: 'Translation failed',
                code: 500,
                data: null,
                error: 'Internal server error on translation',
            });
        }

    });

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});