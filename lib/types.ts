export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  answer: string;
  error?: string;
}
