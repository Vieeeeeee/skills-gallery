#!/bin/bash
# 紧急一键数据回滚脚本
set -e
echo "🛡️ 正在执行黄金数据回滚..."
cp backups/skills_data_master_gold.json public/skills_data.json

# 结构校验必须过：回滚的目的是恢复一个能跑的站，推一份结构坏掉的数据只会雪上加霜。
echo "🔍 正在校验回滚后的数据结构..."
npm run validate:data

# 链接探活只警告、不阻断：紧急回滚时不该被几条失效仓库卡住。
# 注意黄金副本是首发时的快照，含 2026-09-04 上线前审查中删掉的 4 条死链 skill
# （skill-017/032/044/045），回滚会把它们一并请回来 —— 救完火记得再处理一次。
echo "🔗 正在探活链接（仅提示，不阻断回滚）..."
node scripts/validate_data.js --check-links || echo "⚠️  上面列出的失效链接会随本次回滚回到线上，救火结束后请补一次清理。"

echo "📦 正在重新构建生产包..."
npm run build
echo "☁️ 正在重新发布至 Cloudflare Pages..."
npx wrangler pages deploy dist --project-name skills-gallery
echo "✅ 回滚成功！公网数据已恢复为黄金主版本（含上面提示的失效链接，请择期清理）。"
