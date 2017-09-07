import YAML = require("yamljs");

type ParserOutput = { metadata: object | null, body: string };

function parseYAMLString(yaml: string): object | null {
  try {
    return YAML.parse(yaml.replace(/-{3,}/gm, ""));
  } catch (error) {
    console.log("Error in YAML header:");
    console.log(yaml);
    return null;
  }
}

function extractYAML(opts: { start: number, end: number, burrito: string }): ParserOutput {
  return {
    body: opts.burrito.slice(opts.end).trim(),
    metadata: parseYAMLString(opts.burrito.slice(opts.start, opts.end))
  }
}

export function parse(burrito: string): ParserOutput {
  const regex = /^-{3,}[^-]+-{3,}/g;
  const trimmedBurrito = burrito.trim();
  const match = regex.exec(trimmedBurrito);
  if (match) {
    return extractYAML({
      start: match.index,
      end: regex.lastIndex,
      burrito: trimmedBurrito
    });
  }
  return { body: trimmedBurrito, metadata: null };
}

const test = `
--------------------------
title: How Does this work
author: Drew Youngwerth
rating: 5
--------------------------

# This is a title of markdown

Here's a list
- Hello
- World
- How

1. eggs
2. potatoes
3. tomatos

> Quote me!
`;

console.log(parse(test));
