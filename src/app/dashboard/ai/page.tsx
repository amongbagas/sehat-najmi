"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./ai.module.css";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  isEmergency?: boolean;
};

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: "Hello! I am SEHAT AI, your supportive wellness companion. How are you feeling today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message immediately
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: userMsg
    }]);
    
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      const data: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const apiError =
          data && typeof data === "object" && "error" in data && typeof data.error === "string"
            ? data.error
            : "SEHAT AI gagal merespons. Silakan coba lagi.";
        throw new Error(apiError);
      }

      if (!data || typeof data !== "object" || !("reply" in data) || typeof data.reply !== "string") {
        throw new Error("Respons SEHAT AI tidak valid. Silakan coba lagi.");
      }

      const reply = data.reply;
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "ai",
        content: reply,
        isEmergency: "isEmergency" in data && data.isEmergency === true
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "ai",
        content: error instanceof Error
          ? error.message
          : "SEHAT AI gagal merespons. Silakan coba lagi.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>SEHAT AI</h1>
        <p>Your supportive wellness companion</p>
      </div>

      <div className={styles.chatCard}>
        <div className={styles.disclaimer}>
          <strong>Disclaimer:</strong> AI is NOT a doctor or psychologist and cannot provide medical diagnosis. If you are in crisis, please seek professional human support immediately.
        </div>
        
        <div className={styles.messageContainer}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`${styles.message} ${msg.role === "user" ? styles.userMessage : styles.aiMessage} ${msg.isEmergency ? styles.emergencyMessage : ""}`}
            >
              {msg.content}
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.message} ${styles.aiMessage}`}>
              <div className={styles.typingIndicator}>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
                <div className={styles.dot}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form className={styles.inputArea} onSubmit={handleSend}>
          <input
            type="text"
            className={styles.input}
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
          />
          <button 
            type="submit" 
            className={styles.sendBtn}
            disabled={!input.trim() || isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
