import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "./src/scopeApi.js",
    output: [
      {
        file: "dist/min.js",
        name: "sinuousStyle",
        format: "iife",
        compact: true,
        plugins: [terser()]
      }
    ]
  }
];
