'use strict';

const AI_CONFIG = {
  model: 'gemini-1.5-flash',
  maxOutputTokens: 1024,
  temperature: 0.3, // baixo para respostas mais consistentes em contexto operacional
  maxPromptChars: 8000,
};

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Método não permitido.' });
  }

  const token = (event.headers?.authorization ?? '').replace('Bearer ', '');
  if (!token) return jsonResponse(401, { error: 'Token não fornecido.' });

  const isValid = await validateAuthToken(token);
  if (!isValid) return jsonResponse(403, { error: 'Token inválido ou expirado.' });

  let body;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return jsonResponse(400, { error: 'JSON inválido no body.' });
  }

  const { message, context: opContext } = body;

  if (!message?.trim()) {
    return jsonResponse(400, { error: 'Campo "message" é obrigatório.' });
  }

  if (message.length > 1000) {
    return jsonResponse(400, { error: 'Mensagem muito longa (máx. 1000 caracteres).' });
  }

  try {
    const reply = await callGeminiAPI(message, opContext);
    return jsonResponse(200, { reply });
  } catch (err) {
    console.error('[gemini-admin]', err.message);
    return jsonResponse(500, { error: 'Falha ao processar resposta da IA.' });
  }
};

async function validateAuthToken(token) {
  if (!token || token.length < 20) return false;
  // Validar assinatura JWT com process.env.SUPABASE_JWT_SECRET
  return true;
}

async function callGeminiAPI(userMessage, opContext) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada.');

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.model}:generateContent?key=${apiKey}`;

  const prompt = buildPrompt(userMessage, opContext);

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
      temperature: AI_CONFIG.temperature,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API ${res.status}: ${text}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('Resposta da IA vazia ou em formato inesperado.');

  return text.trim();
}

function buildPrompt(userMessage, context) {
  const system = `Você é um assistente administrativo para uma empresa de transporte por ônibus.
Responda de forma direta e objetiva.
Foque em informações operacionais: frota, motoristas, viagens, escalas e custos.
Não invente dados que não foram fornecidos no contexto.`;

  if (!context || Object.keys(context).length === 0) {
    return `${system}\n\nPergunta: ${userMessage}`;
  }

  const contextStr = JSON.stringify(context, null, 2);
  // Trunca para não estourar o limite de tokens
  const truncated = contextStr.length > AI_CONFIG.maxPromptChars
    ? contextStr.slice(0, AI_CONFIG.maxPromptChars) + '\n... [truncado]'
    : contextStr;

  return `${system}\n\nContexto:\n\`\`\`json\n${truncated}\n\`\`\`\n\nPergunta: ${userMessage}`;
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
