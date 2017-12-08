import Remarkable = require("remarkable");
import hljs = require("highlight.js");
const toc = require("markdown-toc");

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
const md = new Remarkable({ highlight, html: true });

// Register plugins
md
  // Add slugified id attribute to each header (Enables table of contents)
  .use(function(remarkable: any) {
    remarkable.renderer.rules.heading_open = function(tokens: any, idx: any) {
      return `<h${tokens[idx].hLevel} id=${toc.slugify(tokens[idx + 1].content)} >`;
    };
  });

export { md };
