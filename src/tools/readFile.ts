import { tool } from "@langchain/core/tools";
import fs from "fs/promises";
import { z } from "zod"

export const readFile = tool(
    async ({ path }) => {
        return await fs.readFile(path, "utf-8")
    },
    {
        name: "read_file",
        description: "Read contents of a file at the given path",
        schema: z.object({ path: z.string() }),
    }
)