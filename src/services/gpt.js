const axios = require('axios');
const { GPT_SYSTEM_PROMPT } = require('../config/prompts');

const askGPT = async (messages, systemNote = '') => {
  const system = systemNote ? `${GPT_SYSTEM_PROMPT}\n\n${systemNote}` : GPT_SYSTEM_PROMPT;
  const res    = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model:      'gpt-4o',
      max_tokens: 800,
      messages:   [{ role: 'system', content: system }, ...messages],
    },
    {
      headers: {
        Authorization:  `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );
  return res.data.choices[0]?.message?.content || '';
};

module.exports = { askGPT };
