import "./ChatWindow.css";
import Chat from "./Chat";
import { MyContext } from "./MyContext";
import { useContext, useState } from "react";
import { ScaleLoader } from "react-spinners";
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

function ChatWindow() {
    const { prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats } = useContext(MyContext);

    const [loading, setLoading] = useState(false);

    const getReply = async () => {
        if (!prompt || prompt.trim() === "") return;

        const promptToSend = prompt;
        const threadIdToSend = currThreadId || `t-${Date.now()}`;

        // show loader immediately and ensure it's visible for a small minimum time
        const MIN_LOADER_MS = 400;
        const start = Date.now();
        setLoading(true);

        // Immediately show the user's message in the UI
        if (typeof setPrevChats === "function") {
            setPrevChats(prev => {
                const next = [...(Array.isArray(prev) ? prev : []), { role: "user", content: promptToSend }];
                return next;
            });
        }
        if (typeof setPrompt === "function") setPrompt("");

        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ message: promptToSend, threadId: threadIdToSend }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("API returned non-OK status:", response.status, text);
                alert(`Server error ${response.status}: ${text}`);
                return;
            }

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                const text = await response.text();
                console.error("Expected JSON but received:", text);
                alert("Unexpected server response (not JSON). Check backend logs.");
                return;
            }

            const data = await response.json();

            // Prefer explicit assistant field if backend provided it
            let assistantText = data?.assistant ?? "";
            if (!assistantText && Array.isArray(data?.messages) && data.messages.length > 0) {
                assistantText = data.messages[data.messages.length - 1]?.content ?? "";
            }

            console.log("[ChatWindow] API data:", data);
            console.log("[ChatWindow] assistantText:", assistantText);

            // Append assistant message
            if (typeof setPrevChats === "function") {
                setPrevChats(prev => {
                    const next = [...(Array.isArray(prev) ? prev : []), { role: "assistant", content: assistantText }];
                    console.log('[ChatWindow] prevChats updated ->', next);
                    return next;
                });
            }

            if (typeof setReply === "function") setReply(assistantText);
        } catch (err) {
            console.error("Error calling /api/chat:", err);
            alert("Network or server error. Check console for details.");
        } finally {
            // ensure loader stays visible for at least MIN_LOADER_MS
            const elapsed = Date.now() - start;
            if (elapsed < MIN_LOADER_MS) {
                await new Promise(r => setTimeout(r, MIN_LOADER_MS - elapsed));
            }
            setLoading(false);
        }
    };

    return (
        <div className="chatWindow">
            <div className="navbar">
                <span>
                    Conversational Chat App &nbsp;<i className="fa-solid fa-chevron-down"></i>
                </span>
                <div className="userIcon">
                    <i className="fa-solid fa-user"></i>
                </div>
            </div>

            <div className="messages">
                <div className="chatList">
                    <Chat loading={loading} />
                </div>
            </div>

            <div className="chatInput">
                <div className="userInput">
                    <input
                        type="text"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter") getReply();
                        }}
                        placeholder="ask anything ..."
                    />
                    <div id="submit" onClick={getReply}>
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>
                </div>
            </div>

            <p className="userInfo">
                Free Research Preview. Conversational chat app may produce inaccurate information about people, places, or facts.
            </p>
        </div>
    );
}

export default ChatWindow;
