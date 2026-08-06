import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSidebar from "../../components/AdminSidebar";
import NexaAuthWrapper from "./components/NexaAuthWrapper";

export default function NexaEmbed() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [config, setConfig] = useState({
    bot_name: "NEXA Support",
    primary_color: "#022919ff",
    greeting: "Hi! I'm your AI support assistant. How can I help you today?",
    position: "bottom-right",
    bot_logo: "",
  });
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "success" });
  const [ownerId, setOwnerId] = useState("system_admin");

  useEffect(() => {
    const id = localStorage.getItem("nexa_owner_id");
    if (id) setOwnerId(id);
    fetchConfig();
  }, []);

  async function fetchConfig() {
    const token = localStorage.getItem("nexa_token");
    if (!token) return;
    try {
        const res = await axios.get("http://localhost:8000/api/widget/", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setConfig(res.data);
    } catch (err) {
        console.error("Failed to fetch widget config", err);
    }
  }

  async function saveConfig(updatedConfig = null) {
    const token = localStorage.getItem("nexa_token");
    if (!token) {
        setMsg({ text: "âŒ Not authenticated with Neural Core.", type: "error" });
        return;
    }
    
    const configToSave = updatedConfig || config;
    setIsSaving(true);
    setMsg({ text: "", type: "success" });
    try {
        await axios.post("http://localhost:8000/api/widget/save", configToSave, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setMsg({ text: "âœ… Configuration synchronized!", type: "success" });
        setTimeout(() => setMsg({ text: "", type: "success" }), 4000);
    } catch (err) {
        const errorMsg = err.response?.data?.detail || "Sync failed.";
        console.error("Nexa Sync Error:", err.response?.data || err.message);
        setMsg({ text: `âŒ ${errorMsg}`, type: "error" });
        
        if (err.response?.status === 401) {
            // Token might be expired or invalid due to server restart
            setMsg({ text: "âŒ Session expired. Please refresh and login again.", type: "error" });
        }
    } finally {
        setIsSaving(false);
    }
  }

  const scriptTag = `<!-- NEXA AI Chat Widget -->
<script>
  (function() {
    window.NexaConfig = {
      ownerId: "${ownerId}",
      botName: "${config.bot_name}",
      botLogo: "${config.bot_logo}",
      primaryColor: "${config.primary_color}",
      position: "${config.position}",
      greeting: "${config.greeting}",
      apiUrl: "http://localhost:8000"
    };
    var s = document.createElement('script');
    s.src = 'http://localhost:3000/nexa-widget.js';
    s.async = true;
    document.head.appendChild(s);
  })();
</script>`;

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('images', file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem('adminToken');
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/upload`, data, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
        }
      });
      
      if (res.data.success) {
         const newLogo = res.data.urls[0];
         const newConfig = { ...config, bot_logo: newLogo };
         setConfig(newConfig);
         // Auto-save to ensure it doesn't "reset" on refresh
         await saveConfig(newConfig);
      }
    } catch (err) {
      console.error("Logo upload failed", err);
      setMsg({ text: "âŒ Logo upload failed.", type: "error" });
    } finally {
      setIsUploading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(scriptTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const body = () => (
    <div className="animate-fade-in" style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>WIDGET DEPLOYMENT</p>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "2rem" }}>
          Widget <span className="gradient-text">Generator</span>
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginTop: "0.75rem", fontSize: "0.95rem" }}>
          Configure your AI chat widget and get the embed code for your storefront.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: "2rem", alignItems: "start" }}>
        {/* Config */}
        <div className="glass" style={{ borderRadius: 24, padding: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.5rem" }}>âš™ï¸ Appearance</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label className="label">Assistant Name</label>
              <input className="input" value={config.bot_name} onChange={e => setConfig({ ...config, bot_name: e.target.value })} />
            </div>
            <div>
              <label className="label">Widget Logo (SVG preferred)</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--color-surface-3)", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid var(--color-border)", overflow: "hidden" }}>
                  {config.bot_logo ? <img src={config.bot_logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ fontSize: "1.2rem" }}>ðŸ¤–</span>}
                </div>
                <label className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", cursor: "pointer" }}>
                  {isUploading ? "Uploading..." : "Upload SVG"}
                  <input type="file" accept=".svg,image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                </label>
                {config.bot_logo && <button onClick={() => setConfig({...config, bot_logo: ""})} style={{ background: "none", border: "none", color: "#ef4444", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}>Remove</button>}
              </div>
            </div>
            <div>
              <label className="label">Brand Color</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <input type="color" value={config.primary_color} onChange={e => setConfig({ ...config, primary_color: e.target.value })} style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: "none", cursor: "pointer" }} />
                <input className="input" value={config.primary_color} onChange={e => setConfig({ ...config, primary_color: e.target.value })} style={{ fontFamily: "monospace" }} />
              </div>
            </div>
            <div>
              <label className="label">Greeting Message</label>
              <textarea className="input" rows={3} value={config.greeting} onChange={e => setConfig({ ...config, greeting: e.target.value })} />
            </div>
            <div>
              <label className="label">Widget Position</label>
              <select className="input" value={config.position} onChange={e => setConfig({ ...config, position: e.target.value })}>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>
        </div>

        {/* Script */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass" style={{ borderRadius: 24, padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700 }}>ðŸ“‹ Embed Code</h2>
              <button className="btn-primary" onClick={copy} style={{ padding: "0.5rem 1.5rem", fontSize: "0.85rem" }}>
                {copied ? "âœ… Copied!" : "Copy Snippet"}
              </button>
            </div>
            <div style={{ background: "#ffffff", border: "1px solid var(--color-border)", borderRadius: 16, padding: "1.5rem", position: "relative" }}>
               <pre style={{ margin: 0, fontSize: "0.85rem", color: "#4f46e5", whiteSpace: "pre-wrap", wordBreak: "break-all", fontFamily: "monospace" }}>
                 {scriptTag}
               </pre>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem", alignItems: "center" }}>
                {msg.text && <span style={{ fontSize: "0.85rem", fontWeight: 600, color: msg.type === "success" ? "#10b981" : "#ef4444" }}>{msg.text}</span>}
                <button 
                  className="btn-primary" 
                  onClick={saveConfig} 
                  disabled={isSaving}
                  style={{ padding: "0.75rem 2rem" }}
                >
                  {isSaving ? "Syncing..." : "Save Changes"}
                </button>
            </div>
            <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", alignItems: "center", color: "var(--color-text-dim)", fontSize: "0.85rem" }}>
                <span>ðŸ’¡</span>
                <span>Paste this snippet before the <code>&lt;/body&gt;</code> tag of your website.</span>
            </div>
          </div>

          <div className="glass" style={{ borderRadius: 24, padding: "2rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1.25rem" }}>ðŸ‘ï¸ Visual Preview</h2>
            <div style={{ background: "#ffffff", borderRadius: 16, height: "200px", display: "flex", justifyContent: config.position === "bottom-right" ? "flex-end" : "flex-start", alignItems: "flex-end", padding: "2rem", border: "1px dashed var(--color-border)" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: config.position === "bottom-right" ? "flex-end" : "flex-start", gap: "1rem" }}>
                    <div className="glass" style={{ padding: "1rem", borderRadius: "16px 16px 4px 16px", fontSize: "0.8rem", maxWidth: "200px", border: "1px solid var(--color-border)" }}>
                        {config.greeting}
                    </div>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: config.primary_color, boxShadow: `0 0 20px ${config.primary_color}60`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", overflow: "hidden" }}>
                        {config.bot_logo ? <img src={config.bot_logo} alt="Logo" style={{ width: "60%", height: "60%", objectFit: "contain" }} /> : "ðŸ’¬"}
                    </div>
                </div>
            </div>
          </div>
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


