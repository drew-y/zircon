import fs = require("fs-extra");
import path = require("path");
import yaml = require("js-yaml");
import { walk } from "./loader";
import { Compiler } from "./compiler";
import { FSItem, FSItemType, Site } from "./definitions";
import { newSite } from "./helpers";

const TEMP_DIR = "./temp-site";

export interface EngineOpts {
  inputPath: string;
  outPath: string;
  skipStatic?: boolean;
}

export class Engine {
  private readonly dir: FSItem[];
  private readonly compiler = new Compiler();
  private readonly opts: EngineOpts;
  private site: Site = newSite("", "./");
  private defaults: { [key: string]: any } = {};

  constructor(opts: EngineOpts) {
    this.opts = opts;
    this.dir = walk(opts.inputPath);
  }

  private isSupportedFile(extension: string) {
    return [".html", ".md", ".md"].indexOf(extension) !== -1;
  }

  /** Read the layouts dir. Registering each layout with handlebars */
  private readLayout(item: FSItem) {
    item.contents.forEach(layout => this.compiler.registerLayout(
      layout.name, fs.readFileSync(layout.path, "utf8")
    ));
  }

  /** Read the partials dir. Registering each partial with handlebars */
  private readPartial(item: FSItem) {
    item.contents.forEach(partial => this.compiler.registerPartial(
      partial.name, fs.readFileSync(partial.path, "utf8")
    ));
  }

  /** Read the helpers dir. Registering each helper with handlebars */
  private readHelper(item: FSItem) {
    item.contents.forEach(helper => this.compiler.registerHelper(
      helper.name, require(helper.path)
    ));
  }

  /** Copy the static directory into the outPath */
  private copyStatic(item: FSItem) {
    fs.copySync(item.path, `${this.opts.outPath}/static`);
  }

  /** Copy a favicon directory into the outPath */
  private copyFavicon(item: FSItem) {
    fs.copySync(item.path, `${this.opts.outPath}/${item.base}`);
  }

  /** The temp directory */
  private removeTempDir() {
    fs.remove(TEMP_DIR);
  }

  /**
   * Read the content directory into a temp directory,
   * compiling the raw file with helpers, and partials
   * as we go.
   */
  private readContent(content: FSItem, dir: string = TEMP_DIR): Site {
    const site = newSite(content.name, dir);
    fs.mkdirpSync(dir);

    for (const item of content.contents) {
      // If the item is a directory, recursively read it.
      if (item.type === FSItemType.directory) {
        site.subSites.push(this.readContent(item, `${dir}/${item.base}`));
        continue;
      }

      // If the item is not a supported format, mark it to be copied on write
      if (!this.isSupportedFile(item.extension)) {
        site.files.push({
          metadata: {}, name: item.name, path: item.path,
          copyWithoutCompile: true, base: item.base
        });
        continue;
      }

      // Compile the supported file into an html doc
      const document = this.compiler.compileRawDocToHTML({
        document: fs.readFileSync(item.path, "utf8"),
        defaults: this.defaults, item
      });

      // Skip the file if it is marked with a skip
      if (document.metadata.skip === true) continue;

      // Write the document into a temp directory to be injected into it's layout later
      fs.writeFileSync(`${dir}/${item.name}.html`, document.body);

      site.files.push({
        metadata: document.metadata,
        name: item.name,
        path: `${dir}/${item.name}.html`,
        base: item.base
      });
    }

    return site;
  }

  private writeSite(sitePiece: Site, dir: string = this.opts.outPath) {
    fs.mkdirpSync(dir);

    for (const item of sitePiece.files) {
      if (item.copyWithoutCompile) {
        fs.copySync(item.path, `${dir}/${item.base}`);
        continue;
      }

      try {
        const body = this.compiler.compileHTMLWithLayout({
          metadata: item.metadata, site: this.site,
          body: fs.readFileSync(item.path, "utf8")
        });

        fs.writeFileSync(`${dir}/${item.name}.html`, body);
      } catch (error) {
        this.removeTempDir();

        throw new Error(`
          ${item.path}
          ${error.message}
        `);
      }
    }

    for (const item of sitePiece.subSites) {
      this.writeSite(item, `${dir}/${item.name}`);
      continue;
    }

    return sitePiece;
  }

  private readDefaults() {
    try {
      const defaults =
        yaml.load(fs.readFileSync(path.resolve(this.opts.inputPath, "defaults.yml"), "utf8"));
        this.defaults = defaults || {};
    } catch (e) { console.log(e) }
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
    this.writeSite(this.site);
    this.removeTempDir();
  }
}
