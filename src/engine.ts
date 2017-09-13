import fs = require("fs-extra");
import Handlebars = require("handlebars");
import util = require("util");
import { walk } from "./loader";
import { Compiler } from "./compiler";
import { FSItem, FSItemType, Site } from "./definitions";

export class Engine {
  private readonly dir: FSItem[];
  private readonly compiler = new Compiler();

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

  private makeSiteDir() {
    fs.mkdir("./site", () => { });
  }

  private readDir() {
    let content: FSItem = {} as FSItem;
    for (const item of this.dir) {
      if (!(item.type === FSItemType.directory)) break;
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
          content = item;
          break;
        case "static":
          this.copyStatic(item);
          break;
        default:
          break;
      }
    }
  }

  generate() {
    this.makeSiteDir();
    this.readDir();
  }
}

new Engine().generate();
