const production = process.env.NODE_ENV === "production";

require("esbuild").buildSync({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  sourcemap: true,
  minify: production,
  platform: "node",
  target: "node16",
  format: "cjs",
  external: ["express", "ffmpeg-static", "fluent-ffmpeg", "@ffmpeg-installer"],
});
