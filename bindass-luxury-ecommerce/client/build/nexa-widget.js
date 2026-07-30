/**
 * NEXA AI — Embeddable Chat Widget (Real-Time Handover Enabled)
 * ============================================================
 * Vanilla JS · Zero dependencies · WebSocket Ready
 */
(function () {
  "use strict";

  const cfg = window.NexaConfig || {};
  const OWNER_ID = cfg.ownerId || "demo";
  const API_URL = cfg.apiUrl || "http://localhost:8000";
  const WS_URL = API_URL.replace("http", "ws");

  // ── State ─────────────────────────────────────────────────────────────────
  let open = false;
  let mode = "ai"; // "ai" | "human"
  let socket = null;
  const clientId = `cust_${Math.random().toString(36).substr(2, 9)}`;
  
  // Configuration that will be fetched
  let liveConfig = {
    botName: cfg.botName || "NEXA Support",
    botLogo: cfg.botLogo || "",
    primaryColor: cfg.primaryColor || "#6366f1",
    position: cfg.position || "bottom-right",
    greeting: cfg.greeting || "👋 Hi! I'm your AI support assistant. How can I help you today?"
  };

  // ── Fetch Live Config ──────────────────────────────────────────────────────
  async function fetchLiveConfig() {
    try {
      const res = await fetch(`${API_URL}/api/widget/public/${OWNER_ID}`);
      const data = await res.json();
      if (data && data.bot_name) {
        liveConfig = {
            botName: data.bot_name,
            botLogo: data.bot_logo,
            primaryColor: data.primary_color,
            position: data.position,
            greeting: data.greeting
        };
      }
    } catch (e) {
      console.error("NEXA: Failed to fetch live config", e);
    }
    initWidget();
  }

  // ── WebSocket Logic ───────────────────────────────────────────────────────
  function initSocket() {
    if (socket) return;
    try {
        socket = new WebSocket(`${WS_URL}/ws/${clientId}`);
        
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "chat") {
            addMessage(data.text, "bot", null, liveConfig.botName);
          } else if (data.type === "status") {
            mode = "human";
            updateStatus("Human Agent Joined");
            addMessage(data.text, "system");
          }
        };

        socket.onclose = () => {
          socket = null;
          setTimeout(initSocket, 5000);
        };
    } catch (e) {
        console.error("Socket initialization failed", e);
    }
  }

  function initWidget() {
    // ── Styles ──────────────────────────────────────────────────────────────────
    const CSS = `
      #nexa-widget-btn { 
        position: fixed; 
        ${liveConfig.position === "bottom-left" ? "left: 24px;" : "right: 24px;"} 
        bottom: 24px; 
        width: 56px; 
        height: 56px; 
        border-radius: 50%; 
        background: ${liveConfig.primaryColor}; 
        border: none; 
        cursor: pointer; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-size: 1.5rem; 
        box-shadow: 0 4px 24px ${liveConfig.primaryColor}60; 
        transition: transform 0.2s ease; 
        z-index: 1000000; 
        color: white;
        overflow: hidden;
      }
      #nexa-widget-btn img { width: 60%; height: 60%; object-fit: contain; }
      #nexa-widget-panel { 
        position: fixed; 
        ${liveConfig.position === "bottom-left" ? "left: 24px;" : "right: 24px;"} 
        bottom: 92px; 
        width: 360px; 
        height: 500px;
        max-height: 80vh; 
        background: #ffffff; 
        border: 1px solid #e2e8f0; 
        border-radius: 20px; 
        display: flex; 
        flex-direction: column; 
        overflow: hidden; 
        z-index: 1000001; 
        box-shadow: 0 20px 60px rgba(0,0,0,0.15); 
        font-family: 'Inter', -apple-system, sans-serif; 
        transform: scale(0.9) translateY(20px); 
        opacity: 0; 
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
        pointer-events: none; 
      }
      #nexa-widget-panel.open { 
        transform: scale(1) translateY(0); 
        opacity: 1; 
        pointer-events: all; 
      }
      #nexa-header { padding: 1.25rem; background: ${liveConfig.primaryColor}; color: white; display: flex; align-items: center; gap: 0.75rem; }
      #nexa-avatar { width: 36px; height: 36px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(0,0,0,0.05); }
      #nexa-avatar img { width: 70%; height: 70%; object-fit: contain; }
      #nexa-bot-name { font-weight: 700; font-size: 1rem; }
      #nexa-status-text { font-size: 0.75rem; opacity: 0.9; }
      #nexa-messages { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; background: #fdfdfd; }
      .nexa-msg { max-width: 85%; font-size: 0.9rem; line-height: 1.5; display: flex; flex-direction: column; }
      .nexa-msg.bot { align-self: flex-start; }
      .nexa-msg.user { align-self: flex-end; }
      .nexa-msg.system { align-self: center; width: 100%; text-align: center; font-size: 0.75rem; color: #94a3b8; margin: 0.5rem 0; font-style: italic; }
      .nexa-bubble { padding: 0.75rem 1rem; border-radius: 16px; position: relative; }
      .nexa-msg.bot .nexa-bubble { background: #f1f5f9; color: #1e293b; border-bottom-left-radius: 4px; }
      .nexa-msg.user .nexa-bubble { background: ${liveConfig.primaryColor}; color: white; border-bottom-right-radius: 4px; }
      .nexa-sender-name { font-size: 0.7rem; color: #64748b; margin-bottom: 0.25rem; margin-left: 0.25rem; font-weight: 600; }
      #nexa-input-area { padding: 1rem; border-top: 1px solid #f1f5f9; display: flex; gap: 0.75rem; background: white; align-items: center; }
      #nexa-input { 
        flex: 1; 
        border: 1.5px solid #e2e8f0; 
        border-radius: 12px; 
        padding: 0.75rem 1rem; 
        font-size: 0.95rem; 
        outline: none; 
        transition: border-color 0.2s;
        background: #fafafa;
      }
      #nexa-input:focus { border-color: ${liveConfig.primaryColor}; background: white; }
      #nexa-send-btn { 
        background: ${liveConfig.primaryColor}; 
        color: white; 
        border: none; 
        border-radius: 12px; 
        padding: 0.75rem 1.25rem; 
        cursor: pointer; 
        font-weight: 700; 
        font-size: 0.9rem;
        transition: opacity 0.2s, transform 0.1s;
      }
      #nexa-send-btn:active { transform: scale(0.95); }
      #nexa-send-btn:disabled { opacity: 0.5; cursor: default; }
    `;

    // ── Inject Styles ──────────────────────────────────────────────────────────
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    // ── Build DOM ──────────────────────────────────────────────────────────────
    const btn = document.createElement("button");
    btn.id = "nexa-widget-btn";
    btn.innerHTML = liveConfig.botLogo ? `<img src="${liveConfig.botLogo}" alt="Logo" />` : "💬";
    document.body.appendChild(btn);

    const panel = document.createElement("div");
    panel.id = "nexa-widget-panel";
    panel.innerHTML = `
      <div id="nexa-header">
        <div id="nexa-avatar">${liveConfig.botLogo ? `<img src="${liveConfig.botLogo}" alt="Logo" />` : "🤖"}</div>
        <div style="flex:1">
          <div id="nexa-bot-name">${liveConfig.botName}</div>
          <div id="nexa-status-text">Online · AI Support</div>
        </div>
        <button id="nexa-close" style="background:none;border:none;color:white;cursor:pointer;font-size:1.5rem;line-height:1">✕</button>
      </div>
      <div id="nexa-messages">
        <div class="nexa-msg bot">
          <div class="nexa-bubble">${liveConfig.greeting}</div>
        </div>
      </div>
      <div id="nexa-input-area">
        <input id="nexa-input" type="text" placeholder="Type a message..." autocomplete="off" />
        <button id="nexa-send-btn">Send</button>
      </div>
    `;
    document.body.appendChild(panel);

    // ── Events ────────────────────────────────────────────────────────────────
    btn.onclick = () => {
      open = !open;
      panel.classList.toggle("open", open);
      if (open) {
          btn.innerHTML = "✕";
          setTimeout(() => document.getElementById("nexa-input")?.focus(), 300);
      } else {
          btn.innerHTML = liveConfig.botLogo ? `<img src="${liveConfig.botLogo}" alt="Logo" />` : "💬";
      }
    };
    
    document.getElementById("nexa-close").onclick = (e) => {
      e.stopPropagation();
      btn.click();
    };
    
    document.getElementById("nexa-send-btn").onclick = handleSend;
    document.getElementById("nexa-input").onkeydown = (e) => {
      if (e.key === "Enter") {
          e.preventDefault();
          handleSend();
      }
    };

    async function handleSend() {
        const input = document.getElementById("nexa-input");
        const sendBtn = document.getElementById("nexa-send-btn");
        if (!input || !sendBtn) return;
        
        const text = input.value.trim();
        if (!text) return;
    
        addMessage(text, "user");
        input.value = "";
        sendBtn.disabled = true;
    
        if (mode === "human" && socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: "chat",
            target_id: "agent_active", 
            text: text
          }));
          sendBtn.disabled = false;
        } else {
          try {
            const res = await fetch(`${API_URL}/api/predict`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: text, owner_id: OWNER_ID })
            });
            const data = await res.json();
            addMessage(data.response, "bot");
            
            if (data.anger_level === "ANGRY") {
              initSocket();
            }
          } catch (e) {
            addMessage("Connection error.", "system");
          } finally {
            sendBtn.disabled = false;
            input.focus();
          }
        }
    }

    function addMessage(text, role, meta, sender = null) {
        const messagesEl = document.getElementById("nexa-messages");
        if (!messagesEl) return;
        
        const msg = document.createElement("div");
        msg.className = `nexa-msg ${role}`;
        
        let html = "";
        if (sender) html += `<span class="nexa-sender-name">${sender}</span>`;
        html += `<div class="nexa-bubble">${text}</div>`;
        
        msg.innerHTML = html;
        messagesEl.appendChild(msg);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function updateStatus(text) {
        const statusEl = document.getElementById("nexa-status-text");
        const avatarEl = document.getElementById("nexa-avatar");
        if (statusEl) statusEl.innerText = text;
        if (avatarEl) avatarEl.innerHTML = mode === "ai" 
            ? (liveConfig.botLogo ? `<img src="${liveConfig.botLogo}" alt="Logo" />` : "🤖")
            : "👨‍💼";
    }

    initSocket();
  }

  // Start by fetching config
  fetchLiveConfig();

})();
