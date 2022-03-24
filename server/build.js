require("esbuild").buildSync({
  entryPoints: ["src/index.ts"],
  bundle: false,
  minify: true,
  sourcemap: true,
  platform: "node",
  target: ["node16"],
  format: "cjs",
  outfile: "dist/index.js",
});
