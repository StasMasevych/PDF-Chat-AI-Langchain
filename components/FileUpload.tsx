import { useState } from "react";

interface FileUploadProps {
  onFileProcessed?: (filename: string) => void;
}

export default function FileUpload({ onFileProcessed }: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [details, setDetails] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    setStatus("Starting file upload...");
    setDetails(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      setStatus("Processing PDF...");
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Server response:", data);

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success) {
        setStatus("Processing complete!");
        setDetails(data.details);
        onFileProcessed?.(file.name);
      }
    } catch (error) {
      console.error("Client Error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to process the PDF"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload PDF
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={loading}
          className="block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 
                     file:rounded-full file:border-0 
                     file:text-sm file:font-semibold 
                     file:bg-blue-50 file:text-blue-700 
                     hover:file:bg-blue-100 
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {loading && <div className="text-sm text-gray-500 mt-2">{status}</div>}

      {error && <div className="text-sm text-red-500 mt-2">Error: {error}</div>}

      {details && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">
            Processing Complete!
          </h3>
          <ul className="mt-2 text-sm text-green-700">
            <li>Pages processed: {details.pages}</li>
            <li>Chunks created: {details.chunks}</li>
            <li>Vectors stored: {details.vectors}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
