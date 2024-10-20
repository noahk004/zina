"use client";

import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  LiveConnectionState,
  LiveTranscriptionEvents,
  useDeepgram,
} from "../../../context/DeepgramContextProvider.js";
import {
  MicrophoneEvents,
  MicrophoneState,
  useMicrophone,
} from "../context/MicrophoneContextProvider.js";
import Visualizer from "./Visualizer.js";

import Page from "./temppage";

const socket = io("http://localhost:5050");

function App() {  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [index, setIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [currAudioUrl, setCurrAudioUrl] = useState('');
  const [caption, setCaption] = useState(
    "Captions Look Like This"
  );
  const { connection, connectToDeepgram, connectionState } = useDeepgram();
  const { setupMicrophone, microphone, startMicrophone, microphoneState } =
    useMicrophone();
  const captionTimeout = useRef();
  const keepAliveInterval = useRef();

  useEffect(() => {
    setupMicrophone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (microphoneState === MicrophoneState.Ready) {
      connectToDeepgram({
        model: "nova-2",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 3000,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState]);

  useEffect(() => {
    if (!microphone) return;
    if (!connection) return;

    const onData = (e) => {
      // iOS SAFARI FIX:
      // Prevent packetZero from being sent. If sent at size 0, the connection will close. 
      if (e.data.size > 0) {
        connection?.send(e.data);
      }
    };

    const onTranscript = (data) => {
      const { is_final: isFinal, speech_final: speechFinal } = data;
      let thisCaption = data.channel.alternatives[0].transcript;

      console.log("thisCaption", thisCaption);
      if (thisCaption !== "") {
        console.log('thisCaption !== ""', thisCaption);
        setCaption(thisCaption);
      }

      if (isFinal && speechFinal) {
        clearTimeout(captionTimeout.current);
        captionTimeout.current = setTimeout(() => {
          setCaption(undefined);
          clearTimeout(captionTimeout.current);
        }, 3000);
      }
    };

    if (connectionState === LiveConnectionState.OPEN) {
      connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.addEventListener(MicrophoneEvents.DataAvailable, onData);

      startMicrophone();
    }

    return () => {
      // prettier-ignore
      connection.removeListener(LiveTranscriptionEvents.Transcript, onTranscript);
      microphone.removeEventListener(MicrophoneEvents.DataAvailable, onData);
      clearTimeout(captionTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState]);

  useEffect(() => {
    if (!connection) return;

    if (
      microphoneState !== MicrophoneState.Open &&
      connectionState === LiveConnectionState.OPEN
    ) {
      connection.keepAlive();

      keepAliveInterval.current = setInterval(() => {
        connection.keepAlive();
      }, 10000);
    } else {
      clearInterval(keepAliveInterval.current);
    }

    return () => {
      clearInterval(keepAliveInterval.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneState, connectionState]);
  
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
    //generateAudio(message); // Added to generate audio and play after it is input
    console.log(socket);
    socket.emit("send_message", message);
    setMessage("");
  };

  return (
    <div>
      <div className="grid grid-cols-2 text-lg" style={{ height: '80svh', width: '80svh' }}>
        <div><Page /></div>
        <div>
          {images && images.length > 0 && (
            <img
              src={images[index]}
              style={{ width: "80%", height: "80%" }}
              alt="Slideshow"
            />
          )}
        </div>
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
        style={{ width: '80%', marginRight: '10px' }}
      />
      <button onClick={sendMessage} style={{ padding: '10px' }}>
        Send
      </button>
      {currAudioUrl && <audio src={currAudioUrl} controls autoPlay />}

    <div className="relative w-full h-full">
      {microphone && <Visualizer microphone={microphone} />}
      <div className="absolute bottom-[8rem]  inset-x-0 max-w-4xl mx-auto text-center">
        {caption && <span className="bg-black/70 p-8">{caption}</span>}
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
      </div>
    </div>
  </div>
  </div>
  );
}

export default App;
