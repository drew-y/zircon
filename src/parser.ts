import Remarkable = require("remarkable");
import YAML = require("yamljs");

const md = new Remarkable();

export interface ParserOutput {
  type: "Plugin" | "Markdown",
  value: object | string
}

const testStr = `
<<<<<<<<<<<<<<<<<<<<<<<
plugin: metadata
author: Drew Youngwerth
title: A Good Burrito
subtitle: Trust Me
date: 2017-9-5
>>>>>>>>>>>>>>>>>>>>>>>

This is a good burrito. It has these ingredients:
- Tortilla
- Chicken
- Salsa

<<<<<<<<<<<<<<<<<<<<<<<
plugin: rating
taste: 6
texture: 7
price: 8
presentation: 4
overall: 6
verdict: Edible
>>>>>>>>>>>>>>>>>>>>>>>
`;

function parseYAMLString(yaml: string): object {
  return YAML.parse(yaml.replace(/(\<{3,}|\>{3,})/gm, ""));
}

export function parse(burrito: string): ParserOutput[] {
  const yamlExtract = /\<{3,}[^(\>\>\>)]*\>{3,}/gm;
  const result: ParserOutput[] = [];

  let burritoStream = burrito;
  let regexResult: RegExpExecArray | null;
  while ((regexResult = yamlExtract.exec(burrito))) {
    const start = regexResult.index;
    const end = yamlExtract.lastIndex;
    result.push({
      type: "Markdown",
      value: md.render(burritoStream.slice(start))
    });
    result.push({
      type: "Plugin",
      value: parseYAMLString(burritoStream.slice(start, end))
    });
    burritoStream = burritoStream.slice(end);
  }

  return result;
}

console.log(parse(testStr));