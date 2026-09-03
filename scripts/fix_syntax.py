
with open("src/components/sketchbook/spreadGenerator.js", "r", encoding="utf-8") as f:
    text = f.read()

text = text.replace("const cacheKey = \;", "const cacheKey = item.id + "_" + index + "_hd";")
text = text.replace("ctx.fillText(\, x, cy - 240);", "ctx.fillText("PLATE № " + plateNum + "  ·  " + catLabel, x, cy - 240);")
text = text.replace("ctx.font = \;", "ctx.font = "bold " + fontSize + "px \"KingHwaOldSong\", \"Songti SC\", \"STSong\", \"Newsreader\", serif";")
text = text.replace("const authorText = item.author ? \ : '开源社区';", "const authorText = item.author ? ('@' + item.author) : '开源社区';")
text = text.replace("const typeText = item.type === 'skill' ? '智能体技能' : (item.aspect_ratio ? \ : '视觉风格画赏');", "const typeText = item.type === 'skill' ? '智能体技能' : (item.aspect_ratio ? ('比例 ' + item.aspect_ratio) : '视觉风格画赏');")
text = text.replace("ctx.fillText(\, x, cy + 280);", "ctx.fillText(authorText + "  ·  " + typeText, x, cy + 280);")

with open("src/components/sketchbook/spreadGenerator.js", "w", encoding="utf-8") as f:
    f.write(text)
print("Syntax fixed successfully")
