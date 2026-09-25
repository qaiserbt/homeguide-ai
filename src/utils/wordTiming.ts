export interface WordTiming {
  text: string;
  start: number;
  end: number;
}

function isSentenceEnd(word: WordTiming): boolean {
  return /[.!?]$/.test(word.text);
}

/** Finds which word is currently being spoken at a given playback time. */
export function findActiveWordIndex(words: WordTiming[], currentTime: number): number {
  for (let i = 0; i < words.length; i++) {
    if (currentTime < words[i].end) return i;
  }
  return words.length - 1;
}

/**
 * Finds the start of the sentence the given word index belongs to, so the
 * caption can build up word-by-word from there — resetting once a sentence
 * ends (or after `maxWords`, so one long run-on sentence doesn't grow
 * forever before clearing).
 */
export function findSentenceStartIndex(words: WordTiming[], activeIndex: number, maxWords = 10): number {
  let start = 0;
  for (let i = 0; i < activeIndex; i++) {
    if (isSentenceEnd(words[i]) || i - start + 1 >= maxWords) {
      start = i + 1;
    }
  }
  return start;
}

/** The caption text to show right now: words spoken so far in the current sentence, building up until it ends. */
export function getProgressiveCaption(words: WordTiming[], currentTime: number): string {
  if (words.length === 0) return "";
  const activeIndex = findActiveWordIndex(words, currentTime);
  const start = findSentenceStartIndex(words, activeIndex);
  return words
    .slice(start, activeIndex + 1)
    .map((w) => w.text)
    .join(" ");
}
