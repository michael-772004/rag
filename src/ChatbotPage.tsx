import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  LogOut,
  Users,
  Database,
  MessageSquare,
  Bell,
  Bot,
  User,
  
  ChartColumn,
  PanelLeft,
} from "lucide-react";

const API_URL = "http://localhost:8000/api/query"; //  backend endpoint

export default function ChatbotPage() {
  const [messages, setMessages] = useState<
    { role: string; content: string; time?: string }[]
  >([
    {
      role: "bot",
      content:
        "Hi! Welcome to RTA Agent Portal Chat. I'm here to help you with transportation data and queries. Ask me anything about ridership statistics, transportation performance, or any RTA-related data.",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      role: "user",
      content: inputText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: inputText }),
      });

      const data = await response.json();
      const botReply =
        data.reply || data.answer || "Sorry, I couldn’t get a response.";

      const botMessage = {
        role: "bot",
        content: botReply,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "❌ Error: Unable to reach the backend server.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden">
      {/* ===== Sidebar ===== */}
      <aside
        className={`bg-white border-r shadow-sm flex flex-col justify-between transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        <div>
          <div className="p-6 border-b text-center">
            <h1 className="text-lg font-semibold text-gray-800">RTA Portal</h1>
            <p className="text-sm text-gray-500">Agent Dashboard</p>
          </div>

          <nav className="p-4 space-y-2 text-gray-600">
            <a
              href="#"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-black "
            >
              <ChartColumn size={18} /> Dashboard
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-black "
            >
              <Users size={18} /> User Management
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-black "
            >
              <Database size={18} /> Data
            </a>
            <a
              href="#"
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-100 text-black "
            >
              <MessageSquare className="text-blue-600" size={18} /> Chat
            </a>
          </nav>
        </div>

        <div className="p-4 border-t flex items-center gap-2 text-red-600 hover:bg-red-50 cursor-pointer rounded">
          <LogOut size={16} />
          <span>Logout</span>
        </div>
      </aside>

      {/* ===== Main Section ===== */}
      <main className="flex-1 flex flex-col bg-gray-50">
        {/* ===== Top Header ===== */}
        <header className="flex justify-between items-center bg-white p-5 border-b shadow-sm">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {isSidebarOpen ? (
                <PanelLeft size={22} className="text-gray-700" />
              ) : (
                <PanelLeft size={22} className="text-gray-700" />
              )}
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                RTA Agent Portal
              </h2>
            </div>
          </div>

          <button className="relative bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </header>

        {/* ===== Chat Support Header ===== */}
        <div className="flex items-center gap-3 px-8 py-6">
          <MessageSquare className="text-black-600" size={28} />
          <div>
            <h2 className="text-3xl font-bold text-gray-800 leading-tight">
              Chat Support
            </h2>
            <p className="text-sm text-gray-500">
              Get instant help with RTA data and queries
            </p>
          </div>
        </div>

        {/* ===== Chat Container ===== */}
        <div className="flex-1 mx-6 mb-6 bg-white rounded-xl border shadow-sm flex flex-col">
          {/* ===== Chat Header ===== */}
          <div className="border-b p-6 flex items-center gap-3">
            <MessageSquare className="text-blue-500" size={20} />
            <h3 className="text-base font-semibold text-gray-700">
              RTA Assistant
            </h3>
          </div>

          {/* ===== Chat Messages ===== */}
          <div className="border border-black-100 flex-1  overflow-y-auto p-6 space-y-5">
            {messages.map((msg, i) => {
              if (msg.role === "bot") {
                return (
                  <div key={i} className="flex items-end gap-3 justify-start">
                    {/* Bot avatar */}
                    <div className=" w-9 h-9 bg-gray-200 flex items-center justify-center rounded-full shadow-sm">
                      <Bot className="text-gray-600" size={18} />
                    </div>

                    {/* Bot message bubble */}
                    <div className="flex flex-col items-start max-w-[70%]">
                      <div className="border border-black-600 bg-white-100 text-gray-800 p-3 rounded-2xl rounded-bl-none shadow-sm text-sm leading-relaxed">
                        {msg.content}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              }

              if (msg.role === "user") {
                return (
                  <div key={i} className="flex items-end gap-3 justify-end">
                    {/* User message bubble */}
                    <div className="flex flex-col items-end max-w-[75%]">
                      <div className="bg-blue-500 text-white p-3 rounded-2xl rounded-br-none shadow-md text-sm leading-relaxed">
                        {msg.content}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        {msg.time}
                      </span>
                    </div>

                    {/* User avatar */}
                    <div className="w-9 h-9 bg-blue-500 flex items-center justify-center rounded-full shadow-sm">
                      <User className="text-white" size={18} />
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Bot size={16} />
                RTA Assistant is typing...
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* ===== Input Box ===== */}
          <div className="border-t bg-gray-50 py-5 px-4 rounded-b-xl flex justify-center">
            <div className="flex items-center gap-3 w-full max-w-4xl">
              <input
                type="text"
                placeholder="Ask me about RTA transportation data..."
                className="flex-1 p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className={`${
                  inputText.trim()
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-blue-300 text-blue-400"
                } p-3.5 rounded-xl shadow-sm transition active:scale-95`}
              >
                <Send className="text-white" size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
