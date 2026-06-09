import { useMemo, useState } from "react";
import OpenAI from "openai";
import "./App.css";

const DEFAULT_PROMPT = "You are a helpful assistant.";
const OPEN_AI_KEY = "your-key-here";
const AI_URL = "https://openrouter.ai/api/v1";

function App() {
  const [messages, setMessages] = useState([
    { role: "system", content: DEFAULT_PROMPT },
    { role: "assistant", content: "Hello! Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openai = useMemo(() => {
    return new OpenAI({
      apiKey: OPEN_AI_KEY,
      baseURL: AI_URL,
      dangerouslyAllowBrowser: true,
    });
  }, []);

  const visibleMessages = messages.filter(
    (message) => message.role !== "system",
  );

  async function handleSubmit(event) {
    event.preventDefault();
    const content = input.trim();
    if (!content || !openai) return;

    const nextMessages = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await openai.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: nextMessages,
      });

      const assistantContent =
        response.choices?.[0]?.message?.content ||
        "Sorry, no response received.";
      setMessages([
        ...nextMessages,
        { role: "assistant", content: assistantContent },
      ]);
    } catch (err) {
      console.error(err);
      setError(
        "OpenAI request failed. Confirm your key and network connectivity.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div>
          <h1>CodeWeekendAI Chat</h1>
          <p>Ask your coding questions to the CodeWeekendAI.</p>
        </div>
      </header>

      <main className="chat-window">
        <div className="message-list">
          {visibleMessages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-label">
                {message.role === "user" ? "You" : "Assistant"}
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your message here..."
            disabled={loading}
            rows={3}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? "Sending..." : "Send"}
          </button>
        </form>

        {error && <div className="chat-error">{error}</div>}
      </main>
    </div>
  );
}

export default App;
