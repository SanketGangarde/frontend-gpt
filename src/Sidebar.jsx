
import "./Sidebar.css";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext";
import { v4 as uuidv4 } from 'uuid';


function Sidebar() {

    const { allChats ,setAllChats,currThreadId,setPrompt,setReply,setCurrThreadId,setNewChat,setPrevChats, user, handleLogout } = useContext(MyContext);

   useEffect(() => {
        const getAllThreads = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/thread", { credentials: "include" });
            const data = await response.json();

            const filteredData = data.map(thread => ({
            threadId: thread.threadId,
            title: thread.title,
            }));

            console.log("All threads fetched:", filteredData);
            setAllChats(filteredData);
        } catch (error) {
            console.error("Error fetching threads:", error);
            setAllChats([]);
        }
        };

        getAllThreads(); 

    }, []); 

    function createNewChat() {
        console.log("Creating new chat...");
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv4());
        setPrevChats([]);
    }

    const loadChat = async (threadId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/thread/${threadId}`, { credentials: "include" });
            if (response.ok) {
                const data = await response.json();
                setCurrThreadId(data.threadId);
                setPrevChats(data.messages || []);
                setNewChat(false);
                setPrompt("");
                setReply(null);
            }
        } catch (error) {
            console.error("Error loading chat:", error);
        }
    };

    const deleteChat = async (threadId) => {
        console.log("deleteChat called with threadId:", threadId);

        try {
            const response = await fetch(`http://localhost:3000/api/thread/${threadId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                console.log("Delete successful for:", threadId);
                setAllChats(prev => prev.filter(chat => chat.threadId !== threadId));
                if (currThreadId === threadId) {
                    createNewChat();
                }
            } else {
                const text = await response.text();
                console.error("Delete failed:", response.status, text);
            }
        } catch (error) {
            console.error("Network error deleting chat:", error);
        }
    };


    

    

    return (

        <>
        <section>
            {/* new chat button */}
            <div className="logo">
                <img src="src/assets/MITRA_LOGO.png" alt="MITRA logo" />
                <span className="logo-text">MITRA</span>
            </div>

            {/* actions */}
            <div className="actions">

                <div className="action-item" onClick={createNewChat}>
                    <i className="fa-solid fa-pen-to-square"></i>
                    <span>Add New Chat</span>
                </div>

                <div className="action-item">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <span>Search History</span>
                </div>
                
            </div>

            chat history
            <ul className="histroy">
                {
                    allChats?.map((thread,id) => (
                        <li key={thread.threadId || id} onClick={() => loadChat(thread.threadId)}>
                            <span className="thread-title">{thread.title}</span>
                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    deleteChat(thread.threadId);
                                }}
                                title="Delete chat"
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </li>
                    ))
                }  
            </ul>

            {/* footer/user info */}
            <footer className="signup">
                <div className="user-info-footer">
                    <div className="user-avatar-small">
                        <i className="fa-solid fa-user"></i>
                    </div>
                    <span className="user-name">{user?.username || "User"}</span>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </footer>
           
        </section>
         
        

        </>    
    );
}

export default Sidebar;

