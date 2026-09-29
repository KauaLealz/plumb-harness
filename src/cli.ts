#!/usr/bin/env node
import { Command } from "commander";
import { registerStatusCommand } from "./commands/status.js";

const program = new Command();

program
  .name("plumb")
  .description("Spec-driven development harness for AI coding agents")
  .version("0.1.0");

registerStatusCommand(program);

program.parseAsync(process.argv);
