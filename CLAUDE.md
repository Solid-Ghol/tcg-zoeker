# Afspraken voor dit project (Pokémon TCG-zoeker)

Dit bestand is voor Claude (en andere ontwikkelaars): huisregels die bij elke wijziging gelden.

## Harde eisen

- **Geen emoji als UI-iconen.** Knoppen, chips en menu's gebruiken uitsluitend de inline
  SVG-sprite bovenaan `<body>` in `index.html` (symbolen `i-ball`, `i-ballfill`, `i-lens`,
  `i-cards`, `i-help`, `i-share`, `i-x`, `i-dl`, `i-gear`, `i-sliders`, …). Nieuw icoon nodig?
  Teken het als `<symbol>` in dezelfde stijl: 24×24 viewBox, `stroke="currentColor"`,
  `stroke-width="2"`, ronde uiteinden — dan kleurt het mee met tekst en thema.
  Typografische tekens (✓, ‹, ›, ▲, ▼) mogen wel; kleuren-emoji (📚 ⭐ 🔗 …) niet.
- **Mobiel-eerst.** De zoeker moet prettig werken op een telefoon: duimbare knoppen,
  16px-invoervelden (anders zoomt iOS-Safari in), `env(safe-area-inset-*)` respecteren.
  Test elke wijziging ook op een smal scherm (±390px).
- **Front-end in één `index.html`.** Alle front-endcode (opmaak + JS) in dat ene bestand:
  geen build, geen dependencies, geen externe assets. De front-end blijft standalone werken —
  hij praat desnoods rechtstreeks met de open API's vanuit de browser (bijv. kaal op GitHub
  Pages). Extra server-functionaliteit hoort NIET in `index.html` maar in de map `api/`
  (Vercel-serverfuncties, plain Node, ook zonder dependencies). Nu aanwezig: `api/identify.js`
  (foto-herkenning) en `api/proxy.js` (caching-proxy vóór de open API's, edge-cache met
  stale-while-revalidate; de front-end gebruikt `/api/proxy` automatisch en valt terug op
  rechtstreeks ophalen als de proxy er niet is — zie `fetchMaybeProxy`/`PROXY_STATE`). Het
  project draait op Vercel met automatische deploy vanaf `main`; zie README (architectuur).
- **Escape dynamische tekst.** Alles wat uit een API of invoerveld komt gaat door `h(...)`
  voordat het in HTML belandt.
- **Nederlands.** Alle zichtbare teksten (en bij voorkeur codecommentaar) in het Nederlands.

## Structuur en patronen

- **Thema's**: CSS-variabelen per `data-theme` op `<html>` (auto/dark/light/sunset/jeroen);
  keuze staat in `localStorage` (`tcgtheme`) en wordt vóór het schilderen gezet (inline script
  in `<head>`). Nieuwe kleuren altijd als variabele toevoegen, nooit hardcoded in componenten.
- **Zoeken is één ding**: één zoekbalk (naam of setnaam, automatisch bepaald; EN via
  pokemontcg.io met TCGdex-terugval, JP via PokéAPI + TCGdex). Er wordt ALTIJD in beide
  talen gezocht — geen taalvinkjes bij het zoeken; taal beperken gebeurt in de filterbalk.
  GEEN aparte "geavanceerd zoeken"-modus toevoegen — dat is eerder geprobeerd en als
  verwarrend weggehaald. Alles ná het zoeken gebeurt in de balk "Filter:" (tekst, rariteit,
  type, soort, taal) plus de weergaveknoppen (per Pokémon / per set / alles) — knoppen,
  geen dropdown, dat is een expliciete wens.
- **Status is alleen voor problemen.** Een geslaagde zoekactie krijgt géén verslagregel
  ("X kaarten gevonden — bron: …"). Waarschuwingen en fouten verschijnen als zwevende,
  sluitbare toast (`toast()`, verdwijnt vanzelf); de vaste statusbalk is er alleen voor
  de laad-indicator en de collectieweergave. Ook een expliciete wens.
- **Horizontaal scrollbare balken** krijgen een zichtbare hint (vervaging + ›-pijltje via
  `.controls.more::after` en `updateScrollHint()`); niets stilletjes laten afkappen.
- **Instellingen** (thema, bron) staan achter het tandwiel rechtsboven
  (`#settingspanel`); nieuwe instellingen horen dáár, niet los in de zoekbalk.
- **Collectie**: `localStorage` (`tcgcol`), sleutel via `colKey()` (regio + kaart-id).
  Prijzen in de collectie worden ververst zodra dezelfde kaart opnieuw wordt opgehaald
  (`refreshColPrices()`).
- **Deelbare links**: `?q=`/`?mode=`/`?en=`/`?jp=` voor gewoon zoeken, `?aq=` voor een
  kenmerken-query; bij het laden wordt zo'n link automatisch uitgevoerd.
