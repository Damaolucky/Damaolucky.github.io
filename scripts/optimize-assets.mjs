import { stat } from "node:fs/promises";
import sharp from "sharp";

const media = new URL("../public/media/", import.meta.url);
const assets = [];

for (const name of ["hua-profile", "hua-profile-anime-clean"]) {
  for (const width of [256, 512, 768]) {
    const output = new URL(`${name}-${width}.webp`, media);
    await sharp(new URL(`${name}.png`, media).pathname)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 88, effort: 6 })
      .toFile(output.pathname);
    assets.push(output);
  }
}

for (const name of ["izumi-idle-sprite", "izumi-drag-sprite-v2", "izumi-turn-sprite", "izumi-reaction-sprite", "izumi-appearance-sprite"]) {
  const output = new URL(`${name}.webp`, media);
  await sharp(new URL(`${name}.png`, media).pathname)
    .webp({ lossless: true, effort: 6 })
    .toFile(output.pathname);
  assets.push(output);
}

const schoolMark = new URL("school-icons/sdu-96.webp", media);
await sharp(new URL("school-icons/sdu.png", media).pathname)
  .resize({ width: 96, height: 96, fit: "inside" })
  .webp({ lossless: true, effort: 6 })
  .toFile(schoolMark.pathname);
assets.push(schoolMark);

for (const asset of assets) {
  const { size } = await stat(asset);
  console.log(`${asset.pathname.split("/media/")[1]}: ${(size / 1024).toFixed(1)} KiB`);
}
