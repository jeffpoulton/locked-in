/**
 * Seeded Pseudo-Random Number Generator (PRNG)
 *
 * Uses the mulberry32 algorithm - a well-established, fast PRNG
 * that produces high-quality random numbers from a 32-bit seed.
 *
 * This implementation is deterministic: the same seed always produces
 * the same sequence of random numbers.
 */

/**
 * Converts a string seed into a 32-bit integer using a simple hash function.
 * Uses the djb2 algorithm for consistent, well-distributed hashing.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * Creates a seeded random number generator using the mulberry32 algorithm.
 *
 * @param seed - A string seed (e.g., contract ID) that determines the random sequence
 * @returns A function that returns the next random number in the sequence (0 to 1, exclusive of 1)
 *
 * @example
 * const random = createSeededRandom("contract-123");
 * console.log(random()); // Always the same for "contract-123"
 * console.log(random()); // Next number in sequence
 */
export function createSeededRandom(seed: string): () => number {
  let state = hashString(seed);

  return function (): number {
    // mulberry32 algorithm
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates a random integer between min and max (inclusive).
 *
 * @param random - The seeded random number generator function
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns A random integer in the range [min, max]
 */
export function randomInt(
  random: () => number,
  min: number,
  max: number
): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm with a seeded random.
 *
 * @param random - The seeded random number generator function
 * @param array - The array to shuffle
 * @returns The shuffled array (same reference, mutated in place)
 */
export function shuffleArray<T>(random: () => number, array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
