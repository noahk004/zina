"use client";

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

import Page from "./temppage";

const socket = io("http://localhost:5050");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState([]);
  const dummyText = "this needs to be spoken";

  useEffect(() => {
    // Listen for incoming messages from the server
    socket.on("message", (msg) => {
      console.log(msg);
      setImages(msg.images);
      setMessages(msg.message);
    });

    // Cleanup on component unmount
    return () => {
      socket.off("message");
    };
  }, []);

  // Use a recursive setTimeout to iterate through images once
  useEffect(() => {
    let isCancelled = false; // Flag to check if component is unmounted

    if (images && images.length > 0) {
      const displayImages = (currentIndex) => {
        if (isCancelled) return; // Stop if component is unmounted

        setIndex(currentIndex);

        if (currentIndex < images.length - 1) {
          setTimeout(() => {
            displayImages(currentIndex + 1);
          }, 5000);
        }
      };

      displayImages(0);
    }

    // Cleanup function to set the flag when component unmounts
    return () => {
      isCancelled = true;
    };
  }, [images]);

  const sendMessage = () => {
    console.log(socket);
    socket.emit("send_message", message);
    setMessage("");
  };

  return (
    <>
      <div>
        <Page />
      </div>
      <div style={{ padding: "20px" }}>
        <div>
          {images && images.length > 0 && (
            <img
              src={images[index]}
              style={{ width: "500px", height: "auto" }}
              alt="Slideshow"
            />
          )}
        </div>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
          style={{ width: "80%", marginRight: "10px" }}
        />
        <button onClick={sendMessage} style={{ padding: "10px" }}>
          Send
        </button>
      </div>
    </>
  );
}

export default App;
