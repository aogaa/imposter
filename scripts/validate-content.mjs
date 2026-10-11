// Validates the word lists in content/<language>/*.json. Run: npm run validate-content
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../content/', import.meta.url).pathname;
const errors = [];
const warnings = [];

for (const lang of readdirSync(root)) {
  const dir = join(root, lang);
  const seen = new Map();
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const category = JSON.parse(readFileSync(join(dir, file), 'utf8'));
    const where = `${lang}/${file}`;
    if (`${category.id}.json` !== file) errors.push(`${where}: id "${category.id}" does not match file name`);
    if (!['free', 'premium'].includes(category.tier)) errors.push(`${where}: invalid tier`);
    if (!['all', '18+'].includes(category.ageRating)) errors.push(`${where}: invalid ageRating`);
    if (category.tier === 'free' && category.ageRating !== 'all') errors.push(`${where}: free content must be ageRating "all"`);
    if (category.words.length < 30) warnings.push(`${where}: only ${category.words.length} words`);

    for (const entry of category.words) {
      const label = `${where}: "${entry.word}"`;
      for (const field of ['word', 'hint', 'pair']) {
        if (typeof entry[field] !== 'string' || !entry[field].trim()) errors.push(`${label}: missing ${field}`);
      }
      if (![1, 2, 3].includes(entry.difficulty)) errors.push(`${label}: difficulty must be 1, 2 or 3`);
      const key = entry.word.toLowerCase();
      if (entry.pair?.toLowerCase() === key) errors.push(`${label}: pair equals word`);
      if (entry.hint?.toLowerCase() === key) errors.push(`${label}: hint equals word`);
      if (entry.hint && entry.word && entry.hint.toLowerCase().includes(key)) warnings.push(`${label}: hint contains the word`);
      if (seen.has(key)) errors.push(`${label}: duplicate, also in ${seen.get(key)}`);
      else seen.set(key, where);
    }
  }
  console.log(`${lang}: ${seen.size} words`);
}

warnings.forEach((w) => console.warn(`warning: ${w}`));
errors.forEach((e) => console.error(`error: ${e}`));
process.exit(errors.length ? 1 : 0);
