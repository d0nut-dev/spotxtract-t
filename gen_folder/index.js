const fs = require("node:fs/promises");
const { getPlaylistData } = require("./spotify-module");
const object = require("./hierarchy.json");

const goTrough = async (item, depth, parent_folder = "plRoot_dir") => {
  let parent_subfolder;
  if (item.type === "folder") {
    if (item.name) {
      parent_subfolder = `${parent_folder}/d-${item.name}`;
      fs.mkdir(parent_subfolder);
      console.log(`${parent_subfolder} -- created`);
      depth++;
    }
    for (const child of item.children) {
      await goTrough(child, depth, parent_subfolder);
    }
  } else if (item.type === "playlist") {
    let pl_data = await getPlaylistData(item.uri).then((data) => data);
    if (pl_data.name) {
      item.name = pl_data.name;
      console.log(pl_data);
      await fs.mkdir(`${parent_folder}/${item.name}`);
      console.log(`${item.name} -- success`);
    } else {
      let pl_failed = `uri => ${item.uri}\n` + JSON.stringify(pl_data, null, 4);
      console.log(pl_failed);
      fs.appendFile("failed-uri", pl_failed);
    }
  }
  return item;
};

try {
  fs.mkdir("plRoot_dir");
  goTrough(object, 0).then((result) => {
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
