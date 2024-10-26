import { Pinecone } from "@pinecone-database/pinecone";

let pineconeInstance: Pinecone | null = null;

export const getPineconeClient = async () => {
  if (!pineconeInstance) {
    // Debug: Check environment variable
    console.log("Pinecone API Key exists:", !!process.env.PINECONE_API_KEY);

    if (!process.env.PINECONE_API_KEY) {
      throw new Error("Pinecone API key not found in environment variables");
    }

    pineconeInstance = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeInstance;
};
