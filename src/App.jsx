
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import Auth from './Auth';
import './App.css'
import { MyContext } from './MyContext';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv4());
  const [prevChats, setPrevChats] = useState([]); // array of {threadId,messages[]} that stores previous chats of a id
  const [newChat, setNewChat] = useState(true); // to indicate if a new chat is started
  const [allChats, setAllChats] = useState([]); // to store all threads with their titles and ids

  const API_URL = import.meta.env.VITE_API_URL;


  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.log("Not authenticated");
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setUser(null);
    setPrompt('');
    setReply(null);
    setCurrThreadId(uuidv4());
    setPrevChats([]);
    setNewChat(true);
    setAllChats([]);
  };

  // Show nothing while checking auth status
  if (authLoading) {
    return null;
  }

  // If not logged in, show auth page
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allChats, setAllChats,
    user, handleLogout,
  };

  return (
    <div className='app'>
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  )
}

export default App;
