const VALID_TYPES = new Set(['style', 'skill', 'tool']);
const OPTIONAL_TEXT_FIELDS = [
  'author',
  'repo_url',
  'website_url',
  'description',
  'prompt',
  'command',
  'install_command',
  'cover_image',
  'slug',
  'usage_guide',
  'motion_prompt'
];

export function assertSkillsData(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('数据源格式错误：顶层必须是非空数组');
  }

  const seenIds = new Set();
  data.forEach((item, index) => {
    const label = `第 ${index + 1} 条`;
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error(`数据源格式错误：${label}不是条目对象`);
    }
    if (typeof item.id !== 'string' || !item.id.trim()) {
      throw new Error(`数据源格式错误：${label}缺少有效 id`);
    }
    if (seenIds.has(item.id)) {
      throw new Error(`数据源格式错误：重复 id ${item.id}`);
    }
    seenIds.add(item.id);
    if (typeof item.title !== 'string' || !item.title.trim()) {
      throw new Error(`数据源格式错误：${label}缺少有效标题`);
    }
    if (!VALID_TYPES.has(item.type)) {
      throw new Error(`数据源格式错误：${label}的 type 无效`);
    }
    if (typeof item.category !== 'string' || !item.category.trim()) {
      throw new Error(`数据源格式错误：${label}缺少有效分类`);
    }
    if (item.tags !== undefined && (!Array.isArray(item.tags) || item.tags.some((tag) => typeof tag !== 'string'))) {
      throw new Error(`数据源格式错误：${label}的 tags 必须是字符串数组`);
    }
    if (item.images !== undefined && (!Array.isArray(item.images) || item.images.some((image) => typeof image !== 'string'))) {
      throw new Error(`数据源格式错误：${label}的 images 必须是字符串数组`);
    }
    for (const field of OPTIONAL_TEXT_FIELDS) {
      if (item[field] !== undefined && item[field] !== null && typeof item[field] !== 'string') {
        throw new Error(`数据源格式错误：${label}的 ${field} 必须是文本`);
      }
    }
  });

  return data;
}

function normalizeStringList(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(/[,\uff0c]/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeImageList(value) {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }
  return typeof value === 'string' && value.trim() ? [value.trim()] : [];
}

export function normalizeImportedItems(records) {
  const seenIds = new Set();
  const items = [];
  let invalidCount = 0;

  records.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || typeof raw.title !== 'string' || !raw.title.trim()) {
      invalidCount += 1;
      return;
    }

    let id = typeof raw.id === 'string' && raw.id.trim()
      ? raw.id.trim()
      : `import-${Date.now()}-${index}`;
    while (seenIds.has(id)) id = `${id}-${index}`;
    seenIds.add(id);

    const type = VALID_TYPES.has(raw.type) ? raw.type : 'style';
    const category = typeof raw.category === 'string' && raw.category.trim()
      ? raw.category.trim()
      : (type === 'skill' ? '开源 Skill' : type === 'tool' ? '设计工具' : '未分类');

    const normalized = {
      ...raw,
      id,
      title: raw.title.trim(),
      type,
      category,
      tags: normalizeStringList(raw.tags),
      images: normalizeImageList(raw.images)
    };

    for (const field of OPTIONAL_TEXT_FIELDS) {
      if (normalized[field] !== undefined && normalized[field] !== null && typeof normalized[field] !== 'string') {
        normalized[field] = '';
      }
    }
    items.push(normalized);
  });

  return { items, invalidCount };
}
