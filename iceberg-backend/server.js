import express from 'express';
import { GoogleGenAI } from '@google/genai';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { tavily } from '@tavily/core'; // Added this line
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY }); // Added this line

let db;

async function initDatabase() {
    db = await open({
        filename: './iceberg_cache.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS curriculum_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic_key TEXT UNIQUE,
            curriculum_json TEXT,
            search_count INTEGER DEFAULT 1,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log("IceBerg Core Database Initialized Successfully.");
}

// ---- NEW SEARCH TEST ROUTE ----
app.get('/api/search/raw', async (req, res) => {
    try {
        const topic = req.query.topic;
        
        if (!topic) {
            return res.status(400).json({ error: "Please provide a topic. Example: ?topic=docker" });
        }

        console.log(`Fetching live web results for: ${topic}...`);

        // Get the top 5 clean results back from the web
        const searchResponse = await tvly.search(topic, {
            searchDepth: "basic",
            maxResults: 15
        });

        res.json({
            success: true,
            query: topic,
            resultsFound: searchResponse.results
        });

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: "Failed to fetch live search results." });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: "IceBerg Server is alive and operational." });
});

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`IceBerg Engine on http://localhost:${PORT}`);
    });
});
