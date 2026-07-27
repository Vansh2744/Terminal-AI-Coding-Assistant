import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import chalk from "chalk";
import { confirmAction } from "./permissionGate.js";

export const writeFile = tool(
  async ({ filePath, content }) => {
    const target = path.resolve(filePath);
    const preview = chalk.gray(
      content.length > 500 ? content.slice(0, 500) + "\n...[truncated preview]" : content
    );

    const ok = await confirmAction(`Write file: ${target}`, preview);
    if (!ok) return "User declined this action. File was not written.";

    try {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, content, "utf-8");
      return `File written successfully: ${target}`;
    } catch (err: any) {
      return `Error writing file: ${err.message}`;
    }
  },
  {
    name: "write_file",
    description:
      "Create a new file or overwrite an existing file with the given content. Requires user confirmation. Use edit_file instead if you only want to change part of an existing file.",
    schema: z.object({
      filePath: z.string().describe("Relative or absolute path to write to"),
      content: z.string().describe("Full content to write to the file"),
    }),
  }
);