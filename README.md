# Pokémon TCG-zoeker — online zetten via GitHub Pages

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

Dit `README.md` hoeft niet mee, maar mag.

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

## Privacy en kosten

Er is geen server en geen database: de pagina draait volledig in de browser en praat rechtstreeks
met de API's van pokemontcg.io en TCGdex. Er wordt niets van jou opgeslagen. GitHub Pages is
gratis voor publieke repositories; er zijn geen limieten die je met dit gebruik gaat raken.

Let op: een publieke repository betekent dat iedereen de pagina kan bekijken. Er staat geen
persoonlijke of bedrijfsinformatie in, dus dat is hier geen bezwaar. Wil je hem toch afgeschermd
hebben, dan is een private repository met GitHub Pages mogelijk vanaf een betaald plan, of je zet
de pagina op een eigen webserver.
