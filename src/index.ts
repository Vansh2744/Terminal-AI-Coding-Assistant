import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import { AIMessage } from "@langchain/core/messages";
import { agent } from "./agents/graph.js";
import { renderBanner, renderUserPrompt, renderToolCall, renderError } from "./ui/render.js";
import { saveSessionMeta, loadSessionMeta } from "./session/store.js";
import { randomUUID } from "crypto";

const program = new Command();

program
  .name("terminal-ai-coding-assistant")
  .description("A terminal-based AI coding assistant")
  .option("-s, --session <name>", "session name to resume or create", "default")
  .parse(process.argv);

const options = program.opts();

async function main() {
  renderBanner();

  const sessionName = options.session as string;
  let meta = await loadSessionMeta(sessionName);

  if (meta) {
    console.log(chalk.gray(`Resumed session "${sessionName}"`));
  } else {
    meta = {
      name: sessionName,
      threadId: randomUUID(),
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    };
    await saveSessionMeta(meta);
    console.log(chalk.gray(`Started new session "${sessionName}"`));
  }

  const threadConfig = { configurable: { thread_id: meta.threadId } };

  while (true) {
    const { userInput } = await inquirer.prompt([
      { type: "input", name: "userInput", message: renderUserPrompt() },
    ]);

    if (!userInput || userInput.trim().toLowerCase() === "exit") {
      console.log(chalk.gray("Goodbye."));
      break;
    }

    try {
      const stream = await agent.stream(
        { messages: [{ role: "user", content: userInput }] },
        { ...threadConfig, streamMode: "values" }
      );

      for await (const step of stream) {
        const lastMsg = step.messages[step.messages.length - 1];

        if (lastMsg instanceof AIMessage && lastMsg.tool_calls?.length) {
          for (const call of lastMsg.tool_calls) {
            renderToolCall(call.name, call.args);
          }
        } else if (lastMsg instanceof AIMessage && lastMsg.content) {
          console.log(chalk.white("\n" + lastMsg.content));
        }
      }

      meta.lastUsedAt = new Date().toISOString();
      await saveSessionMeta(meta);
    } catch (err: any) {
      renderError(err.message);
    }
  }
}

main().catch((err) => {
  renderError(err.message);
  process.exit(1);
});