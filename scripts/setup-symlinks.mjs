#!/usr/bin/env node
// Tự tạo lại 2 symlink root (motion-config.ts, motion-scene.tsx) sau mỗi lần
// `pnpm install` — symlink không lên được GitHub (xem .gitignore) nên phải
// tái tạo ở máy mới. Chạy tự động qua "postinstall", không cần làm tay.
import { existsSync, lstatSync, symlinkSync, unlinkSync } from "fs";
import { join } from "path";

const root = process.cwd();

const LINKS = [
  {
    link: "motion-config.ts",
    target: "src/features/editor/motion-config.ts"
  },
  {
    link: "motion-scene.tsx",
    target: "src/features/editor/player/items/motion-scene.tsx"
  }
];

for (const { link, target } of LINKS) {
  const linkPath = join(root, link);
  const targetPath = join(root, target);

  if (existsSync(linkPath)) {
    try {
      if (lstatSync(linkPath).isSymbolicLink()) continue; // đã có, bỏ qua
    } catch {
      // rơi xuống, thử tạo lại
    }
    unlinkSync(linkPath);
  }

  try {
    // "file" symlink type trên Windows không cần quyền admin đầy đủ như "dir"
    symlinkSync(targetPath, linkPath, process.platform === "win32" ? "file" : undefined);
    console.log(`✓ Symlink: ${link} -> ${target}`);
  } catch (err) {
    console.warn(`⚠ Không tạo được symlink "${link}": ${err.message}`);
    console.warn(
      "  Trên Windows: bật Developer Mode (Settings > Update & Security > For developers) " +
      "hoặc chạy lại lệnh cài đặt với quyền Administrator, sau đó chạy: node scripts/setup-symlinks.mjs"
    );
  }
}
