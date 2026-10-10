# Arkitektur

## Stakk

| Del | Valg | Hvorfor |
|---|---|---|
| Rammeverk | Expo SDK (siste stabile) + React Native + TypeScript | Én kodebase for iOS, Android og web-testing |
| Navigasjon | Expo Router | Filbasert, standard i Expo |
| Tilstand | Zustand | Enkelt, lite boilerplate |
| Lagring | `@react-native-async-storage/async-storage` | Spillere, innstillinger, brukte ord |
| i18n | `i18next` + `react-i18next` + `expo-localization` | Flerspråklig fra dag én |
| Kjøp | `react-native-purchases` (RevenueCat) | Engangskjøp på tvers av plattformer, gjenoppretting |
| Animasjon | `react-native-reanimated` | Avsløringsflyt |
| Haptikk/lyd | `expo-haptics`, `expo-audio` | Følelse i avsløringen |
| Tester | Jest (`jest-expo`) | Spillmotoren testes som ren TypeScript |
| Bygg/publisering | EAS Build + EAS Submit | Skybygg til begge butikker |

## Prinsipper

- **Spillmotoren er ren TypeScript** i `src/game/`, uten React-avhengigheter, slik at den kan testes grundig og senere gjenbrukes til romkode-modus (server).
- **Tilfeldighet injiseres** (seedbar RNG) slik at tester er deterministiske.
- **All UI-tekst via i18n-nøkler.** Norsk (`no`) er referansespråket.
- **Innhold er data, ikke kode.** Ordlister ligger som JSON i `content/<språk>/` og valideres med et skript.
- **Entitlements:** én RevenueCat-entitlement `premium`. Hver kategori/modus har feltet `tier: "free" | "premium"`.

## Datamodell (utkast)

```ts
type Category = {
  id: string;            // "mat"
  tier: "free" | "premium";
  ageRating: "all" | "18+";
  icon: string;
  words: WordEntry[];
};

type WordEntry = {
  word: string;          // "Pizza"
  hint: string;          // hintord til imposteren: "Italia"
  pair?: string;         // Undercover-ord: "Pai"
  difficulty: 1 | 2 | 3;
};
```

Kategorinavn og beskrivelser ligger i i18n-filene, ordene i `content/<språk>/<kategori>.json`.

## Senere: hver sin telefon
Krever en enkel sanntidsserver (f.eks. Supabase Realtime eller PartyKit). Motoren i `src/game/` skal derfor ikke anta én enhet.
