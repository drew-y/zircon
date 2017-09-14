import fs = require("fs-extra");
import Handlebars = require("handlebars");
import YAML = require("yamljs");
import { walk } from "./loader";
import { Compiler } from "./compiler";
import { FSItem, FSItemType, Site } from "./definitions";
import { newSite } from "./helpers";

const TEMP_DIR = "./temp-site"

export class Engine {
  private readonly dir: FSItem[];
  private readonly compiler = new Compiler();
  private site: Site = newSite("", "./");
  private defaults = {};

  constructor() {
    this.dir = walk("./example");
  }

  private readLayout(item: FSItem) {
    item.contents.forEach(layout => this.compiler.addLayout(
      layout.name, fs.readFileSync(layout.path, 'utf8')
    ));
  }

  private readPartial(item: FSItem) {
    item.contents.forEach(partial => this.compiler.addPartial(
      partial.name, fs.readFileSync(partial.path, 'utf8')
    ));
  }

  private readHelper(item: FSItem) {
    item.contents.forEach(helper => this.compiler.addHelper(
      helper.name, require(helper.path)(Handlebars)
    ));
  }

  private copyStatic(item: FSItem) {
    fs.copySync(item.path, "./site/static");
  }

  private removeTempDir() {
    fs.remove(TEMP_DIR);
  }

  private readContent(content: FSItem, dir: string = TEMP_DIR): Site {
    const site = newSite(content.name, dir)
    fs.mkdirpSync(dir);
    for (const item of content.contents) {
      if (item.type === FSItemType.directory) {
        site.subSites.push(this.readContent(item, `${dir}/${item.base}`));
        continue;
      }
      const document = this.compiler.compile(
        fs.readFileSync(item.path, 'utf8'),
        this.defaults
      );
      fs.writeFileSync(`${dir}/${item.name}.html`, document.body);
      site.files.push({
        metadata: document.metadata,
        name: item.name,
        path: `${dir}/${item.name}.html`
      })
    }
    return site;
  }

  private writeSite(sitePiece: Site, dir: string = "./site") {
    fs.mkdirpSync(dir);
    for (const item of sitePiece.files) {
      const body = this.compiler.compileLayout({
        metadata: item.metadata, site: this.site,
        body: fs.readFileSync(item.path, 'utf8')
      })
      fs.writeFileSync(`${dir}/${item.name}.html`, body);
    }
    for (const item of sitePiece.subSites) {
      this.writeSite(item, `${dir}/${item.name}`);
      continue;
    }
    return sitePiece;
  }

  private readSrcDir() {
    for (const item of this.dir) {
      switch (item.name) {
        case "defaults":
          const defaults = YAML.parse(fs.readFileSync(item.path, "utf8"));
          this.defaults = defaults || {};
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
          this.copyStatic(item);
          break;
        default:
          break;
      }
    };
  }

  generate() {
    this.readSrcDir();
    this.writeSite(this.site);
    this.removeTempDir();
  }
}

new Engine().generate();
