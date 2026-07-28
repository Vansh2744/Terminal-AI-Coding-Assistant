import chalk from "chalk";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";

marked.setOptions({
  renderer: new TerminalRenderer() as any,
});

export function renderAssistantText(text: string) {
  process.stdout.write(marked.parse(text) as string);
}

export function renderUserPrompt(): string {
  return chalk.cyan.bold("You ›") + " ";
}

export function renderToolCall(toolName: string, args: unknown) {
  console.log(
    chalk.magenta(`\n  ↳ calling ${toolName}(${JSON.stringify(args)})`)
  );
}

export function renderError(message: string) {
  console.log(chalk.red.bold("✖ Error: ") + chalk.red(message));
}

export function renderBanner() {
  console.log(
    chalk.bold.green(`
  ┌─────────────────────────────┐
  │ terminal-ai-coding-assistant│
  │    type "exit" to quit      │
  └─────────────────────────────┘
`)
  );
}