const NODE_ENV = process.env.NODE_ENV || "development";

require("esbuild").buildSync({
  entryPoints: ["src/index.tsx"],
  outdir: "dist",
  bundle: true,
  packages: "bundle",
  sourcemap: true,
  minify: NODE_ENV === "production",
  platform: "browser",
  target: "es2023",
  define: {
    "process.env.NODE_ENV": JSON.stringify(NODE_ENV),
  },
  loader: {
    ".eot": "file",
    ".svg": "file",
    ".ttf": "file",
    ".woff": "file",
    ".woff2": "file",
  },
});
