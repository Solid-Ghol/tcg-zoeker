// Caching-proxy voor de open kaart-API's (draait op Vercel).
//
// De zoeker haalt kaartgegevens en prijzen normaal rechtstreeks bij de open API's op. Deze
// functie zet daar een caching-laag voor: elk verzoek wordt op de edge van Vercel bewaard
// (Cache-Control met stale-while-revalidate), zodat dezelfde zoekopdracht of kaart de tweede
// keer — door jou of een andere bezoeker — meteen terugkomt en de bron-API's ontlast worden.
//
// De site blijft werken zónder deze functie: dan praat de front-end gewoon rechtstreeks met
// de API's (zie de terugval in index.html). Alleen deze hosts worden doorgelaten:
const ALLOW = ['api.pokemontcg.io', 'api.tcgdex.net', 'pokeapi.co'];

module.exports = async function handler(req, res){
  // CORS, zodat de zoeker de proxy ook vanaf een ander domein (bijv. GitHub Pages) mag gebruiken.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Expose-Headers', 'x-proxy');
  // Merkbaar maken dát dit de proxy is (de front-end herkent hieraan of de functie bestaat).
  res.setHeader('x-proxy', 'miss');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Gebruik GET.' });

  const u = req.query && req.query.u;
  if (!u) return res.status(400).json({ error: 'Geef ?u=<url> mee.' });
  let target;
  try { target = new URL(u); } catch(e){ return res.status(400).json({ error: 'Ongeldige url.' }); }
  if (target.protocol !== 'https:' || !ALLOW.includes(target.hostname)){
    return res.status(403).json({ error: 'Host niet toegestaan.' });
  }

  try {
    const r = await fetch(target.toString(), { headers: { 'Accept': 'application/json' } });
    const body = await r.text();
    if (r.ok){
      // ~1 uur vers op de edge, daarna tot een dag "stale-while-revalidate": de bezoeker krijgt
      // meteen de (iets oudere) versie terwijl Vercel op de achtergrond ververst. Prijzen bij de
      // bron zijn toch een dagelijkse momentopname, dus dit is ruim vers genoeg.
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    } else {
      res.setHeader('Cache-Control', 'no-store');   // fouten niet vasthouden
    }
    res.setHeader('x-proxy', 'hit');
    res.setHeader('Content-Type', r.headers.get('content-type') || 'application/json');
    return res.status(r.status).send(body);
  } catch(e){
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Ophalen mislukt: ' + (e.message || 'onbekend') });
  }
};
