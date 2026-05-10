import { exec } from "child_process";

import { WALLPAPER_ENGINE } from "../wallhaven.js";

export async function saveWallPaper(path, options) {
  if (!path) {
    throw new Error("saveWallPaper function misused, Please report issue on github with error message");
  }
  exec(`${WALLPAPER_ENGINE} img ${path} --transition-fps 60 --transition-step ${options.transitionStep ?? 80} --transition-type ${options.transitionType ?? "random"}`)
    .addListener("spawn", () => console.log("Wallpaper applied ✔"))
    .addListener("error", err => console.log("Wallpaper failed to apply", err));
};


