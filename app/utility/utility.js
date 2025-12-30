import { exec } from "child_process";

export async function saveWallPaper(path, options) {
  if (!path) {
    throw new Error("path must be provided, Please report issue on github for this");
  }
  exec(`swww img ${path} --transition-fps 60 --transition-step ${options.transitionStep ?? 80} --transition-type ${options.transitionType ?? "random"}`)
    .addListener("spawn", () => console.log("Wallpaper applied ✔"))
    .addListener("error", err => console.log("Wallpaper failed to apply", err));
};


