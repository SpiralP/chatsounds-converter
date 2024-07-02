const NODE_ENV = process.env.NODE_ENV || "development";

require("esbuild").buildSync({
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
  bundle: true,
  packages: "bundle",
  sourcemap: true,
  minify: NODE_ENV === "production",
  platform: "node",
  target: "node16",
  format: "cjs",
  external: ["express", "fluent-ffmpeg"],
  define: {
    "process.env.NODE_ENV": JSON.stringify(NODE_ENV),
  },
});
