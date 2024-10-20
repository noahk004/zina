"use client";

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

import { motion } from "framer-motion";

import { generateToken } from "@/components/agora/tokenGenerator";
import generateUid from "@/components/agora/uidGenerator";

const socket = io("http://localhost:5050");

import { appId, channelName, token } from "@/components/agora/data";

import { useJoin, useRemoteUsers } from "agora-rtc-react";

import LocalUserComponent from "../lobby/LocalUserComponent";
import RemoteUserComponent from "../lobby/RemoteUserComponent";

import AgoraRTC, {
  AgoraRTCProvider,
  useClientEvent,
  useRTCClient,
} from "agora-rtc-react";

import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";

export default function Page() {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  return (
    <AgoraRTCProvider client={client}>
      <Classroom />
    </AgoraRTCProvider>
  );
}

function Classroom() {
  const [message, setMessage] = useState("");

  const [index, setIndex] = useState(0);

  const [images, setImages] = useState([]);
  const [messages, setMessages] = useState([]);

  const dummyText = "this needs to be spoken";

  // const uid = generateUid()
  // const token = generateToken(uid)

  // ------ AGORA -------
  const [calling, setCalling] = useState(true);
  useJoin(
    { appid: appId, channel: channelName, token: token ? token : null },
    calling
  );
  const remoteUsers = useRemoteUsers();
  // ------ AGORA -------

  // ------ COMPONENTS -------
  const [camerasVisible, setCamerasVisible] = useState(true);
  // ------ COMPONENTS -------

  useEffect(() => {
    // Listen for incoming messages from the server
    socket.on("message", (msg) => {
      console.log(msg);
      setImages(msg["images"]);
      setMessages(msg["text_contents"]);
      console.log(msg["text_contents"]);
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
          }, 3000);
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
<<<<<<< HEAD
    <>
      <div className="grid grid-cols-2 text-lg" style={{ height: '80svh', width: '80svh' }}>
        <div><Page /></div>
        <div>
=======
    <div className="w-screen flex justify-between bg-purpleLight h-full">
      <div className="p-5">
        <button onClick={sendMessage}>Start</button>
      </div>

      <div className="h-full flex flex-col justify-center items-center">
        <div className="">
>>>>>>> main
          {images && images.length > 0 && (
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={images[index]}
<<<<<<< HEAD
              style={{ width: "80%", height: "80%" }}
=======
              className="w-[800px] min-h-[200px] bg-white rounded-3xl"
>>>>>>> main
              alt="Slideshow"
            />
          )}
        </div>
<<<<<<< HEAD
      </div>

      <div style={{ marginLeft: "5svh", marginBottom: "5svh" }}>
        <div className="absolute bomax-w-[600px] bg-black text-white text-sm" style={{bottom: "25svh"}}>
          Transcriptions/Captions go here
        </div>
        <div style={{ bottom: "15svh" }}>
        <div className="chat-box" style={{ 
            maxWidth: "80%",
            maxHeight: "300px", 
            overflowY: "auto", 
            border: "1px solid black", 
            padding: "10px",  
            backgroundColor: "#f0f0f0" 
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} >
              <strong>{msg.sender === "user" ? "You" : "Server"}:</strong> {msg.text}
            </div>
          ))}
        </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            style={{ width: "80%", bottom: "10svh"}}
          />
          <button onClick={sendMessage} style={{ padding: "10px" }}>
            Send
          </button>
          </div>
=======
        {messages && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute max-w-[600px] bg-black text-white text-sm bottom-[50px]"
          >
            {messages[index]}
          </motion.div>
        )}
>>>>>>> main
      </div>

      <div className="py-[30px] pr-[30px]">
        <button
          onClick={() => setCamerasVisible(!camerasVisible)}
          className="w-fit"
        >
          {camerasVisible ? (
            <CaretRightIcon className="w-5 h-5 text-purple3" />
          ) : (
            <CaretDownIcon className="w-5 h-5 text-purple3" />
          )}
        </button>
        <div
          className={`flex flex-col gap-2 j-fit ${
            camerasVisible ? "visible" : "invisible"
          }`}
        >
          <LocalUserComponent />
          {remoteUsers.map((user) => (
            <RemoteUserComponent key={user.uid} user={user} />
          ))}
        </div>
      </div>
    </div>
  );
}
