# agent.md: instruksjoner for AI-agenter (og mennesker)

Les denne fila først, deretter `progress.md`. Sammen gir de alt du trenger for å fortsette arbeidet fra en hvilken som helst PC eller sesjon.

## Prosjektet i én setning

Et norsk-først sosialt bløffespill i Imposter-sjangeren (alle unntatt én får et hemmelig ord, imposteren bløffer), for iOS og Android, med gratis grunnspill og ett engangskjøp.

## Roller

- **Espen** (GitHub: `aogaa`) eier produktet, tester og tar alle beslutninger.
- **Claude** skriver koden og innholdsutkastene. Espen godkjenner.

## Arbeidsregler

1. **Start hver økt** med å lese `agent.md`, `progress.md` og `docs/beslutninger.md`.
2. **Avslutt hver økt** med å oppdatere `progress.md`: hva ble gjort, hva er neste steg, eventuelle blokkeringer. Commit og push. Ugjort arbeid som ikke er pushet, er tapt.
3. **Nye beslutninger** føres i `docs/beslutninger.md` med dato. Ikke endre en tatt beslutning uten at Espen har sagt ja.
4. **Språk:** Dokumentasjon og commit-meldinger på norsk. Kode (variabelnavn, kommentarer) på engelsk.
5. **Ingen hardkodet tekst i UI.** All tekst går via i18n-nøkler (se `docs/arkitektur.md`), fordi spillet skal bli flerspråklig.
6. **Små, fungerende steg.** Hver commit skal la appen starte. Kjør `npm run lint` og `npm test` før push når de finnes.
7. **Ordlister er produktet.** Følg `docs/innhold.md`. Aldri maskinoversett ordlister; nye språk får egne, lokalt tilpassede lister.
8. **Ingen abonnement, ingen reklame.** Se `docs/monetisering.md`.

## Teknologi (bestemt)

- Expo (React Native) + TypeScript, Expo Router
- Kjøp: RevenueCat (engangskjøp / non-consumable)
- i18n: `i18next` + `expo-localization`
- Lagring lokalt på enheten (ingen konto, ingen server i v1)
- Testing underveis: i nettleser først (`npx expo start --web`), deretter Expo Go på telefon

## Mappestruktur (planlagt)

```
app/            Skjermer (Expo Router)
src/game/       Spillmotor: roller, trekking, runder, avstemning (ren TS, testbar)
src/i18n/       Oppsett og UI-tekster per språk (no, en, ...)
src/store/      Tilstand og lagring
src/purchases/  RevenueCat-integrasjon
content/no/     Ordlister på norsk (JSON)
docs/           Produkt, beslutninger, design, innhold, monetisering
```

## Viktige dokumenter

| Fil | Innhold |
|---|---|
| `progress.md` | Fremdriftslogg og neste steg |
| `docs/beslutninger.md` | Alle beslutninger fra oppstartsintervjuet og senere |
| `docs/produkt.md` | Produktspesifikasjon og MVP |
| `docs/spillregler.md` | Regler for Klassisk og Undercover |
| `docs/arkitektur.md` | Teknisk oppbygning |
| `docs/innhold.md` | Regler og format for ordlister |
| `docs/design.md` | Visuell stil |
| `docs/monetisering.md` | Gratis vs. Premium |
| `docs/veikart.md` | Faser etter MVP |
| `docs/research.md` | Markedsresearch (okt. 2026) |
