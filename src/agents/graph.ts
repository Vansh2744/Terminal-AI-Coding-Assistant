import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { llm } from "../llm/groqClient.js";
import {
  readFile,
  writeFile,
  editFile,
  runBash,
  listDir,
  searchCode,
} from "../tools/index.js";

const SYSTEM_PROMPT = `You are a terminal-based coding assistant, similar to Claude Code.
You have access to tools for reading, writing, and editing files, listing directories,
searching code, and running shell commands.

Rules:
- Always explore before editing: use list_dir/read_file/search_code to understand
  context before calling write_file or edit_file.
- Prefer edit_file over write_file when only part of a file needs to change.
- Be concise in your responses. Show, don't over-explain.
- If a tool call is declined by the user, do not retry the same action — ask the
  user what they'd like to do instead.
- Never assume file contents — read them first if you haven't already seen them
  in this conversation.`;

// checkpointer gives the graph built-in memory across turns, keyed by thread_id
const checkpointer = new MemorySaver();

export const agent = createReactAgent({
  llm,
  tools: [readFile, writeFile, editFile, runBash, listDir, searchCode],
  stateModifier: SYSTEM_PROMPT,
  checkpointer,
});