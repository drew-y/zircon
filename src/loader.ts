import fs = require("fs");
import path = require("path");
import { FSItemType, FSItem } from "./definitions";

export function walk(dir: string): FSItem[] {
  const fsItems: FSItem[] = [];
  const dirContents = fs.readdirSync(dir);

  for (const item of dirContents) {
    const location = `${dir}/${item}`;
    const stats = fs.lstatSync(location);
    if (stats.isFile()) {
      const parsedPath = path.parse(item);
      fsItems.push({
        type: FSItemType.file,
        base: item,
        name: parsedPath.name,
        extension: parsedPath.ext,
        path: path.resolve(location),
        contents: []
      });
      continue;
    }

    if (stats.isDirectory()) {
      const parsedPath = path.parse(item);
      fsItems.push({
        type: FSItemType.directory,
        base: item,
        name: parsedPath.name,
        extension: parsedPath.ext,
        path: path.resolve(location),
        contents: walk(location)
      });
    }
  }

  return fsItems;
}
