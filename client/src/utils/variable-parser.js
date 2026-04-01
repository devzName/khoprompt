// Matches [variable_name] brackets — max 50 chars, no nested brackets
const VARIABLE_REGEX = /\[([^\[\]]{1,50})\]/g;

/**
 * Extract unique variable names from text (strips HTML first)
 * @param {string} text - Raw or HTML string
 * @returns {string[]} Ordered unique variable names
 */
export function extractVariables(text) {
  if (!text) return [];
  // Strip HTML tags before parsing so we don't pick up HTML attribute values
  const plainText = text.replace(/<[^>]*>/g, '');
  const matches = [...plainText.matchAll(VARIABLE_REGEX)];
  const seen = new Set();
  return matches
    .map(m => m[1].trim())
    .filter(name => name && !seen.has(name) && seen.add(name));
}

/**
 * Replace [var_name] placeholders in text with provided values.
 * Preserves original HTML structure — only replaces bracket tokens.
 * @param {string} text - Original string (may contain HTML)
 * @param {Record<string, string>} values - Map of variable name → filled value
 * @returns {string}
 */
export function fillVariables(text, values) {
  if (!text) return '';
  return text.replace(VARIABLE_REGEX, (match, name) => {
    const trimmed = name.trim();
    return values[trimmed] !== undefined && values[trimmed] !== '' ? values[trimmed] : match;
  });
}
