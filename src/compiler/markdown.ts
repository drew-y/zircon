import MarkdownIt = require("markdown-it");
import hljs = require("highlight.js");

// Syntax highlighter function for Remarkable
function highlight(str: string, lang: string) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(lang, str).value;
    } catch (err) {}
  }

  try {
    return hljs.highlightAuto(str).value;
  } catch (err) {}

  return ""; // use external default escaping
}

// Initialize remarkable
const md = new MarkdownIt({ highlight, html: true });
md.use(require("markdown-it-named-headings"));

export { md };
