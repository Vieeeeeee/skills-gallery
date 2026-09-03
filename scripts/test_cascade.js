
import { WORDS, REF_W, REF_H, ROW_Y, DASH_H, AXIS } from "../src/components/dash-cascade/params.js";

console.log("Words count:", WORDS.length);
const wordNames = ["PROMPT", "SKILLS", "WIBI"];
WORDS.forEach((grid, idx) => {
  console.log("--- Word:", wordNames[idx], "---");
  let segCount = 0;
  let minX = 999, maxX = -999;
  grid.forEach((row, rIdx) => {
    row.forEach(([x0, x1, lIdx, numLetters]) => {
      segCount++;
      if (x0 < minX) minX = x0;
      if (x1 > maxX) maxX = x1;
      if (x0 >= x1) console.error(`Invalid segment in row ${rIdx}: [${x0}, ${x1}]`);
    });
  });
  console.log(`Total segments: ${segCount}, X bounds: [${minX}, ${maxX}], Axis: ${AXIS}`);
});
