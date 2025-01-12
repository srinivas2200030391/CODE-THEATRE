import React, { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { Message, ChatBotPanelProps } from "../../../types/chat";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeBlock = ({ code, language }: { code: string; language: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors"
        title="Copy code">
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-zinc-200" />
        )}
      </button>
      <SyntaxHighlighter
        language={language.toLowerCase()}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: "0.5rem",
          padding: "2rem 1rem 1rem 1rem",
        }}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const MessageContent = ({ content, language }: { content: string; language: string }) => {
  // Regular expression to match code blocks with optional language specification
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  const parts: Array<{ type: "text" | "code"; content: string; lang?: string }> = [];
  
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before the code block
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }

    // Add the code block
    parts.push({
      type: "code",
      content: match[2].trim(),
      lang: match[1] || language,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last code block
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.slice(lastIndex),
    });
  }

  // If no code blocks were found, return the content as-is
  if (parts.length === 0) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="space-y-4">
      {parts.map((part, index) => (
        <div key={index}>
          {part.type === "code" ? (
            <CodeBlock code={part.content} language={part.lang || "plaintext"} />
          ) : (
            <p className="whitespace-pre-wrap">{part.content}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const ChatBotPanel: React.FC<ChatBotPanelProps> = ({
  isOpen,
  onClose,
  code,
  language,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const analyzeCode = async (userMessage: string) => {
    try {
      const prompt = `
        Programming Language: ${language}
        Code:
        ${code}
        
        User Question: ${userMessage}
        
        Please analyze this code and provide helpful suggestions, explanations, or solutions to any problems. 
        When showing code examples, please wrap them in triple backticks with the language specified (e.g. \`\`\`python).
      `;

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from API");
      }

      const data = await response.json();
      return data.output;
    } catch (error) {
      console.error("Error analyzing code:", error);
      return "Sorry, I encountered an error while analyzing your code. Please try again.";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    setInputValue("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { type: "bot", content: "Analyzing..." }]);

    const response = await analyzeCode(userMessage);

    setMessages((prev) => {
      const newMessages = [...prev];
      newMessages.pop();
      return [...newMessages, { type: "bot", content: response }];
    });

    setIsLoading(false);
  };

  return (
    <div className="relative h-full">
      <div
        className={`fixed right-0 top-2 h-full bg-blue-75 dark:bg-zinc-900 shadow-lg transition-all duration-300 ease-in-out text-black ${
          isOpen ? "w-96 translate-x-0" : "w-0 translate-x-full"
        }`}>
        <div className="h-full flex flex-col">
          <div className="p-4 border-b dark:border-zinc-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-blue-50">
              Code Assistant
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-zinc-700 dark:hover:bg-zinc-800 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === "user"
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-zinc-100 dark:bg-zinc-800"
                }`}>
                <MessageContent content={message.content} language={language} />
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t dark:border-zinc-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about your code..."
                className="flex-1 text-black p-2 rounded-lg border dark:border-zinc-700 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-600"
                }`}
                disabled={isLoading}>
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatBotPanel;