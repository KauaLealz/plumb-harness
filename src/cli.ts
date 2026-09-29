#!/usr/bin/env node
import { Command } from "commander";
import { registerStatusCommand } from "./commands/status.js";
import { registerDiscoverCommand } from "./commands/discover.js";
import { registerScaffoldCommand } from "./commands/scaffold.js";
import { registerInitCommand } from "./commands/init.js";
import { registerDoctorCommand } from "./commands/doctor.js";
import { registerNewCommand } from "./commands/new.js";
import { registerMemCommand } from "./commands/mem.js";
import { registerBriefCommand } from "./commands/brief.js";
import { registerPresetCommand } from "./commands/preset.js";
import { registerSetupCommand } from "./commands/setup.js";
import { registerLogCommand } from "./commands/log.js";
import { registerStatsCommand } from "./commands/stats.js";
import { registerDreamDueCommand } from "./commands/dreamDue.js";
import { registerHooksCommand } from "./commands/hooks.js";
import { registerDreamCommand } from "./commands/dream.js";
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
registerMemCommand(program);
registerBriefCommand(program);
registerPresetCommand(program);
registerSetupCommand(program);
registerLogCommand(program);
registerStatsCommand(program);
registerDreamDueCommand(program);
registerHooksCommand(program);
registerDreamCommand(program);

program.parseAsync(process.argv);
