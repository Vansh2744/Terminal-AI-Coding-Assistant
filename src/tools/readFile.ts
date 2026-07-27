import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const MAX_CHARS = 20_000;

export const readFile = tool(
  async ({ filePath }) => {
    const target = path.resolve(filePath);
    try {
      const content = await fs.readFile(target, "utf-8");
      if (content.length > MAX_CHARS) {
        return (
          content.slice(0, MAX_CHARS) +
          `\n\n[TRUNCATED — file is ${content.length} chars, showing first ${MAX_CHARS}]`
        );
      }
      return content;
    } catch (err: any) {
      return `Error reading file: ${err.message}`;
    }
  },
  {
    name: "read_file",
    description: "Read the full contents of a file at the given path.",
    schema: z.object({
      filePath: z.string().describe("Relative or absolute path to the file"),
    }),
  }
);