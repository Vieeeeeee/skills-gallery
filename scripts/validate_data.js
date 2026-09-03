#!/usr/bin/env node
/**
 * Data Schema & Integrity Validator for Skills Gallery
 * Usage: node scripts/validate_data.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_PATH = path.resolve(__dirname, '../public/skills_data.json');

console.log('🔍 正在校验数据完整性与格式规范...');
console.log(`📁 数据源文件: ${DATA_PATH}`);

if (!fs.existsSync(DATA_PATH)) {
  console.error(`❌ 错误: 未找到数据文件: ${DATA_PATH}`);
  process.exit(1);
}

let data;
try {
  const content = fs.readFileSync(DATA_PATH, 'utf-8');
  data = JSON.parse(content);
} catch (err) {
  console.error(`❌ 错误: JSON 解析失败!`, err.message);
  process.exit(1);
}

if (!Array.isArray(data) || data.length === 0) {
  console.error('❌ 错误: 数据必须是一个非空的 JSON 数组!');
  process.exit(1);
}

const errors = [];
const warnings = [];
const seenIds = new Set();
const stats = {
  total: data.length,
  styles: 0,
  skills: 0,
  tools: 0,
  categories: new Set(),
  tags: new Set(),
  authors: new Set()
};

data.forEach((item, index) => {
  const prefix = `[第 ${index + 1} 项 (ID: ${item.id || '未知'})]`;

  // 1. ID 检查
  if (item.id === undefined || item.id === null || String(item.id).trim() === '') {
    errors.push(`${prefix} 缺少必需字段: id`);
  } else {
    const idStr = String(item.id);
    if (seenIds.has(idStr)) {
      errors.push(`${prefix} 发现重复的 ID: "${idStr}"`);
    }
    seenIds.add(idStr);
  }

  // 2. 标题检查
  if (!item.title || typeof item.title !== 'string' || item.title.trim() === '') {
    errors.push(`${prefix} 缺少有效标题 title`);
  }

  // 3. 类型检查
  const validTypes = ['style', 'skill', 'tool'];
  if (!item.type || !validTypes.includes(item.type)) {
    errors.push(`${prefix} 类型 type 必须是 [${validTypes.join(', ')}] 之一，实际为: "${item.type}"`);
  } else {
    if (item.type === 'style') stats.styles++;
    else if (item.type === 'skill') stats.skills++;
    else if (item.type === 'tool') stats.tools++;
  }

  // 4. 分类检查
  if (!item.category || typeof item.category !== 'string') {
    errors.push(`${prefix} 缺少有效分类 category`);
  } else {
    stats.categories.add(item.category);
  }

  // 5. 内容主体检查 (prompt, command, description 至少有一个)
  const hasContent = Boolean(item.prompt || item.command || item.install_command || item.description);
  if (!hasContent) {
    errors.push(`${prefix} 必须包含 prompt、command、install_command 或 description 之一`);
  }

  // 6. 作者检查
  if (item.author) stats.authors.add(item.author);

  // 7. 标签检查
  if (item.tags) {
    if (!Array.isArray(item.tags)) {
      warnings.push(`${prefix} tags 建议为数组格式`);
    } else {
      item.tags.forEach(t => stats.tags.add(String(t).trim()));
    }
  }

  // 8. 图片数组检查
  if (item.images && !Array.isArray(item.images)) {
    warnings.push(`${prefix} images 建议为数组格式`);
  }
});

console.log('\n📊 数据健康度统计:');
console.log(`  • 收录总计: ${stats.total} 条`);
console.log(`  • 视觉风格: ${stats.styles} 款`);
console.log(`  • Agent 技能: ${stats.skills} 款`);
console.log(`  • 设计工具: ${stats.tools} 款`);
console.log(`  • 灵感分类: ${stats.categories.size} 个`);
console.log(`  • 检索标签: ${stats.tags.size} 个`);
console.log(`  • 收录创作者: ${stats.authors.size} 位`);

if (warnings.length > 0) {
  console.log(`\n⚠️ 发现 ${warnings.length} 条轻量告警 (非阻断):`);
  warnings.slice(0, 5).forEach(w => console.log('  ' + w));
  if (warnings.length > 5) console.log(`  ... 以及另外 ${warnings.length - 5} 条告警`);
}

if (errors.length > 0) {
  console.error(`\n❌ 数据校验未通过! 共发现 ${errors.length} 处阻断错误:`);
  errors.forEach(e => console.error('  ' + e));
  process.exit(1);
} else {
  console.log('\n✅ 恭喜！数据校验全部通过，结构 100% 规范符合开源标准！\n');
  process.exit(0);
}
