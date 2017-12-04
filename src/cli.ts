#! /usr/bin/env node

import program = require("commander");
import fs = require("fs-extra");
import chokidar = require("chokidar");
import { Engine } from "./engine";

const DEFUALT_INPUT_PATH = "./";
const DEFUALT_OUTPUT_PATH = "./site";

let didExecuteSubCommand = false;

program
  .version(require('../package.json').version)
  .usage("[options] [input] [output]")
  .description("Simple static site generation");

program
  .command("init <destination>")
  .description("Initialize a new site")
  .action((destination: string) => {
    console.log("Initializing");
    fs.copySync(__dirname + "/../example", destination);
    didExecuteSubCommand = true;
  });

program
  .command("watch [input] [output]")
  .option("-s, --skip-static", "Skip copying the static directory")
  .description("Watch the directory for file changes")
  .action((input?: string, output?: string) => {
    const outPath = output || DEFUALT_OUTPUT_PATH;
    const inputPath = input || DEFUALT_INPUT_PATH;

    const engine = new Engine({
      inputPath, outPath,
      skipStatic: program.skipStatic
    });

    const watcher = chokidar.watch([
      inputPath + "content/**",
      inputPath + "static/**",
      inputPath + "layouts/**",
      inputPath + "partials/**",
      inputPath + "defaults.yml",
    ]);

    watcher
      .on("ready", () => console.log("Watching..."))
      .on("change", path => console.log(`File ${path} has been changed`))
      .on("change", (...args: any[]) => {
        console.log("Building...");
        engine.generate();
      });

    engine.generate();
    didExecuteSubCommand = true;
  });

program
  .command("build [input] [output]")
  .option("-s, --skip-static", "Skip copying the static directory")
  .description("Build the burrito site")
  .action((input?: string, output?: string) => {
    console.log("Building...");
    const engine = new Engine({
      inputPath: input || DEFUALT_INPUT_PATH,
      outPath: output || DEFUALT_OUTPUT_PATH,
      skipStatic: program.skipStatic
    });
    engine.generate();
    didExecuteSubCommand = true;
  });

program.parse(process.argv);

// No command picked. Build by default.
if (!didExecuteSubCommand) {
  console.log("Building...");
  const engine = new Engine({
    inputPath: program.args[0] || DEFUALT_INPUT_PATH,
    outPath: program.args[1] || DEFUALT_OUTPUT_PATH,
    skipStatic: program.skipStatic
  });
  engine.generate();
}

