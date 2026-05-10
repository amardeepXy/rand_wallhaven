import { execFile, spawn } from "child_process";

import { WALLPAPER_ENGINE, WALLPAPER_ENGINE_DAEMON } from "../wallhaven.js";

function isSwwwDaemonRunning() {
  return new Promise((res, rej) => {
    execFile(WALLPAPER_ENGINE, ["query"], (err, stdout) => {
      if (err) return rej(false);
      if (!stdout || stdout.trim() == "") {
        return rej(false);
      }

      return res(true);
    })
  });
};


function startSwwwDaemon() {
  return new Promise((res, rej) => {
    spawn(WALLPAPER_ENGINE_DAEMON, err => {
      if (err) return rej(err);
      return res("awww daemon started");
    }).unref()
  })
}


function isSwwwConfigured() {
  return new Promise((res, rej) => {

    // check if awww is installed
    execFile(WALLPAPER_ENGINE, ["--version"], (err) => {
      if (err && err.code === "ENOENT") {
        return rej("awww is not installed on your system. Install it!");
      } else if (err) {
        return rej(`${err} \n Report on github with the error message`);
      }
      // res(stdout.trim());

    });

    // check if awww-daemon is installed
    execFile(WALLPAPER_ENGINE_DAEMON, ["--version"], (err, stdout) => {
      if (err && err.code === "ENOENT") {
        return rej("awww-daemon is not installed  on your system. Install swww properly!");
      } else if (err) {
        return rej(`${err} \n Report on github with the error message`);
      }

      res(true);

    })
  });
}

async function ensureSwww() {
  let isConfigured;
  let isDaemonRunning;
  try {
    // Check if awww is installed on system
    isConfigured = await isSwwwConfigured();
  } catch (err) {
    console.error(err, "Report the error on github with message");
    return process.exit(1);
  }

  try {
    // Check if swww-daemon is running 
    isDaemonRunning = await isSwwwDaemonRunning();
  } catch (err) {
    isDaemonRunning = false
  }

  console.log({ isDaemonRunning, isConfigured });
  if (isDaemonRunning && !!isConfigured) return true;

  console.log("loggic error");
  try {
    isDaemonRunning = await startSwwwDaemon()
  } catch (error) {

    return process.exit(1);
  }

}



export { ensureSwww };


