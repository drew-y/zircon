import fs = require("fs-extra");
import Handlebars = require("handlebars");
import util = require("util");
import { walk, FSItemType, FSItem } from "./loader";
import { Engine, EngineOptions } from "./engine";

interface DirectoryStructure {
  name: string;
  path: string;
  files: string[];
  subdirectories: DirectoryStructure[];
}

export class Generator {
  private readonly dir: FSItem[];
  private readonly opts: EngineOptions = {
    partials: [],
    helpers: [],
    layouts: []
  };
  private outDir: DirectoryStructure = this.newDirStructure("", "");

  constructor() {
    this.dir = walk("./example");
  }

  private addLayout(item: FSItem) {
    item.contents.forEach(layout => this.opts.layouts.push({
      name: layout.name,
      body: fs.readFileSync(layout.path, 'utf8')
    }));
  }

  private addPartial(item: FSItem) {
    item.contents.forEach(partial => this.opts.partials.push({
      name: partial.name,
      partial: fs.readFileSync(partial.path, 'utf8')
    }));
  }

  private addHelper(item: FSItem) {
    item.contents.forEach(helper => this.opts.helpers.push({
      name: helper.name,
      fn: require(helper.path)(Handlebars, { dir: this.dir })
    }));
  }

  private addStatic(item: FSItem) {
    fs.copySync(item.path, "./site/static");
  }

  private newDirStructure(name: string, path: string): DirectoryStructure {
    return {
      name, path,
      files: [],
      subdirectories: []
    };
  }

  private generateContentDirStructure(contentDirectory: FSItem, relDir?: string): DirectoryStructure {
    const dir = relDir ? relDir : "";

    const structure: DirectoryStructure = this.newDirStructure(contentDirectory.name, "");

    contentDirectory.contents.forEach(content => {
      if (content.type === FSItemType.directory) {
        structure.subdirectories.push(
          this.generateContentDirStructure(content, dir + "/" + content.name)
        );
        return;
      }

      structure.files.push(`${dir}/${content.name}.html`)
    });

    return structure;
  }

  private consumeContents(content: FSItem, engine: Engine, relDir?: string) {
    const dir = relDir ? relDir : "./site";
    if (content.contents) {
      content.contents.forEach(content => {
        if (content.type === FSItemType.directory) {
          fs.mkdir(dir + "/" + content.name)
          this.consumeContents(content, engine, dir + "/" + content.name);
          return;
        }

        const file = fs.readFileSync(content.path, "utf8");
        const html = engine.render(file, {
          path: `${dir}/${content.name}.html`,
          date: Date.now(),
          siteStructure: this.outDir
        });
        fs.writeFileSync(`${dir}/${content.name}.html`, html);
      })
    }
  }

  generate() {
    fs.mkdir("./site", () => {});

    let content: FSItem = {} as FSItem;
    for (const item of this.dir) {
      if (!(item.type === FSItemType.directory)) break;
      switch (item.name) {
        case "layouts":
          this.addLayout(item);
          break;
        case "partials":
          this.addPartial(item);
          break;
        case "helpers":
          this.addHelper(item);
          break;
        case "content":
          content = item;
          break;
        case "static":
          this.addStatic(item);
          break;
        default:
          break;
      }
    }

    const engine = new Engine(this.opts);
    this.outDir = this.generateContentDirStructure(content);
    this.consumeContents(content, engine);
  }
}

new Generator().generate();
