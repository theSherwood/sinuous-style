import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "./src/index.js",
    output: [
      {
        file: "dist/min.js",
        name: "sinuousStyle",
        format: "iife",
        globals: {
          sinuous: "S",
          ["sinuous/observable"]: "S",
        },
        compact: true,
        plugins: [terser()],
      },
    ],
  },
];
