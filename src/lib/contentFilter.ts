// Content filter — synchronous, used for posts, comments, and display names.
// Word list: add entries freely; this is intentionally expandable.

const BLOCKED_WORDS = new Set([
  // Core profanity
  'fuck', 'fucker', 'fucking', 'fucked', 'fucks',
  'shit', 'shitting', 'shitty', 'bullshit',
  'bitch', 'bitches', 'bitchy',
  'asshole', 'assholes',
  'bastard', 'bastards',
  'cunt', 'cunts',
  'cock', 'cocks',
  'dick', 'dicks',
  'pussy', 'pussies',
  'motherfucker', 'motherfuckers',
  'whore', 'whores',
  'slut', 'sluts',
  'prick',
  'twat',
  'wanker',
  'jackass',
  // Racial / ethnic slurs
  'nigger', 'niggers', 'nigga',
  'chink', 'chinks',
  'spic', 'spics',
  'kike', 'kikes',
  'gook', 'gooks',
  'wetback', 'wetbacks',
  'cracker', 'crackers',
  'beaner',
  'raghead',
  'towelhead',
  // Homophobic / transphobic slurs
  'faggot', 'faggots',
  'fag', 'fags',
  'dyke', 'dykes',
  'tranny', 'trannies',
  // Other targeted slurs
  'retard', 'retarded', 'retards',
  'spaz', 'spastic',
]);

// Phone: US formats + international prefix
const PHONE_RE = /\b(\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}\b/;

// Email
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

export interface FilterResult {
  blocked: boolean;
  reason?: string;
}

export const containsBlockedContent = (text: string): FilterResult => {
  const tokens = tokenize(text);
  for (const token of tokens) {
    if (BLOCKED_WORDS.has(token)) {
      return {
        blocked: true,
        reason: "This message contains language that isn't allowed in our community.",
      };
    }
  }

  if (PHONE_RE.test(text)) {
    return {
      blocked: true,
      reason:
        "For everyone's safety, please avoid sharing phone numbers in the community.",
    };
  }

  if (EMAIL_RE.test(text)) {
    return {
      blocked: true,
      reason:
        "For everyone's safety, please avoid sharing email addresses in the community.",
    };
  }

  return { blocked: false };
};
