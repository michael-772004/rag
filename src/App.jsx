import React, { useState } from "react";

export default function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 🧩 Send question to FastAPI
  const handleSend = async () => {
    if (!question.trim()) return;

    const userMessage = { sender: "user", text: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.answer || "No answer received." };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const botMessage = { sender: "bot", text: "❌ Failed to connect to backend.",error };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Upload PDF file
  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file first.");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Failed to upload PDF.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#007bff",
          color: "white",
          padding: "15px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "20px",
        }}
      >
        🤖 RAG + Llama3.2 Chat
      </div>

      {/* Chat Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? "#007bff" : "#eaeaea",
              color: msg.sender === "user" ? "white" : "black",
              padding: "10px 15px",
              borderRadius: "15px",
              maxWidth: "70%",
              wordWrap: "break-word",
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div
            style={{
              alignSelf: "flex-start",
              backgroundColor: "#eaeaea",
              color: "#333",
              padding: "10px 15px",
              borderRadius: "15px",
              maxWidth: "60%",
              fontStyle: "italic",
            }}
          >
            🧠 Thinking...
          </div>
        )}
      </div>

      {/* Upload + Input Bar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10px",
          backgroundColor: "white",
          borderTop: "1px solid #ccc",
          position: "sticky",
          bottom: 0,
        }}
      >
        {/* Upload Controls */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ flex: 1 }}
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              marginLeft: "10px",
              padding: "8px 15px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
        </div>

        {/* Chat Input */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              flex: 1,
              padding: "10px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              marginRight: "10px",
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
