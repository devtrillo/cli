import { Command } from "commander";
import inquirer from "inquirer";
import { capitalize, lowerCase } from "lodash";
import chalk from "chalk";

import {
  asyncShellCommand,
  greenLog,
  customColor,
  logError,
} from "../../utils";

import {
  isRiskValid,
  isTicketValid,
  riskOptions,
  updateTicketNumber,
} from "./utils";
import { MessageType } from "./types";

const program = new Command();

const commitCommand = program
  .command("commit")
  .option("-m --message <message>", "The message of the commit")
  .option("-r --risk <risk>", "The risk level of the commit")
  .option("-t --ticket <ticket>", "The ticket that are you working on")
  .option("-p --push", "Should push after the commit?")
  .option(
    "-f --replace",
    "In case you want to replace the commit in the branches",
    false
  )
  .addHelpText("before", () =>
    customColor("This utility command is to make simpler commit messages")
  )
  .addHelpText(
    "after",
    `
  In case you don't pass all the parameters

  it will display an ${chalk.green(
    "interactive form"
  )} to add the missing information to your commit
  `
  )
  .action(async (responses) => {
    console.log(
      customColor(`
     ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗████████╗
    ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║╚══██╔══╝
    ██║     ██║   ██║██╔████╔██║██╔████╔██║██║   ██║
    ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║
    ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║   ██║
     ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝   ╚═╝

██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗██████╗
██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝██╔══██╗
███████║███████║██╔██╗ ██║██║  ██║██║     █████╗  ██████╔╝
██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝  ██╔══██╗
██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═╝
                                                          `)
    );

    const { message, risk, ticket, replace } = responses;
    const ticketNumber = await updateTicketNumber(ticket, replace);
    const inquirerResponses = await inquirer.prompt([
      {
        name: "message",
        type: "input",
        message: "What is the commit message",
        when: () => !message,
      },
      {
        type: "input",
        name: "ticket",
        message: "What is the ticket number?",
        when: () => !isTicketValid(ticket) && !ticketNumber,
        validate: (input: string): boolean | string =>
          isTicketValid(input) ? true : "Please input a correct ticket number ",
      },
      {
        choices: riskOptions.map(capitalize),
        default: "low",
        message: "What is the risk level for this commit",
        name: "risk",
        type: "list",
        when: () => !isRiskValid(risk),
      },
    ]);
    try {
      const finalResponses: MessageType = {
        ...responses,
        ...inquirerResponses,
        ...(ticketNumber && { ticket: ticketNumber }),
      };
      await updateTicketNumber(finalResponses.ticket, true);
      await asyncShellCommand(
        `git commit -m "${finalResponses.message}" -m "[#${
          finalResponses.ticket
        }]" -m "[risk=${lowerCase(finalResponses.risk)}]"`
      );
      greenLog("The commit was created successfully");
      greenLog("(´・ω・)っ由");
      if (responses.push) {
        greenLog("I'm pushing your changes...");
        await asyncShellCommand("git push -u origin HEAD");
        greenLog("Your changes have been pushed");
      }
    } catch (e) {
      logError(e);
    }
  });
export default commitCommand;
