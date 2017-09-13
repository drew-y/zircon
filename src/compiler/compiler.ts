import Handlebars = require("handlebars");
import Remarkable = require("remarkable");
import { parse } from "./parser";

export class Compiler {
  private readonly md = new Remarkable();
  private readonly bars = Handlebars.create();
  private readonly layouts: { [name: string]: HandlebarsTemplateDelegate } = {};

  private mergeDefaultsWithPageMetadata(defaults: object, metadata: object): object {
    return Object.assign(defaults, metadata);
  }

  addPartial(name: string, partial: string) {
    this.bars.registerPartial(name, partial);
  }

  addHelper(name: string, fn: Function) {
    this.bars.registerHelper(name, fn);
  }

  addLayout(name: string, body: string) {
    this.layouts[name] = this.bars.compile(body)
  }

  compile(page: string, defaults: object): {
    metadata: object,
    body: string
  } {
    const parsed = parse(page);
    const metadata = this.mergeDefaultsWithPageMetadata(defaults, parsed.metadata);
    const body = this.md.render(this.bars.compile(parsed.body)(metadata));
    return { metadata, body };
  }
}