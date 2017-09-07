import fs = require("fs");
import util = require("util");

enum FSItemType {
  directory = "Directory",
  file = "File"
}

interface FSItem {
  type: FSItemType;
  name: string;
  directory: string;
  contents: string | FSItem[];
}

export function walk(dir: string): FSItem[] {
  const fsItems: FSItem[] = [];
  const dirContents = fs.readdirSync(dir);

  for (const item of dirContents) {
    const location = dir + "/" + item;
    const stats = fs.lstatSync(location);
    if (stats.isFile()) {
      fsItems.push({
        type: FSItemType.file,
        name: item,
        directory: dir,
        contents: fs.readFileSync(location, { encoding: "utf8" })
      });
      continue;
    }

    if (stats.isDirectory()) {
      fsItems.push({
        type: FSItemType.directory,
        name: item,
        directory: dir,
        contents: walk(location)
      });
    }
  }

  return fsItems;
}