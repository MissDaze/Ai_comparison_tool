/**
 * AI Comparison Tool - Backend Server
 * 
 * This Express server handles:
 * 1. Serving static frontend files (HTML, CSS, JS)
 * 2. Receiving prompts from the frontend
 * 3. Sending the same prompt to three different AI model APIs in parallel
 * 4. Returning responses to the frontend for display
 * 
 * API providers can be easily swapped using environment variables and abstracted functions.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// API ABSTRACTION LAYER
// These functions abstract away the specific API implementations.
// Easy to swap providers later by modifying these functions.
// ============================================================================

/**
 * Model A: OpenAI GPT-4
 * Send a prompt to OpenAI's API and return the response
 */
async function callModelA(prompt) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    return `Error calling Model A: ${error.message}`;
  }
}

/**
 * Model B: Anthropic Claude
 * Send a prompt to Anthropic's API and return the response
 */
async function callModelB(prompt) {
  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-opus-20240229',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
      }
    );
    return response.data.content[0].text;
  } catch (error) {
    return `Error calling Model B: ${error.message}`;
  }
}

/**
 * Model C: Google Gemini
 * Send a prompt to Google's Gemini API and return the response
 */
async function callModelC(prompt) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    return `Error calling Model C: ${error.message}`;
  }
}

// ============================================================================
// API ENDPOINT
// ============================================================================

/**
 * POST /api/compare
 * 
 * Expected request body:
 * {
 *   "prompt": "Your prompt text here"
 * }
 * 
 * Returns:
 * {
 *   "modelA": "Response from Model A",
 *   "modelB": "Response from Model B",
 *   "modelC": "Response from Model C"
 * }
 */
app.post('/api/compare', async (req, res) => {
  const { prompt } = req.body;

  // Validate input
  if (!prompt || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt cannot be empty' });
  }

  // Log the request (for debugging)
  console.log(`[${new Date().toISOString()}] Comparing prompt: "${prompt.substring(0, 50)}..."`);

  try {
    // Send prompt to all three models in parallel using Promise.all()
    // This is more efficient than making requests sequentially
    const [responseA, responseB, responseC] = await Promise.all([
      callModelA(prompt),
      callModelB(prompt),
      callModelC(prompt),
    ]);

    // Return all three responses
    return res.json({
      modelA: responseA,
      modelB: responseB,
      modelC: responseC,
    });
  } catch (error) {
    console.error('Error in /api/compare:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * GET /api/health
 * Simple health check to verify the server is running
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(PORT, () => {
  console.log(`✓ AI Comparison Tool server is running on http://localhost:${PORT}`);
  console.log(`✓ Open your browser and navigate to http://localhost:${PORT}`);
  console.log(`✓ Make sure you have set up your .env file with API keys`);
});