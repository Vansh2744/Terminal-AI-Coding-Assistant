import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import chalk from "chalk";
import { diffLines } from "diff";
import { confirmAction } from "./permissionGate.js";

export const editFile = tool(
  async ({ filePath, oldStr, newStr }) => {
    const target = path.resolve(filePath);
    let original: string;

    try {
      original = await fs.readFile(target, "utf-8");
    } catch (err: any) {
      return `Error reading file: ${err.message}`;
    }

    const occurrences = original.split(oldStr).length - 1;
    if (occurrences === 0) {
      return `Error: oldStr not found in ${target}. Make sure it matches exactly (including whitespace).`;
    }
    if (occurrences > 1) {
      return `Error: oldStr matches ${occurrences} times in ${target}. It must be unique — include more surrounding context.`;
    }

    const updated = original.replace(oldStr, newStr);

    const diffOutput = diffLines(original, updated)
      .map((part) => {
        const color = part.added ? chalk.green : part.removed ? chalk.red : chalk.gray;
        const prefix = part.added ? "+ " : part.removed ? "- " : "  ";
        return part.value
          .split("\n")
          .filter((l) => l.length > 0)
          .map((l) => color(prefix + l))
          .join("\n");
      })
      .join("\n");

    const ok = await confirmAction(`Edit file: ${target}`, diffOutput);
    if (!ok) return "User declined this action. File was not modified.";

    await fs.writeFile(target, updated, "utf-8");
    return `File edited successfully: ${target}`;
  },
  {
    name: "edit_file",
    description:
      "Replace an exact, unique block of text in an existing file with new text. oldStr must match exactly once — include enough surrounding lines to make it unique. Requires user confirmation.",
    schema: z.object({
      filePath: z.string().describe("Relative or absolute path to the file"),
      oldStr: z.string().describe("Exact existing text to replace (must be unique in file)"),
      newStr: z.string().describe("Text to replace it with"),
    }),
  }
);