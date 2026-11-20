import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef(null);

  // Directly points to your backend FastAPI server bypass route
  const API_BASE_URL = "http://127.0.0.1:8000/api";
  

  const suggestions = [
    "Who are you?",
    "I'm from a non-IT background. Can I learn AI?",
    "How long does the course take?",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);




const handleSendMessage = async (text) => {
  if (!text.trim() || isThinking) return;

  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "human",
      text: text,
    },
  ]);

  setInput("");
  setIsThinking(true);

  const url = "http://127.0.0.1:8000/api/chat";

  console.log("React requesting:", url);

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: text,
      }),
    });
 

    console.log("HTTP status:", response.status);

    const data = await response.json();

    console.log("Response data:", data);

    if (!response.ok) {
      throw new Error(data.detail || `HTTP ${response.status}`);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "ai",
        text: data.reply,
      },
    ]);

  } catch (error) {
    console.error("React fetch failed:", error);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "ai",
        text: `Error: ${error.message}`,
      },
    ]);

  } finally {
    setIsThinking(false);
  }
};


  // const handleSendMessage = async (text) => {
  //   if (!text.trim() || isThinking) return;

  //   const userMessage = { id: Date.now(), role: "human", text: text };
  //   setMessages((prev) => [...prev, userMessage]);
  //   setInput("");
  //   setIsThinking(true);

  //   try {
  //     const response = await fetch(`${API_BASE_URL}/chat`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ message: text }), // Clean single-session text payload
  //     });

  //     if (!response.ok) throw new Error("Server processed your request with an error code.");
  //     const data = await response.json();

  //     setMessages((prev) => [
  //       ...prev,
  //       { id: Date.now() + 1, role: "ai", text: data.reply },
  //     ]);
  //   } catch (error) {
  //     setMessages((prev) => [
  //       ...prev,
  //       { id: Date.now() + 1, role: "ai", text: `Sorry, something is not right: ${error.message}` },
  //     ]);
  //   } finally {
  //     setIsThinking(false);
  //   }
  // };

  const handleClearConversation = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reset`, { 
        method: "POST" 
      });
      if (!response.ok) throw new Error("Clear request rejected by server.");
      setMessages([]);
    } catch (error) {
      console.error("Failed to wipe remote memory session reference.", error);
      alert(`Wipe error: ${error.message}`);
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h3 className="fallback-title">🏢 BEPEC AI</h3>
        </div>
        
        <div className="sidebar-section">
          <h2>Admin Controls</h2>
          <p className="caption">Learning Sandbox (Single Session)</p>
        </div>

        <div className="sidebar-section">
          <button className="btn-clear" onClick={handleClearConversation}>
            🧹 Clear Conversation
          </button>
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section system-info">
          <h3>📊 Pipeline Config</h3>
          <ul>
            <li><strong>Agent:</strong> Ruchi Assistant</li>
            <li><strong>Model:</strong> <code>gpt-4o-mini</code></li>
            <li><strong>Session Mode:</strong> Single Instance</li>
          </ul>
        </div>
      </aside>

      <div className="main-content-layout">
        <div className="chat-container">
          <header className="chat-header">
            <h1>🤖 Ruchi AI Assistant</h1>
            <p>Interactive single-session learning template.</p>
          </header>

          <div className="messages-viewport">
            {messages.length === 0 ? (
              <div className="empty-chat-state">
                <p>No active message history. Click a suggestion below to start.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`chat-message ${msg.role === "human" ? "user" : "assistant"}`}>
                  <div className="avatar">{msg.role === "human" ? "👤" : "🧠"}</div>
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))
            )}
            {isThinking && (
              <div className="chat-message assistant thinking">
                <div className="avatar">🧠</div>
                <div className="message-bubble thinking-bubble">
                  <span className="spinner"></span> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-controls">
            <div className="suggestions-grid">
              {suggestions.map((sug, index) => (
                <button key={index} className="suggestion-pill" onClick={() => handleSendMessage(sug)} disabled={isThinking}>
                  ✨ {sug}
                </button>
              ))}
            </div>

            <form className="input-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}>
              <input
                type="text"
                placeholder="Ask about our AI, Data Science, and Data Engineering courses..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isThinking}
              />
              <button type="submit" disabled={isThinking || !input.trim()}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
