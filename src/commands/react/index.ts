import { Command } from "commander";
import { createComponent } from "./create-component";

const program = new Command();

export const react = program.command("react").addCommand(createComponent);
