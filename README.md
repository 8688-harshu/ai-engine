# Autonomous AI Website Quality, Trust, and Hygiene Evaluation Engine
An autonomous agentic engine that crawls websites, performs deep analysis of design, functionality, performance, accessibility, and SEO, and calculates a comprehensive **Hygiene & Trust Score** (0-100). The project includes a robust TypeScript scanner backend, a Python FastAPI backend for database caching (Supabase), and an interactive React frontend dashboard.
---
## 🏗️ Architecture & Project Structure
The project consists of three main components:
1. **Core TypeScript Backend** (`/src`): The primary engine running the crawler and rule-based/AI analyzers via Playwright.
2. **FastAPI Python Backend** (`/python_backend`): A FastAPI application supporting API access, async workers, and report caching using Supabase.
3. **React Frontend** (`/frontend`): A modern React + TypeScript single-page application built on Vite for launching scans and visualizing report analytics.
```text
ai-engine/
├── src/                      # TypeScript/Node.js Scan Engine
│   ├── analyzers/            # Accessibility, Functional, Network, UI/UX, Semantic
│   ├── crawler/              # Playwright-based autonomous Crawler & Navigator
│   ├── engine/               # Coordinator and Scoring modules
│   ├── reporter/             # Markdown report generator
│   ├── server.ts             # Node Express server for scans
│   └── index.ts              # Command-line interface entry point
├── python_backend/           # FastAPI web server and alternative engine
│   ├── analyzers/            # Python-based page analyzers
│   ├── engine/               # Python Crawler/Coordinator
│   ├── services/             # Supabase & Database integrations
│   └── server.py             # FastAPI server entry point
├── frontend/                 # React + Vite + TypeScript dashboard app
└── reports/                  # Directory where generated markdown reports are saved
🚀 Key Features
Autonomous Crawler: Deeply crawls websites up to a configurable depth and page limit.
Multi-Dimensional Analyzers:
Accessibility (a11y): Powered by @axe-core/playwright to find WCAG compliance errors.
Functional: Listens to page console errors and runtime exceptions.
Network: Tracks request failure codes, slow load times, and broken APIs.
UI/UX: Identifies structural layouts, font consistency, and design bugs.
Semantic (SEO): Inspects page titles, meta descriptions, image alt texts, and header hierarchies.
Knowledge Graph Builder: Maps how pages link together along with their scanned health metrics.
Automatic Caching: Python backend caches reports to Supabase to speed up re-auditing.
📋 Prerequisites
Node.js (v18 or higher)
Python (v3.10 or higher)
npm or yarn
⚙️ Setup & Configuration
Create a .env file in the root directory (based on .env.example):

env


PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_or_service_key
# If using AI integrations
GEMINI_API_KEY=your_gemini_api_key
Make sure you install the Playwright browsers:

bash


npx playwright install --with-deps
🏃 Running the Application
1. TypeScript Command Line Interface (CLI)
Run a direct scan against any website from the CLI:

bash


# Install dependencies
npm install
# Run CLI scanner (arguments: <url>, options: --max-pages, --max-depth, --headless)
npm run start:cli -- https://example.com --max-pages 10 --max-depth 2
2. Express Backend Server (Node.js)
Start the Express API server to handle requests from the React frontend:

bash


# Run backend on http://localhost:3000
npm run serve
3. FastAPI Server (Python)
If you prefer to run the Python-based API server with Supabase caching:

bash


cd python_backend
# Set up virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
# Install requirements
pip install -r requirements.txt
# Start FastAPI server (runs on PORT specified in .env, default: 3000)
python server.py
4. React Frontend Dashboard
Start the frontend development server to interact with the UI dashboard:

bash


cd frontend
npm install
npm run dev
Open http://localhost:5173 in your browser to access the dashboard.

📊 Reports
Every scan outputs a detailed Markdown report saved in the ./reports/ directory:

Contains Overall Trust & Hygiene Score (0-100).
Breaks down all detected issues by severity (High, Medium, Low).
Offers Immediate, Short-Term, and Long-Term remediation steps.
Lists all scanned URLs with their individual issues count.
