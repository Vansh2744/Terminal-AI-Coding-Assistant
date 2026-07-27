import { ChatGroq } from "@langchain/groq";
import "dotenv/config"

export const llm = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY!,
    model: process.env.GROQ_MODEL!,
    temperature: 0,
    streaming: true
})