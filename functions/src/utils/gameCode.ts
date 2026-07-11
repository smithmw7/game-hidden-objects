const WORDS = ["COZY", "ROOM", "PLANT", "BOOK", "DOG", "CAT", "ART", "LAMP", "HOME"];

export function generateReadableCode(random: () => number = Math.random): string {
  const word = WORDS[Math.floor(random() * WORDS.length)];
  const suffix = Math.floor(1000 + random() * 9000);
  return `${word}-${suffix}`;
}

export function normalizeGameCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}
