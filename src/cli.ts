#! /usr/bin/env node

import program = require("commander");
import fs = require("fs-extra");
import chokidar = require("chokidar");
import { Engine } from "./engine";
import nodeStatic = require("node-static");
import http = require("http");

const DEFUALT_INPUT_PATH = "./";
const DEFUALT_OUTPUT_PATH = "./site";

let didExecuteSubCommand = false;

program
  .version(require("../package.json").version)
  .usage("[options] [input] [output]")
  .option("-S, --skip-static", "Skip copying the static directory")
  .description("Simple static site generation");

program
  .command("init <destination>")
  .description("Initialize a new site")
  .action((destination: string) => {
    console.log("Initializing...");
    fs.copySync(`${__dirname}/../default`, destination);
    didExecuteSubCommand = true;
  });

program
  .command("watch [input] [output]")
  .option("-s, --serve [port]", "Serve the output folder on port (8080 by default)")
  .option("-S, --skip-static", "Skip copying the static directory")
  .description("Watch the directory for file changes")
  .action((input?: string, output?: string, options?: any) => {
    const outPath = output || DEFUALT_OUTPUT_PATH;
    const inputPath = input || DEFUALT_INPUT_PATH;

    const engine = new Engine({
      inputPath, outPath,
      skipStatic: program.skipStatic
    });

    const watcher = chokidar.watch([
      `${inputPath}content/**`,
      `${inputPath}static/**`,
      `${inputPath}layouts/**`,
      `${inputPath}partials/**`,
      `${inputPath}defaults.yml`,
    ]);

    watcher
      .on("ready", () => console.log("Watching..."))
      .on("change", path => console.log(`File ${path} has been changed`))
      .on("change", (...args: any[]) => {
        console.log("Building...");
        engine.generate();
      });

    engine.generate();

    if (options.serve) {
      const port: number = typeof options.serve === "boolean" ? 8080 : options.serve;
      const folder = new nodeStatic.Server(outPath);
      http.createServer((req, res) => {
        req.addListener("end", () => folder.serve(req, res)).resume();
      }).listen(port);
      console.log(`Server now running on http://localhost:${port}`);
    }

    didExecuteSubCommand = true;
  });

program
  .command("build [input] [output]")
  .option("-S, --skip-static", "Skip copying the static directory")
  .description("Build the zircon site")
  .action((input?: string, output?: string, options?: any) => {
    console.log("Building...");
    const engine = new Engine({
      inputPath: input || DEFUALT_INPUT_PATH,
      outPath: output || DEFUALT_OUTPUT_PATH,
      skipStatic: options.skipStatic
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

