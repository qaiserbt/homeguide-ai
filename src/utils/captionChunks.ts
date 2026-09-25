export interface WordTiming {
  text: string;
  start: number;
  end: number;
}

export interface CaptionChunk {
  text: string;
  start: number;
  end: number;
}

/** Groups word-level timings into short readable caption phrases (like real subtitles), breaking at sentence punctuation or a word-count cap, whichever comes first. */
export function chunkWordsIntoCaptions(words: WordTiming[], maxWordsPerChunk = 7): CaptionChunk[] {
  const chunks: CaptionChunk[] = [];
  let current: WordTiming[] = [];

  const flush = () => {
    if (current.length === 0) return;
    chunks.push({
      text: current.map((w) => w.text).join(" "),
      start: current[0].start,
      end: current[current.length - 1].end,
    });
    current = [];
  };

  for (const word of words) {
    current.push(word);
    if (current.length >= maxWordsPerChunk || /[.!?]$/.test(word.text)) {
      flush();
    }
  }
  flush();

  return chunks;
}

/** Finds which caption chunk should be showing at a given playback time. */
export function findActiveChunkIndex(chunks: CaptionChunk[], currentTime: number): number {
  for (let i = 0; i < chunks.length; i++) {
    if (currentTime < chunks[i].end) return i;
  }
  return chunks.length - 1;
}
