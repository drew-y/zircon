import fs = require("fs");
import path = require("path");
import util = require("util");

export enum FSItemType {
  directory = "Directory",
  file = "File"
}

interface FSItem {
  /** Item is directory or file */
  type: FSItemType;
  /** Filename without extension */
  name: string;
  /** Relative directory of item */
  directory: string;
  /** Absolute directory of item */
  path: string;
  /** Filename with extension */
  base: string;
  /** If the item is a directory contents holds more FSItems */
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
        base: item,
        name: path.parse(item).name,
        directory: dir,
        path: path.resolve(location)
      });
      continue;
    }

    if (stats.isDirectory()) {
      fsItems.push({
        type: FSItemType.directory,
        base: item,
        name: path.parse(item).name,
        directory: dir,
        path: path.resolve(location),
        contents: walk(location)
      });
    }
  }

  return fsItems;
}
