import { loadFont as loadHeading } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

const { fontFamily: headingFamily } = loadHeading("normal", {
  weights: ["500", "700"],
});
const { fontFamily: bodyFamily } = loadBody("normal", {
  weights: ["400", "500", "600"],
});

export const heading = headingFamily;
export const body = bodyFamily;

export const colors = {
  bg: "#08081a",
  bgDeep: "#04040d",
  surface: "#14142b",
  surfaceHi: "#1c1c3a",
  border: "#2a2a52",
  primary: "#6366f1",
  primaryGlow: "#818cf8",
  accent: "#22d3ee",
  good: "#22c55e",
  warn: "#f59e0b",
  bad: "#ef4444",
  text: "#f5f5fa",
  textMuted: "#a5a5c7",
  textDim: "#6b6b8c",
};