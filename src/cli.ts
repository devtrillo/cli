#! /usr/bin/env node

import { Command } from "commander";
import { commitCommand, react } from "./commands";
import { customColor } from "./utils";

const program = new Command();

program
  .version("1.0.2")
  .addCommand(commitCommand)
  .addCommand(react)
  .addHelpText("beforeAll", () =>
    customColor(`
██████╗ ███████╗██╗   ██╗████████╗██████╗ ██╗██╗     ██╗      ██████╗
██╔══██╗██╔════╝██║   ██║╚══██╔══╝██╔══██╗██║██║     ██║     ██╔═══██╗
██║  ██║█████╗  ██║   ██║   ██║   ██████╔╝██║██║     ██║     ██║   ██║
██║  ██║██╔══╝  ╚██╗ ██╔╝   ██║   ██╔══██╗██║██║     ██║     ██║   ██║
██████╔╝███████╗ ╚████╔╝    ██║   ██║  ██║██║███████╗███████╗╚██████╔╝
╚═════╝ ╚══════╝  ╚═══╝     ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝ ╚═════╝

                     ██████╗██╗     ██╗
                    ██╔════╝██║     ██║
                    ██║     ██║     ██║
                    ██║     ██║     ██║
                    ╚██████╗███████╗██║
                     ╚═════╝╚══════╝╚═╝
`)
  );

program.parseAsync(process.argv);
