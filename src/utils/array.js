/**
 * Utility functions for array manipulation.
 */

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array} arr The array to shuffle.
 * @returns {Array} The shuffled array.
 */
export function shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
