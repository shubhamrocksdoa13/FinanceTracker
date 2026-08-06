// One-off generator for the PWA/manifest icon PNGs in public/icons/.
// Run with: node scripts/generate-icons.mjs
//
// These are separate from src/app/icon.tsx / apple-icon.tsx (which Next
// renders on request for the browser-tab favicon and iOS home-screen icon).
// The manifest needs real static files at fixed sizes/purposes, so they're
// pre-rendered once here rather than served dynamically.
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og.js";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");
await mkdir(outDir, { recursive: true });

const BG = "#0a0a0a";
const ACCENT = "#059669";

function mark({ size, padding, rounded }) {
  return {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BG,
        borderRadius: rounded ? size * 0.18 : 0,
      },
      children: {
        type: "div",
        props: {
          style: {
            width: size - padding * 2,
            height: size - padding * 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: ACCENT,
            color: "#ffffff",
            fontSize: (size - padding * 2) * 0.55,
            fontWeight: 700,
            fontFamily: "sans-serif",
          },
          children: "W",
        },
      },
    },
  };
}

async function render(name, size, { padding, rounded }) {
  const res = new ImageResponse(mark({ size, padding, rounded }), { width: size, height: size });
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(join(outDir, name), buf);
  console.log(`wrote ${name} (${buf.length} bytes)`);
}

// "any" purpose: safe to fill the whole square, so the mark can sit close to the edge.
await render("icon-192.png", 192, { padding: 16, rounded: true });
await render("icon-512.png", 512, { padding: 40, rounded: true });

// "maskable" purpose: Android may crop to a circle/squircle, so keep the mark
// inside the ~80% safe zone and let the background fill the full canvas.
await render("icon-maskable-512.png", 512, { padding: 96, rounded: false });
