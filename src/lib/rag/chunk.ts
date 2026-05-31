/**
 * Découpage de texte en chunks pour le RAG.
 * Stratégie : ~800 tokens par chunk avec 100 tokens de chevauchement,
 * en respectant au mieux les frontières de paragraphes/phrases.
 *
 * Approximation : 1 token ≈ 4 caractères (suffisant pour le chunking,
 * le comptage exact est fait par l'API d'embeddings).
 */

const CHARS_PER_TOKEN = 4;

export interface TextChunk {
  content: string;
  index: number;
  tokens: number;
}

export function chunkText(
  text: string,
  { maxTokens = 800, overlapTokens = 100 } = {},
): TextChunk[] {
  const clean = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!clean) return [];

  const maxChars = maxTokens * CHARS_PER_TOKEN;
  const overlapChars = overlapTokens * CHARS_PER_TOKEN;

  // Découpe d'abord par paragraphes, puis regroupe jusqu'à maxChars.
  const paragraphs = clean.split(/\n{2,}/);
  const chunks: TextChunk[] = [];
  let buffer = "";
  let index = 0;

  const flush = () => {
    const content = buffer.trim();
    if (!content) return;
    chunks.push({
      content,
      index: index++,
      tokens: Math.ceil(content.length / CHARS_PER_TOKEN),
    });
    // Conserve un chevauchement (fin du buffer) pour garder le contexte.
    buffer = overlapChars > 0 ? content.slice(-overlapChars) : "";
  };

  for (const para of paragraphs) {
    // Paragraphe géant → on le coupe en phrases.
    if (para.length > maxChars) {
      const sentences = para.match(/[^.!?]+[.!?]+|\S+$/g) ?? [para];
      for (const sentence of sentences) {
        if (buffer.length + sentence.length > maxChars) flush();
        buffer += sentence;
      }
      continue;
    }
    if (buffer.length + para.length + 2 > maxChars) flush();
    buffer += (buffer ? "\n\n" : "") + para;
  }
  flush();

  return chunks;
}
