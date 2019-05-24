import Handlebars = require("handlebars");
import { extractDocumentBodyAndMetadata } from "./parser";
import { HandlebarsLayoutContext, HandlebarsContentContext } from "../definitions";
import { md } from "./markdown";

type Metadata = { [key: string]: any };

export class Compiler {
  private readonly bars = Handlebars.create();
  private readonly layouts: { [name: string]: HandlebarsTemplateDelegate } = {};

  private mergeDefaultsWithPageMetadata(defaults: Metadata, metadata: Metadata): Metadata {
    return Object.assign({}, defaults, metadata);
  }

  private checkLayoutExists(layoutName: string) {
    if (!(this.layouts[layoutName] instanceof Function)) {
      throw new Error("Layout not found");
    }
  }

  /** Register a handlebars partial */
  registerPartial(name: string, partial: string) {
    this.bars.registerPartial(name, partial);
  }

  /** Register a handlebars helper */
  registerHelper(name: string, fn: Handlebars.HelperDelegate) {
    this.bars.registerHelper(name, fn);
  }

  /** Register a handlebars layout */
  registerLayout(name: string, body: string) {
    this.layouts[name] = this.bars.compile(body);
  }

  /**
   * Extract metadata from
   * Supported formats are .hbs, .html, and markdown
   */
  extractMetadata(opts: {
    document: string,
    defaults: object,
  }): {
    metadata: { [key: string]: any },
    body: string
  } {
    const { document, defaults } = opts;

    // Extract document body and metadata
    const parsed = extractDocumentBodyAndMetadata(document);

    // Merge document metadata with default metadata
    const metadata = this.mergeDefaultsWithPageMetadata(defaults, parsed.metadata);

    return { metadata, body: parsed.body };
  }

  compileSiteFile(context: HandlebarsContentContext): string {
    if (context.extension === ".md") {
      const hbs = md.render(context.text);
      return this.bars.compile(hbs)(context);
    }

    if (context.extension === ".hbs") {
      return this.bars.compile(context.text)(context);
    }

    return context.text;
  }

  /**
   * Takes an HTML file and compiles it
   * with the layout specified in the metadata
   * property.
   */
  insertCompiledContentIntoLayout(context: HandlebarsLayoutContext) {
    this.checkLayoutExists(context.metadata.layout);
    return this.layouts[context.metadata.layout](context);
  }
}
