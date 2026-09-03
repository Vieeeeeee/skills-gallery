#!/bin/bash
# 紧急一键数据回滚脚本
set -e
echo "🛡️ 正在执行黄金数据回滚..."
cp backups/skills_data_master_gold.json public/skills_data.json
echo "📦 正在重新构建生产包..."
npm run build
echo "☁️ 正在重新发布至 Cloudflare Pages..."
npx wrangler pages deploy dist --project-name skills-gallery
echo "✅ 回滚成功！公网数据已完整恢复为标准纯净主版本。"
