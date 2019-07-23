import yaml = require("js-yaml");

type ParserOutput = { metadata: object, body: string };

function parseYAMLString(yamlStr: string): object | null {
  return yaml.load(yamlStr.replace(/-{3,}/gm, ""));
}

function extractYAML(opts: { start: number, end: number, trimmedDoc: string }): ParserOutput {
  const metadata = parseYAMLString(opts.trimmedDoc.slice(opts.start, opts.end));
  return { body: opts.trimmedDoc.slice(opts.end).trim(), metadata: (metadata ? metadata : {}) };
}

function findYAML(trimmedDoc: string): { start: number, end: number } {
  const regex = /^(---).*?(---)/gs;
  const match = regex.exec(trimmedDoc);
  if (!match) return { start: 0, end: 0 };
  return { start: match.index, end: regex.lastIndex };
}

export function extractDocumentBodyAndMetadata(doc: string): ParserOutput {
  const trimmedDoc = doc.trim();
  return extractYAML({ ...findYAML(trimmedDoc), trimmedDoc });
}
