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
        <button className="transition-all duration-300 text-xl font-semibold bg-gradient-to-r to-purple1 via-purple3 from-purple2 bg-size-200 disabled:border-purple2 hover:bg-pos-100 px-4 py-2 rounded-full border-2 border-white text-white disabled:text-gray-400 disabled:pointer-events-none hover:drop-shadow-[0_0_10px_rgba(255,255,255,.75)]" onClick={startListening}>start</button>
        <button className="transition-all duration-300 text-xl font-semibold bg-gradient-to-r to-purple1 via-purple3 from-purple2 bg-size-200 disabled:border-purple2 hover:bg-pos-100 px-4 py-2 rounded-full border-2 border-white text-white disabled:text-gray-400 disabled:pointer-events-none hover:drop-shadow-[0_0_10px_rgba(255,255,255,.75)]" onClick={handleSend}>stop</button>
      </div>
      <h2>{transcript}</h2>
    </div>
  );
};

export default VoiceToText;