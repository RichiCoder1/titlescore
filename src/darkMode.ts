import { parse } from "cookie";

const cookies = parse(document.cookie);
if (cookies["ts__colorMode"] == null) {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.cookie = "ts__colorMode=dark; path=/";
    document.documentElement.classList.add("dark");
  } else {
    document.cookie = "ts__colorMode=light; path=/";
    document.documentElement.classList.remove("dark");
  }
} else {
  if (cookies["ts__colorMode"] === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}
