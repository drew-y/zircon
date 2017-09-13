import YAML = require("yamljs");

type ParserOutput = { metadata: object, body: string };

function parseYAMLString(yaml: string): object | null {
  return YAML.parse(yaml.replace(/-{3,}/gm, ""));
}

function extractYAML(opts: { start: number, end: number, burrito: string }): ParserOutput {
  const metadata = parseYAMLString(opts.burrito.slice(opts.start, opts.end));
  return { body: opts.burrito.slice(opts.end).trim(), metadata: (metadata ? metadata : { }) };
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
