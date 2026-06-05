/**
 * Tokenizes a TipTap JSON content structure into a flat array of tokens.
 * Tokens can be of type 'word', 'space', or 'newline'.
 *
 * @param {string|object} contentJSON - The TipTap JSON string or object.
 * @returns {Array<{type: 'word'|'space'|'newline', text: string}>}
 */
export function tokenizeLetterContent(contentJSON) {
  if (!contentJSON) return [];
  let doc;
  if (typeof contentJSON === 'string') {
    try {
      doc = JSON.parse(contentJSON);
    } catch (e) {
      return [];
    }
  } else {
    doc = contentJSON;
  }

  if (!doc || doc.type !== 'doc' || !Array.isArray(doc.content)) {
    return [];
  }

  const tokens = [];
  let isFirstBlock = true;

  for (const block of doc.content) {
    if (block.type === 'paragraph' || block.type === 'heading') {
      if (!isFirstBlock) {
        tokens.push({ type: 'newline', text: '\n' });
      }
      isFirstBlock = false;

      const textContent = (block.content || [])
        .filter((child) => child.type === 'text' && typeof child.text === 'string')
        .map((child) => child.text)
        .join('');

      if (textContent.length > 0) {
        const regex = /([^\s]+)|(\s)/g;
        let match;
        while ((match = regex.exec(textContent)) !== null) {
          const word = match[1];
          const space = match[2];
          if (word !== undefined) {
            tokens.push({ type: 'word', text: word });
          } else if (space !== undefined) {
            tokens.push({ type: 'space', text: space });
          }
        }
      }
    }
  }

  return tokens;
}
