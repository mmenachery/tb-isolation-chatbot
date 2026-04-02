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
  const { message, patientContext, structuredData, conversationHistory } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  // Set up streaming headers
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Transfer-Encoding", "chunked");
  res.flushHeaders?.();

  try {
    // Build the user message with context ONLY for the current turn
    // The patient context and structured data provide the baseline
    // The conversationHistory maintains the dialogue
    let contextMessage = "";
    
    if (patientContext || structuredData) {
      contextMessage = `PATIENT CONTEXT:
${patientContext || 'None provided'}

STRUCTURED DATA:
- Pre-Treatment Bacterial Burden: ${structuredData?.bacterialBurden ?? 'Not provided'}
- GeneXpert/Drug Susceptibility: ${structuredData?.geneXpert ?? 'Not provided'}
- Community Risk: ${structuredData?.communityRisk ?? 'Not provided'}
- Patient Harm: ${structuredData?.patientHarm ?? 'Not provided'}
- Days on Treatment: ${structuredData?.treatmentDays ?? 'Not provided'}
- Treatment Drugs: ${structuredData?.treatmentDrugs ?? 'Not provided'}
- Treatment Tolerance: ${structuredData?.treatmentTolerance ?? 'Not provided'}
- Drug Resistance Concern: ${structuredData?.drugResistance ?? 'Not provided'}

`;
    }

    // Build messages array for OpenAI
    // Include conversation history to maintain context
    let messages = [];
    
    // If there's conversation history, include it
    if (conversationHistory && conversationHistory.length > 0) {
      messages = [...conversationHistory];
    }
    
    // Add the current user message
    const currentMessage = contextMessage + message;
    messages.push({ role: "user", content: currentMessage });

    console.log("📝 Sending to TB-specialized prompt:", PROMPT_ID);
    console.log("📚 Using vector store:", VECTOR_STORE_ID);
    console.log("💬 Conversation history length:", conversationHistory?.length || 0);
    console.log("💬 Current message:\n", currentMessage);
    console.log("---");

    // Create a streaming response using the stored TB-specialized prompt ID
    const stream = await client.responses.create({
      model: "o1",
      stream: true,
      
      // Reference your TB-specialized prompt by ID
      prompt: { id: PROMPT_ID },
      
      // Pass the full conversation with history
      input: messages,
      
      // File search tool with vector store containing TB guidelines
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
      // Log events for debugging (can remove in production)
      console.log("Event type:", event.type);
      
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