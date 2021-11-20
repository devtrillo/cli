import * as fs from "fs/promises";
import { Command } from "commander";

import { greenLog } from "../../../utils";
import inquirer from "inquirer";
import { capitalize } from "lodash";

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
  const possibleDirectories = ["./src/components", "./components"];
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
};
const createFiles = async ({
  directory,
  componentName,
  isTypescript,
  isLegacy,
}: CreateFiles) => {
  const extension = isTypescript ? "ts" : "js";
  const capitalizedName = capitalize(componentName);
  const files = [
    {
      file: `index.${extension}`,
      content: `export {default as ${capitalizedName}} from './${capitalizedName}';`,
    },
    {
      file: `${capitalizedName}.${extension}x`,
      content: `${isLegacy ? 'import React from "react"' : ""}
import style from './${capitalizedName}.module.css'
const ${capitalizedName} = (props)=>{
  return <div>${componentName}</div>
}

export default ${capitalizedName}
    `,
    },
    //{ file: `${capitalizedName}.stories.${extension}`, content: `` },
    {
      file: `${componentName}.test.${extension}`,
      content: `import { render, screen } from "@testing-library/react";
import renderer from "react-test-renderer";

import ${capitalizedName} from "./${capitalizedName}";

describe("The ${capitalizedName} component", function () {
  it("should not change", function () {
    const tree = renderer.create(<${capitalizedName} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  it("should render a footer", function () {
    const { getByText } = render(<${capitalizedName} />);
    expect(getByText("${componentName}")).toBeInTheDocument();
  });
});
`,
    },
    { file: `${capitalizedName}.module.css`, content: `` },
  ];
  try {
    greenLog();
    const dirToSave = `${directory}/${capitalizedName}`;
    await fs.mkdir(dirToSave, { recursive: true });
    for (const { file, content } of files) {
      greenLog("Creating the file", `${directory}/${file}`);
      await fs.writeFile(`${dirToSave}/${file}`, content);
    }
    await fs.appendFile(
      `${directory}/index.${extension}`,
      `\n export * from "./${capitalizedName}";`
    );
  } catch (e) {
    console.error(e);
  }
};

type Options = {
  name?: string;
  typescript?: boolean;
  legacy?: boolean;
};

export const createComponent = program
  .command("create")
  .option("-n --name <name>", "name of the component")
  .option("-t --typescript ", "If i should create a typescript command")
  .option("-l --legacy ", "If I'm using a legacy version of React")
  .action(async (options: Options) => {
    greenLog("Creating a new react component...", JSON.stringify(options));
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
      };
      await createFiles(finalOptions);
    } catch (e) {
      console.error(e);
    }
  });
