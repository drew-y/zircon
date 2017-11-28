#! /usr/bin/env node

import program = require("commander");
import fs = require("fs-extra");
import { Engine } from "./engine";

const DEFUALT_INPUT_PATH = "./";
const DEFUALT_OUTPUT_PATH = "./site";

program
  .version("0.0.1")
  .option("-s, --skip-static", "Skip copying the static directory")
  .usage("[options] [input] [output]")
  .description("Simple static site generation");

program
  .command("init <destination>")
  .description("Initialize a new site")
  .action((destination: string) => {
    console.log("Initializing");
    fs.copySync(__dirname + "/../example", destination);
    process.exit(0);
  });

program.parse(process.argv);

const engine = new Engine({
  inputPath: program.args[0] || DEFUALT_INPUT_PATH,
  outPath: program.args[1] || DEFUALT_OUTPUT_PATH,
  skipStatic: program.skipStatic
});
engine.generate();
