import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import NexaAuthWrapper from "./components/NexaAuthWrapper";

const API = "http://localhost:8000";

export default function NexaChat() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm the NEXA AI neural core. Type a message to test my sentiment-to-resolution logic.", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setOwnerId(localStorage.getItem("nexa_owner_id"));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/predict`, {
        message: input,
        owner_id: ownerId,
        customer_meta: { customer_name: "Test User", order_id: "ORD-999" }
      });

      const botMsg = { 
        role: "bot", 
        text: res.data.response, 
        timestamp: new Date(),
        metadata: {
            anger: res.data.anger_level,
            intent: res.data.intent,
            emoji: res.data.anger_emoji,
            source: res.data.resolution_source,
            compensation: res.data.compensation_type !== "none" ? `${res.data.compensation_type}: ${res.data.compensation_value}` : null
        }
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "❌ Error: Could not connect to the AI neural core.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const body = () => (
    <div className="animate-fade-in" style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column", padding: "2rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>NEURAL SANDBOX</p>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "2rem" }}>
          Chat <span className="gradient-text">Playground</span>
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.95rem" }}>Test your AI resolution policies and sentiment detection in real-time.</p>
      </div>

      <div className="glass" style={{ flex: 1, borderRadius: 24, display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid var(--color-border)" }}>
        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ 
                maxWidth: "70%", 
                background: m.role === "user" ? "var(--color-primary)" : "rgba(255,255,255,0.03)", 
                border: m.role === "user" ? "none" : "1px solid var(--color-border)",
                borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                padding: "1rem 1.25rem",
                position: "relative"
              }}>
                <p style={{ fontSize: "0.95rem", color: m.role === "user" ? "white" : "var(--color-text)", lineHeight: 1.5 }}>{m.text}</p>
                
                {m.metadata && (
                    <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.7rem", background: "rgba(0,0,0,0.2)", padding: "0.2rem 0.6rem", borderRadius: 6, color: "var(--color-text-muted)", fontWeight: 700 }}>
                            {m.metadata.emoji} {m.metadata.anger}
                        </span>
                        <span style={{ fontSize: "0.7rem", background: "rgba(99, 102, 241, 0.15)", padding: "0.2rem 0.6rem", borderRadius: 6, color: "#a5b4fc", fontWeight: 700 }}>
                            🎯 {m.metadata.intent.replace(/_/g, " ")}
                        </span>
                        {m.metadata.compensation && (
                            <span style={{ fontSize: "0.7rem", background: "rgba(16, 185, 129, 0.15)", padding: "0.2rem 0.6rem", borderRadius: 6, color: "#10b981", fontWeight: 700 }}>
                                🎁 {m.metadata.compensation}
                            </span>
                        )}
                        <span style={{ fontSize: "0.6rem", color: "var(--color-text-dim)", marginLeft: "auto", textTransform: "uppercase" }}>Source: {m.metadata.source}</span>
                    </div>
                )}
                <span style={{ fontSize: "0.65rem", color: m.role === "user" ? "rgba(255,255,255,0.6)" : "var(--color-text-dim)", display: "block", marginTop: "0.5rem", textAlign: m.role === "user" ? "right" : "left" }}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", color: "var(--color-text-dim)", fontSize: "0.85rem" }}>
                <span className="animate-pulse">●</span>
                <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
                <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
                Nexa AI is thinking...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} style={{ padding: "1.5rem", borderTop: "1px solid var(--color-border)", display: "flex", gap: "1rem", background: "rgba(0,0,0,0.1)" }}>
          <input 
            className="input" 
            placeholder="Type a support query (e.g. I want a refund for order #123)..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ borderRadius: 16 }}
          />
          <button className="btn-primary" type="submit" disabled={loading} style={{ borderRadius: 16, width: "64px", height: "48px", padding: 0 }}>
            {loading ? "..." : "✈️"}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 font-display mt-16 overflow-hidden">
        <AdminSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto w-full">
            <NexaAuthWrapper>
                {body()}
            </NexaAuthWrapper>
        </main>
    </div>
  );
}
