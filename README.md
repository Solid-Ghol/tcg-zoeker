# Pokémon TCG-zoeker

Een Pokémon-kaartzoeker die per zoekterm alle kaarten ophaalt — met afbeelding, set,
kaartnummer, rariteit en actuele marktprijzen (Cardmarket als hoofdbron, met per kaart een
PriceCharting-link voor ungraded- en graded-prijzen). Engelse en Japanse
kaarten worden apart opgehaald. Alles zit in één `index.html`; er is geen server of database.

## Uitgangspunt: werkt lekker op mobiel

De zoeker moet **prettig werken op een telefoon** — dat is een harde eis, geen bijzaak. De meeste
mensen openen hem onderweg op hun mobiel (bijvoorbeeld tijdens het snuffelen op een verzamelbeurs).
Daarom:

- de layout is mobile-first en schaalt mee met de schermbreedte;
- knoppen en velden zijn groot genoeg om met de duim te bedienen, en invoervelden gebruiken op
  mobiel `16px` zodat Safari niet ongevraagd inzoomt;
- het grote kaartvenster vult op de telefoon het volledige scherm, met bladerknoppen binnen
  duimbereik;
- er wordt rekening gehouden met de veilige zone (de "notch"/afgeronde hoeken) via
  `env(safe-area-inset-*)`.

Test bij elke wijziging dus ook even op een smal scherm (of de mobiele weergave van je browser)
voordat je hem online zet.

## Zoeken, bladeren en filteren

- **Zoeken** op Pokémon-naam of setnaam (bovenste veld). Tijdens het typen vult de zoekbalk
  Pokémon-namen aan (alle soorten, via PokéAPI) — sets blader je door via het
  kaarten-icoontje naast de zoekbalk.
