import { asyncShellCommand, logError } from "../../utils";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { get, last, split, trim } from "lodash";
import { cyan } from "chalk";

const savedFileName = `${__dirname}/branches.json`;

export const riskOptions = ["low", "medium", "high"];

export const isTicketValid = (ticketNumber: number | string | undefined) => {
  if (!ticketNumber) return false;
  return ticketNumber.toString().length === 9;
};

export const isRiskValid = (risk: string) => riskOptions.indexOf(risk) !== -1;

export const getGitBranch = async () =>
  trim(await asyncShellCommand("git symbolic-ref --short HEAD"));

async function getProjectName() {
  const projectPath = split(
    trim(await asyncShellCommand("git rev-parse --show-toplevel")),
    "/"
  );

  return last(projectPath);
}

export function getWorkingBranches() {
  if (existsSync(savedFileName)) {
    return JSON.parse(readFileSync(savedFileName).toString());
  } else {
    writeFileSync(savedFileName, "{}");
    return {};
  }
}

export async function saveBranchNumber(ticketNumber: string) {
  if (!isTicketValid(ticketNumber))
    throw new Error("The ticket number is incorrect");
  const branches = getWorkingBranches();
  const gitBranch = `${await getProjectName()}-${await getGitBranch()}`;
  branches[gitBranch] = ticketNumber;
  writeFileSync(savedFileName, JSON.stringify(branches, null, 2));
}

export async function updateTicketNumber(
  ticket: string | undefined,
  replace = false
) {
  const ticketNumberRegex = /\d{1,9}/gm;
  try {
    if (ticket && replace) await saveBranchNumber(ticket);
    const workingGitBranch = await getGitBranch();
    const savedBranch = get(getWorkingBranches(), workingGitBranch);
    if (savedBranch) return savedBranch;
    const ticketNameInBranch =
      ticketNumberRegex.exec(workingGitBranch) || [][0];
    if (!ticketNameInBranch) {
      logError(new Error("there is no ticket in the branch name"));
      return null;
    }
    await saveBranchNumber(ticketNameInBranch);
    return ticketNameInBranch;
  } catch (e) {
    return logError(e);
  }
}
