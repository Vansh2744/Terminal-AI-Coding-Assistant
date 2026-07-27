import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const searchCode = tool(
  async ({ query, dirPath }) => {
    try {
      const { stdout } = await execFileAsync("rg", [
        "--line-number",
        "--max-count",
        "5",
        "--max-columns",
        "200",
        query,
        dirPath || ".",
      ]);
      return stdout || "No matches found.";
    } catch (err: any) {
      if (err.code === 1) return "No matches found.";
      return `Search error: ${err.message}. Is ripgrep (rg) installed?`;
    }
  },
  {
    name: "search_code",
    description:
      "Search for a text pattern across files in a directory using ripgrep. Returns file paths, line numbers, and matching lines.",
    schema: z.object({
      query: z.string().describe("Text or regex pattern to search for"),
      dirPath: z.string().describe("Directory to search in").default("."),
    }),
  }
);