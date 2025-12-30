import { execFile, spawn } from "child_process";

function isSwwwDaemonRunning() {
  return new Promise((res, rej) => {
    execFile("swww", ["query"], (err, stdout) => {
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
    spawn("swww-daemon", {
      detached: true,
      stdio: "ignore",
    }, err => {
      if (err) return rej(err);
      return res("swww daemon started");
    }).unref()
  })
}


function isSwwwConfigured() {
  return new Promise(res => {
    execFile("swww", ["--version"], (err, stdout) => {
      if (err && err.code === "ENOENT") {
        return rej("swww is not installed on your system. Install it!");
      }
      res(stdout.trim());

    });
    execFile("swww-daemon", ["--version"], (err, stdout) => {
      if (err && err.code === "ENOENT") {
        return rej("swww-daemon is not installed  on your system. Install swww properly!");
      }

      res(stdout.trim());

    })
  });
}

async function ensureSwww() {
  let isConfigured;
  let isDaemonRunning;
  try {
    isConfigured = await isSwwwConfigured();
  } catch (err) {
    return process.exit(1);
  }

  try {

    isDaemonRunning = await isSwwwDaemonRunning();
  } catch (err) {
    isDaemonRunning = false
  }

  if (!!isDaemonRunning && !!isConfigured) return true;

  try {
    isDaemonRunning = await startSwwwDaemon()
  } catch (error) {

    return process.exit(1);
  }

}



export { ensureSwww };


