"use client";

import { useEffect } from "react";
import FileUpload from "@/components/FileUpload";

export default function Home() {
  useEffect(() => {
    // Test both endpoints
    const testEndpoints = async () => {
      try {
        // Test the process-pdf endpoint
        const pdfResponse = await fetch("/api/process-pdf");
        if (!pdfResponse.ok) {
          throw new Error(`PDF endpoint error: ${pdfResponse.status}`);
        }
        const pdfData = await pdfResponse.json();
        console.log("PDF API test:", pdfData);

        // Test the test endpoint
        const testResponse = await fetch("/api/test");
        if (!testResponse.ok) {
          throw new Error(`Test endpoint error: ${testResponse.status}`);
        }
        const testData = await testResponse.json();
        console.log("Test API:", testData);
      } catch (error) {
        console.error("API test error:", error);
      }
    };

    testEndpoints();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        PDF Chat Assistant
      </h1>
      <FileUpload />
    </main>
  );
}
