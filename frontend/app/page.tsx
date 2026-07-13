"use client";

import { useState } from "react";
import { Upload, AlertTriangle, DollarSign, FileText, Loader2, MessageSquare, Send } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");

  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const uploadAndAnalyze = async () => {
    if (!file) {
      setError("Upload File Here!");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);
    setChatHistory([]); // Purani chat reset karo

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/backend/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.status === "success") {
        setAnalysis(data.analysis);
      } else {
        setError(data.detail || "Something is Wrong!");
      }
    } catch (err) {
      setError("Could not connect to backend");
    } finally {
      setLoading(false);
    }
  };

  // Chat API call function
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatHistory((prev) => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("/api/backend/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg }),
      });
      const data = await response.json();
      if (response.ok) {
        setChatHistory((prev) => [...prev, { role: "ai", text: data.answer }]);
      } else {
        setChatHistory((prev) => [...prev, { role: "ai", text: "⚠️ Error: Can not give Answer." }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: "ai", text: "⚠️ is server down?" }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto border-b border-gray-800 pb-4 mb-8">
        <h1 className="text-3xl font-bold text-emerald-400">Legal Doc Analyzer</h1>
        <p className="text-gray-400 text-sm mt-1">Simplify complex contracts and legal documents instantly.</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Upload Box */}
        <div className="lg:col-span-4 bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload size={20} className="text-emerald-400" /> Upload PDF
          </h2>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors relative cursor-pointer">
            <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <FileText className="mx-auto text-gray-400 mb-2" size={40} />
            <p className="text-sm text-gray-300">{file ? file.name : "Select/drag your PDF here."}</p>
          </div>
          {error && <p className="text-red-400 text-sm mt-3 font-medium">⚠️ {error}</p>}
          <button onClick={uploadAndAnalyze} disabled={loading} className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 text-gray-950 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={20} /> Scanning...</> : "Analyze Document"}
          </button>
        </div>

        {/* Right Side: Analysis and Chat View */}
        <div className="lg:col-span-8 space-y-6">
          {!analysis && !loading && (
            <div className="bg-gray-800 p-12 rounded-xl border border-gray-700 text-center text-gray-400">
              Start the report by uploading the PDF from the left side.
            </div>
          )}

          {loading && (
            <div className="bg-gray-800 p-12 rounded-xl border border-gray-700 text-center text-gray-400 animate-pulse">
              Preparing the report...
            </div>
          )}

          {analysis && (
            <>
              {/* Report Dashboard Widgets */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2"><FileText size={18} /> Summary</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  {analysis.summary.map((point: string, idx: number) => <li key={idx}>{point}</li>)}
                </ul>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2"><AlertTriangle size={18} /> Risk Assessment</h3>
                <div className="space-y-3">
                  {analysis.red_flags.map((flag: any, idx: number) => (
                    <div key={idx} className="bg-gray-900 p-4 rounded-lg border-l-4 border-red-500">
                      <p className="text-xs text-gray-500">Clause: "{flag.clause}"</p>
                      <p className="text-sm text-gray-300 mt-1 font-medium">👉 {flag.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🔥 NEW FEATURE: Chat Box Component */}
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col h-[400px]">
                <h3 className="text-lg font-bold text-sky-400 mb-3 flex items-center gap-2">
                  <MessageSquare size={18} /> Document Chat Assistant (Chat)
                </h3>

                {/* Messages Display Screen */}
                <div className="flex-1 bg-gray-900 rounded-lg p-4 overflow-y-auto space-y-3 custom-scrollbar">
                  {chatHistory.length === 0 && (
                    <p className="text-gray-500 text-center text-sm mt-12">Ask anything about this document (e.g., what is its tech stack? or what is the notice period?)</p>
                  )}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.role === "user" ? "bg-sky-600 text-white" : "bg-gray-800 text-gray-200 border border-gray-700"
                        }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && <div className="text-gray-500 text-xs italic animate-pulse">Llama is thinking...</div>}
                </div>

                {/* Input Bar */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Ask something about this file..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 text-sm text-gray-100 focus:outline-none focus:border-sky-500"
                  />
                  <button onClick={sendChatMessage} className="bg-sky-500 hover:bg-sky-600 p-2.5 rounded-lg text-gray-950 font-bold transition-colors">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
