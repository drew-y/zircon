import Handlebars = require("handlebars");
import { extractDocumentBodyAndMetadata } from "./parser";
import { SiteFolder, FSItem, SiteFile } from "../definitions";
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

    return { metadata, body: parsed.body };
  }

  compileSiteFile({ root, content, text, local }: {
    root: SiteFolder,
    local: SiteFolder,
    content: SiteFile,
    text: string
  }): string {
    const metadata = content.metadata;

    // Just return the document if the file is already html
    if (content.extension === ".html") return text;

    // Compile any handlebars content within the document body
    let body = this.bars.compile(text)({ ...metadata, root, local });

    // Check to see if the file is .md if it is we need to compile the markdown
    if (content.extension === ".md") {
      body = md.render(body);
    }

    return body;
  }

  /**
   * Takes an HTML file and compiles it
   * with the layout specified in the metadata
   * property.
   */
  insertCompiledContentIntoLayout(opts: {
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
