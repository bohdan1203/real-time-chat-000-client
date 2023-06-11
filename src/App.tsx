import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

// const baseUrl = "http://localhost:3500";
const baseUrl = "https://real-time-chat-000-server.onrender.com";

//@ts-ignore
const socket = io.connect(baseUrl);

interface Message {
  status: "sent" | "received";
  message?: string;
  content?: string;
  sender: string;
}

function App() {
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");

  const [chat, setChat] = useState<Message[]>([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [isError, setIsError] = useState(false);

  const room = "room1";

  useEffect(() => {
    // setIsError(false);
    // setIsLoading(true);

    axios
      .get(`${baseUrl}/chats`)
      .then((response) => {
        if (response.data) {
          return response.data;
        } else {
          throw new Error();
        }
      })
      .then((messages) => {
        setChat(messages);
      })
      .catch(() => {
        // setIsError(true);
      })
      .finally(() => {
        // setIsLoading(false);
      });
  }, []);

  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (trimmedMessage) {
      socket.emit("send_message", {
        sender: nickname,
        message: trimmedMessage,
        room,
      });
    }

    setChat((prev) => [
      ...prev,
      { status: "sent", message: trimmedMessage, sender: nickname },
    ]);

    setMessage("");
  };

  useEffect(() => {
    socket.emit("join_room", room);

    socket.on("receive_message", (data: Omit<Message, "status">) => {
      setChat((prev) => [
        ...prev,
        { status: "received", message: data.message, sender: data.sender },
      ]);
    });
  }, [socket]);

  useEffect(() => {
    console.log(chat);
  }, [chat]);

  return (
    <>
      <input
        type="text"
        placeholder="Your Nickname"
        onChange={(e) => setNickname(e.target.value)}
      />

      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>
      <h1>Chat:</h1>
      <ul
        style={{
          listStyle: "none",
          padding: "0 40px",
        }}
      >
        {chat.map((message, i) => {
          return (
            <li
              key={i}
              style={{
                backgroundColor: message.status === "sent" ? "violet" : "gray",
                display: "flex",
                margin: "12px 0",
                marginLeft: message.status === "sent" ? "auto" : "0",
                width: "max-content",
                padding: "6px",
                borderRadius: "6px",
                maxWidth: "80%",
                wordBreak: "break-all",
              }}
            >
              {`${message.sender}: ${message.content}`}
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default App;
