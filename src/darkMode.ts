import { parse } from "cookie";
import { createContext, useContext } from "react";

const cookies = parse(document.cookie);
let mode: "dark" | "light" = "light";
if (cookies["ts__colorMode"] == null) {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.cookie = "ts__colorMode=dark; path=/";
    document.documentElement.classList.add("dark");
    mode = "dark";
  } else {
    document.cookie = "ts__colorMode=light; path=/";
    document.documentElement.classList.remove("dark");
    mode = "light";
  }
} else {
  if (cookies["ts__colorMode"] === "dark") {
    document.documentElement.classList.add("dark");
    mode = "dark";
  } else {
    document.documentElement.classList.remove("dark");
    mode = "light";
  }
}

export const ColorModeContext = createContext(mode);

export function useColorMode() {
  return useContext(ColorModeContext);
}
