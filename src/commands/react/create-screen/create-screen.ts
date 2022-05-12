import * as fs from "fs/promises";
import { Command } from "commander";
import inquirer from "inquirer";

import { greenLog } from "../../../utils";

const program = new Command();

const testForDirectory = async (directory: string) => {
  try {
    const isDirectory = (await fs.lstat(directory)).isDirectory();
    if (isDirectory) return directory;
    else return null;
  } catch (e) {
    return null;
  }
};
const getComponentsDirectory = async () => {
  const possibleDirectories = ["./src/screens", "./screens"];
  for (const directory of possibleDirectories) {
    const isCorrect = await testForDirectory(directory);
    if (isCorrect) return isCorrect;
  }
};

type CreateFiles = {
  directory: string;
  componentName: string;
  isTypescript: boolean;
  isLegacy: boolean;
  css: boolean;
};
const createFiles = async ({
  directory,
  componentName,
  isTypescript,
  isLegacy,
  css,
}: CreateFiles) => {
  const extension = isTypescript ? "ts" : "js";
  const files = [
    {
      file: `index.${extension}`,
      content: `export {default as ${componentName}} from './${componentName}';`,
    },
    {
      file: `${componentName}.${extension}x`,
      content: `${isLegacy ? 'import React from "react"' : ""}
${css ? "import style from './${componentName}.module.css'" : ""}
const ${componentName} = ()=>{
  return <div>${componentName}</div>
}

export default ${componentName}
    `,
    },
    //{ file: `${componentName}.stories.${extension}`, content: `` },
    {
      file: `${componentName}.test.${extension}x`,
      content: `import { render, screen } from "@testing-library/react";

import ${componentName} from "./${componentName}";

describe("The ${componentName} component", function () {
  it("should not change", function () {
    const {container} = render(<${componentName} />);
    expect(container).toMatchSnapshot();
  });
  it("should render a footer", function () {
    render(<${componentName} />);
    expect(screen.getByText("${componentName}")).toBeInTheDocument();
  });
});
`,
    },
  ];
  try {
    greenLog();
    const dirToSave = `${directory}/${componentName}`;
    await fs.mkdir(dirToSave, { recursive: true });
    if (css) files.push({ file: `${componentName}.module.css`, content: "" });
    for (const { file, content } of files) {
      greenLog("Creating the file", `${directory}/${file}`);
      await fs.writeFile(`${dirToSave}/${file}`, content);
    }
    await fs.appendFile(
      `${directory}/index.${extension}`,
      `\n export * from "./${componentName}";`
    );
  } catch (e) {
    console.error(e);
  }
};

type Options = {
  name?: string;
  typescript?: boolean;
  legacy?: boolean;
  css?: boolean;
};

export const createScreen = program
  .command("screen")
  .option("-n --name <name>", "name of the component")
  .option("-t --typescript ", "If i should create a typescript command")
  .option("-l --legacy ", "If I'm using a legacy version of React")
  .option("-c --css ", "With CSS")
  .action(async (options: Options) => {
    greenLog("Creating a new react screen...", JSON.stringify(options));
    try {
      const componentsFolder = await getComponentsDirectory();
      const inquirerResponses = await inquirer.prompt([
        {
          name: "name",
          type: "input",
          message: "What will be the component",
          when: () => !options.name,
        },
        {
          name: "directory",
          type: "input",
          message: "under which directory should I create the component",
          when: () => !componentsFolder,
        },
        {
          name: "options",
          type: "checkbox",
          message: "Please select the options that you need",
          when: () =>
            typeof options.typescript !== "boolean" ||
            typeof options.legacy !== "boolean",
          choices: [
            new inquirer.Separator(" = Custom options = "),
            { name: "typescript" },
            { name: "legacy" },
            { name: "with css" },
          ],
        },
        {
          name: "directory",
          type: "input",
          message: "under which directory should I create the component",
          when: () => !componentsFolder,
        },
      ]);
      const finalOptions: CreateFiles = {
        directory: componentsFolder || inquirerResponses.directory,
        componentName: options.name || inquirerResponses.name,
        isLegacy:
          options.legacy || inquirerResponses.options.includes("legacy"),
        isTypescript:
          options.typescript ||
          inquirerResponses.options.includes("typescript"),
        css: options.css || inquirerResponses.options.includes("with css"),
      };
      await createFiles(finalOptions);
    } catch (e) {
      console.error(e);
    }
  });
