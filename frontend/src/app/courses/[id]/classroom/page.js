"use client";


import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

import VoiceToTextComponent from "./VoiceToTextComponent";

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

import VoiceToText from "./VoiceToText";

export default VoiceToText

function Page() {
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

  // Use a function to iterate through images and messages based on speech completion
  useEffect(() => {
    let isCancelled = false; // Flag to check if component is unmounted

    if (images && images.length > 0 && messages && messages.length > 0) {
      const displayContent = (currentIndex) => {
        if (isCancelled) return; // Stop if component is unmounted

        setIndex(currentIndex);

        // Speak the current message
        if ("speechSynthesis" in window) {
          // Cancel any ongoing speech
          window.speechSynthesis.cancel();

          const currentMessage = messages[currentIndex];
          const utterance = new SpeechSynthesisUtterance(currentMessage);

          // Optional: Set properties like language, pitch, rate
          utterance.lang = "en-US";
          utterance.rate = 1;
          utterance.pitch = 1;
          utterance.volume = 1;

          // When the speech ends, move to the next index
          utterance.onend = () => {
            if (isCancelled) return;

            if (currentIndex < images.length - 1) {
              displayContent(currentIndex + 1);
            }
          };

          // Speak the message
          window.speechSynthesis.speak(utterance);
        } else {
          console.warn("Speech Synthesis not supported in this browser.");

          // If speech synthesis is not supported, proceed after a delay
          if (currentIndex < images.length - 1) {
            setTimeout(() => {
              if (isCancelled) return;
              displayContent(currentIndex + 1);
            }, 3000);
          }
        }
      };

      displayContent(0);
    }

    // Cleanup function to set the flag when component unmounts
    return () => {
      isCancelled = true;
      window.speechSynthesis.cancel();
    };
  }, [images, messages]);

  const sendMessage = () => {
    //generateAudio(message); // Added to generate audio and play after it is input
    console.log(socket);
    socket.emit("send_message", message);
    setMessage("");
  };

  return (
    <div className="w-screen flex justify-between h-full">
      <div className="p-5">
        soe text
      </div>

      <VoiceToTextComponent />

      <div className="h-full flex flex-col justify-center items-center">
        <div className="">
          {images && images.length > 0 && (
            <motion.img
              key={index} // Add key to trigger re-render
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={images[index]}
              className="w-[800px] min-h-[200px] bg-white rounded-3xl"
              alt="Slideshow"
            />
          )}
        </div>
        {messages && messages.length > 0 && (
          <motion.div
            key={index} // Add key to trigger re-render
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute max-w-[600px] bg-black text-white text-sm bottom-[50px]"
          >
            {messages[index]}
          </motion.div>
        )}
      </div>

      <div className="py-[30px] pr-[30px]">
        <div className="flex justify-end">
          <button
            onClick={() => setCamerasVisible(!camerasVisible)}
            className="p-2 hover:bg-purple-800 duration-200 rounded-full mb-2"
          >
            {camerasVisible ? (
              <CaretRightIcon className="w-5 h-5 text-white" />
            ) : (
              <CaretDownIcon className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

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
