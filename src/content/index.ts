import type { Category } from '@/game';
import type { Language } from '@/i18n';

import dyr from '../../content/no/dyr.json';
import hjemmeOgHytta from '../../content/no/hjemme-og-hytta.json';
import jobber from '../../content/no/jobber.json';
import matOgDrikke from '../../content/no/mat-og-drikke.json';
import sportOgFritid from '../../content/no/sport-og-fritid.json';
import stederINorge from '../../content/no/steder-i-norge.json';

const content: Record<Language, Category[]> = {
  no: [matOgDrikke, dyr, stederINorge, sportOgFritid, hjemmeOgHytta, jobber] as Category[],
  // English word lists come later (see docs/veikart.md). Until then English UI uses Norwegian words.
  en: [],
};

export function getCategories(language: Language): Category[] {
  return content[language].length > 0 ? content[language] : content.no;
}
