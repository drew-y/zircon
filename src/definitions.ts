
export interface SiteFile {
  /** Any metadata coupled with the file */
  metadata: object;
  /** name of the file without extension */
  name: string;
  /** Absolute path of item */
  path: string;
  /** Filename with extension */
  fullname: string;
  /** Extension of the file */
  extension: string;
  /** Text content of the file without frontmatter */
  text: string;
  /** Copy the file without compiling it into a layout */
  copyWithoutCompile?: boolean;
  /** Path of the original file */
  sourcePath: string;
}

export interface SiteFolder {
  /** Name of the folder */
  name: string;
  /** Path of the folder */
  path: string;
  /** Files inside of the folder */
  files: SiteFile[];
  /** Subfolders */
  subfolders: SiteFolder[];
}

export interface HandlebarsFolderContext {
  name: string;
  path: string;
  subfolders: HandlebarsFolderContext[];
  pages: {
    path: string,
    text: string,
    metadata: { [key: string]: any };
  }[];
}

export interface HandlebarsContentContext {
  /** Metadata from the page frontmatter merged with defaults */
  metadata: { [key: string]: any };

  /** Path of the current page */
  path: string;

  /** Folder containing the current page */
  folder: HandlebarsFolderContext;

  /** The entire site */
  site: HandlebarsFolderContext;
}

export interface HandlebarsLayoutContext {
  /** Metadata from the page frontmatter merged with defaults */
  metadata: { [key: string]: any };

  /** Path of the current page */
  path: string;

  /** Content for the layout to display */
  content: string;

  /** Folder containing the current page */
  folder: HandlebarsFolderContext;

  /** The entire site */
  site: HandlebarsFolderContext;
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
  fullname: string;
  /** If the item is a directory contents holds more FSItems */
  contents: FSItem[];
}
