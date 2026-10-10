# progress.md: fremdriftslogg

Nyeste øverst. Oppdateres ved slutten av hver arbeidsøkt (se `agent.md`).

## Status nå

**Fase:** 1, spillbar prototype. Expo-prosjekt, spillmotor og utkast til ordlister er på plass. Ingen spillskjermer ennå.

**Neste steg:**
1. Espen går gjennom ordlisteutkastene (se `content/no/STATUS.md`). Rett opp etter tilbakemelding.
2. Bygg skjermflyten: velg modus og kategorier → spillere → innstillinger → send telefonen rundt (vis rolle) → hvem starter → diskusjon med tidtaker → avstemning → avsløring/gjetting → resultat.
3. Lagre spillere, innstillinger og brukte ord lokalt (Zustand + AsyncStorage er installert).

**Åpne spørsmål:** Endelig navn på spillet (arbeidsnavn: Imposter).

**Blokkert av:** Ingenting.

## Logg

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
