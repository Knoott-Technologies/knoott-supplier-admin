import {
  Source_Sans_3,
  Playfair_Display,
} from "next/font/google";

export const source = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const libre = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700", "800", "900"],
});