- **Foto-herkenning** (camera-icoon `i-cam` naast de zoekbalk): de foto wordt in de browser
  verkleind (canvas, ±1024px, JPEG) en als base64 naar een instelbaar endpoint gePOST
  (`photoEndpoint()` — standaard `/api/identify`, override via `localStorage` `tcgphoto` +
  het veld in `#settingspanel`). Het endpoint (`api/identify.js`, een Vercel-serverfunctie)
  praat met een vision-model en kiest automatisch de eerste provider waarvan een sleutel is
  gezet (volgorde: `OPENROUTER_API_KEY` = OpenRouter, gratis vision-modellen — voorkeur →
  `GROQ_API_KEY` = Groq/Llama (niet elk account heeft vision) → `GEMINI_API_KEY` = Google Gemini
  (gratis maar niet in elke regio/account, geeft daar `quota limit: 0`) → `ANTHROPIC_API_KEY` =
  Claude, betaald). Bij OpenRouter en Groq zoekt de functie zélf een gratis/beschikbaar vision-model
  op via hun `/models`-endpoint (met terugval op een volgend model), zodat gewisselde modelnamen
  niet stuklopen; forceren kan met `OPENROUTER_MODEL`/`GROQ_MODEL`/`GEMINI_MODEL`/`ANTHROPIC_MODEL`.
  De sleutel staat server-side, NOOIT in `index.html`.
  Antwoord = `{name, number, set}`;
  daarna wordt `#q` gevuld, `run()` uitgevoerd en de exacte kaart geopend
  (`revealPhotoMatch()`, matcht op kaartnummer + set). De site blijft een statisch bestand:
  zonder endpoint werkt al het andere gewoon door.

## Testen

- Echte API's zijn vanuit de ontwikkelsandbox vaak geblokkeerd (403). Test de flow met
  Playwright + `page.route()`-mocks voor `api.pokemontcg.io`, `api.tcgdex.net`, `pokeapi.co`
  en de afbeeldingshosts; Chromium staat op `/opt/pw-browsers/chromium-*/chrome-linux/chrome`.
- Controleer minstens: dark + light, desktop + 390px, en de consolefoutenlog.

## Bekende valkuilen

- pokemontcg.io geeft geregeld 500 bij heel brede queries ("bevat"-wildcards, alleen een
  supertype); toon dan de gebruikte query en probeer een lichtere variant.
- TCGdex-prijzen zitten in het detail-endpoint per kaart — vergeet `addTcgdexPrices()` niet
  voor elke TCGdex-lijst (ook Japans!). Structuur (zie tcgdex.dev/markets-prices): `d.pricing`
  (spiegelt de hoofdvariant; anders de eerste `d.variants_detailed[].pricing`) met
  `cardmarket` = plat object in EUR (`trend` = Cardmarket "Price Trend", `avg30`, `avg`, `low`
  = laagste over álle condities dus onbetrouwbaar laag, `updated`, `idProduct`) en `tcgplayer`
  = per drukvariant (`holofoil`/`normal`/…) met `marketPrice` (USD). Lees exact deze velden —
  geen "zoek maar een getal"-heuristiek, die pakt de verkeerde variant.
- TCGdex-afbeeldingen bestaan niet altijd in elk formaat (vooral Japanse kaarten missen soms
  `.webp`). De `<img onerror="imgErr(this)">`-helper probeert daarom `.webp` → `.png` → `.jpg`,
  daarna een `data-alt` (kleine versie in het detailvenster), en pas dán de placeholder. Nooit
  meteen op de eerste laadfout "geen afbeelding" tonen.
- Externe marktplaatsen (Cardmarket, TCGplayer, PriceCharting) kunnen niets met Japanse
  tekens of Japanse setnamen: bouw zoek-URL's altijd via `marketName()` (Engelse naam) en
  geef bij PriceCharting "japanese" + kaartnummer mee. Directe productlinks (`cmUrl`/`tpUrl`)
  hebben altijd voorrang boven een zoekopdracht.
- **PriceCharting-zoekquery = "pokemon" + kaartnaam + kaartnummer** (producten heten daar
  "Naam #Nummer"); setnamen weglaten, die wijken af en elk niet-kloppend zoekwoord geeft
  daar nul resultaten. PC-prijzen tonen in de app kan alleen met hun betaalde API-token.
- **Cardmarket is de primaire marktplaats** voor deze gebruikers: de EUR-pil staat voorop en
  krijgt visueel accent (`a.pr.main`). Directe links voor pokemontcg.io-kaarten volgen het
  vaste patroon `https://prices.pokemontcg.io/cardmarket/{id}` — bouw ze desnoods zelf uit
  het kaart-id, dan komt de knop ook zonder prijsblok op de juiste kaart uit. Ook voor
  Engelse TCGdex-kaarten (terugvalroute als pokemontcg.io hapert) wordt die redirect
  opgebouwd uit het genormaliseerde kaart-id (sv03→sv3, .5→pt5); een expliciete
  Cardmarket-URL uit TCGdex-prijsdata wint altijd. Japanse kaarten kunnen alleen op
  Engelse naam zoeken — Cardmarket voert de meeste Japanse kaarten niet.
- **Cardmarket-prijsvelden**: `trendPrice` is de globale markttrend (conditie-onafhankelijk,
  in de praktijk gedreven door Near Mint-verkopen). De kale `lowPrice` telt álle condities mee
  (ook Played/Damaged) en is dus onbetrouwbaar laag — gebruik `lowPriceExPlus` (Excellent of
  beter, het near-mint-segment) voor "laagste aanbod", met `lowPrice` alleen als terugval
  (vlag `cmLowEx` bepaalt het label).
- **TCGplayer is bewust verwijderd** uit de interface (expliciete wens): Cardmarket is main,
  PriceCharting (ungraded/graded) is sub. De USD-prijs wordt nog wel stilletjes opgehaald als
  terugval voor prijssortering en collectiewaarde wanneer een euroteken ontbreekt — niet tonen.
- **De twee prijstegels op de kaart zijn allebei Cardmarket**: trendprijs (main, met ▲/▼) en
  gemiddelde 30 dagen. PriceCharting zit alleen in het detailvenster — geen eigen prijstegel,
  ook een expliciete wens.