- **Foto-herkenning** — met het camera-icoon naast de zoekbalk maak je een foto van een kaart;
  de naam en het kaartnummer worden herkend en meteen opgezocht (de juiste kaartversie wordt
  vanzelf geopend). Dit vraagt eenmalig een kleine gratis serverfunctie — zie
  *[Foto-herkenning instellen](#foto-herkenning-instellen)* hieronder.
- **Blader door alle sets** — de link onder de zoekbalk opent een overzicht van álle sets,
  gegroepeerd per serie (net als op pkmn.gg). Eén klik haalt de hele set op.
- **Filter** (balk die na een zoekopdracht verschijnt): filtert binnen wat je al hebt
  opgehaald — op vrije tekst, **rariteit**, **energietype**, **soort kaart** en **taal**.
  De menu's vullen zich automatisch met wat er in je resultaten zit; met **Wis** zet je
  alles in één keer terug.
- **Weergave** kies je met knoppen (geen menu): per Pokémon, per set of alles in één lijst,
  plus een sorteervolgorde.
- **Energietypes** krijgen hun herkenbare kleur (Fire = rood, Water = blauw, Lightning = geel,
  enzovoort), zowel op de kaart als in het detailvenster en de CSV-export.
- **Kaartdetails** — het detailvenster toont naast set en prijzen ook soort/subtype, HP,
  zwakte/weerstand, terugtrekkosten, de aanvallen (met energiekosten en schade) en de illustrator.
- **Set-weergave** — groepeer resultaten per set (met setlogo, jaar en aantal) en sorteer op
  kaartnummer. Wie op een setnaam zoekt, krijgt deze weergave automatisch.

## Collectie, prijstrend en delen

- **Collectie** — met **+ Collectie** op een kaart bewaar je hem in je verzamellijst (opgeslagen
  in de browser, alleen op dat apparaat). Via de knop **Collectie** rechtsboven bekijk je alles
  terug, met de geschatte totale waarde; nogmaals klikken (of de terug-link in de statusregel)
  brengt je weer bij je zoekresultaten. Zoek je een bewaarde kaart opnieuw op, dan worden de
  opgeslagen prijzen automatisch ververst.
- **Back-up** — via het tandwiel exporteer je je collectie als JSON-bestand en lees je zo'n
  back-up ook weer in (op hetzelfde of een ander apparaat; wordt samengevoegd met wat er al is).
- **Voortgang per set** — in de set-weergave zie je per set een balkje met hoeveel kaarten je
  daarvan al hebt (bijvoorbeeld „34/165 in collectie").
- **Prijstrend** — een ▲ of ▼ naast de Cardmarket-prijs betekent dat de trendprijs minstens 3%
  boven of onder het 30-dagengemiddelde ligt; de tooltip geeft het percentage.
- **Delen** — de knop **Deel** kopieert een link die precies dezelfde zoekopdracht opent,
  handig om een vondst naar iemand door te sturen.

## Instellingen en thema's

Achter het tandwiel rechtsboven zitten de instellingen: thema en de bron van kaartgegevens.
Je themakeuze wordt onthouden op je apparaat.

- **Systeem** — volgt automatisch de licht/donker-stand van je telefoon of computer.
- **Donker** en **Licht** — vaste keuze, ongeacht je systeeminstelling.
- **Zonsondergang** — diep violet met een warm oranje/roze accent.
- **Jeroen** — amberkleurig thema met kleine Pokémon-fossielen (Helix- en Dome-fossiel)
  als patroon op de achtergrond. Puur voor de sier.

## Online zetten via GitHub Pages

De zoeker haalt kaartgegevens en prijzen op bij twee open API's. Browsers staan dat alleen toe
wanneer de pagina zelf via `http(s)://` geserveerd wordt. Vanaf de bestandsopslag (`file://`)
blokkeert met name Safari op iPhone en iPad die verzoeken — vandaar deze stap.

GitHub Pages is gratis, vraagt geen server en geeft een vast adres dat je op je beginscherm kunt
zetten.

## Wat je uploadt

| Bestand | Waarvoor |
|---|---|
| `index.html` | de zoeker zelf — alle opmaak en code zit erin |
| `apple-touch-icon.png` | pictogram voor "Zet op beginscherm" op iOS |
| `icon-512.png` | pictogram voor Android en desktopbrowsers |
| `manifest.webmanifest` | zorgt dat de zoeker als eigen app opent in plaats van als tabblad |
| `api/identify.js` | **alleen nodig voor de foto-herkenning** — de serverfunctie voor Vercel (zie hieronder) |

Dit `README.md` hoeft niet mee, maar mag. Zoeken, filteren, de collectie en alle prijzen
werken volledig zonder `api/identify.js`; die map is puur voor de foto-herkenning.

## Stappen

1. Log in op [github.com](https://github.com). Heb je nog geen account, maak er dan een aan —
   gratis is voldoende.
2. Klik rechtsboven op **+** → **New repository**.
   - **Repository name**: bijvoorbeeld `tcg-zoeker`
   - Zet hem op **Public** (Pages werkt op een gratis account alleen bij publieke repositories)
   - Vink **Add a README file** *niet* aan
   - Klik **Create repository**
3. Klik op **uploading an existing file** (of **Add file** → **Upload files**). Sleep de vier
   bestanden hierboven het venster in en klik onderaan op **Commit changes**.
4. Ga naar **Settings** → in het linkermenu **Pages**.
   - Onder *Source* kies je **Deploy from a branch**
   - Branch: **main**, map: **/ (root)** → **Save**
5. Wacht één tot twee minuten en ververs de Pages-pagina. Bovenaan verschijnt het adres:

   ```
   https://<jouw-gebruikersnaam>.github.io/tcg-zoeker/
   ```

6. Open dat adres in Safari op je iPhone. Zoeken werkt nu.
7. Tik op **Deel** (het vierkantje met de pijl) → **Zet op beginscherm**. De zoeker staat daarna
   als app tussen je andere iconen.

## Later iets wijzigen

Open het bestand in de repository, klik op het potloodje, pas aan en commit. GitHub Pages werkt
zichzelf binnen een minuut bij. Een nieuwe versie van `index.html` uploaden over de oude heen mag
ook — GitHub vraagt dan om de vervanging te bevestigen.

## Foto-herkenning instellen

Het camera-icoon naast de zoekbalk herkent een kaart van een foto (naam + kaartnummer) en
zoekt die meteen op. Dat gebeurt door de foto naar een klein serverfunctietje te sturen dat
op zijn beurt een vision-model bevraagt. Waarom een server? Omdat je API-sleutel geheim moet
blijven — die mag nooit in de openbare `index.html` staan. De serverfunctie (`api/identify.js`)
bewaart de sleutel veilig en geeft alleen de herkende kaart terug.

Dit is **optioneel**: laat je het weg, dan werkt de rest van de zoeker gewoon; het camera-icoon
geeft dan een nette melding.

### Kies een vision-model (gratis kan!)

De serverfunctie werkt met vier aanbieders en kiest automatisch de eerste waarvan je een sleutel
instelt (volgorde: OpenRouter → Groq → Gemini → Anthropic):

- **OpenRouter — gratis (aanbevolen).** Bundelt meerdere gratis vision-modellen, **zonder
  creditcard**, en werkt in de EU. Haal een sleutel op via
  [openrouter.ai/keys](https://openrouter.ai/keys). Zet in Vercel de variabele `OPENROUTER_API_KEY`;
  de functie kiest zelf een gratis vision-model (optioneel forceer je er één met `OPENROUTER_MODEL`,
  bijv. `qwen/qwen2.5-vl-72b-instruct:free`).
- **Groq — gratis, maar niet elk account heeft een vision-model.** Sleutel via
  [console.groq.com](https://console.groq.com/). Variabele: `GROQ_API_KEY` (model wordt automatisch
  gekozen, of forceer met `GROQ_MODEL`).
- **Google Gemini — gratis, maar niet overal.** Sleutel via
  [aistudio.google.com](https://aistudio.google.com/). Let op: de gratis tier is niet in elke regio
  of bij elk (bedrijfs)account beschikbaar — krijg je `quota … limit: 0`, gebruik dan OpenRouter.
  Variabele: `GEMINI_API_KEY`.
- **Anthropic Claude — betaald.** Sleutel via [console.anthropic.com](https://console.anthropic.com/);
  je zet er zelf een klein tegoed op. Variabele: `ANTHROPIC_API_KEY`.

Verder heb je een gratis **[Vercel](https://vercel.com/)**-account nodig (host de serverfunctie
kosteloos).

### De makkelijkste manier: alles op Vercel

Als je de site via Vercel host, staan de zoeker én de serverfunctie op hetzelfde adres en werkt
het camera-icoon meteen — je hoeft in de zoeker niets in te stellen.

1. Zorg dat `index.html`, de iconen, `manifest.webmanifest` én de map `api/` (met `identify.js`)
   in je GitHub-repository staan.
2. Log in op [vercel.com](https://vercel.com/) met je GitHub-account en klik **Add New… → Project**.
3. Kies je `tcg-zoeker`-repository en klik **Import**. Framework: **Other** (geen build nodig).
4. Vouw **Environment Variables** open en voeg één sleutel toe:
   - Gratis (aanbevolen): **Name** `OPENROUTER_API_KEY` — **Value** je OpenRouter-sleutel.
   - Of gratis: **Name** `GROQ_API_KEY` — **Value** je Groq-sleutel.
   - Of gratis: **Name** `GEMINI_API_KEY` — **Value** je Gemini-sleutel.
   - Of betaald: **Name** `ANTHROPIC_API_KEY` — **Value** je Anthropic-sleutel.
5. Klik **Deploy**. Na een halve minuut krijg je een adres zoals
   `https://tcg-zoeker.vercel.app` — open dat en het camera-icoon werkt.

### Of: site op GitHub Pages, functie op Vercel

Wil je de site op GitHub Pages houden (zoals hierboven beschreven), dan zet je alléén de
serverfunctie op Vercel:

1. Doorloop de Vercel-stappen hierboven; je krijgt een adres zoals `https://tcg-zoeker.vercel.app`.
2. Open je zoeker op GitHub Pages, klik op het **tandwiel** rechtsboven en vul bij
   **Foto-herkenning** de volledige functie-URL in:
   `https://tcg-zoeker.vercel.app/api/identify`.
3. Klaar — de instelling wordt op je apparaat onthouden.

### Wat er met je foto gebeurt

De foto wordt in de browser verkleind en één keer naar je eigen serverfunctie gestuurd, die hem
aan het gekozen vision-model (OpenRouter, Groq, Gemini of Claude) doorgeeft om de kaart af te lezen.
Er wordt niets van de foto bewaard. Alleen jij gebruikt je eigen sleutel; bij OpenRouter, Groq en
Gemini blijf je binnen de gratis tier, bij Anthropic betaal je je eigen (zeer kleine) verbruik.

## Privacy en kosten

Er is geen server en geen database: de pagina draait volledig in de browser en praat rechtstreeks
met de API's van pokemontcg.io en TCGdex. Er wordt niets van jou opgeslagen. GitHub Pages is
gratis voor publieke repositories; er zijn geen limieten die je met dit gebruik gaat raken.

Let op: een publieke repository betekent dat iedereen de pagina kan bekijken. Er staat geen
persoonlijke of bedrijfsinformatie in, dus dat is hier geen bezwaar. Wil je hem toch afgeschermd
hebben, dan is een private repository met GitHub Pages mogelijk vanaf een betaald plan, of je zet
de pagina op een eigen webserver.
