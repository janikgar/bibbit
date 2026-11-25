await Bun.build({
  entrypoints: [
    "./src/index.ts",
    "./src/cook.ts",
    "./search.ts",
  ],
  outdir: "./dist",
  sourcemap: "inline",
});
