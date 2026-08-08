# Roadmap — TCG-Finder uitbreidingen

Levend document met de geplande features. Vaste projectafspraken staan in **`CLAUDE.md`**;
dit bestand beschrijft alleen wat er nog komt en in welke volgorde.

Randvoorwaarden (uit `CLAUDE.md`): front-end volledig in `index.html` (geen build/dependencies),
serverwerk in `api/` (Vercel-functies), mobiel-eerst, Pokédex-look, Nederlands, dynamische
tekst via `h()`, iconen als SVG-symbolen (géén emoji). Uitrollen via branch → PR → merge naar
`main` (Vercel deployt automatisch); nooit rechtstreeks naar `main`.

## Volgorde (afgesproken)

1. **E2** — Beginpagina: waardevolste kaarten + filters zichtbaar
2. **E3** — Gedeeltelijk zoeken ("bevat")
3. **E1** — Accounts & cloud-sync
4. *(daarna, nog te plannen)* **E4** bulk naar collectie · **E5** binder + verlanglijst · **E6** beursagenda

De drie snelle winsten E2/E3 (+ later E4) zijn onafhankelijk; E1 is het fundament dat de
binder (E5) nodig heeft voor gebruik over meerdere apparaten.

---

## E1 · Accounts & cloud-sync — *fundament* · effort: XL
Cross-device binders/collectie/verlanglijst vereist opslag buiten de browser.
- De app blijft **offline werken op `localStorage`**; inloggen is optioneel en synct dan naar
  de cloud, met samenvoeg-/conflictlogica.
- Nieuw: auth- en sync-serverfuncties in `api/`, een datastore, en een login-UI achter een
  nieuw `i-user`-icoon.
- **Beslissingen bij aanvang:** inlogmethode (magic-link e-mail / Google-OAuth / passkey) en
  opslagbackend (Vercel Postgres/KV of Supabase) + gratis-tier-limieten.
- Claude voert nooit zelf wachtwoorden in — auth *bouwen* mag; de echte login test de gebruiker.

## E2 · Beginpagina: waardevolste kaarten + filters (punt 3 + 4) · effort: M
- Startpagina toont de **duurste kaarten** i.p.v. de lege tekst.
- **Geverifieerd:** pokemontcg.io ondersteunt server-side prijs-sortering
  (`orderBy=-cardmarket.prices.trendPrice`) → één cachebare query levert de top mét prijzen.
- **Filterbalk (`#controls`) meteen zichtbaar** en toegepast op die kaarten; "meer laden"
  voor volgende pagina's.
- Onafhankelijk van accounts. Eerste zichtbare winst.

## E3 · Gedeeltelijk zoeken ("bevat", punt 2) · effort: S–M
- Hoofdzoekbalk matcht op deel van een woord (`name:*char*` → Charizard/Charmander).
- Valkuil: pokemontcg.io geeft 500 bij te brede queries → lichte-variant-terugval + melding
  (bestaand patroon).

## E4 · Meerdere kaarten tegelijk naar collectie (punt 1) · effort: S–M
- **Selectiemodus** (vinkjes op tegels + "selectie toevoegen") en snelknoppen "hele set
  toevoegen" / "alle resultaten toevoegen".
- Puur front-end op de bestaande `COL`-structuur.

## E5 · Binder-functie + verlanglijst (punt 5) · effort: XL · *leunt op E1*
Geïnspireerd op pkmnbindr.com, in sub-fasen:
- **5a** — datamodel (binders in opslag) + één binder als bladerbare 3×3-albumpagina's.
- **5b** — meerdere benoemde binders, set-gebaseerde layout (kaart op zijn setslot),
  markering **in bezit / ontbreekt**.
- **5c** — **verlanglijst-scherm** los van de binders, met per kaart een notitie
  "nog nodig voor binder X".
- Nieuwe SVG-iconen `i-binder`/`i-wish` in de bestaande stijl.

## E6 · Beursagenda (punt 6) · effort: L · backend-zwaar
- `api/beurzen.js`: **periodieke scraping per landcode** (NL standaard, uitbreidbaar naar
  andere landen), resultaat gecached/opgeslagen en ververst via **Vercel Cron**.
- Front-end: agenda-scherm (datum, plaats, link) met landkeuze.
- **Beslissing bij aanvang:** welke bron(nen) scrapen (ToS checken) en verversfrequentie.

---

## Cross-cutting (in elke fase meenemen)
- **Navigatie/IA:** de tabbar heeft nu 3 items (Zoeken/Collectie/Prijzen). Met Binder + Agenda
  erbij wordt dat te vol → Binder onder Collectie of een "Meer"-menu, Agenda als eigen tab.
  Ontwerpbeslissing bij E5/E6.
- **Ontwerp & i18n:** Pokédex-look, nieuwe iconen als SVG-symbolen (geen emoji), alles
  Nederlands, dynamische tekst via `h()`, testen op 390px + desktop en licht + donker.

## Openstaande beslissingen (pas nodig bij de betreffende fase)
- **E1:** inlogmethode + opslagbackend.
- **E6:** scrape-bron(nen) + verversfrequentie.
- **IA:** plek van Binder en Agenda in de navigatie.
