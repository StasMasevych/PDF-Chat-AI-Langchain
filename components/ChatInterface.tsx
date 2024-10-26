import { useState } from "react";

interface ChatInterfaceProps {
  fileId: string;
  onResponse: (question: string, answer: string) => void;
  disabled?: boolean;
}

export default function ChatInterface({
  fileId,
  onResponse,
  disabled,
}: ChatInterfaceProps) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question.trim(),
          namespace: fileId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      onResponse(question, data.answer);
      setQuestion("");
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={disabled || loading}
            placeholder="Ask a question about the PDF..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                      disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={disabled || loading || !question.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg
                     hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}
      </form>
    </div>
  );
}
