# Handoff — actuele stand van zaken

Dit bestand is een korte overdracht voor een nieuwe Claude Code-sessie (die begint zonder
geheugen van eerdere gesprekken). De blijvende projectafspraken staan in **`CLAUDE.md`** —
lees dat eerst; die worden automatisch geladen. Dit bestand vult alleen de *actuele context* aan.

## Recent gedaan en LIVE (op `main`, uitgerold via Vercel)

- **Rode Pokédex-look.** Wordmark **"TCG-Finder"** (Caprasimo), pixel-Pokéball + statuslampjes
  in de header. Per Pokémon een gewone kopregel (`.pokeh2`) met **alleen de sprite** naast de
  naam (bewust géén grote info-balk met omschrijving/type/dexnummer). Klein **dexnummer-badge**
  (`.dexno`, pixel-font) rechtsboven op de tegels.
- **Engelse zoekresultaten samengevoegd.** `fetchEnglish()` haalt in de `auto`-modus nu
  pokemontcg.io **én** TCGdex op en merget de kaarten die pokemontcg.io mist (ontdubbeld op
  genormaliseerd kaart-id óf set+nummer). Zo verschijnen gloednieuwe sets/promo's die
  pokemontcg.io (nog) niet heeft. Prijzen worden alleen voor de extra TCGdex-kaarten opgehaald,
  dus de snelheid blijft vrijwel gelijk.
- **Afbeeldings-terugval verbeterd.** `imgErr()` probeert nu álle combinaties
  `low/high × webp/png/jpg` (bijgehouden op het element via `data-imgtried`, dus geen laadlus)
  voordat de "geen afbeelding"-placeholder verschijnt. Reden: nieuwe promo's hebben bij TCGdex
  soms alleen de `high`-versie, niet `low`.

## Scrydex — bewust NIET gebruikt

Scrydex (scrydex.com) is een betaalde API (geen gratis tier, ~$29/mnd). Ook de afbeeldingen
lopen via die betaalde API. Zonder abonnement kunnen we 'm niet gebruiken → geparkeerd. Er is
géén Scrydex-code in het project. Mocht er ooit tóch een abonnement komen: een beveiligde
serverfunctie (`api/scrydex.js`) met de sleutels server-side (`SCRYDEX_API_KEY`,
`SCRYDEX_TEAM_ID`) + edge-cache is de aangewezen route (zoals `api/proxy.js`).

## Openstaande taak

**Waarom toont de Tyrunt-promo uit "Mega Evolution Black Star Promos" (#070) geen afbeelding?**

Trek dit na met **echte internettoegang** (lokaal beschikbaar):

1. Vraag `https://api.tcgdex.net/v2/en/cards?name=Tyrunt` op en zoek de promo-kaart (set
   "Mega Evolution Black Star Promos", localId `070`).
2. Vraag het detail-endpoint van die kaart op en kijk naar het `image`-veld: bestaat er een
   afbeelding, en zo ja welke varianten (`low`/`high` × `.webp`/`.png`/`.jpg`)?
3. Bevestig of de `imgErr()`-fix het oplost, of vind de echte oorzaak (bv. TCGdex heeft
   simpelweg nog geen afbeelding voor die kaart → dan kan geen enkele bron 'm tonen).

> In de vorige web-sessie waren `api.tcgdex.net` en `api.pokemontcg.io` geblokkeerd door het
> netwerkbeleid van de sandbox, waardoor dit niet live te controleren viel. Lokaal wél.

## Werkwijze

- **Testen:** Playwright + `page.route()`-mocks (Chromium staat op
  `/opt/pw-browsers/chromium-*/chrome-linux/chrome` in de web-omgeving; lokaal je eigen
  Chromium/Playwright). Controleer minstens: licht + donker, desktop + 390px, en de console.
- **Uitrollen:** ontwikkel op een aparte branch, open een PR en merge naar `main` — Vercel
  deployt automatisch vanaf `main`. Nooit rechtstreeks naar `main` pushen.
- Alle zichtbare teksten en codecommentaar in het **Nederlands**.
