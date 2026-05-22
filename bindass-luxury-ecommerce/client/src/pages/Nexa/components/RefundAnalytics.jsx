import React, { useEffect, useState } from "react";
import axios from "axios";

export default function RefundAnalytics() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("nexa_token");
    if (!token) return;

    axios.get("http://localhost:8000/api/live/refund/stats", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(r => setStats(r.data))
      .catch(() => setError(true));
  }, []);

  if (error) return null;
  if (!stats) return <div className="glass" style={{ height: 100, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-dim)", fontSize: "0.8rem" }}>Loading financial data...</div>;

  const ITEMS = [
    { label: "Total Volume", value: `₹${(stats.total_refunded || 0).toLocaleString()}`, color: "var(--color-text)" },
    { label: "Approved", value: stats.approved_count || 0, color: "#10b981" },
    { label: "AI Suggested", value: stats.ai_suggested_count || 0, color: "#818cf8" },
    { label: "Avg Refund", value: `₹${Math.round(stats.avg_refund_amount || 0).toLocaleString()}`, color: "var(--color-text-muted)" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
      {ITEMS.map(i => (
        <div key={i.label} className="glass" style={{ padding: "1rem 1.25rem", borderRadius: 16 }}>
          <div style={{ fontSize: "0.7rem", color: "var(--color-text-dim)", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.25rem", letterSpacing: "0.05em" }}>{i.label}</div>
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: i.color, fontFamily: "'Space Grotesk', sans-serif" }}>{i.value}</div>
        </div>
      ))}
    </div>
  );
}
