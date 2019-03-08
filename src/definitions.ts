export interface SiteFolder {
  /** Name of the site */
  name: string;
  /** Path of the site */
  path: string;
  /** Files inside of the site */
  files: {
    /** Any metadata coupled with the file */
    metadata: object,
    /** name of the file without extension */
    name: string,
    /** Absolute path of item */
    path: string,
    /** Filename with extension */
    base: string;
    /** Copy the file without compiling it into a layout */
    copyWithoutCompile?: boolean
  }[];
  /** Subsites */
  subFolders: SiteFolder[];
}

export enum FSItemType {
  directory = "Directory",
  file = "File"
}

export interface FSItem {
  /** Item is directory or file */
  type: FSItemType;
  /** Filename without extension */
  name: string;
  /** File extension */
  extension: string;
  /** Absolute path of item */
  path: string;
  /** Filename with extension */
  base: string;
  /** If the item is a directory contents holds more FSItems */
  contents: FSItem[];
}