# AI Comparison Tool

A simple web tool that sends the same prompt to multiple AI model APIs in parallel and displays the responses side-by-side for easy comparison.

## Description

Users enter a prompt in the web interface, and the backend forwards it to several configured AI providers simultaneously, returning each model's response for direct comparison. The provider integrations are abstracted so new models/providers can be swapped in via environment variables.

## Tech Stack

- Node.js / Express (backend, API abstraction layer)
- Axios (API requests)
- Plain HTML/CSS/JS front end

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and add your API keys for the model providers you want to compare.
3. Start the server:
   ```
   npm start
   ```
4. Open the app in your browser at `http://localhost:3000` (or the configured `PORT`).
