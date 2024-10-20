"use client";

import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

import { motion } from "framer-motion";

import { useParams } from "next/navigation";


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

import { PropagateLoader } from "react-spinners";

import { CaretDownIcon, CaretRightIcon } from "@radix-ui/react-icons";

import VoiceToText from "./VoiceToText";

export default function Page() {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  return (
    <AgoraRTCProvider client={client}>
      <Classroom />
    </AgoraRTCProvider>
  );
}

function Classroom() {

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const [index, setIndex] = useState(0);

  const [images, setImages] = useState([]);
  const [messages, setMessages] = useState([]);

  const dummyText = "this needs to be spoken";

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


  const { id } = useParams();

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

      setLoading(false)

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

    if (!images) {
      sendMessage();
    }

    if (images && images.length > 0 && messages && messages.length > 0) {
      const displayContent = (currentIndex) => {

        if (isCancelled) return; // Stop if component is unmounted

        setIndex(currentIndex);

        if (currentIndex < images.length - 1) {
          setTimeout(() => {
            displayImages(currentIndex + 1);
          }, 3000);

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
    socket.emit("send_message", id);
    setMessage("");
  };
  if (!loading) {
    return (
      <div className="w-screen flex justify-between h-full">
        <div className="p-5">soe text</div>

        <div className="h-full flex flex-col justify-center items-center">
          <div className="">
            {images && images.length > 0 && (
              <motion.img
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
  } else {
    return (
      <div classsName="flex justify-center items-center w-screen h-screen">
        <div>
          <p className="text-white">Loading your course...</p>
          <PropagateLoader color="#EAEBED" size={10} />
        </div>
      </div>
    );
  }
