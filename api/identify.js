// Serverfunctie voor de foto-herkenning van de TCG-zoeker (draait op Vercel).
//
// Ze ontvangt een foto (base64) van de zoeker, stuurt die naar het vision-model van
// Anthropic en geeft de herkende kaart terug als { name, number, set }. De API-sleutel
// blijft hier op de server (omgevingsvariabele ANTHROPIC_API_KEY) en komt nooit in de
// browserpagina terecht.
//
// Instellen (zie ook de README):
//   - Zet in Vercel een omgevingsvariabele ANTHROPIC_API_KEY met je Anthropic-sleutel.
//   - Optioneel ANTHROPIC_MODEL om een ander model te kiezen (standaard hieronder).

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5';

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

module.exports = async function handler(req, res){
  // CORS: nodig als de zoeker op een ander domein staat (bijv. GitHub Pages) dan deze functie.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gebruik POST met een foto.' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({
    error: 'De server heeft geen ANTHROPIC_API_KEY. Zet die in de Vercel-omgevingsvariabelen.' });

  try {
    // req.body kan al geparsed zijn (Vercel) of nog een string; beide opvangen.
    let body = req.body;
    if (typeof body === 'string'){ try { body = JSON.parse(body); } catch(e){ body = {}; } }
    const image = body && body.image;
    const mediaType = (body && body.media_type) || 'image/jpeg';
    if (!image) return res.status(400).json({ error: 'Geen afbeelding meegestuurd.' });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
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
      const msg = (data && data.error && data.error.message) || ('Anthropic gaf status ' + r.status);
      return res.status(502).json({ error: msg });
    }
    const text = (data.content || []).map(b => b.text || '').join('').trim();
    const parsed = extractJSON(text);
    if (!parsed) return res.status(200).json({ name: '', number: '', set: '', confidence: 'low', raw: text });
    return res.status(200).json({
      name: parsed.name || '',
      number: parsed.number || '',
      set: parsed.set || '',
      confidence: parsed.confidence || '',
    });
  } catch(e){
    return res.status(500).json({ error: e.message || 'onbekende fout' });
  }
};
