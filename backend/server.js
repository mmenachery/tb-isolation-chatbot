import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Validate required environment variables
["OPENAI_API_KEY", "OPENAI_PROMPT_ID", "OPENAI_VECTOR_STORE_ID"].forEach((key) => {
  if (!process.env[key]) throw new Error(`${key} is missing in .env`);
});

const PROMPT_ID = process.env.OPENAI_PROMPT_ID;
const VECTOR_STORE_ID = process.env.OPENAI_VECTOR_STORE_ID;

app.post("/api/chat", async (req, res) => {
  const { message, patientContext, structuredData } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  // Set up streaming headers
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Transfer-Encoding", "chunked");
  res.flushHeaders?.();

  try {
    // Build the complete user message with patient context
    let fullMessage = message;
    
    if (patientContext || structuredData) {
      fullMessage = `PATIENT CONTEXT:
${patientContext || 'None provided'}

STRUCTURED DATA:
- Pre-Treatment Bacterial Burden: ${structuredData?.bacterialBurden ?? 'N/A'}
- Gene Xpert: ${structuredData?.geneXpert ?? 'N/A'}
- Community Risk: ${structuredData?.communityRisk ?? 'N/A'}
- Patient Harm: ${structuredData?.patientHarm ?? 'N/A'}

USER QUESTION:
${message}`;
    }

    console.log("📝 Sending to TB-specialized prompt:", PROMPT_ID);
    console.log("📚 Using vector store:", VECTOR_STORE_ID);
    console.log("💬 Full message being sent:\n", fullMessage);
    console.log("---");

    // Create a streaming response using the stored TB-specialized prompt ID
    const stream = await client.responses.create({
      model: "o1",  // Using o1 reasoning model to support reasoning.effort parameter
      stream: true,
      
      // Reference your TB-specialized prompt by ID
      // This prompt should contain your TB domain expertise and instructions
      prompt: { id: PROMPT_ID },
      
      // User's message with patient context
      input: [{ role: "user", content: fullMessage }],
      
      // File search tool with vector store containing TB guidelines/documents
      tools: [
        {
          type: "file_search",
          vector_store_ids: [VECTOR_STORE_ID],
          max_num_results: 8,
        },
      ],
    });

    // Stream the response back to the client
    for await (const event of stream) {
      
      // Handle different event types
      if (event.type === "response.output_text.delta") {
        // Try different possible delta structures
        if (typeof event.delta === 'string') {
          res.write(event.delta);
        } else if (event.delta?.text) {
          res.write(event.delta.text);
        } else if (event.text) {
          res.write(event.text);
        } else if (event.delta) {
          res.write(JSON.stringify(event.delta));
        }
      } else if (event.type === "response.output.delta") {
        // Alternative delta event type
        if (event.delta?.content) {
          res.write(event.delta.content);
        }
      } else if (event.type === "response.content_block.delta") {
        // Content block delta
        if (event.delta?.text) {
          res.write(event.delta.text);
        }
      } else if (event.type === "response.done" || event.type === "response.completed") {
        // Response is complete
        console.log("✅ Response completed");
      }
    }

    res.end();
  } catch (err) {
    console.error("💥 OpenAI error:", err);
    if (!res.headersSent) {
      res.status(500);
    }
    res.end("Backend error");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`🧠 Active TB Prompt ID: ${PROMPT_ID}`);
  console.log(`📚 Vector Store ID: ${VECTOR_STORE_ID}`);
});