#!/usr/bin/env node
/**
 * Downloads the portraits and avatars used in the Figma V2 mockups into /public/images.
 * Usage: FIGMA_TOKEN=xxxx npm run assets:figma
 * (Personal access token: Figma › Settings › Security › Personal access tokens, scope "file_content:read".)
 *
 * After download, set `photo` / `avatar` in src/lib/mock/data/{notices,users}.ts
 * (e.g. photo: "/images/people/esther-kabeya.jpg"). Components fall back to initials otherwise.
 */
import { mkdir, writeFile } from "node:fs/promises";

const FILE_KEY = "642AcLQYpjtd9CK62tjSx5";
const ASSETS = {
  "people/esther-kabeya.jpg": "27f571f07837935b7dc2fdb0f1a14bd4c857559c",
  "people/ruth-ngalula.jpg": "8fe7ad6b85c053224d98bfd7e680608c07f3c239",
  "avatars/macgenius.jpg": "bb37c0d80b097a885cf1c4ea4d9f1bac1c110278",
  "avatars/johnny-andedi.jpg": "fae4f82122c6cd28ba95abd620917706370cd08f",
  "avatars/rich-man-ali.jpg": "c7b8ccf6f83ec8f4d40b01b93dbd1798ba8fbeaf",
  "avatars/grace-lukusa.jpg": "2d145f8c92057afed5713aa1e67ba329253336f6",
  "avatars/patrick-ilunga.jpg": "05555dff3f0d5e8899976001c256237794d56b46",
};

const token = process.env.FIGMA_TOKEN;
if (!token) {
  console.error("FIGMA_TOKEN manquant. Exemple : FIGMA_TOKEN=xxxx npm run assets:figma");
  process.exit(1);
}

// GET /v1/files/:key/images returns a map imageRef → temporary download URL.
const res = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}/images`, { headers: { "X-Figma-Token": token } });
if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`);
const { meta } = await res.json();

for (const [path, ref] of Object.entries(ASSETS)) {
  const url = meta.images[ref];
  if (!url) {
    console.warn(`⚠ image ${ref} introuvable (${path})`);
    continue;
  }
  const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
  const target = new URL(`../public/images/${path}`, import.meta.url);
  await mkdir(new URL(".", target), { recursive: true });
  await writeFile(target, bytes);
  console.log(`✓ public/images/${path} (${Math.round(bytes.length / 1024)} Ko)`);
}
