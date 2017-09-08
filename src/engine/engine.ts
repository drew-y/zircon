import Handlebars = require("handlebars");
import Remarkable = require("remarkable");
import { parse } from "./parser";

export interface EngineOptions {
  partials: { name: string, partial: string }[];
  helpers: { name: string, fn: Function }[];
  layouts: { name: string, body: string}[];
}

export class Engine {
  private readonly md = new Remarkable();
  private readonly bars = Handlebars.create();
  private readonly layouts: { [name: string]: HandlebarsTemplateDelegate } = {};

  constructor(opts: EngineOptions) {
    opts.partials.forEach(partial => this.bars.registerPartial(partial.name, partial.partial));
    opts.helpers.forEach(helper => this.bars.registerPartial(helper.name, helper.fn));
    opts.layouts.forEach(layout => this.layouts[layout.name] = this.bars.compile(layout.body));
  }

  // private addBurritoHelper() {
  //   const self = this;
  //   this.bars.registerHelper('burrito', function(md: string) {
  //     return self.md.render(md);
  //   })
  // }

  render(page: string, api: object): string {
    const parsed = parse(page);
    parsed.metadata["burrito"] = api;
    const body = this.md.render(this.bars.compile(parsed.body)(parsed.metadata));
    return this.layouts[parsed.metadata.layout]({ body, data: parsed.metadata });
  }
}