import https from "https";
import fs from "fs";

export function createDownloadDir(downloadDir) {
  return new Promise((resolve, reject) => {
    fs.mkdir(downloadDir, (err) => {
      if (err) {
        console.error("Failed to create wallpaper download directory.");
        return reject(err);
      }
      console.log("Wallpaper download directory created.")
      resolve(downloadDir);
    });
  })
};


let wallPaperPath;

export async function downloadImage(url, savingDir) {
  let res = await fetch(url);
  if (!res) {
    throw new Error("Failed to fetch images, You can check your internet connection.");
  }

  res = await res.json();

  const randomNumber = Math.random() * 10;
  const randomImageUrl = res.data[Math.floor(randomNumber)].path;
  const imageName = randomImageUrl.split("/");
  const fullImagePath = savingDir + "/" + imageName[imageName.length - 1];
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
          if (process.stdout.isTTY) {
            process.stdout.write(`\rDownload progress: ${currentPercentage}%`);
          }
          lastPercentage = currentPercentage;
        }
      })

      response.pipe(file);

      file.on("finish", () => {
        file.close();
        console.log("\nFile downloaded");
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

