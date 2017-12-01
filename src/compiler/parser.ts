import YAML = require("yamljs");

type ParserOutput = { metadata: object, body: string };

function parseYAMLString(yaml: string): object | null {
  return YAML.parse(yaml.replace(/-{3,}/gm, ""));
}

function extractYAML(opts: { start: number, end: number, burrito: string }): ParserOutput {
  const metadata = parseYAMLString(opts.burrito.slice(opts.start, opts.end));
  return { body: opts.burrito.slice(opts.end).trim(), metadata: (metadata ? metadata : { }) };
}

function findYAML(trimmedBurrito: string): { start: number, end: number } {
  const regex = /^-{3,}[^-]+-{3,}/g;
  const match = regex.exec(trimmedBurrito);
  if (!match) return { start: 0, end: 0 };
  return { start: match.index, end: regex.lastIndex };
}

export function extractDocumentBodyAndMetadata(burrito: string): ParserOutput {
  const trimmedBurrito = burrito.trim();
  const { start, end } = findYAML(trimmedBurrito);
  return extractYAML({ start, end, burrito: trimmedBurrito });
}
