import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/WorkSans";

const { fontFamily: serifFamily } = loadSerif("normal", { weights: ["400"] });
const { fontFamily: sansFamily } = loadSans("normal", {
  weights: ["400", "500", "600", "700"],
});

export const serif = serifFamily;
export const sans = sansFamily;

export const c = {
  paper: "#f5f3ee",
  paperDeep: "#ece8df",
  ink: "#0d0d0d",
  inkSoft: "#4a463f",
  clay: "#c65a3e",
  good: "#3f7d58",
  line: "#d8d2c6",
};
