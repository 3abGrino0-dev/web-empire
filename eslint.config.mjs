import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["apps/mobile/**", "backup-media-tools-*/**", "patch/**"] },
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;
