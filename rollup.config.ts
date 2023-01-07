import typescript from "@rollup/plugin-typescript";
import cleanup from "rollup-plugin-cleanup";

export default {
  input: "src/main.ts",
  output: {
    dir: "dist",
    format: "cjs",
  },
  external: ["express"],
  plugins: [typescript(), cleanup({ extensions: ["ts"] })],
};
