import dotenv from 'dotenv';
dotenv.config();

export const config = {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    headless: true, // Default, can be overridden by CLI args
};
