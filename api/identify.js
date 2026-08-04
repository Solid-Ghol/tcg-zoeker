// Serverfunctie voor de foto-herkenning van de TCG-zoeker (draait op Vercel).
//
// Ze ontvangt een foto (base64) van de zoeker, laat een vision-model de kaart aflezen en
// geeft het resultaat terug als { name, number, set }. De API-sleutel blijft hier op de
// server (omgevingsvariabele) en komt nooit in de browserpagina terecht.
//
// Twee providers worden ondersteund; de functie kiest automatisch:
//   1) GEMINI_API_KEY  -> Google Gemini (heeft een GRATIS tier — geen creditcard nodig).
//   2) ANTHROPIC_API_KEY -> Anthropic Claude (betaald).
// Zet in Vercel dus één van deze twee omgevingsvariabelen (Gemini is gratis).
//
// Optioneel: GEMINI_MODEL / ANTHROPIC_MODEL om een ander model te kiezen.

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';

// Wat we het model vragen: alléén de kaart aflezen en als strikte JSON teruggeven.
const PROMPT = [
  'Je krijgt een foto van één Pokémon-verzamelkaart (TCG).',
  'Lees de kaart af en antwoord met UITSLUITEND geldige JSON, zonder uitleg eromheen:',
  '{"name": "...", "number": "...", "set": "...", "confidence": "high|medium|low"}',
  '',
  '- "name": de ENGELSE kaartnaam zoals die in de Pokémon TCG-database staat',
  '  (bijv. "Charizard ex", "Pikachu", "Professor\'s Research"). Bij een Japanse kaart',
  '  geef je de Engelse naam van diezelfde Pokémon/kaart.',
  '- "number": het kaartnummer zoals gedrukt, alleen het deel vóór de streep',
  '  (dus bij "58/102" geef je "58"; bij "TG05/TG30" geef je "TG05").',
  '- "set": de setnaam als je die kunt lezen, anders een lege string.',
  '- Kun je de kaart niet met zekerheid aflezen, laat velden dan leeg en zet confidence op "low".',
].join('\n');

// Probeert JSON uit het antwoord te vissen, ook als er per ongeluk tekst omheen staat.
function extractJSON(text){
  if (!text) return null;
  try { return JSON.parse(text); } catch(e){ /* verder proberen */ }
  const m = text.match(/\{[\s\S]*\}/);
  if (m){ try { return JSON.parse(m[0]); } catch(e){ /* geef op */ } }
  return null;
}

// --- Google Gemini (gratis tier) ---
async function askGemini(image, mediaType){
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(GEMINI_MODEL) + ':generateContent?key=' + encodeURIComponent(GEMINI_KEY);
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { inline_data: { mime_type: mediaType, data: image } },
          { text: PROMPT },
        ],
      }],
      generationConfig: { temperature: 0, maxOutputTokens: 400 },
    }),
  });
  const data = await r.json();
  if (!r.ok){
    const e = new Error((data && data.error && data.error.message) || ('Gemini gaf status ' + r.status));
    e.status = 502; throw e;
  }
  const parts = (data.candidates && data.candidates[0] && data.candidates[0].content &&
                 data.candidates[0].content.parts) || [];
  return parts.map(p => p.text || '').join('').trim();
}

// --- Anthropic Claude (betaald) ---
async function askAnthropic(image, mediaType){
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
          { type: 'text', text: PROMPT },
        ],
      }],
    }),
  });
  const data = await r.json();
  if (!r.ok){
    const e = new Error((data && data.error && data.error.message) || ('Anthropic gaf status ' + r.status));
    e.status = 502; throw e;
  }
  return (data.content || []).map(b => b.text || '').join('').trim();
}

module.exports = async function handler(req, res){
  // CORS: nodig als de zoeker op een ander domein staat (bijv. GitHub Pages) dan deze functie.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gebruik POST met een foto.' });

  if (!GEMINI_KEY && !ANTHROPIC_KEY) return res.status(500).json({
    error: 'De server heeft geen sleutel. Zet in Vercel GEMINI_API_KEY (gratis via ' +
      'aistudio.google.com) óf ANTHROPIC_API_KEY.' });

  try {
    // req.body kan al geparsed zijn (Vercel) of nog een string; beide opvangen.
    let body = req.body;
    if (typeof body === 'string'){ try { body = JSON.parse(body); } catch(e){ body = {}; } }
    const image = body && body.image;
    const mediaType = (body && body.media_type) || 'image/jpeg';
    if (!image) return res.status(400).json({ error: 'Geen afbeelding meegestuurd.' });

    // Gratis provider heeft voorrang; anders de betaalde.
    const text = GEMINI_KEY ? await askGemini(image, mediaType)
                            : await askAnthropic(image, mediaType);

    const parsed = extractJSON(text);
    if (!parsed) return res.status(200).json({ name: '', number: '', set: '', confidence: 'low', raw: text });
    return res.status(200).json({
      name: parsed.name || '',
      number: parsed.number || '',
      set: parsed.set || '',
      confidence: parsed.confidence || '',
    });
  } catch(e){
    return res.status(e.status || 500).json({ error: e.message || 'onbekende fout' });
  }
};
