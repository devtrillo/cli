import { asyncShellCommand, logError } from "../../utils";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { get, trim } from "lodash";

const savedFileName = `${__dirname}/branches.json`;

export const riskOptions = ["low", "medium", "high"];

export const isTicketValid = (ticketNumber: number | string | undefined) => {
  if (!ticketNumber) return false;
  return ticketNumber.toString().length === 9;
};

export const isRiskValid = (risk: string) => riskOptions.indexOf(risk) !== -1;

export const getGitBranch = async () =>
  trim(await asyncShellCommand("git symbolic-ref --short HEAD"));

export const getWorkingBranches = () => {
  if (existsSync(savedFileName)) {
    return JSON.parse(readFileSync(savedFileName).toString());
  } else {
    writeFileSync(savedFileName, "{}");
    return {};
  }
};

export const saveBranchNumber = async (ticketNumber: string) => {
  if (!isTicketValid(ticketNumber))
    throw new Error("The ticket number is incorrect");
  const branches = getWorkingBranches();
  const gitBranch = await getGitBranch();
  console.log(gitBranch);
  branches[gitBranch] = ticketNumber;
  console.log(branches);
  writeFileSync(savedFileName, JSON.stringify(branches, null, 2));
};

export const updateTicketNumber = async (
  ticket: string | undefined,
  replace = false
) => {
  try {
    if (ticket && replace) await saveBranchNumber(ticket);
    const workingGitBranch = await getGitBranch();
    const savedBranch = get(getWorkingBranches(), workingGitBranch);
    return savedBranch
      ? savedBranch
      : workingGitBranch.match(/\d{9}/g)?.at(0);
  } catch (e) {
    return logError(e);
  }
};
