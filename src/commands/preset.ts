import type { Command } from "commander";
import { applyPreset, listPresets, savePreset, presetsRoot } from "../lib/preset.js";

export function registerPresetCommand(program: Command): void {
  const preset = program.command("preset").description("Save and reuse overlay/config across projects");

  preset
    .command("save")
    .description("Save this project's overlay, config.env and map.md as a reusable preset")
    .argument("<name>", "preset name")
    .action((name: string) => {
      const dir = savePreset(process.cwd(), name);
      console.log(`Saved preset "${name}" to ${dir}`);
    });

  preset
    .command("list")
    .description("List available presets")
    .action(() => {
      const presets = listPresets();
      if (presets.length === 0) {
        console.log(`No presets in ${presetsRoot()} yet. Create one with \`plumb preset save <name>\`.`);
        return;
      }
      for (const name of presets) console.log(name);
    });

  preset
    .command("apply")
    .description("Overwrite this project's overlay, config.env and map.md with a saved preset")
    .argument("<name>", "preset name")
    .action((name: string) => {
      try {
        const result = applyPreset(process.cwd(), name);
        console.log(`Applied preset "${name}": ${result.applied.join(", ") || "nothing to apply"}`);
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exitCode = 1;
      }
    });
}
