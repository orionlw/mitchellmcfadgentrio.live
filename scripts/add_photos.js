const fs = require("fs");
const path = require("path");

const IMG_DIR = path.join(__dirname, "../src/static/img/conner");
const OUTPUT_DIR = path.join(__dirname, "../src/photos");

const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

fs.readdirSync(IMG_DIR).forEach((file) => {
  const ext = path.extname(file).toLowerCase();
  if (!validExtensions.includes(ext)) return;

  const baseName = path.basename(file, ext);
  const mdFile = path.join(OUTPUT_DIR, `${baseName}.md`);
  const imgPath = `/static/img/conner/${file}`;

  const mdContent = `---
title: ""
image: "${imgPath}"
description: "Photo credit: Conner Morrison"
---
`;

  fs.writeFileSync(mdFile, mdContent);
  console.log(`Created: ${mdFile}`);
});

console.log("All Conner photos processed.");
