const fs = require("node:fs/promises");
const process = require("process");
const spawnSync = require("child_process").spawnSync;
const sleep = require("timers/promises").setTimeout;

const { getPlaylistData } = require("./spotify-module");
const hierarchy = require("./hierarchy.json");

const playlistDir = "playlists";

const getInfo = async (item) => {
  try {
    console.log("Attempting to fetch data...");
    let pl_data = await getPlaylistData(item.uri).then((data) => data);
    if (typeof pl_data !== "undefined") {
      console.log("Success.");
      return await pl_data;
    } else throw Error("No data.");
  } catch (err) {
    console.log(err.messaage);
    console.log("Data wasn't received.");
    console.log("Waiting for other attempt.");
    await sleep(10000, "Resuming.");
    return await getInfo(item);
  }
};

const goTrough = async (item, depth, parent_folder = playlistDir) => {
  let parent_subfolder;
  if (item.type === "folder") {
    if (item.name) {
      parent_subfolder = `${parent_folder}/d-${item.name}`;
      fs.stat(parent_subfolder).catch((err) => {
        if (err.message.includes("no such file or directory")) {
          fs.mkdir(parent_subfolder);
          console.log(`${parent_subfolder} -- created`);
        }
      });
      // console.log(`depth=${depth}`);
      depth++;
    }
    for (const child of item.children) {
      await goTrough(child, depth, parent_subfolder);
    }
  } else if (item.type === "playlist") {
    let pl_data = await getInfo(item);
    if (pl_data.name) {
      item.name = pl_data.name;
      console.log(pl_data.name);
      // console.log(pl_data.external_urls.spotify);
      // console.log(pl_data);
      // await fs.mkdir(`${parent_folder}/${item.name}`);
      const zspotifyProc = spawnSync(
        "zspotify",
        [
          "-cf",
          "/tmp/credentials.json",
          "-pl",
          `${pl_data.external_urls.spotify}`,
          "-md",
          `${parent_folder}/`,
        ],
        { stdio: "inherit" }
      );
      console.log(`\n${item.name} -- success\n`);
      let plImgPath = `${parent_folder}/${pl_data.name}`
        .replace(/['":?]/g, "")
        .trim();
      console.log("Fetching playlist's cover.");
      const pwd = process.cwd();
      // console.log(pwd);
      process.chdir(`${plImgPath}`);
      // console.log(process.cwd());
      // console.log(plImgPath);
      const wgetPlImg = spawnSync(
        "curl",
        [`${pl_data.images[0].url}`, "-o", "pl_cover.png"],
        { stdio: "inherit" }
      );
      process.chdir(pwd);
    } else {
      // let pl_failed = `uri => ${item.uri}\n` + JSON.stringify(pl_data, null, 4);
      let pl_failed = `{\n    "uri": "${item.uri}"\n    "name": "${pl_data.name}"\n    "href": "${pl_data.href}"\n}\n`;
      console.log(pl_failed);
      fs.appendFile("failed-uri", pl_failed);
    }
  }
  return item;
};

try {
  fs.stat(playlistDir).catch((err) => {
    if (err.message.includes("no such file or directory")) {
      fs.mkdir(playlistDir);
    }
  });
  goTrough(hierarchy, 0).then((result) => {
    const data = JSON.stringify(result, null, 4);
    fs.writeFile("hierarchy-mod.json", data, function (err) {
      if (err) {
        return console.log(err);
      }
      console.log("The file was saved!\n");
    });
    console.log(result);
  });
} catch (err) {
  console.err("There was an error:", err.message);
}
