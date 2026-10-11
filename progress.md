# progress.md: fremdriftslogg

Nyeste øverst. Oppdateres ved slutten av hver arbeidsøkt (se `agent.md`).

## Status nå

**Fase:** 1, spillbar prototype. Hele spillet (Klassisk og Undercover) kan spilles i nettleseren med én telefon som sendes rundt.

**Neste steg:**
1. Espen tester i nettleser (`npm install && npm run web`) og på telefon (`npm start` + Expo Go), og gir tilbakemelding.
2. Fase 2, app-kvalitet: endelig design (fonter, animasjon ved avsløring, haptikk, lyd), «Slik spiller du»-skjerm, stemmegiving for uavgjort.
3. Fase 3: RevenueCat og Premium (festpakke 18+).

**Åpne spørsmål:** Endelig navn på spillet (arbeidsnavn: Imposter).

**Blokkert av:** Ingenting.

## Logg

### 2026-10-11: Spillskjermene
- Skjermflyt i `src/app/`: start (`index`), oppsett (`setup`) og selve runden (`play`: utdeling → ledetråder med tidtaker → avstemning → avsløring/gjetting → resultat → spill igjen).
- Tilstand i `src/store/game.ts` (Zustand). Spillere, innstillinger, brukte ord og forrige runders imposters lagres lokalt.
- Avslørt imposter / Mr. White gjetter høyt, og gruppen trykker Riktig/Feil (`resolveGuess` i motoren).
- Web-eksport satt til `single` (SPA) for å unngå hydreringsfeil med lagret tilstand og enhetsspråk.
- Testet hele runden i begge moduser i nettleser (Playwright), uten feil i konsollen.

### 2026-10-11: Ordlister godkjent
- Espen godkjente alle 6 gratis ordlister (308 ord) uten endringer.

### 2026-10-10: Fase 1 startet
- Expo SDK 57 med TypeScript, Expo Router (`src/app/`), i18next (norsk + engelsk UI), Zustand og AsyncStorage.
- Spillmotor i `src/game/`: oppsett, trekking av ord uten gjentakelse, roller for Klassisk og Undercover, ingen imposter to runder på rad, avstemning, gjetting og vinner. 21 tester.
- Utkast til 6 gratis ordlister i `content/no/` (308 ord med hint og undercover-ord) og valideringsskript.
- Startskjerm som viser moduser og kategorier (bekreftet i nettleser).

### 2026-10-10: Oppstart
- Researchrapport ferdig (`docs/research.md`).
- Oppstartsintervju med Espen: 18 beslutninger tatt, se `docs/beslutninger.md`.
- Opprettet dokumentasjon: `agent.md`, `progress.md`, `README.md` og `docs/`.
- Privat GitHub-repo `aogaa/imposter` opprettet av Espen, dokumentasjonen pushet.
