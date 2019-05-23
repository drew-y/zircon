# <img src="docs/static/blue-gem.png" alt="" style="width: 22px"/> Zircon Static Site Generator

A simple static site generator with a focus on markdown and handlebars

- [<img src="docs/static/blue-gem.png" alt="" style="width: 22px"/> Zircon Static Site Generator](#img-src%22docsstaticblue-gempng%22-alt%22%22-style%22width-22px%22-zircon-static-site-generator)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
  - [Zircon Site Structure](#zircon-site-structure)
  - [Content](#content)
  - [Layouts](#layouts)
  - [Partials](#partials)
  - [Helpers](#helpers)
  - [Rules Overview](#rules-overview)
  - [Contexts](#contexts)
- [Tips](#tips)

# Installation

Prerequisites:
- `Node v6+`

Install:
```bash
npm i -g zircon
```

# Quick Start

```bash
# Make a folder for the your new site
mkdir my-new-site
cd my-new-site

# Initialize the site using zircon defaults
zircon init .

# Build the site
zircon . ./site

# Serve the site with your favorite static site server
http-server site
```

# Documentation

## Zircon Site Structure

- [content](#content) - Folder with all site content (Required)
- [layouts](#layouts) - Folder that holds all the layouts content can use (Required)
- [partials](#partials) - Folder that holds handlebars partials
- [helpers](#helpers) - Foldler that holds all handlebars helpers
- `static` - Folder that is copied into the build
- `favicon.ico` - The sites favicon
- `defaults.yml` - Acts as the default info in each content frontmatter

See the example in the [content](#content) section.


## Content

The content directory is the most important directory in a Zircon site. It is where
all the main content of your site goes. The final site output directly mirrors the
structure of this folder.

Detailed Rules:

- `.md` files are passed through a markdown compiler, followed by the handlebars
compiler.

- `.hbs and .md` Are processed by the handlebars compiler followed by the markdown
  compiler. Any handlebars expressions are given a context containing the following
  data:
  - The content frontmatter data merged with the data from defaults.yaml
  - A "root" object that decribes the entire site (see SiteFolder src/definitions.ts for interface)
  - A "local" object that decribes the directory the content file is in. (see SiteFolder src/definitions.ts for interface)

- `.hbs, .md, and .html` Are finally injected into the layout specified by either the
front matter or the `defaults.yml` file (if layout is not defined in front matter). Once
handlebars has finished compiling the file it is written to the output directory.

- `All other files` are coppied exactly as they are to the output dir.

Note. The "front matter" is a plain text metadata specified at the top of a content file
in yaml format and in between two sets of three dashes (`--- YAML ---`).

**Example:**

Site root:
```
- content
  - blog
    - exciting-news.md
    - update-12-7-17.md
    - first-post.md
  - about.md
  - support-us.hbs
  - index.html
- layouts
  - index.hbs
  - post.hbs
- partials
  - header.hbs
  - footer.hbs
- helpers
  - currentDate.js
- static
  - logo.png
- defaults.yml
- favicon.ico
```

Build command:
```bash
zircon . ./site
```

Final ./site:
```
- blog
  - exciting-news.html
  - update-12-7-17.html
  - first-post.html
- static
  - logo.png
- about.html
- support-us.html
- index.html
- favicon.ico
```

## Layouts

Layouts are handlebars files that define the layout of your content. They live
in the top level layouts folder. Every layout is passed a context with a
`content` property. This property contains the text content of the page the
layout is being used to render.

To learn more about the *.hbs (Handlebars) file syntax, visit [http://handlebarsjs.com/](http://handlebarsjs.com/).

## Partials

Partials are small pieces of html/hbs that can be included in a layout or content file.

To include a partial in a layout or content file use the following syntax:

```html
{{> partial_file_name}}
```

To learn more about partials, visit [http://handlebarsjs.com/partials.html](http://handlebarsjs.com/partials.html),

## Helpers

Helpers are javascript functions that can be called from a handlebars file to
generate html with a given set of parameters.

Each helpers file should export a single function like this:
```javascript
// currentDate.js

export = function currentDate() {
  const date = new Date();

  const months = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return day + ' ' + months[monthIndex] + ' ' + year;
}
```

The file is automatically registered with handlebars and can be accessed with its filename:
```html
<article>
  <span class="author">Drew Youngwerth</span>
  <span class="date">{{currentDate}}</span>
<article>

<!-- Renders to: -->

<article>
  <span class="author">Drew Youngwerth</span>
  <span class="date">12 December 2017</span>
<article>
```

Like partials, helpers can be accessed from both layouts and content files.

For more on handlebars helpers, visit [http://handlebarsjs.com/#helpers](http://handlebarsjs.com/#helpers).

## Rules Overview

- All site content goes into the `root/content` directory
  - The content directory exactly mirrors the final output directory (minus the static folder)
  - .md, .hbs, and .html files are compiled into html before they get moved to the output dir
  - All other files are copied into the output directory without modification
- Handlebars layouts go in the `root/layouts` directory (One level only)
- Handlebars partials go in the `root/paritails` directory (One level only)
- Handlebars helpers go in the helpers directory as `*.js` (One level only)
  - Each file must export one funtion with `export =`
- The root directory must have a defaults.yml file with at least a `layout` property defined.
- `favicon.ico` and static directories defined in the root are coppied into the build directory

## Contexts

Layouts and Content have access to handlebars contexts with the following
interface:

```typescript
export interface HandlebarsFolderContext {
  name: string;
  path: string;
  subfolders: HandlebarsFolderContext[];
  pages: {
    path: string,
    text: string,
    metadata: { [key: string]: any };
  }[];
}

export interface HandlebarsContentContext {
  /** Metadata from the page frontmatter merged with defaults */
  metadata: { [key: string]: any };

  /** Path of the current page */
  path: string;

  /** Folder containing the current page */
  folder: HandlebarsFolderContext;

  /** The entire site */
  site: HandlebarsFolderContext;
}

export interface HandlebarsLayoutContext {
  /** Metadata from the page frontmatter merged with defaults */
  metadata: { [key: string]: any };

  /** Path of the current page */
  path: string;

  /** Content for the layout to display */
  content: string;

  /** Folder containing the current page */
  folder: HandlebarsFolderContext;

  /** The entire site */
  site: HandlebarsFolderContext;
}
```

# Tips

- If you're not ready for a contents file to be included in the build
simply add `skip: true` to the YAML frontmatter at the top of the page.

Gem Icon by [Twemoji](http://twitter.github.io/twemoji/)
