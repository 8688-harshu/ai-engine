import express from 'express';
import cors from 'cors';
import path from 'path';
import { Coordinator } from './engine/Coordinator';
import { ReportGenerator } from './reporter/ReportGenerator';
import { DatabaseService } from './services/DatabaseService';
import { ScanConfig } from './types';
import { config } from './config';

const dbService = new DatabaseService();

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

    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.send('Backend is running. Use the frontend server (usually http://localhost:5173) for the UI.');
    }
});

// API Endpoint for scanning
app.post('/api/scan', async (req, res) => {
    try {
        const { url, maxPages, maxDepth, auth } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Web Scan Request for: ${url} (Pages: ${maxPages || 10}, Depth: ${maxDepth || 2})`);

        // 1. Check Cache
        const cachedReport = await dbService.getReport(url);
        if (cachedReport) {
            console.log('Returning cached report');
            // return res.json(cachedReport); // TODO: Disable cache for custom scans temporarily or key by config
        }

        // Initialize scan config
        const scanConfig: ScanConfig = {
            startUrl: url.startsWith('http') ? url : `https://${url}`,
            maxPages: maxPages ? parseInt(maxPages) : 10,
            maxDepth: maxDepth ? parseInt(maxDepth) : 2,
            auth: auth, // Pass auth config
            headless: config.headless
        };

        const coordinator = new Coordinator(scanConfig);
        const report = await coordinator.run();

        // Generate and save the markdown report (Local)
        const reportPath = ReportGenerator.generateMarkdown(report, './reports');
        console.log(`Saved report to: ${reportPath}`);

        // 2. Save to Database
        await dbService.saveReport(url, report);

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
