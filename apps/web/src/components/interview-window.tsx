"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { trpc } from "../lib/trpc";
import Loader from "./loader";

interface Message {
  id: string;
  isAi: boolean;
  text: string;
  timestamp: Date;
}

interface InterviewWindowProps {
  scenarioId: string;
}

export default function InterviewWindow({ scenarioId }: InterviewWindowProps) {
  const router = useRouter();
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = React.useState("");
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [isFinishing, setIsFinishing] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const startSessionMutation = trpc.interview.startSession.useMutation();
  const [streamingInput, setStreamingInput] = React.useState<{
    sessionId: string;
    userMessage: string;
  } | null>(null);

  const sendMessageSubscription = trpc.interview.sendMessage.useSubscription(streamingInput, {
    enabled: Boolean(streamingInput),
    onData: (token) => {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.isAi && lastMessage.id.startsWith("ai-streaming")) {
          // Update streaming message
          return prev.map((msg, idx) =>
            idx === prev.length - 1
              ? { ...msg, text: msg.text + token }
              : msg
          );
        }
        return prev;
      });
    },
    onComplete: () => {
      setIsStreaming(false);
      setStreamingInput(null);
      // Mark the streaming message as final
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id.startsWith("ai-streaming")
            ? { ...msg, id: msg.id.replace("ai-streaming", "ai-final") }
            : msg
        )
      );
    },
    onError: (error) => {
      console.error("Streaming error:", error);
      setIsStreaming(false);
      setStreamingInput(null);
    },
  });
  const finishSessionMutation = trpc.interview.finishSession.useMutation();

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start session on mount
  React.useEffect(() => {
    startSessionMutation.mutate(
      { scenarioId },
      {
        onSuccess: ({ sessionId: newSessionId, message }) => {
          setSessionId(newSessionId);
          setMessages([
            {
              id: `ai-${Date.now()}`,
              isAi: true,
              text: message,
              timestamp: new Date(),
            },
          ]);
        },
        onError: (error) => {
          console.error("Failed to start session:", error);
          router.push("/scripts");
        },
      }
    );
  }, [scenarioId]);

  // Handle streaming messages
  React.useEffect(() => {
    if (sendMessageSubscription.data) {
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.isAi && !lastMessage.id.startsWith("final-")) {
          // Update streaming message
          return prev.map((msg, idx) =>
            idx === prev.length - 1
              ? { ...msg, text: msg.text + sendMessageSubscription.data }
              : msg
          );
        }
        return prev;
      });
    }
  }, [sendMessageSubscription.data]);

  // Handle stream completion
  React.useEffect(() => {
    if (sendMessageSubscription.isError) {
      console.error("Streaming error:", sendMessageSubscription.error);
      setIsStreaming(false);
    }
  }, [sendMessageSubscription.isError]);

  const handleSendMessage = () => {
    if (!sessionId || !currentMessage.trim() || isStreaming) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage("");

    // Add user message immediately
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      isAi: false,
      text: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Start streaming AI response
    setIsStreaming(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `ai-streaming-${Date.now()}`,
        isAi: true,
        text: "",
        timestamp: new Date(),
      },
    ]);

    // Start subscription
    setStreamingInput({ sessionId, userMessage });
  };

  const handleFinish = () => {
    if (!sessionId || isFinishing) return;

    setIsFinishing(true);
    finishSessionMutation.mutate(
      { sessionId },
      {
        onSuccess: () => {
          router.push(`/interview/results?sessionId=${sessionId}`);
        },
        onError: (error) => {
          console.error("Failed to finish session:", error);
          setIsFinishing(false);
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (startSessionMutation.isPending) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="flex justify-center">
          <Loader />
        </div>
      </main>
    );
  }

  if (startSessionMutation.isError) {
    return (
      <main className="max-w-4xl mx-auto py-16 px-6">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Ошибка</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Не удалось начать интервью. Попробуйте еще раз.
          </p>
          <Button onClick={() => router.push("/scripts")}>
            Вернуться к сценариям
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Интервью</h1>
        <Button
          onClick={handleFinish}
          disabled={isFinishing || isStreaming}
          variant="outline"
        >
          {isFinishing ? "Завершение..." : "Завершить интервью"}
        </Button>
      </div>

      <Card className="h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isAi ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.isAi
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    : "bg-blue-500 text-white"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                {isStreaming && message.isAi && message.id.startsWith("ai-streaming") && (
                  <span className="animate-pulse">▊</span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите ваш ответ..."
              className="flex-1 resize-none"
              rows={3}
              disabled={isStreaming}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isStreaming}
              className="self-end"
            >
              {isStreaming ? "Ожидание..." : "Отправить"}
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
