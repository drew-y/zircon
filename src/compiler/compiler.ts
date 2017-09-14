import Handlebars = require("handlebars");
import Remarkable = require("remarkable");
import hljs = require("highlight.js");
import { parse } from "./parser";
import { Site } from "../definitions";

function highlight(str: string, lang: string) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(lang, str).value;
    } catch (err) {}
  }

  try {
    return hljs.highlightAuto(str).value;
  } catch (err) {}

  return ''; // use external default escaping
}

export class Compiler {
  private readonly md = new Remarkable({ highlight, html: true });
  private readonly bars = Handlebars.create();
  private readonly layouts: { [name: string]: HandlebarsTemplateDelegate } = {};

  private mergeDefaultsWithPageMetadata(defaults: object, metadata: object): object {
    return Object.assign(metadata, defaults);
  }

  private checkLayoutExists(layoutName: string) {
    if (!(this.layouts[layoutName] instanceof Function))
      throw new Error("Layout not found");
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

  /** Interprets a burrito document */
  compile(document: string, defaults: object): {
    metadata: { [key: string]: any },
    body: string
  } {
    const parsed = parse(document);
    const metadata = this.mergeDefaultsWithPageMetadata(defaults, parsed.metadata);
    const body = this.md.render(this.bars.compile(parsed.body)(metadata));
    return { metadata, body };
  }

  /** Compiles a document to html */
  compileLayout(opts: {
    metadata: { [key: string]: any },
    site: Site,
    body: string
  }) {
    const { metadata, body, site } = opts;
    this.checkLayoutExists(metadata.layout);
    return this.layouts[metadata.layout]({
      content: body, metadata, site
    });
  }
}