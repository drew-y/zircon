#! /usr/bin/env node

import program = require("commander");
import fs = require("fs-extra");
import { Engine } from "./engine";

const DEFUALT_INPUT_PATH = "./";
const DEFUALT_OUTPUT_PATH = "./site";

program
  .version("0.0.1")
  .arguments("[input] [output]")
  .action((input?: string, output?: string) => {
    const engine = new Engine(input || DEFUALT_INPUT_PATH, output || DEFUALT_OUTPUT_PATH);
    engine.generate();
  });

program
  .version("0.0.1")
  .command("init <destination>")
  .action((destination: string) => {
    fs.copy(__dirname + "/../example", destination);
  });


program.parse(process.argv);