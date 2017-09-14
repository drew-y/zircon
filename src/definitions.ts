export interface Site {
  name: string;
  path: string;
  files: {
    metadata: object,
    name: string,
    path: string
  }[];
  subSites: Site[];
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
  /** Absolute path of item */
  path: string;
  /** Filename with extension */
  base: string;
  /** If the item is a directory contents holds more FSItems */
  contents: FSItem[];
}