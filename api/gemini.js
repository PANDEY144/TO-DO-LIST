const GEMINI_MODEL = 'gemini-2.5-flash';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY environment variable' });
  }

  const { prompt, tasks = [] } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const assistantPrompt =
    'You are an AI Todo Assistant. Current tasks: ' +
    JSON.stringify(tasks) +
    '. Use context for knowledge, decisions, breakdowns, priorities. Query: ' +
    prompt +
    '. Be concise, actionable. Use markdown for lists.';

  try {
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: assistantPrompt }]
          }]
        })
      }
    );

    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      const message = data.error && data.error.message ? data.error.message : 'Gemini request failed';
      return res.status(geminiResponse.status).json({ error: message });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: 'Gemini returned no text' });
    }

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'AI request failed' });
  }
};
