# Zircon Static Site Generator

A simple static site generator with a focus on markdown and handlebars

## Installation

Prerequisites:
- `Node v6+`

Install:
```bash
npm i -g zircon
```

## Quick Start

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

## Rules

- All site content goes into the `root/content` directory
  - The content directory exactly mirrors the final output directory (minus the static folder)
  - .md, .hbs, and .html files are compiled into html before they get moved to the output dir
  - All other files are copied into the output directory without modification
- Handlebars layouts go in the `root/layouts` directory
- Handlebars partials go in the `root/paritails` directory
- Handlebars helpers go in the helpers directory as `*.js`
  - Each file must export one funtion with `export =`
- The root directory must have a defaults.yml file with at least a `layout` property defined.
