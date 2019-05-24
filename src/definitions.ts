
export interface SiteFile {
  /** Any metadata coupled with the file */
  metadata: object;
  /** name of the file without extension */
  name: string;
  /** Absolute path of item */
  absolutePath: string;
  /** Filename with extension */
  filename: string;
  /** Extension of the file */
  extension: string;
  /** Absolute path to text content of the file without frontmatter */
  extractedTextPath: string;
  /** Copy the file without compiling it into a layout */
  copyWithoutCompile?: boolean;
  /** Path of the original file */
  sourcePath: string;
}

export interface SiteFolder {
  /** Name of the folder */
  name: string;
  /** Path of the folder */
  absolutePath: string;
  /** Files inside of the folder */
  files: SiteFile[];
  /** Subfolders */
  subfolders: SiteFolder[];
}

export interface HandlebarsFolderContext {
  name: string;
  absolutePath: string;
  /** Path relative to the root of the page */
  path: string;
  subfolders: HandlebarsFolderContext[];
  pages: {
    path: string,
    /** Absolute path to text content of the file without frontmatter */
    extractedTextPath: string,
    extension: string,
    metadata: { [key: string]: any };
  }[];
}

export interface HandlebarsContentContext {
  /** Metadata from the page frontmatter merged with defaults */
  metadata: { [key: string]: any };

  /** Path of the current page */
  absolutePath: string;

  /** Folder containing the current page */
  folder: HandlebarsFolderContext;

  /** filename with extension */
  filename: string;

  /** Path relative to the root of the page */
  path: string;

  /** Absolute path to text content of the file without frontmatter */
  extractedTextPath: string;

  /** Original unmodified extension of the content file */
  extension: string;

  /** The entire site */
  site: HandlebarsFolderContext;
}

export interface HandlebarsLayoutContext extends HandlebarsContentContext {
  /** Content for the layout to display */
  content: string;
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
  filename: string;
  /** If the item is a directory contents holds more FSItems */
  contents: FSItem[];
}
