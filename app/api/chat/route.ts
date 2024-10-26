import { NextResponse } from "next/server";
import { OpenAI } from "@langchain/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getPineconeClient } from "@/lib/pinecone";

export async function POST(request: Request) {
  try {
    const { question, namespace } = await request.json();

    if (!namespace) {
      return NextResponse.json(
        { error: "No PDF file selected" },
        { status: 400 }
      );
    }

    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.index(process.env.PINECONE_INDEX_NAME!);

    // Create embeddings for the question
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    const questionEmbedding = await embeddings.embedQuery(question);

    // Query Pinecone using metadata filter
    const queryResponse = await pineconeIndex.query({
      vector: questionEmbedding,
      topK: 5,
      includeMetadata: true,
      filter: {
        fileId: namespace, // Use metadata filter instead of namespace
      },
    });

    // Construct context from the matched documents
    const context = queryResponse.matches
      .map((match) => match.metadata?.text)
      .join("\n");

    if (!context) {
      return NextResponse.json({
        answer:
          "No relevant information found in the document for this question.",
      });
    }

    // Use OpenAI to generate an answer
    const model = new OpenAI({
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
    });

    const prompt = `
      Based on the following context from the PDF document, please answer the question. 
      If you cannot answer the question based on the context, say "I cannot answer this question based on the provided context."
      
      Context: ${context}
      
      Question: ${question}
      
      Please provide a clear and concise answer based only on the information provided in the context.
    `;

    const response = await model.invoke(prompt);

    return NextResponse.json({ answer: response });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    );
  }
}
