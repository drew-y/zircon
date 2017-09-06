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
    const startYAML = regexResult.index;
    const endYAML = yamlExtract.lastIndex;
    const markdown = md.render(burritoStream.slice(0, startYAML));
    const yaml = parseYAMLString(burritoStream.slice(startYAML, endYAML));
    result.push({ type: "Markdown", value: markdown });
    result.push({ type: "Plugin", value: yaml });
    burritoStream = burritoStream.slice(endYAML);
    yamlExtract.lastIndex = 0;
  }

  return result;
}
