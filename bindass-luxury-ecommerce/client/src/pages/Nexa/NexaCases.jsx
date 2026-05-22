import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import NexaAuthWrapper from "./components/NexaAuthWrapper";

const INTENTS = [
  "cancel_order", "change_order", "change_shipping_address", "check_cancellation_fee",
  "check_invoice", "check_payment_methods", "check_refund_policy", "complaint",
  "contact_customer_service", "contact_human_agent", "create_account", "delete_account",
  "delivery_options", "delivery_period", "edit_account", "get_invoice", "get_refund",
  "newsletter_subscription", "payment_issue", "place_order", "recover_password",
  "registration_problems", "review", "set_up_shipping_address", "switch_account",
  "track_order", "track_refund",
  "greeting", "gratitude", "farewell", "chitchat", "positive_feedback", "general_inquiry",
];

const ANGER_BUCKETS = ["CALM", "FRUSTRATED", "ANGRY"];
const COMP_TYPES = ["none", "discount", "store_credit", "refund", "priority_support"];

const EMPTY = {
  intent: "get_refund",
  anger_bucket: "ANGRY",
  response_template: "I sincerely apologize, {customer_name}. I am processing your request immediately and crediting {compensation_value} to your account.",
  compensation_type: "store_credit",
  compensation_value: "₹500",
};

const AngerBadge = ({ level }) => {
  const colors = { 
    ANGRY: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", border: "rgba(239, 68, 68, 0.2)" },
    FRUSTRATED: { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b", border: "rgba(245, 158, 11, 0.2)" },
    CALM: { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981", border: "rgba(16, 185, 129, 0.2)" }
  };
  const theme = colors[level] || colors.CALM;
  return (
    <span style={{ background: theme.bg, color: theme.text, border: `1px solid ${theme.border}`, padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {level}
    </span>
  );
}

export default function NexaCases() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [cases, setCases] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const token = localStorage.getItem("nexa_token");
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:8000/api/cases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCases(res.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const token = localStorage.getItem("nexa_token");
    if (!token) return;
    setSaving(true);
    try {
      if (editing) {
        await axios.put(`http://localhost:8000/api/cases/${editing}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMsg("✅ Policy updated!");
      } else {
        await axios.post("http://localhost:8000/api/cases", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMsg("✅ Policy created!");
      }
      setForm(EMPTY);
      setEditing(null);
      await load();
    } catch (e) {
      setMsg("❌ Save failed — check backend connectivity.");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  };

  const deleteCase = async (id) => {
    const token = localStorage.getItem("nexa_token");
    if (!token || !window.confirm("Permanently delete this intelligence policy?")) return;
    await axios.delete(`http://localhost:8000/api/cases/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
  };

  const body = () => (
    <div className="animate-fade-in" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
        <div>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>REASONING ENGINE</p>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "2rem" }}>
            Resolution <span className="gradient-text">Policies</span>
          </h1>
        </div>
        <div className="glass" style={{ padding: "0.6rem 1.25rem", borderRadius: 12, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.6rem", fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 10px #10b981" }} />
            {cases.length} Live Intelligence Units
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Form */}
        <div className="glass" style={{ borderRadius: 24, padding: "2rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.5rem" }}>
            {editing ? "✏️ Edit Policy" : "➕ Deploy New Policy"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="label">Customer Intent</label>
              <select className="input" value={form.intent} onChange={e => setForm({ ...form, intent: e.target.value })}>
                {INTENTS.map(i => <option key={i} value={i}>{i.replace(/_/g, " ")}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Trigger Sentiment</label>
              <select className="input" value={form.anger_bucket} onChange={e => setForm({ ...form, anger_bucket: e.target.value })}>
                {ANGER_BUCKETS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Resolution Template</label>
              <textarea
                className="input"
                rows={5}
                placeholder="Use {customer_name}, {order_id}, {compensation_value} as dynamic variables"
                value={form.response_template}
                onChange={e => setForm({ ...form, response_template: e.target.value })}
                style={{ resize: "vertical", lineHeight: 1.5 }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label className="label">Reward Type</label>
                <select className="input" value={form.compensation_type} onChange={e => setForm({ ...form, compensation_type: e.target.value })}>
                  {COMP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Value</label>
                <input className="input" placeholder='e.g. "20%" or "₹250"' value={form.compensation_value} onChange={e => setForm({ ...form, compensation_value: e.target.value })} disabled={form.compensation_type === "none"} />
              </div>
            </div>

            {msg && <div style={{ fontSize: "0.85rem", padding: "0.75rem", borderRadius: 12, background: "rgba(0,0,0,0.05)", textAlign: "center", fontWeight: 600 }}>{msg}</div>}

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
              <button className="btn-primary" onClick={save} disabled={saving} style={{ flex: 1 }}>
                {saving ? "Deploying..." : editing ? "Update Policy" : "Deploy to Neural Core"}
              </button>
              {editing && (
                <button className="btn-secondary" onClick={() => { setEditing(null); setForm(EMPTY); }}>Cancel</button>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          {cases.length === 0 ? (
            <div className="glass" style={{ borderRadius: 24, padding: "4rem", textAlign: "center" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "1.5rem" }}>🧠</div>
              <p style={{ color: "var(--color-text-dim)", fontWeight: 500 }}>No intelligence units deployed.<br />Use the builder to create your first policy.</p>
            </div>
          ) : (
            cases.map(c => (
              <div key={c.id} className="glass glass-hover" style={{ borderRadius: 20, padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <span style={{ background: "rgba(99, 102, 241, 0.1)", color: "#4f46e5", padding: "0.3rem 0.75rem", borderRadius: 8, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                      {c.intent.replace(/_/g, " ")}
                    </span>
                    <AngerBadge level={c.anger_bucket} />
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => { setEditing(c.id); setForm(c); }} className="btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.75rem", borderRadius: 8 }}>Edit</button>
                    <button onClick={() => deleteCase(c.id)} className="btn-secondary" style={{ padding: "0.4rem 1rem", fontSize: "0.75rem", borderRadius: 8, color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)" }}>Delete</button>
                  </div>
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: "1.25rem", lineHeight: 1.6, fontStyle: "italic", borderLeft: "3px solid var(--color-border)", paddingLeft: "1rem" }}>
                  &ldquo;{c.response_template}&rdquo;
                </p>
                {c.compensation_type !== "none" && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(16, 185, 129, 0.1)", padding: "0.35rem 0.875rem", borderRadius: 10, fontSize: "0.75rem", fontWeight: 700, color: "#10b981" }}>
                    🎁 {c.compensation_type.toUpperCase()} : {c.compensation_value}
                  </div>
                )}
              </div>
            ))
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
                {body()}
            </NexaAuthWrapper>
        </main>
    </div>
  );
}
