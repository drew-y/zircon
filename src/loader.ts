import fs = require("fs");
import path = require("path");
import { FSItemType, FSItem } from "./definitions";

export function walk(dir: string): FSItem[] {
  const fsItems: FSItem[] = [];
  const dirContents = fs.readdirSync(dir);

  for (const item of dirContents) {
    const location = dir + "/" + item;
    const stats = fs.lstatSync(location);
    if (stats.isFile()) {
      fsItems.push({
        type: FSItemType.file,
        base: item,
        name: path.parse(item).name,
        path: path.resolve(location),
        contents: []
      });
      continue;
    }

    if (stats.isDirectory()) {
      fsItems.push({
        type: FSItemType.directory,
        base: item,
        name: path.parse(item).name,
        path: path.resolve(location),
        contents: walk(location)
      });
    }
  }

  return fsItems;
}
