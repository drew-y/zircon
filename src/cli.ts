#! /usr/bin/env node

import program = require("commander");
import fs = require("fs-extra");
import { Engine } from "./engine";

const DEFUALT_INPUT_PATH = "./";
const DEFUALT_OUTPUT_PATH = "./site";

if (process.argv.length <= 2) {
  const engine = new Engine(DEFUALT_INPUT_PATH, DEFUALT_OUTPUT_PATH);
  engine.generate();
  process.exit(0);
}

program
  .version("0.0.1")
  .arguments("[input] [output]")
  .action((input: string, output?: string) => {
    const engine = new Engine(input, output || DEFUALT_OUTPUT_PATH);
    engine.generate();
  });

 program
  .version("0.0.1")
  .action((input: string, output?: string) => {
    const engine = new Engine(DEFUALT_INPUT_PATH, DEFUALT_OUTPUT_PATH);
    engine.generate();
  });

program
  .version("0.0.1")
  .command("init <destination>")
  .action((destination: string) => {
    fs.copy(__dirname + "/../example", destination);
  });


program.parse(process.argv);