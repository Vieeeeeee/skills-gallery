// Fast search with support for multi-keyword matching, pinyin initials, bilingual tokens
//
// 语料按条目缓存：不缓存的话每次按键都要为全量条目（当前约 1000+ 条）重新拼接+小写化全文
// （实测桌面 11ms/键，手机 5~8 倍）。条目对象是稳定引用，用 WeakMap 随条目一起回收。
const corpusCache = new WeakMap();

function getCorpus(item) {
  let corpus = corpusCache.get(item);
  if (corpus === undefined) {
    corpus = [
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
    corpusCache.set(item, corpus);
  }
  return corpus;
}

export function matchSearch(item, query) {
  if (!query || !query.trim()) return true;
  const tokens = query.toLowerCase().trim().split(/\s+/);
  const corpus = getCorpus(item);
  // Every token must match somewhere in corpus
  return tokens.every(token => corpus.includes(token));
}
