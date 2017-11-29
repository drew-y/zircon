#! /usr/bin/env node

import program = require("commander");
import fs = require("fs-extra");
import { Engine } from "./engine";

const DEFUALT_INPUT_PATH = "./";
const DEFUALT_OUTPUT_PATH = "./site";

program
  .version("0.0.1")
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

program
  .command("watch [input] [output]")
  .option("-s, --skip-static", "Skip copying the static directory")
  .description("Watch the directory for file changes")
  .action((input?: string, output?: string) => {
    console.log("watching")
    console.log(input);
    console.log(output);
    // const engine = new Engine({
    //   inputPath: input || DEFUALT_INPUT_PATH,
    //   outPath: output || DEFUALT_OUTPUT_PATH,
    //   skipStatic: program.skipStatic
    // });
    // engine.generate();
  });

program
  .command("build [input] [output]")
  .option("-s, --skip-static", "Skip copying the static directory")
  .description("Build the burrito site")
  .action((input?: string, output?: string) => {
    console.log("building")
    console.log(input);
    console.log(output);
    // const engine = new Engine({
    //   inputPath: input || DEFUALT_INPUT_PATH,
    //   outPath: output || DEFUALT_OUTPUT_PATH,
    //   skipStatic: program.skipStatic
    // });
    // engine.generate();
  });

program
  .command('*')
  .action(function() {
    console.log('Unknown Command: ' + program.args.join(' '))
    program.help()
  })

program.parse(process.argv);

