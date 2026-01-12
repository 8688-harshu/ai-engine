import express from 'express';
import cors from 'cors';
import path from 'path';
import { Coordinator } from './engine/Coordinator';
import { ScanConfig } from './types';
import { config } from './config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Serve static files from the 'public' directory (which will contain the React build)
app.use(express.static(path.join(__dirname, 'public')));

// Handle React Routing, return all requests to React app
app.get(/(.*)/, (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Endpoint for scanning
app.post('/api/scan', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Web Scan Request for: ${url}`);

        // Initialize scan config
        const scanConfig: ScanConfig = {
            startUrl: url.startsWith('http') ? url : `https://${url}`,
            maxPages: 1, // MVP
            headless: config.headless
        };

        const coordinator = new Coordinator(scanConfig);
        const report = await coordinator.run();

        res.json(report);

    } catch (error: any) {
        console.error('Scan Error:', error);
        res.status(500).json({
            error: 'Failed to scan website.',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`
    🚀 Web Trust Engine Server Running!
    -----------------------------------------
    🔗 URL: http://localhost:${PORT}
    -----------------------------------------
    `);
});
