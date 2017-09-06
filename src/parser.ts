import Remarkable = require("remarkable");
import YAML = require("yamljs");

const md = new Remarkable();

export interface ParserOutput {
  type: "Plugin" | "Markdown",
  value: object | string
}

function parseYAMLString(yaml: string): object {
  return YAML.parse(yaml.replace(/(\<{3,}|\>{3,})/gm, ""));
}

export function parse(burrito: string): ParserOutput[] {
  const yamlExtract = /\<{3,}[^(\>\>\>)]*\>{3,}/gm;
  const result: ParserOutput[] = [];

  let burritoStream = burrito;
  let regexResult: RegExpExecArray | null;
  while (regexResult = yamlExtract.exec(burritoStream)) {
    const start = regexResult.index;
    const end = yamlExtract.lastIndex;
    const markdown = md.render(burritoStream.slice(0, start));
    const yaml = parseYAMLString(burritoStream.slice(start, end));
    result.push({ type: "Markdown", value: markdown });
    result.push({ type: "Plugin", value: yaml });
    burritoStream = burritoStream.slice(end);
    yamlExtract.lastIndex = 0;
  }

  return result;
}
