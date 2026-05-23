import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { tavily } from '@tavily/core';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Import our User model (Make sure you created User.js as shown in the previous step)
import User from './User.js'; 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_hackathon_secret_key';

// Initialize APIs securely using process.env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Connect to MongoDB Atlas Cloud instead of local SQLite
async function initDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("🚀 Connected to MongoDB Cloud Atlas Successfully.");
    } catch (err) {
        console.error("❌ MongoDB Database connection error:", err);
        process.exit(1);
    }
}

// ---- CLOUD AUTHENTICATION ROUTES ----

// 1. SIGN UP
app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already registered." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.json({ message: "Account created successfully in MongoDB!" });
    } catch (error) {
        res.status(500).json({ error: "Registration failed on server." });
    }
});

// 2. LOG IN
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid email or password." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password." });

        const token = jwt.sign(
            { userId: user._id, isPremium: user.isPremium },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, isPremium: user.isPremium, message: "Welcome back!" });
    } catch (error) {
        res.status(500).json({ error: "Login server error." });
    }
});


// ---- THE PASSION PROJECT "SPIKE" PIPELINE ROUTE ----
app.get('/api/curriculum', async (req, res) => {
    try {
        const topic = req.query.topic; // This expects: "University | Major | Hobby"
        if (!topic) {
            return res.status(400).json({ error: "Missing optimization query parameters." });
        }

        const topicKey = topic.trim().toLowerCase();

        console.log(`🌐 Scouring the live web for admissions context: ${topicKey}...`);

        // 1. Fetch from the live web via Tavily to catch current university trends
        const searchResponse = await tvly.search(topicKey, {
            searchDepth: "basic",
            maxResults: 5
        });

        const webContext = searchResponse.results
            .map(res => `Title: ${res.title}\nContent: ${res.content}`)
            .join("\n\n");

        console.log("🤖 Consulting Gemini to architect the college admissions spike...");

        // 2. Synthesize structured strategy blueprint using Gemini
        const prompt = `You are an elite Ivy League Admissions Consultant.
        The student wants to get into the following university ecosystem: "${topicKey}".
        Analyze the raw web data regarding recent university acceptance profiles and successful applications. Devise a highly authentic, unique 'Passion Project' that avoids cliché resume-padding.

        Raw Web Data Context:
        ${webContext}

        Output requirements:
        Return ONLY valid JSON matching this exact scheme. No conversational text, no markdown wrappers, no code blocks. Just the raw JSON object.
        {
          "topic": "${topicKey}",
          "summary": "The exact hook strategy: How this specific project will surprise and impress an admissions officer reading this student's folder.",
          "milestones": [
            {
              "phase": 1,
              "title": "💡 The Custom Passion Project",
              "core_concept": "A distinct, highly actionable real-world project, app, or initiative that blends their hobby with their intended academic major.",
              "action_item": "Detailed description of the final product they will create (e.g., a specific app, a published local report, a community campaign)."
            },
            {
              "phase": 2,
              "title": "🚀 Execution & Community Impact",
              "core_concept": "How the high schooler can scale the project over a 3-month window to prove tangible, real-world community metric impacts.",
              "action_item": "Specific, actionable steps to get users, gather data, or launch the initiative publicly."
            },
            {
              "phase": 3,
              "title": "📝 Common App Essay Blueprint",
              "core_concept": "The exact narrative angle the student should write about in their college application essays regarding this project.",
              "action_item": "Provide 2 specific reflection questions or narrative themes that tie this project directly to the university's institutional values."
            }
          ]
        }`;

        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        let rawText = aiResponse.text.trim();
        
        if (rawText.startsWith("```json")) rawText = rawText.substring(7);
        if (rawText.endsWith("```")) rawText = rawText.substring(0, rawText.length - 3);
        rawText = rawText.trim();

        const parsedJson = JSON.parse(rawText);

        // Send response straight to frontend
        res.json(parsedJson);

    } catch (error) {
        console.error("Engine Generation Error:", error);
        res.status(500).json({ error: "The engine failed to process this request." });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: "Admissions Engine Server is alive and operational." });
});

// Run Database then kickstart the app server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Admissions Engine roaring on http://localhost:${PORT}`);
    });
});
