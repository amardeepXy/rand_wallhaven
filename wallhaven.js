import https from "https";
import fs from "fs";
import { exec } from "child_process";

const WALLHAVEN_API = "https://wallhaven.cc/api/v1/search?sorting=random&categories=110&purity=110&atleast=1920x1080&ratios=16x9";
const WALLPAPER_PATH = "/home/amardeep/Pictures/Wallpapers";

let wallPaperPath;

async function downloadImage(url) {
  let res = await fetch(url);
  if (!res) {
    throw new Error("failed to fetch data");
  }

  res = await res.json();

  const randomNumber = Math.random() * 10;
  const randomImageUrl = res.data[Math.floor(randomNumber)].path;
  const imageName = randomImageUrl.split("/");
  const fullImagePath = WALLPAPER_PATH + "/" + imageName[imageName.length - 1];
  wallPaperPath = fullImagePath;

  const file = fs.createWriteStream(fullImagePath);

  return new Promise((resolve, rej) => {
    https.get(randomImageUrl, response => {
      if (response.statusCode !== 200) {
        rej(`Image download request responsed with status code ${statusCode}`);
        return;
      }

      const totalLength = parseInt(response.headers["content-length"], 10);

      let downloadedLength = 0;
      let lastPercentage = -1;

      response.on("data", (chunk) => {
        downloadedLength += chunk.length;
        const currentPercentage = Math.floor((downloadedLength / totalLength) * 100);

        if (currentPercentage > lastPercentage) {
          console.log("Download progress: ", currentPercentage, "%");
          lastPercentage = currentPercentage;
        }
      })

      response.pipe(file);

      file.on("finish", () => {
        file.close();
        console.log("File downloaded");
        resolve(fullImagePath);
      });

    }).on("error", err => {
      fs.unlink(fullImagePath, () => {
        rej("Undoing file changes \n Error occured while sending request for download", err);
        return;
      });
    })
  });

}

async function saveWallPaper(path) {
  console.log("Setting wallpaper");
  if (!path) {
    throw new Error("path must be provided");
  }


  exec(`swaybg -i ${path}`);
};

async function main() {
  let downloadedImagePath;
  try {
    downloadedImagePath = await downloadImage(WALLHAVEN_API);
    console.log(downloadedImagePath);
    await saveWallPaper(downloadedImagePath);
  } catch (error) {
    if (downloadedImagePath) {
      fs.unlink(downloadedImagePath, err => {
        console.log("File download failed, Undoing changes...");
      })
    }
    console.log(error);
  }
}

main();
