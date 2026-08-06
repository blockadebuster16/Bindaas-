import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import NexaAuthWrapper from "./components/NexaAuthWrapper";

const AngerBadge = ({ level }) => {
  const colors = { 
    ANGRY: { bg: "rgba(239, 68, 68, 0.1)", text: "#b91c1c", dot: "#ef4444" },
    FRUSTRATED: { bg: "rgba(245, 158, 11, 0.1)", text: "#b45309", dot: "#f59e0b" },
    CALM: { bg: "rgba(16, 185, 129, 0.1)", text: "#047857", dot: "#10b981" }
  };
  const theme = colors[level] || colors.CALM;
  return (
    <span style={{ background: theme.bg, color: theme.text, padding: "0.25rem 0.6rem", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: theme.dot }} />
      {level}
    </span>
  );
}

export default function NexaDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState("Your Company");

  useEffect(() => {
    const owner_id = localStorage.getItem("nexa_owner_id");
    const token = localStorage.getItem("nexa_token");
    const storedCompany = localStorage.getItem("nexa_company");
    if (storedCompany) setCompany(storedCompany);

    if (!owner_id || !token) {
        setLoading(false);
        return;
    };

    const fetchStats = async () => {
        try {
            const r = await axios.get(`http://localhost:8000/api/analytics/${owner_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setData(r.data);
        } catch (err) {
            console.error("Dashboard data sync failed", err);
        } finally {
            setLoading(false);
        }
    };

    fetchStats();
  }, []);

  const content = () => {
    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
            <div className="animate-pulse" style={{ color: "var(--color-text-muted)" }}>Initializing Nexa AI Intelligence...</div>
        </div>
      );
    
      if (!data) return (
        <div className="glass" style={{ padding: "3rem", textAlign: "center", borderRadius: 24, margin: "2rem" }}>
            <h2 style={{ marginBottom: "1rem" }}>Welcome to NEXA AI Support Center</h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem" }}>Connect your store or seed some data to see your intelligence overview.</p>
            <Link to="/admin/nexa-embed" className="btn-primary" style={{ textDecoration: "none" }}>Connect Store →</Link>
        </div>
      );
    
      const STATS = [
        { label: "Total Tickets", value: data.total_tickets.toLocaleString(), icon: "🎫", color: "var(--color-primary)" },
        { label: "Avg Anger", value: `${(data.avg_anger_score * 100).toFixed(0)}%`, icon: "🌡️", color: "#f59e0b" },
        { label: "Policy Coverage", value: `${data.total_tickets > 0 ? ((data.resolutions_served / data.total_tickets) * 100).toFixed(0) : 0}%`, icon: "🎯", color: "#22d3ee" },
        { label: "Critical Priority", value: data.anger_distribution.ANGRY || 0, icon: "🔥", color: "#ef4444" },
      ];
    
      return (
        <div className="animate-fade-in" style={{ padding: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
            <div>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>REAL-TIME AI INTELLIGENCE</p>
              <h1 style={{ fontFamily: "inherit", fontWeight: 700, fontSize: "2rem" }}>
                <span className="gradient-text">{company}</span> AI Overview
              </h1>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
                <Link to="/admin/nexa-live" className="glass" style={{ padding: "0.6rem 1.2rem", borderRadius: 12, textDecoration: "none", fontSize: "0.9rem", color: "var(--color-text)" }}>Live Queue</Link>
                <Link to="/admin/nexa-cases" className="btn-primary" style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem", textDecoration: "none" }}>Manage Policies</Link>
            </div>
          </div>
    
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
            {STATS.map(s => (
              <div key={s.label} className="glass stat-card" style={{ borderRadius: 24, padding: "1.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                    <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--color-text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>24h Radar</span>
                </div>
                <div style={{ fontSize: "2.25rem", fontWeight: 700, color: s.color, marginBottom: "0.25rem", fontFamily: "inherit" }}>{s.value}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em" }}>{s.label}</div>
              </div>
            ))}
          </div>
    
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "1.5rem", marginBottom: "2rem" }}>
            {/* Recent Tickets Table */}
            <div className="glass" style={{ borderRadius: 24, padding: "1.75rem", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>🎫 Recent Intelligence</h2>
                <Link to="/admin/nexa-live" style={{ fontSize: "0.8rem", color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>Full Queue →</Link>
              </div>
              <div className="table-wrapper" style={{ margin: "0 -1.75rem" }}>
                <table style={{ borderCollapse: "separate", borderSpacing: "0 0.5rem" }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: "1.75rem" }}>CUSTOMER REQUEST</th>
                      <th>INTENT</th>
                      <th>SENTIMENT</th>
                      <th style={{ paddingRight: "1.75rem" }}>RESOLUTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_tickets.slice(0, 8).map(t => (
                      <tr key={t.id} style={{ background: "rgba(0,0,0,0.01)" }}>
                        <td style={{ paddingLeft: "1.75rem", maxWidth: 300 }}>
                          <p style={{ fontSize: "0.85rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text)" }}>{t.raw_message}</p>
                          <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Ticket #{t.id.slice(-5)} · {new Date(t.timestamp).toLocaleTimeString()}</p>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.75rem", background: "var(--color-surface-2)", padding: "0.3rem 0.6rem", borderRadius: 8, fontWeight: 500 }}>{t.intent?.replace(/_/g, " ")}</span>
                        </td>
                        <td><AngerBadge level={t.anger_level} /></td>
                        <td style={{ paddingRight: "1.75rem" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: t.compensation_type !== "none" ? "#10b981" : "var(--color-text-muted)" }}>
                                {t.compensation_type === "none" ? "Standard Response" : `${t.compensation_type} ${t.compensation_value}`}
                            </span>
                            <span style={{ fontSize: "0.6rem", color: "var(--color-text-dim)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.03em" }}>{t.resolution_source}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
    
            {/* Distribution Pane */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div className="glass" style={{ borderRadius: 24, padding: "1.75rem" }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem" }}>🌡️ Sentiment Radar</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        {[
                            { label: "CALM", count: data.anger_distribution.CALM || 0, color: "#10b981" },
                            { label: "FRUSTRATED", count: data.anger_distribution.FRUSTRATED || 0, color: "#f59e0b" },
                            { label: "ANGRY", count: data.anger_distribution.ANGRY || 0, color: "#ef4444" },
                        ].map(b => (
                            <div key={b.label}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem", alignItems: "flex-end" }}>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{b.label}</span>
                                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontWeight: 500 }}>{b.count} tickets</span>
                                </div>
                                <div style={{ height: 12, background: "var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${data.total_tickets > 0 ? (b.count / data.total_tickets * 100) : 0}%`, background: b.color, borderRadius: 12, transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
    
                <div className="glass" style={{ borderRadius: 24, padding: "1.75rem", flex: 1 }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem" }}>🎯 Intent Analytics</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                        {data.intent_frequency.slice(0, 5).map((item, i) => {
                            const max = data.intent_frequency[0]?.count || 1;
                            return (
                                <div key={item.intent}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                                        <span style={{ fontSize: "0.825rem", color: "var(--color-text)", fontWeight: 500 }}>{item.intent.replace(/_/g, " ")}</span>
                                        <span style={{ fontSize: "0.825rem", fontWeight: 700 }}>{item.count}</span>
                                    </div>
                                    <div style={{ height: 4, background: "var(--color-border)", borderRadius: 4 }}>
                                        <div style={{ height: "100%", width: `${(item.count / max) * 100}%`, background: "var(--color-primary)", borderRadius: 4, opacity: 0.8 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-display overflow-hidden">
        <AdminSidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto w-full">
            <NexaAuthWrapper>
                {content()}
            </NexaAuthWrapper>
        </main>
    </div>
  );
}
