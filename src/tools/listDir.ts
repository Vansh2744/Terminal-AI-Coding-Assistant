import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

export const listDir = tool(
  async ({ dirPath }) => {
    const target = path.resolve(dirPath || ".");
    const entries = await fs.readdir(target, { withFileTypes: true });
    return entries
      .map((e) => `${e.isDirectory() ? "[DIR] " : "      "}${e.name}`)
      .join("\n");
  },
  {
    name: "list_dir",
    description:
      "List files and directories at the given path (defaults to current directory). Use this to explore project structure before reading files.",
    schema: z.object({
      dirPath: z.string().describe("Relative or absolute directory path").default("."),
    }),
  }
);