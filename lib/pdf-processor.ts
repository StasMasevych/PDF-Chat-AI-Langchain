import pdfjsLib from "./pdf-init";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getPineconeClient } from "./pinecone";

interface PDFPageItem {
  str: string;
  dir?: string;
  transform?: number[];
  width?: number;
  height?: number;
  fontName?: string;
}

export const processPDF = async (file: File) => {
  try {
    console.log("Starting PDF processing...");

    // Verify OpenAI API key
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      throw new Error("OpenAI API key not found in environment variables");
    }

    // Read the PDF file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    // Extract text from all pages
    const numPages = pdf.numPages;
    const textContent: string[] = [];

    console.log(`Processing ${numPages} pages...`);

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: PDFPageItem) => item.str)
        .join(" ");
      textContent.push(pageText);
      console.log(`Processed page ${i}/${numPages}`);
    }

    const fullText = textContent.join(" ");
    console.log("Text extraction complete. Starting text splitting...");

    // Split text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.splitText(fullText);
    console.log(`Created ${chunks.length} text chunks`);

    // Initialize OpenAI embeddings with explicit API key
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      configuration: {
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      },
    });

    console.log("Creating embeddings...");

    // Get Pinecone client
    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.index(
      process.env.NEXT_PUBLIC_PINECONE_INDEX_NAME!
    );

    // Convert chunks to vectors and upload to Pinecone
    const vectors = await Promise.all(
      chunks.map(async (chunk: string, i: number) => {
        const embedding = await embeddings.embedQuery(chunk);
        console.log(`Created embedding for chunk ${i + 1}/${chunks.length}`);

        return {
          id: `${file.name}-${i}`,
          values: embedding,
          metadata: {
            text: chunk,
            fileId: file.name,
            pageNumber: Math.floor(i / (chunks.length / numPages)) + 1,
          },
        };
      })
    );

    console.log("Uploading vectors to Pinecone...");
    await pineconeIndex.upsert(vectors);

    console.log("PDF processing complete!");
    return { success: true };
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw error;
  }
};
