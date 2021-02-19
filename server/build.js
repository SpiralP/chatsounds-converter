require("esbuild").buildSync({
  entryPoints: ["src/index.ts"],
  bundle: false,
  minify: true,
  sourcemap: true,
  platform: "node",
  target: ["node10"],
  format: "cjs",
  outfile: "dist/index.js",
});
