#!/usr/bin/env node
import { Command } from "commander";
import { registerStatusCommand } from "./commands/status.js";
import { registerDiscoverCommand } from "./commands/discover.js";
import { registerScaffoldCommand } from "./commands/scaffold.js";
import { registerInitCommand } from "./commands/init.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerNewCommand } from "./commands/new.js";
import { getPlumbVersion } from "./lib/version.js";

const program = new Command();

program
  .name("plumb")
  .description("Spec-driven development harness for AI coding agents")
  .version(getPlumbVersion());

registerStatusCommand(program);
registerDiscoverCommand(program);
registerScaffoldCommand(program);
registerInitCommand(program);
registerDoctorCommand(program);
registerNewCommand(program);

program.parseAsync(process.argv);
