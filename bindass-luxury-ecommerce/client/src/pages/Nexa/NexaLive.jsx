import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import RefundAnalytics from "./components/RefundAnalytics";
import AdminSidebar from "../../components/AdminSidebar";
import NexaAuthWrapper from "./components/NexaAuthWrapper";

const API = "http://localhost:8000";

export default function NexaLive() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [overrideAmount, setOverrideAmount] = useState("");
  const [activeTab, setActiveTab] = useState("analysis"); // "analysis" or "chat"
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [agentId] = useState(`agent_${Math.random().toString(36).substr(2, 5)}`);
  const ws = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => {
        clearInterval(interval);
        if (ws.current) ws.current.close();
    };
  }, []);

  useEffect(() => {
    if (selected) {
        setSuggestion(null);
        setOverrideAmount("");
        setActiveTab("analysis");
        setChatMessages([]);
        connectSocket(selected.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const connectSocket = (customerId) => {
    if (ws.current) ws.current.close();
    
    const wsUrl = `ws://localhost:8000/ws/${agentId}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
        // Inform server we are joining this customer's session
        ws.current.send(JSON.stringify({
            type: "agent_join",
            customer_id: customerId
        }));
    };

    ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "chat") {
            setChatMessages(prev => [...prev, { role: data.sender_id === agentId ? "agent" : "customer", text: data.text, time: data.timestamp || new Date().toLocaleTimeString() }]);
        }
    };
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !ws.current) return;

    const msg = {
        type: "chat",
        target_id: selected.id,
        text: chatInput,
        timestamp: new Date().toLocaleTimeString()
    };

    ws.current.send(JSON.stringify(msg));
    setChatMessages(prev => [...prev, { role: "agent", text: chatInput, time: msg.timestamp }]);
    setChatInput("");
  };

  async function fetchSessions() {
    const token = localStorage.getItem("nexa_token");
    if (!token) return;
    try {
      const r = await axios.get(`${API}/api/live/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(r.data);
    } catch {}
  }

  async function getSuggestion() {
    if (!selected) return;
    const token = localStorage.getItem("nexa_token");
    if (!token) return;
    setLoading(true);
    try {
      const r = await axios.post(`${API}/api/live/refund/suggest`, 
        {
            ticket_id: selected.id, agent_id: agentId,
            anger_score: selected.anger_score, anger_level: selected.anger_level,
            intent: selected.intent, compensation_type: selected.compensation_type || "store_credit",
            order_value: 50.0 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuggestion(r.data);
      setOverrideAmount(r.data.ai_amount.toString());
    } catch {
      alert("AI suggestion failed.");
    } finally {
      setLoading(false);
    }
  }

  async function executeRefund(action) {
    if (!suggestion) return;
    const token = localStorage.getItem("nexa_token");
    if (!token) return;
    setLoading(true);
    try {
      await axios.post(`${API}/api/live/refund/approve`, 
        {
          refund_audit_id: suggestion.audit_id, agent_id: agentId,
          final_amount: parseFloat(overrideAmount) || suggestion.ai_amount,
          final_type: suggestion.ai_type,
          override_reason: parseFloat(overrideAmount) !== suggestion.ai_amount ? "Agent adjusted amount" : null,
          action
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Refund ${action}ed successfully!`);
      setSuggestion(null);
      setSelected(null);
      fetchSessions();
    } catch {
      alert("Failed to process refund.");
    } finally {
      setLoading(false);
    }
  }

  const renderBody = () => (
    <div className="animate-fade-in" style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>HUMAN-IN-THE-LOOP CONTROL</p>
        <h1 style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "2rem" }}>
          Live <span className="gradient-text">Command Center</span>
        </h1>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <RefundAnalytics />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Session List */}
        <div className="glass" style={{ borderRadius: 24, padding: "1.5rem", height: "70vh", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
             <h3 style={{ fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Live Queue</h3>
             <span style={{ fontSize: "0.75rem", background: "rgba(16,185,129,0.1)", color: "#10b981", padding: "0.2rem 0.5rem", borderRadius: 20, fontWeight: 700 }}>{sessions.length} Active</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {sessions.map(s => (
              <div 
                key={s.id} 
                className={`glass-hover ${selected?.id === s.id ? 'active-glow' : ''}`}
                style={{ 
                  padding: "1rem", 
                  borderRadius: 16, 
                  cursor: "pointer", 
                  background: selected?.id === s.id ? "rgba(99, 102, 241, 0.05)" : "rgba(0,0,0,0.01)",
                  border: `1px solid ${selected?.id === s.id ? "rgba(99, 102, 241, 0.2)" : "var(--color-border)"}`
                }}
                onClick={() => setSelected(s)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-text-dim)", textTransform: "uppercase" }}>Ticket #{s.id.slice(-5)}</span>
                  <span style={{ fontSize: "0.65rem", color: s.anger_level === "ANGRY" ? "#ef4444" : "#10b981", fontWeight: 800 }}>{s.anger_level}</span>
                </div>
                <p style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--color-text)", marginBottom: "0.5rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.raw_message}</p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.65rem", background: "var(--color-surface-2)", padding: "0.2rem 0.5rem", borderRadius: 4, fontWeight: 600 }}>{s.intent}</span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && <p style={{ textAlign: "center", color: "var(--color-text-dim)", fontSize: "0.85rem", marginTop: "2rem" }}>No active sessions.</p>}
          </div>
        </div>

        {/* Intelligence Pane */}
        <div className="glass" style={{ borderRadius: 24, padding: "0", height: "70vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {!selected ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-text-dim)" }}>
                <span style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>🎯</span>
                <p style={{ fontWeight: 500 }}>Select a ticket from the queue to begin resolution.</p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", background: "rgba(0,0,0,0.02)" }}>
                 <button onClick={() => setActiveTab("analysis")} style={{ flex: 1, padding: "1.25rem", border: "none", background: activeTab === "analysis" ? "rgba(99, 102, 241, 0.1)" : "none", color: activeTab === "analysis" ? "var(--color-primary)" : "var(--color-text-dim)", fontWeight: 700, fontSize: "0.9rem", transition: "all 0.3s" }}>
                    🤖 AI Analysis
                 </button>
                 <button onClick={() => setActiveTab("chat")} style={{ flex: 1, padding: "1.25rem", border: "none", background: activeTab === "chat" ? "rgba(99, 102, 241, 0.1)" : "none", color: activeTab === "chat" ? "var(--color-primary)" : "var(--color-text-dim)", fontWeight: 700, fontSize: "0.9rem", transition: "all 0.3s" }}>
                    💬 Live Interaction
                 </button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
                {activeTab === "analysis" ? (
                  <div className="animate-fade-in">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                       <div>
                          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>Sentiment Pulse</h2>
                          <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Agent Session: {agentId.slice(-5)}</p>
                       </div>
                       <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: "0.35rem" }}>ANGER SCORE</div>
                          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: selected.anger_level === "ANGRY" ? "#ef4444" : "#10b981" }}>{(selected.anger_score * 100).toFixed(0)}%</div>
                       </div>
                    </div>

                    <div style={{ background: "#f8fafc", borderRadius: 16, padding: "1.5rem", marginBottom: "2rem", border: "1px solid var(--color-border)" }}>
                       <p style={{ fontSize: "0.75rem", color: "var(--color-text-dim)", fontWeight: 700, marginBottom: "0.75rem", textTransform: "uppercase" }}>Customer Query</p>
                       <p style={{ fontSize: "1.1rem", lineHeight: 1.6, color: "var(--color-text)", fontWeight: 500 }}>&ldquo;{selected.raw_message}&rdquo;</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                       <div className="glass" style={{ padding: "1.25rem", borderRadius: 16 }}>
                          <p style={{ fontSize: "0.7rem", color: "var(--color-text-dim)", fontWeight: 700, marginBottom: "0.5rem" }}>DETECTED INTENT</p>
                          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary)" }}>{selected.intent.replace(/_/g, " ")}</p>
                       </div>
                       <div className="glass" style={{ padding: "1.25rem", borderRadius: 16 }}>
                          <p style={{ fontSize: "0.7rem", color: "var(--color-text-dim)", fontWeight: 700, marginBottom: "0.5rem" }}>RECOMMENDED REWARD</p>
                          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981" }}>{selected.compensation_type?.toUpperCase() || "NONE"}</p>
                       </div>
                    </div>

                    {/* AI Recommendation Section */}
                    <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "2rem" }}>
                       {!suggestion ? (
                          <div style={{ textAlign: "center" }}>
                              <button className="btn-primary" onClick={getSuggestion} disabled={loading} style={{ padding: "1rem 2.5rem" }}>
                                  {loading ? "Generating..." : "Generate Neural Compensation Suggestion"}
                              </button>
                          </div>
                       ) : (
                          <div className="animate-fade-in glass" style={{ padding: "2rem", borderRadius: 20, border: "2px solid rgba(99, 102, 241, 0.3)" }}>
                              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem" }}>🤖 AI Resolution Suggestion</h3>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "1.5rem" }}>
                                  <div>
                                      <label className="label">Suggested Type</label>
                                      <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10b981" }}>{suggestion.ai_type}</div>
                                  </div>
                                  <div>
                                      <label className="label">Amount</label>
                                      <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>₹{suggestion.ai_amount}</div>
                                  </div>
                              </div>
                              <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: "2rem" }}>{suggestion.reasoning}</p>
                              <div style={{ display: "flex", gap: "1rem" }}>
                                  <input className="input" type="number" value={overrideAmount} onChange={(e) => setOverrideAmount(e.target.value)} />
                                  <button className="btn-primary" onClick={() => executeRefund("approve")} disabled={loading} style={{ background: "#10b981" }}>Approve</button>
                                  <button className="btn-secondary" onClick={() => executeRefund("reject")} disabled={loading} style={{ color: "#ef4444" }}>Reject</button>
                              </div>
                          </div>
                       )}
                    </div>
                  </div>
                ) : (
                  <div className="animate-fade-in" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                     <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {chatMessages.map((m, i) => (
                           <div key={i} style={{ alignSelf: m.role === "agent" ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                              <div style={{ background: m.role === "agent" ? "var(--color-primary)" : "#f1f5f9", color: m.role === "agent" ? "white" : "black", padding: "0.75rem 1rem", borderRadius: 16 }}>
                                 {m.text}
                              </div>
                              <span style={{ fontSize: "0.6rem", color: "var(--color-text-dim)", marginTop: "0.25rem", display: "block" }}>{m.time}</span>
                           </div>
                        ))}
                        <div ref={chatEndRef} />
                     </div>
                     <form onSubmit={sendChatMessage} style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
                        <input className="input" placeholder="Type a message to the customer..." value={chatInput} onChange={e => setChatInput(e.target.value)} />
                        <button className="btn-primary" type="submit">Send</button>
                     </form>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-display overflow-hidden">
        <AdminSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto w-full">
            <NexaAuthWrapper>
                {renderBody()}
            </NexaAuthWrapper>
        </main>
    </div>
  );
}
