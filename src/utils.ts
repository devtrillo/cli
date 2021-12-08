import chalk from "chalk";
import { exec, spawn } from "child_process";

export const greenLog = (...args: string[]) =>
  console.log(chalk.green(...args));
export const redLog = (...args: string[]) => console.log(chalk.red(...args));

export const asyncShellCommand = (command: string) =>
  new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(stderr);
      if (stdout) console.log(stdout);
      return resolve(stdout);
    });
  });
export const logError = (e: any) => {
  redLog("I wasn't able to create the commit properly");
  redLog("ლ(ಠ益ಠლ)");
  redLog("This is the reason why");
  redLog(e);
};
export const customColor = chalk.hex("#BFDBFE");
