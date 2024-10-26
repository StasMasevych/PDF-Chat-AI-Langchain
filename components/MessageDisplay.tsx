interface Message {
  id: string;
  question: string;
  answer: string;
}

interface MessageDisplayProps {
  messages: Message[];
}

export default function MessageDisplay({ messages }: MessageDisplayProps) {
  if (messages.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 space-y-6">
      {messages.map((message) => (
        <div key={message.id} className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold text-gray-600">Question:</p>
            <p className="mt-1">{message.question}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-600">Answer:</p>
            <p className="mt-1 whitespace-pre-wrap">{message.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
