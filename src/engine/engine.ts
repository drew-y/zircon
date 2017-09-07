import Handlebars = require("handlebars");
import Remarkable = require("remarkable");

export class Engine {
  private readonly md = new Remarkable();
  private readonly bars = Handlebars.create();
  private readonly layouts: { [name: string]: HandlebarsTemplateDelegate } = {};

  constructor(opts: {
    partials: { name: string, partial: string }[],
    helpers: { name: string, fn: Function }[],
    layouts: { name: string, body: string}[]
  }) {
    opts.partials.forEach(partial => this.bars.registerPartial(partial.name, partial.partial));
    opts.helpers.forEach(helper => this.bars.registerPartial(helper.name, helper.fn));
    opts.layouts.forEach(layout => this.layouts[layout.name] = this.bars.compile(layout.body));
  }
}