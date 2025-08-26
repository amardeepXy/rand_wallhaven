var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// wallhaven.js
var import_https = __toESM(require("https"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_child_process = require("child_process");
var import_os = __toESM(require("os"), 1);
var WALLHAVEN_API = "https://wallhaven.cc/api/v1/search?sorting=random&categories=110&purity=110&atleast=1920x1080&ratios=16x9";
var WALLPAPER_PATH = import_os.default.homedir() + "/.wallhaven";
function createDownloadDir() {
  return new Promise((resolve, reject) => {
    import_fs.default.mkdir(WALLPAPER_PATH, (err) => {
      if (err) {
        console.error("Failed to create wallpaper download directory.");
        return reject(err);
      }
      console.log("Wallpaper download directory created.");
      resolve(WALLPAPER_PATH);
    });
  });
}
var wallPaperPath;
async function downloadImage(url) {
  let res = await fetch(url);
  if (!res) {
    throw new Error("Failed to fetch images, You can check your internet connection.");
  }
  res = await res.json();
  const randomNumber = Math.random() * 10;
  const randomImageUrl = res.data[Math.floor(randomNumber)].path;
  const imageName = randomImageUrl.split("/");
  const fullImagePath = WALLPAPER_PATH + "/" + imageName[imageName.length - 1];
  wallPaperPath = fullImagePath;
  const file = import_fs.default.createWriteStream(fullImagePath);
  return new Promise((resolve, rej) => {
    import_https.default.get(randomImageUrl, (response) => {
      if (response.statusCode !== 200) {
        rej(`Image download request responsed with status code ${statusCode}`);
        return;
      }
      const totalLength = parseInt(response.headers["content-length"], 10);
      let downloadedLength = 0;
      let lastPercentage = -1;
      response.on("data", (chunk) => {
        downloadedLength += chunk.length;
        const currentPercentage = Math.floor(downloadedLength / totalLength * 100);
        if (currentPercentage > lastPercentage) {
          console.log("Download progress: ", currentPercentage, "%");
          lastPercentage = currentPercentage;
        }
      });
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log("File downloaded");
        resolve(fullImagePath);
      });
    }).on("error", (err) => {
      import_fs.default.unlink(fullImagePath, () => {
        rej("Undoing file changes \n Error occured while sending request for download", err);
        return;
      });
    });
  });
}
async function saveWallPaper(path) {
  if (!path) {
    throw new Error("path must be provided, Please report issue on github for this");
  }
  console.log("Applying wallpaper");
  (0, import_child_process.exec)(`swaybg -i ${path}`).addListener("spawn", () => console.log("Wallpaper applied \u2714"));
}
async function main() {
  let downloadedImagePath;
  try {
    if (!import_fs.default.existsSync(WALLPAPER_PATH)) {
      await createDownloadDir();
    }
    downloadedImagePath = await downloadImage(WALLHAVEN_API);
    await saveWallPaper(downloadedImagePath);
  } catch (error) {
    if (downloadedImagePath) {
      import_fs.default.unlink(downloadedImagePath, (err) => {
        console.log("File download failed, Undoing changes...", err);
      });
    }
    console.log(error);
  }
}
main();
