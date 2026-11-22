// gta6-clipper-01 entrypoint.
// Copies VIDEO.json (the public YouTube Short address of the GTA VI clip)
// from the repository root into the grader's output directory.
// Node 22, standard library only. No network, no secrets.
import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

async function main(): Promise<void> {
  const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const source = join(botDir, "VIDEO.json");
  const target = join(outDir, "VIDEO.json");

  const raw = await readFile(source, "utf8");
  const data: unknown = JSON.parse(raw);
  if (typeof data !== "object" || data === null || typeof (data as { url?: unknown }).url !== "string") {
    throw new Error("VIDEO.json must be a JSON object with a string url");
  }
  const url = (data as { url: string }).url;
  const match = url.match(
    /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#].*)?$/,
  );
  if (match === null) {
    throw new Error(`VIDEO.json url is not a YouTube video address: ${url}`);
  }
  const videoId = match[1];
  await mkdir(outDir, { recursive: true });
  await copyFile(source, target);
  const info = await stat(target);
  console.log(`copied ${source} -> ${target}`);
  console.log(`video id: ${videoId} (${info.size} bytes)`);
}

main().catch((error: unknown) => {
  console.error(`main.ts failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
