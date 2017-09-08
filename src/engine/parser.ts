import YAML = require("yamljs");

interface MetaData {
  layout: string;
  [key: string]: any;
}

type ParserOutput = { metadata: MetaData, body: string };

function parseYAMLString(yaml: string): object | null {
  return YAML.parse(yaml.replace(/-{3,}/gm, ""));
}

function extractYAML(opts: { start: number, end: number, burrito: string }): ParserOutput {
  const metadata = parseYAMLString(opts.burrito.slice(opts.start, opts.end)) as { layout?: string, [key: string]: any } | null;
  if (metadata === null) throw new Error("Invalid yaml header");
  if (!(typeof metadata.layout === "string")) throw new Error("Layout property missing from yaml header");
  return { body: opts.burrito.slice(opts.end).trim(), metadata: metadata as MetaData };
}

export function parse(burrito: string): ParserOutput {
  const regex = /^-{3,}[^-]+-{3,}/g;
  const trimmedBurrito = burrito.trim();
  const match = regex.exec(trimmedBurrito);
  if (!match) throw new Error("Could not find yaml header");
  return extractYAML({
    start: match.index,
    end: regex.lastIndex,
    burrito: trimmedBurrito
  });
}
