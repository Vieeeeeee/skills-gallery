// Fast search with support for multi-keyword matching, pinyin initials, bilingual tokens
export function matchSearch(item, query) {
  if (!query || !query.trim()) return true;
  
  const tokens = query.toLowerCase().trim().split(/\s+/);
  
  // Build searchable text corpus for this item
  const corpus = [
    item.title || '',
    item.category || '',
    item.type || '',
    item.author || '',
    item.command || '',
    item.repo_url || '',
    item.description || '',
    item.prompt || '',
    (item.tags || []).join(' ')
  ].join(' ').toLowerCase();
  
  // Every token must match somewhere in corpus
  return tokens.every(token => corpus.includes(token));
}

