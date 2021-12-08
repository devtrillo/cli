import { Command } from "commander";
import { asyncShellCommand, customColor, greenLog } from "../../utils";
import path from "path";

const program = new Command();

export const upgradeCommand = program
  .command("upgrade")
  .option("-s --save", "In case you have pending changes to the cli")
  .action(async (responses) => {
    console.log(
      customColor(`
██╗   ██╗██████╗  ██████╗ ██████╗  █████╗ ██████╗ ███████╗
██║   ██║██╔══██╗██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██╔════╝
██║   ██║██████╔╝██║  ███╗██████╔╝███████║██║  ██║█████╗
██║   ██║██╔═══╝ ██║   ██║██╔══██╗██╔══██║██║  ██║██╔══╝
╚██████╔╝██║     ╚██████╔╝██║  ██║██║  ██║██████╔╝███████╗
 ╚═════╝ ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝

                 ██████╗██╗     ██╗
                ██╔════╝██║     ██║
                ██║     ██║     ██║
                ██║     ██║     ██║
                ╚██████╗███████╗██║
                 ╚═════╝╚══════╝╚═╝
`)
    );
    console.log(await asyncShellCommand(`cd ${process.cwd()} && git pull`));
  });
