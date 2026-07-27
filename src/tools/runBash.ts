import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import chalk from "chalk";
import { confirmAction } from "./permissionGate.js";

const execAsync = promisify(exec);

// crude first-pass guard — not a substitute for real sandboxing
const DENYLIST = [
  /rm\s+-rf\s+\//, 
  /:\(\)\{.*\};:/, // fork bomb
  /mkfs/,
  /dd\s+if=/,
  />\s*\/dev\/sd/,
  /chmod\s+-R\s+777\s+\//,
];

export const runBash = tool(
  async ({ command }) => {
    if (DENYLIST.some((pattern) => pattern.test(command))) {
      return "Blocked: this command matches a denylisted destructive pattern and was not run.";
    }

    const ok = await confirmAction(
      "Run shell command",
      chalk.cyan(`$ ${command}`)
    );
    if (!ok) return "User declined this action. Command was not run.";

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
        timeout: 30_000, // 30s guard against hanging commands
        maxBuffer: 1024 * 1024, // 1MB output cap
      });
      return stdout || stderr || "(command produced no output)";
    } catch (err: any) {
      return `Command failed: ${err.message}\n${err.stdout || ""}\n${err.stderr || ""}`;
    }
  },
  {
    name: "run_bash",
    description:
      "Execute a shell command in the current working directory. Requires user confirmation. Times out after 30 seconds. Avoid destructive or irreversible commands.",
    schema: z.object({
      command: z.string().describe("The shell command to execute"),
    }),
  }
);