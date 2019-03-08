import Handlebars = require("handlebars");
import { extractDocumentBodyAndMetadata } from "./parser";
import { SiteFolder, FSItem } from "../definitions";
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
   * Compile a document.
   * Supported formats are .hbs, .html, and markdown
   */
  compileRawDocToHTML(opts: {
    document: string,
    defaults: object,
    item: FSItem
  }): {
    metadata: { [key: string]: any },
    body: string
  } {
    const { document, defaults, item } = opts;

    // Extract document body and metadata
    const parsed = extractDocumentBodyAndMetadata(document);

    // Merge document metadata with default metadata
    const metadata = this.mergeDefaultsWithPageMetadata(defaults, parsed.metadata);

    // If the document if marked as skip return an empty string as the body
    if (metadata.skip) return { metadata, body: "" };

    // Just return the document if the file is already html
    if (item.extension === ".html") return { metadata, body: parsed.body };

    // Compile any handlebars content within the document body
    let body = this.bars.compile(parsed.body)(metadata);

    // Check to see if the file is .md if it is we need to compile the markdown
    if (item.extension === ".md") {
      body = md.render(body);
    }

    return { metadata, body };
  }

  /**
   * Takes an HTML file and compiles it
   * with the layout specified in the metadata
   * property.
   */
  compileHTMLWithLayout(opts: {
    metadata: { [key: string]: any },
    site: SiteFolder,
    body: string
  }) {
    const { metadata, body, site } = opts;
    this.checkLayoutExists(metadata.layout);
    return this.layouts[metadata.layout]({
      content: body, metadata, site
    });
  }
}
