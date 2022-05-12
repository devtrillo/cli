import { Command } from "commander";
import { createComponent } from "./create-component";
import { createScreen } from "./create-screen";

const program = new Command();

export const react = program
  .command("react")
  .addCommand(createComponent)
  .addCommand(createScreen);
