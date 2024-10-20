import React from "react";
import { useVoiceToText } from "react-speakup";

import { io } from 'socket.io-client';

const socket = io("http://localhost:5050");

const VoiceToText = () => {
  const { startListening, stopListening, transcript, reset } = useVoiceToText({
    continuous: true,
    lang: "en-US",
  });

  const handleSend = () => {
    stopListening();
    socket.emit("send_message", transcript);
    setTimeout(() => {
      reset();
    }, 5000);
  };

  return (
    <div className="flex flex-col gap-6">
      {" "}
      <div className="flex gap-6">
        <button onClick={startListening} className="rounded-full hover:bg-gray-300 duration-200 p-2">start</button>
        <button onClick={handleSend} className="rounded-full hover:bg-gray-300 duration-200 p-2">stop</button>
      </div>
      <h2>{transcript}</h2>
    </div>
  );
};

export default VoiceToText;