const fs = require("fs");
const path = require("path");
// If you're on Node.js <18, uncomment the next line and install node-fetch@2
// const fetch = require("node-fetch");

const API_KEY = "AIzaSyDrkhk2U9LO9fEpO43vrb2AHpIlB0QMh-U";
const PLAYLIST_ID = "PLTBfpswKxQYtc2H4gsZ2fCharGys28UMQ";
const OUTPUT_DIR = path.join(__dirname, "src/music");

async function fetchPlaylistItems(playlistId, pageToken = "") {
  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ""}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

function sanitizeFilename(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function formatDescription(description) {
  if (!description) return "";
  // If description is multi-line, use YAML block style
  if (description.includes("\n")) {
    // Indent each line by two spaces for YAML block
    return `|\n  ${description.replace(/\r?\n/g, "\n  ")}`;
  }
  return description;
}

async function main() {
  let pageToken = "";
  let count = 0;

  do {
    const data = await fetchPlaylistItems(PLAYLIST_ID, pageToken);
    for (const item of data.items) {
      const { title, description, resourceId } = item.snippet;
      const youtube_id = resourceId.videoId;
      const filename = sanitizeFilename(title) + ".md";
      const filePath = path.join(OUTPUT_DIR, filename);

      const md = `---
title: "${title.replace(/"/g, "'")}"
youtube_id: "${youtube_id}"
description: ${formatDescription(description)}
---
`;

      fs.writeFileSync(filePath, md);
      console.log(`Created: ${filePath}`);
      count++;
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  console.log(`Imported ${count} videos.`);
}

main().catch(console.error);
