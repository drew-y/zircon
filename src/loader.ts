import fs = require("fs");
import path = require("path");

enum FSItemType {
  directory = "Directory",
  file = "File"
}

interface FSItem {
  type: FSItemType;
  name: string;
  directory: string;
  path: string;
  contents?: FSItem[];
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
        path: path.resolve(location)
      });
      continue;
    }

    if (stats.isDirectory()) {
      fsItems.push({
        type: FSItemType.directory,
        name: item,
        directory: dir,
        path: path.resolve(location),
        contents: walk(location)
      });
    }
  }

  return fsItems;
}
