import type { Resources } from '../types';

const en: Resources = {
  app: {
    name: 'Imposter',
    tagline: "Who's bluffing?",
  },
  modes: {
    classic: { name: 'Classic', description: 'Everyone except the imposter gets the secret word.' },
    undercover: { name: 'Undercover', description: 'One player gets a similar word. Mr. White gets nothing.' },
  },
  roles: {
    civilian: 'Civilian',
    imposter: 'Imposter',
    undercover: 'Undercover',
    mrwhite: 'Mr. White',
  },
  categories: {
    title: 'Categories',
    wordCount: '{{count}} words',
    'mat-og-drikke': 'Food and drink',
    dyr: 'Animals',
    'steder-i-norge': 'Places in Norway',
    'sport-og-fritid': 'Sports and hobbies',
    'hjemme-og-hytta': 'Home and cabin',
    jobber: 'Jobs',
  },
  common: {
    comingSoon: 'Coming soon',
  },
};

export default en;
