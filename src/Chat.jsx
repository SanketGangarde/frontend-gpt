import "./Chat.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ScaleLoader } from "react-spinners";
import { CopyBlock, dracula } from "react-code-blocks";

function Chat({ loading }) {
  const { newChat, prevChats, reply } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const loadingMessages = [
    "analyzing your request...",
    "fetching data...",
    "processing information...",
    "converting response...",
    "structuring the answer...",
    "polishing the output...",
    "almost there...",
    "just a second..."
  ];
  const [loadingText, setLoadingText] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval;
    if (loading) {
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[index]);
      }, 10000);
    } else {
      setLoadingText(loadingMessages[0]);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Detect if reply contains a table
  const containsTable = reply && /\|.*\|/.test(reply);

  useEffect(() => {
    if (!prevChats || prevChats.length === 0 || !reply) return;

    if (containsTable) {
      // If table exists, render entire reply instantly
      setLatestReply(reply);
      setIsTypingComplete(true);
    } else {
      // Typing effect for normal text
      setLatestReply("");
      setIsTypingComplete(false);
      const content = reply.split(" ");
      let index = 0;

      const interval = setInterval(() => {
        setLatestReply((prev) => prev + (index === 0 ? "" : " ") + content[index]);
        index++;
        if (index >= content.length) {
          clearInterval(interval);
          setIsTypingComplete(true);
        }
      }, 50); // Slightly slower interval for words (50ms per word)

      return () => clearInterval(interval);
    }
  }, [prevChats, reply]);

  return (
    <>
      {prevChats.length === 0 && newChat && <h1>Start new Chat!</h1>}

      <div className="chats">
        {Array.isArray(prevChats) && prevChats.length > 0 ? (
          prevChats.map((chat, index) => {
            const isLastAssistantMessage = index === prevChats.length - 1 && chat.role === "assistant";
            const showTyping = isLastAssistantMessage && !isTypingComplete && reply === chat.content;

            return (
              <div
                className={chat.role === "user" ? "userDiv" : "gptDiv"}
                key={index}
              >
                {chat.role === "user" ? (
                  <p className="userMessage">{chat.content}</p>
                ) : (
                  <div className="gptContent">
                    <div className="avatar">MITRA</div>
                    <div className={`gptMessage ${showTyping ? "typing" : ""}`}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code({ inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const codeText = String(children).replace(/\n$/, "");
                            if (!inline && match) {
                              return (
                                <div className="code-block">
                                  <CopyBlock
                                    text={codeText}
                                    language={match[1]}
                                    showLineNumbers
                                    theme={dracula}
                                    wrapLines
                                    codeBlock
                                  />
                                </div>
                              );
                            }
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {showTyping ? latestReply : chat.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="placeholder">
            No messages yet — start the conversation.
          </div>
        )}

        {/* loader */}
        {loading && (
          <div className="centeredLoader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px' }}>
            <ScaleLoader color="#fff" loading={loading} />
            <p style={{ color: '#aaa', fontSize: '15px', fontStyle: 'italic', margin: 0 }}>{loadingText}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Chat;
