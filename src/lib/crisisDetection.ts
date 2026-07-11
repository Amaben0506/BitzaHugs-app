// Crisis-language detection for supportive follow-up. This list is intentionally
// expandable and should be reviewed periodically with safety/moderation guidance.

const CRISIS_PHRASES = new Set([
  'kill myself',
  'killing myself',
  'i want to die',
  'want to die',
  'wanna die',
  'wish i was dead',
  'wish i were dead',
  'i should be dead',
  'rather be dead',
  'end it all',
  'end my life',
  'ending my life',
  'take my own life',
  'taking my own life',
  'commit suicide',
  'die by suicide',
  'suicidal thoughts',
  'feeling suicidal',
  'i am suicidal',
  'im suicidal',
  'no reason to live',
  'nothing to live for',
  'dont want to live',
  'dont want to wake up',
  'cant keep living',
  'cant go on',
  'cant do this anymore',
  'i cant do this anymore',
  'dont want to be here anymore',
  'better off without me',
  'everyone would be better off without me',
  'my family would be better off without me',
  'world would be better without me',
  'hurting myself',
  'hurt myself',
  'harm myself',
  'self harm',
  'self harming',
  'cut myself',
  'cutting myself',
  'not safe with myself',
  'cant keep myself safe',
  'going to overdose',
  'overdose on purpose',
]);

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/\bcan['’]?t\b/g, 'cant')
    .replace(/\bdon['’]?t\b/g, 'dont')
    .replace(/\bi['’]?m\b/g, 'im')
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const detectsCrisisLanguage = (text: string): boolean => {
  const normalized = normalize(text);
  if (!normalized) return false;

  for (const phrase of CRISIS_PHRASES) {
    if (normalized.includes(phrase)) return true;
  }

  return false;
};
