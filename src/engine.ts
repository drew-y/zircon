import fs = require("fs-extra");
import path = require("path");
import yaml = require("js-yaml");
import { walk } from "./loader";
import { Compiler } from "./compiler";
import { FSItem, FSItemType, SiteFolder, HandlebarsFolderContext } from "./definitions";
import { newSite } from "./helpers";
import { tmpdir } from "os";

const read = (path: string) => fs.readFileSync(path, "utf8");

export interface EngineOpts {
  inputPath: string;
  outPath: string;
  skipStatic?: boolean;
}

/**
 * The engine crawls a zircon site source passes the data to the compiler
 * and writes the compiled site to the outPath.
 */
export class Engine {
  private readonly dir: FSItem[];
  private readonly compiler = new Compiler();
  private readonly opts: EngineOpts;
  private site: SiteFolder = newSite("", "./");
  private readonly tempDir = `${tmpdir()}/zircon_${Date.now()}`;
  private defaults: { [key: string]: any } = {};

  constructor(opts: EngineOpts) {
    this.opts = opts;
    this.dir = walk(opts.inputPath);
  }

  /** The temp directory */
  private removeTempDir() {
    fs.remove(this.tempDir);
  }

  private isSupportedFile(extension: string) {
    return [".html", ".hbs", ".md"].includes(extension);
  }

  /** Read the layouts dir. Registering each layout with handlebars */
  private readLayout(item: FSItem) {
    item.contents.forEach(layout =>
      this.compiler.registerLayout(layout.name, read(layout.path)));
  }

  /** Read the partials dir. Registering each partial with handlebars */
  private readPartial(item: FSItem) {
    item.contents.forEach(partial =>
      this.compiler.registerPartial(partial.name, read(partial.path)));
  }

  /** Read the helpers dir. Registering each helper with handlebars */
  private readHelper(item: FSItem) {
    item.contents.forEach(helper =>
      this.compiler.registerHelper(helper.name, require(helper.path)));
  }

  /** Copy the static directory into the outPath */
  private copyStatic(item: FSItem) {
    fs.copySync(item.path, `${this.opts.outPath}/static`);
  }

  /** Copy a favicon directory into the outPath */
  private copyFavicon(item: FSItem) {
    fs.copySync(item.path, `${this.opts.outPath}/${item.filename}`);
  }

  /**
   * Crawl the content folder to generate the root SiteFolder.
   * To save RAM we copy raw files without the metadata to a temp
   * dir. Those files are later compiled with the entire SiteFolder
   * context by the writeSite function.
   */
  private readContent(
    content: FSItem,
    dir: string = this.opts.outPath,
    tempDir = this.tempDir
  ): SiteFolder {
    const site = newSite(content.name, dir);
    fs.mkdirpSync(tempDir);

    for (const item of content.contents) {
      const path = `${dir}/${item.filename}`;
      const tempPath = `${tempDir}/${item.filename}`;
      // If the item is a directory, recursively read it.
      if (item.type === FSItemType.directory) {
        site.subfolders.push(this.readContent(item, path, tempPath));
        continue;
      }

      // If the item is not a supported format, mark it to be copied on write
      if (!this.isSupportedFile(item.extension)) {
        site.files.push({
          metadata: {},
          copyWithoutCompile: true,
          extractedTextPath: "",
          name: item.name,
          filename: item.filename,
          absolutePath: path,
          sourcePath: item.path,
          extension: item.extension
        });
        continue;
      }

      // Extract the metadata from the file
      const document = this.compiler.extractMetadata({
        document: read(item.path),
        defaults: this.defaults
      });

      // Skip the file if it is marked with a skip
      if (document.metadata.skip === true) continue;

      // Write the document into a temp directory to be injected into it's layout later
      fs.writeFileSync(tempPath, document.body);

      site.files.push({
        metadata: document.metadata,
        extractedTextPath: tempPath,
        name: item.name,
        filename: item.filename,
        absolutePath: path,
        sourcePath: item.path,
        extension: item.extension
      });
    }

    return site;
  }

  private genContext(folder: SiteFolder): HandlebarsFolderContext {
    const pages = folder.files
      .map(item => ({
        path: item.absolutePath.replace(this.opts.outPath, ""),
        metadata: item.metadata,
        extractedTextPath: item.extractedTextPath,
        extension: item.extension
      }));
    const subfolders = folder.subfolders
      .map(item => this.genContext(item));
    return {
      name: folder.name,
      absolutePath: folder.absolutePath,
      path: folder.absolutePath.replace(this.opts.outPath, ""),
      pages, subfolders
    };
  }

  private writeSite(
    folder: SiteFolder,
    siteContext: HandlebarsFolderContext,
    dir: string = this.opts.outPath
  ) {
    fs.mkdirpSync(dir);

    for (const item of folder.files) {
      if (item.copyWithoutCompile) {
        fs.copySync(item.sourcePath, item.absolutePath);
        continue;
      }

      try {
        const context = {
          metadata: item.metadata,
          absolutePath: item.absolutePath,
          filename: `${item.name}.html`,
          path: item.absolutePath.replace(this.opts.outPath, ""),
          folder: this.genContext(folder),
          site: siteContext,
          extractedTextPath: item.extractedTextPath,
          extension: item.extension
        };

        const text = read(item.extractedTextPath);
        const content = this.compiler.compileSiteFile(text, context);

        const fullPage =
          this.compiler.insertCompiledContentIntoLayout({ ...context, content });

        fs.writeFileSync(`${dir}/${item.name}.html`, fullPage);
      } catch (error) {
        this.removeTempDir();

        throw new Error(`
          ${item.absolutePath}
          ${error.message}
        `);
      }
    }

    for (const item of folder.subfolders) {
      this.writeSite(item, siteContext, `${dir}/${item.name}`);
      continue;
    }

    return folder;
  }

  private readDefaults() {
    try {
      const defaults =
        yaml.load(read(path.resolve(this.opts.inputPath, "defaults.yml")));
      this.defaults = defaults || {};
    } catch (e) { console.log(e); }
  }

  private readSrcDir() {
    for (const item of this.dir) {
      switch (item.name) {
        case "layouts":
          this.readLayout(item);
          break;
        case "partials":
          this.readPartial(item);
          break;
        case "helpers":
          this.readHelper(item);
          break;
        case "content":
          this.site = this.readContent(item);
          break;
        case "static":
          if (!this.opts.skipStatic) this.copyStatic(item);
          break;
        case "favicon":
          this.copyFavicon(item);
          break;
        default:
          break;
      }
    }
  }

  generate() {
    fs.mkdirpSync(this.opts.outPath);
    this.readDefaults();
    this.readSrcDir();
    const siteContext = this.genContext(this.site);
    this.writeSite(this.site, siteContext);
    this.removeTempDir();
  }
}
