import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const FASTAPI_URL = process.env.FASTAPI_BACKEND_URL || 'http://127.0.0.1:8000';

app.use(cors());
app.use(express.json());

// API Proxy Route (Proxies requests from React frontend to FastAPI backend)
app.get('/api/proxy/secure-data', async (req, res) => {
    try {
        const fastapiResponse = await fetch(`${FASTAPI_URL}/api/secure-data`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
            }
        });

        if (!fastapiResponse.ok) {
            throw new Error(`FastAPI responded with status: ${fastapiResponse.status}`);
        }

        const data = await fastapiResponse.json();
        res.json({ success: true, source: "Node.js Server-Side Proxy", data });
    } catch (error) {
        console.error("Proxy error:", error.message);
        res.status(500).json({ error: 'Failed to communicate with FastAPI backend. Make sure FastAPI is running on port 8000.' });
    }
});

// Serve Static React Frontend Files
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Proxying backend requests to: ${FASTAPI_URL}`);
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown for Databricks deployments
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});