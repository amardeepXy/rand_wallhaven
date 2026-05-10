import os from "os";
import fs from "fs"
import { Command, Option } from "commander";

import { downloadImage, createDownloadDir } from "./wallhaven/client.js";
import { saveWallPaper } from "./utility/utility.js";
import { ensureSwww } from "./swww/swww.js";

export const WALLPAPER_ENGINE = "awww";
export const WALLPAPER_ENGINE_DAEMON = "awww-daemon";




const WALLHAVEN_API = "https://wallhaven.cc/api/v1/search?sorting=random&categories=110&purity=110&atleast=1920x1080&ratios=16x9";

// const WALLPAPER_PATH = "/home/username/.wallhaven" => download directory for wallpapers
const WALLPAPER_PATH = os.homedir() + "/.wallhaven";


const TRANSITION_TYPE = "simple | fade | left | right | top | bottom | wipe | grow | center | outer | random | wave".replaceAll("|", "").split("  ");

const program = new Command();
program
  .name("rand_wallhaven")
  .description("A command line tool to set random wallpapers using awww")
  .version("1.0.0")
  .addOption(new Option("--transition-type <TRANSITION_TYPE>", "Sets the type of transition. Default is 'grow', that fades into the new image").choices(TRANSITION_TYPE))
  .addOption(new Option("--transition-step <number>", "How fast the transition approaches the new image. default(10)"))
  .parse(process.argv);


const options = program.opts();

async function main() {
  console.log("Welcome user");
  let downloadedImagePath;
  try {
    await ensureSwww();
    console.log("awww ensured");
    // if wallpaper storage directory doesn't exist create it
    if (!fs.existsSync(WALLPAPER_PATH)) {
      await createDownloadDir(WALLPAPER_PATH);
    }
    console.log("wallpaper downloaded");
    downloadedImagePath = await downloadImage(WALLHAVEN_API, WALLPAPER_PATH);
    await saveWallPaper(downloadedImagePath, options);
  } catch (error) {
    if (downloadedImagePath) {
      fs.unlink(downloadedImagePath, err => {
        console.log("File download failed, Undoing changes...", err);
      })
    }
    console.log(error);
  }
}

main();
