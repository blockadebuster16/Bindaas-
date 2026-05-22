import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import NexaAuthWrapper from "./components/NexaAuthWrapper";

export default function NexaKB() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("nexa_token");
    if (!token) {
        setLoading(false);
        return;
    }

    axios.get("http://localhost:8000/api/kb/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => setContent(r.data.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    const token = localStorage.getItem("nexa_token");
    if (!token) return;
    
    setSaving(true);
    setMsg("");
    try {
      await axios.post("http://localhost:8000/api/kb/save", 
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("✅ Intelligence matrix updated successfully!");
    } catch {
      setMsg("❌ Failed to sync with neural core.");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 4000);
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("nexa_token");
    if (!token) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setMsg("");
    try {
      const res = await axios.post("http://localhost:8000/api/kb/upload", formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
      });
      
      // Fetch the full content again or use the preview
      setMsg("✅ File analyzed and indexed!");
      // Optimization: Fetch the full KB again to show in the textarea
      const r = await axios.get("http://localhost:8000/api/kb/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContent(r.data.content);

    } catch (err) {
      console.error("File upload failed", err);
      setMsg("❌ Failed to process document.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  }

  if (loading) return <div style={{ padding: "2rem", color: "var(--color-text-muted)" }}>Synchronizing with Knowledge Base...</div>;

  const body = () => (
    <div className="animate-fade-in" style={{ padding: "2rem", maxWidth: 1000 }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>UNSTRUCTURED INTELLIGENCE</p>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "2rem" }}>
          Knowledge <span className="gradient-text">Base</span>
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginTop: "0.75rem", fontSize: "0.95rem", lineHeight: 1.6 }}>
          Paste your company policies, refund rules, and shipping guidelines here. 
          NEXA's **Semantic Search** engine will automatically index this text and use it to resolve customer queries in real-time.
        </p>
      </div>

      <div className="glass" style={{ borderRadius: 24, padding: "2rem", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text)" }}>Policy Manual</h3>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {msg && <span style={{ fontSize: "0.85rem", fontWeight: 600, color: msg.startsWith("✅") ? "#10b981" : "#ef4444" }}>{msg}</span>}
                <label className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>📁 {isUploading ? "Processing..." : "Upload Document"}</span>
                    <input 
                        type="file" 
                        accept=".pdf,.docx,.txt" 
                        style={{ display: "none" }} 
                        onChange={handleFileUpload}
                        disabled={isUploading}
                    />
                </label>
            </div>
        </div>
        
        <textarea
          style={{
            width: "100%",
            minHeight: "500px",
            background: "#ffffff",
            border: "1.5px solid var(--color-border)",
            borderRadius: 16,
            padding: "1.5rem",
            color: "var(--color-text)",
            fontFamily: "inherit",
            fontSize: "1rem",
            lineHeight: 1.7,
            outline: "none",
            resize: "vertical"
          }}
          placeholder="e.g. Our refund policy allows for a 100% refund within 90 days if the product is unopened. Shipping to North America takes 5-7 business days..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end", gap: "1rem", alignItems: "center" }}>
           <p style={{ fontSize: "0.8rem", color: "var(--color-text-dim)" }}>
             Character count: <strong>{content.length}</strong> · Estimated chunks: <strong>{Math.ceil(content.length / 500)}</strong>
           </p>
           <button 
             className="btn-primary" 
             onClick={save} 
             disabled={saving || isUploading}
             style={{ padding: "0.75rem 2rem", fontSize: "0.95rem" }}
           >
             {saving ? "Syncing..." : "Update Intelligence Matrix"}
           </button>
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
